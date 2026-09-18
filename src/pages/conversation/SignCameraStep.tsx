import { useEffect, useRef, useState } from 'react'
import { Camera, Sun, Hand, User, Lightbulb, AlertCircle, Check, X, Pencil, RotateCcw, Timer } from 'lucide-react'
import QuestionCard from './QuestionCard'
import SignJudgeGuide from '../../guide/SignJudgeGuide'
import { getSignDisplayLabel } from '../../guide/signLabels'
import { useMediaRecorder, MEDIA_PERMISSION_ERROR } from '../../hooks/useMediaRecorder'
import { useSession } from '../../context/SessionContext'
import { useDesktopMode } from '../../context/DesktopModeContext'
import { postSign } from '../../api/sign'
import { ApiError } from '../../api/client'
import LandmarkOverlay from './LandmarkOverlay'
import cameraAlignmentGuide from '../../assets/guides/camera-alignment-guide.svg'

// TalkDoc-VisionAI는 영상 1개당 단어 1개만 인식합니다. 그래서 이 화면은 촬영을 여러 번 반복해
// 인식된 단어들을 클라이언트에서 모아두고, 환자가 [답변 완료하기]를 누르면 그 단어 목록으로
// 다음 단계(분석)로 넘어갑니다.
const RETRY_MESSAGE: Record<string, string> = {
  LOW_CONFIDENCE: '동작을 다시 인식하지 못했어요. 한 동작을 천천히, 정확하게 다시 촬영해주세요.',
  INSUFFICIENT_LANDMARKS: '양손과 상반신이 화면에 보이지 않아요. 손과 상반신이 모두 보이도록 다시 촬영해주세요.',
}

const AUTO_RECORDING_SECONDS = 3
const PREPARATION_SECONDS = 3

export default function SignCameraStep({
  questionText,
  time,
  judgeGuideMode = false,
  onSuccess,
  onFailure,
}: {
  questionText: string
  time?: string
  judgeGuideMode?: boolean
  onSuccess: (labels: string[]) => void
  onFailure: () => void
}) {
  const { session_id: sessionId, patient_token: patientToken } = useSession()
  const { desktopMode } = useDesktopMode()
  const [words, setWords] = useState<string[]>([])
  const [recording, setRecording] = useState(false)
  const [preparing, setPreparing] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [editingIndex, setEditingIndex] = useState<number | null>(null)
  const [editValue, setEditValue] = useState('')
  const [recordingSecondsLeft, setRecordingSecondsLeft] = useState(0)
  const [preparationSecondsLeft, setPreparationSecondsLeft] = useState(0)
  // 스트림은 받았는데(카메라 권한/장치 자체는 정상) 실제 화면에 프레임이 안 들어오는 경우가 있습니다
  // (다른 탭/앱이 카메라를 이미 쓰고 있거나, 드라이버 문제 등). 이럴 땐 <video>가 깨진 아이콘만
  // 보여주고 조용히 멈춰버리는데, 사용자가 원인을 알 수 없으니 일정 시간 안에 첫 프레임이
  // 안 들어오면 명확한 안내 + "다시 켜기" 버튼을 보여줍니다.
  const [previewBroken, setPreviewBroken] = useState(false)
  const recorder = useMediaRecorder()
  const videoRef = useRef<HTMLVideoElement>(null)
  const startedAtRef = useRef(0)
  const autoStopTimerRef = useRef<number | null>(null)
  const countdownTimerRef = useRef<number | null>(null)
  const preparationTimerRef = useRef<number | null>(null)
  const preparationStartTimerRef = useRef<number | null>(null)
  const stoppingRef = useRef(false)

  const clearRecordingTimers = () => {
    if (autoStopTimerRef.current !== null) window.clearTimeout(autoStopTimerRef.current)
    if (countdownTimerRef.current !== null) window.clearInterval(countdownTimerRef.current)
    if (preparationTimerRef.current !== null) window.clearInterval(preparationTimerRef.current)
    if (preparationStartTimerRef.current !== null) window.clearTimeout(preparationStartTimerRef.current)
    autoStopTimerRef.current = null
    countdownTimerRef.current = null
    preparationTimerRef.current = null
    preparationStartTimerRef.current = null
  }

  useEffect(() => {
    const video = videoRef.current
    if (!video) return
    video.srcObject = recorder.stream
    if (!recorder.stream) {
      setPreviewBroken(false)
      return
    }
    setPreviewBroken(false)
    // srcObject만 바꿔서는 일부 브라우저에서 자동재생이 안 붙는 경우가 있어, 명시적으로 재생을
    // 시도합니다. 사용자 제스처 없이 호출될 수 있어 거부(reject)될 수 있는데, 이미 muted라
    // 대부분 허용되고 설령 막혀도 화면이 깨지는 건 아니라 조용히 무시해도 됩니다.
    video.play().catch(() => {})

    let receivedFrame = false
    const markReady = () => {
      receivedFrame = true
    }
    video.addEventListener('loadedmetadata', markReady)
    video.addEventListener('playing', markReady)
    const watchdog = setTimeout(() => {
      if (!receivedFrame) setPreviewBroken(true)
    }, 4000)

    return () => {
      video.removeEventListener('loadedmetadata', markReady)
      video.removeEventListener('playing', markReady)
      clearTimeout(watchdog)
    }
  }, [recorder.stream])

  // 이 화면에 들어오자마자 카메라 미리보기를 켜서, [답변 촬영 시작하기]를 누르기 전에도
  // 환자가 자기 모습이 어떻게 잡히는지 바로 볼 수 있게 합니다. 실제 녹화는 버튼을 눌러야 시작됩니다.
  // words/recording/submitting에도 의존해서, 촬영 중이 아닐 때 미리보기가 (기기 문제 등으로)
  // 꺼져 있으면 자동으로 다시 켭니다 — 한 번 깨지면 계속 빈 화면으로 남지 않도록 하기 위함입니다.
  useEffect(() => {
    if (recorder.stream || preparing || recording || submitting) return
    let cancelled = false
    recorder.startPreview({ video: { facingMode: 'user' }, audio: false }).then((ok) => {
      if (cancelled) return
      if (!ok) setError(MEDIA_PERMISSION_ERROR)
    })
    return () => {
      cancelled = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [recorder.stream, preparing, recording, submitting])

  // 화면을 완전히 떠날 때만 카메라를 실제로 끕니다.
  useEffect(() => {
    return () => {
      clearRecordingTimers()
      recorder.stopPreview()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // 미리보기가 깨졌을 때(previewBroken) 누르는 버튼: 지금 들고 있는(고장난) 스트림을 버립니다.
  // 여기서 startPreview()를 직접 또 부르면, stopPreview()로 스트림이 null이 되는 순간 위
  // 자동복구 effect도 동시에 startPreview()를 불러서 두 요청이 경합하게 됩니다(요청 번호로
  // 서로를 무효화하다 보니, 이 함수가 부른 쪽이 진 것처럼 보여 실제로는 복구에 성공했는데도
  // 잘못된 권한 에러가 뜰 수 있음) — 그래서 스트림을 비우기만 하고, 새로 여는 건 그 effect
  // 하나에게만 맡깁니다.
  const retryPreview = () => {
    setError(null)
    setPreviewBroken(false)
    recorder.stopPreview()
  }

  const beginRecording = async () => {
    const ok = await recorder.start({ video: { facingMode: 'user' }, audio: false })
    setPreparing(false)
    setPreparationSecondsLeft(0)
    if (!ok) {
      setError(MEDIA_PERMISSION_ERROR)
      return
    }
    startedAtRef.current = Date.now()
    stoppingRef.current = false
    setRecordingSecondsLeft(AUTO_RECORDING_SECONDS)
    setRecording(true)

    const deadline = Date.now() + AUTO_RECORDING_SECONDS * 1000
    countdownTimerRef.current = window.setInterval(() => {
      setRecordingSecondsLeft(Math.max(1, Math.ceil((deadline - Date.now()) / 1000)))
    }, 200)
    autoStopTimerRef.current = window.setTimeout(() => {
      void stopRecording()
    }, AUTO_RECORDING_SECONDS * 1000)
  }

  const startRecording = () => {
    if (preparing || recording || submitting) return
    setError(null)

    // 실제 MediaRecorder는 준비 카운트다운이 끝난 다음에만 시작됩니다.
    if (!recorder.stream) {
      setError('카메라가 준비 중이에요. 잠시 후 다시 눌러주세요.')
      return
    }

    setPreparing(true)
    setPreparationSecondsLeft(PREPARATION_SECONDS)
    const deadline = Date.now() + PREPARATION_SECONDS * 1000
    preparationTimerRef.current = window.setInterval(() => {
      setPreparationSecondsLeft(Math.max(1, Math.ceil((deadline - Date.now()) / 1000)))
    }, 200)
    preparationStartTimerRef.current = window.setTimeout(() => {
      if (preparationTimerRef.current !== null) window.clearInterval(preparationTimerRef.current)
      preparationTimerRef.current = null
      preparationStartTimerRef.current = null
      void beginRecording()
    }, PREPARATION_SECONDS * 1000)
  }

  const stopRecording = async () => {
    if (stoppingRef.current) return
    stoppingRef.current = true
    clearRecordingTimers()
    setRecordingSecondsLeft(0)
    const duration = (Date.now() - startedAtRef.current) / 1000
    const videoBlob = await recorder.stop()
    setRecording(false)
    setSubmitting(true)
    setError(null)
    try {
      const result = await postSign(sessionId, patientToken, videoBlob, duration)
      if (result.sign.accepted && result.sign.label) {
        setWords((prev) => [...prev, result.sign.label as string])
      } else {
        setError(
          (result.sign.reason && RETRY_MESSAGE[result.sign.reason]) ??
            '동작을 인식하지 못했어요. 다시 촬영해주세요.',
        )
      }
    } catch (err) {
      setError(err instanceof ApiError ? err.message : '수어 인식에 실패했어요. 다시 시도해주세요.')
    } finally {
      setSubmitting(false)
      stoppingRef.current = false
    }
  }

  const finishAnswer = () => {
    if (words.length > 0) onSuccess(words)
    else onFailure()
  }

  // 수어 인식이 잘못됐을 수 있으니(예: "배"를 "네"로 오인식), 촬영을 다시 하지 않고도
  // 단어를 직접 고치거나 지울 수 있게 합니다.
  const startEditWord = (i: number) => {
    setEditingIndex(i)
    setEditValue(words[i])
  }

  const saveEditWord = () => {
    if (editingIndex === null) return
    const value = editValue.trim()
    const index = editingIndex
    setWords((prev) => (value ? prev.map((w, i) => (i === index ? value : w)) : prev.filter((_, i) => i !== index)))
    setEditingIndex(null)
  }

  const removeWord = (i: number) => {
    setWords((prev) => prev.filter((_, idx) => idx !== i))
    if (editingIndex === i) setEditingIndex(null)
  }

  const wordChips = (
    words.length > 0 && (
      <div className="flex flex-wrap gap-1.5">
          {words.map((word, i) =>
            editingIndex === i ? (
              <span
                key={`edit-${i}`}
                className="inline-flex items-center gap-1 rounded-full bg-white border-2 border-teal-500 pl-2.5 pr-1 py-1"
              >
                <input
                  value={editValue}
                  onChange={(e) => setEditValue(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') saveEditWord()
                    if (e.key === 'Escape') setEditingIndex(null)
                  }}
                  autoFocus
                  className="w-16 text-xs font-semibold text-teal-700 outline-none"
                />
                <button
                  onClick={saveEditWord}
                  aria-label={`${word} 단어 수정 완료`}
                  className="w-5 h-5 rounded-full bg-teal-500 text-white flex items-center justify-center shrink-0"
                >
                  <Check size={11} />
                </button>
              </span>
            ) : (
              <span
                key={`${word}-${i}`}
                className="inline-flex items-center gap-1 rounded-full bg-teal-50 border border-teal-200 pl-2.5 pr-1 py-1 text-xs font-semibold text-teal-700"
              >
                <button onClick={() => startEditWord(i)} className="inline-flex items-center gap-1">
                  {getSignDisplayLabel(word)}
                  <Pencil size={10} className="text-teal-400" />
                </button>
                <button
                  onClick={() => removeWord(i)}
                  aria-label={`${word} 단어 삭제`}
                  className="w-4 h-4 rounded-full text-teal-500 flex items-center justify-center shrink-0"
                >
                  <X size={11} />
                </button>
              </span>
            ),
          )}
        </div>
      )
  )

  const statusLine = preparing ? (
        <div className="rounded-2xl bg-amber-50 p-4 flex items-center justify-between gap-3">
          <div>
            <p className="text-sm font-bold text-amber-900">촬영을 준비해주세요.</p>
            <p className="text-xs text-amber-700 mt-0.5">
              {preparationSecondsLeft}초 뒤 촬영을 시작하고, {AUTO_RECORDING_SECONDS}초 동안 자동 촬영해요.
            </p>
          </div>
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-amber-500 text-base font-bold text-white">
            {preparationSecondsLeft}
          </span>
        </div>
      ) : recording ? (
        <div className="rounded-2xl bg-teal-50 p-4 flex items-center justify-between gap-3">
          <div>
            <p className="text-sm font-bold text-teal-900">안내 영상의 동작을 따라 해주세요.</p>
            <p className="text-xs text-teal-600 mt-0.5">
              촬영은 {AUTO_RECORDING_SECONDS}초 뒤 자동으로 끝나고 바로 분석돼요.
            </p>
          </div>
          <span className="relative w-9 h-9 rounded-full bg-teal-500 flex items-center justify-center shrink-0">
            <span className="absolute inset-0 rounded-full bg-teal-400 animate-ping opacity-50" />
            <Camera size={16} className="relative text-white" />
          </span>
        </div>
      ) : previewBroken ? (
        <div className="flex items-center gap-1.5 text-xs text-red-500 font-medium">
          <span className="w-1.5 h-1.5 rounded-full bg-red-500 inline-block" />
          카메라 화면을 불러오지 못했어요.
        </div>
      ) : (
        <div className="flex items-center gap-1.5 text-xs text-teal-600 font-medium">
          <span className="w-1.5 h-1.5 rounded-full bg-teal-500 inline-block" />
          {words.length > 0 ? '다음 단어를 촬영하거나 답변을 완료하세요.' : '카메라 준비 완료'}
        </div>
      )

  const cameraBox = (
      <div className={`relative rounded-2xl bg-slate-800 overflow-hidden flex items-center justify-center ${desktopMode ? 'flex-1 min-h-[420px]' : 'flex-1 min-h-[220px]'}`}>
        <div className="absolute inset-3 border-2 border-transparent z-10">
          <span className="absolute -top-0.5 -left-0.5 w-6 h-6 border-t-4 border-l-4 border-teal-400 rounded-tl-xl" />
          <span className="absolute -top-0.5 -right-0.5 w-6 h-6 border-t-4 border-r-4 border-teal-400 rounded-tr-xl" />
        </div>
        {recorder.stream ? (
          <>
            <video
              ref={videoRef}
              autoPlay
              muted
              playsInline
              className="absolute inset-0 w-full h-full object-cover -scale-x-100"
            />
            {!recording && !submitting && (
              <img
                src={cameraAlignmentGuide}
                alt=""
                aria-hidden="true"
                className={`pointer-events-none absolute inset-0 z-[4] h-full w-full object-cover transition-opacity ${
                  preparing ? 'opacity-70' : 'opacity-55'
                }`}
              />
            )}
            <LandmarkOverlay
              videoRef={videoRef}
              enabled={!previewBroken}
            />
          </>
        ) : (
          <User size={72} className="text-slate-500" strokeWidth={1} />
        )}
        {recorder.stream && previewBroken && (
          <div className="absolute inset-0 z-20 flex flex-col items-center justify-center gap-3 bg-slate-800/95 px-6 text-center">
            <AlertCircle size={28} className="text-amber-400" />
            <p className="text-sm text-white/90">
              카메라 화면을 불러오지 못했어요.
              <br />
              다른 앱/탭에서 카메라를 쓰고 있는지 확인해주세요.
            </p>
            <button
              onClick={retryPreview}
              className="flex items-center gap-1.5 rounded-full bg-teal-600 px-4 py-2 text-sm font-semibold text-white"
            >
              <RotateCcw size={14} />
              카메라 다시 켜기
            </button>
          </div>
        )}
        {preparing ? (
          <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-black/15">
            <span className="flex h-20 w-20 items-center justify-center rounded-full bg-black/55 text-4xl font-bold text-white backdrop-blur-sm">
              {preparationSecondsLeft}
            </span>
            <p className="mt-3 rounded-full bg-black/45 px-3 py-1 text-xs font-medium text-white">
              자세를 잡고 동작을 준비해주세요
            </p>
          </div>
        ) : recording ? (
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 z-10">
            <p className="text-xs text-white/90">촬영 종료까지 {recordingSecondsLeft}초</p>
            <div className="flex items-end gap-[3px] h-4">
              {[4, 9, 6, 12, 5, 10, 7, 4].map((h, i) => (
                <span
                  key={i}
                  className="w-[3px] rounded-full bg-teal-300 animate-pulse"
                  style={{ height: h, animationDelay: `${i * 80}ms` }}
                />
              ))}
            </div>
          </div>
        ) : (
          <p className="absolute bottom-4 left-1/2 -translate-x-1/2 text-xs text-white/90 bg-black/40 rounded-full px-3 py-1 z-10 whitespace-nowrap">
            가이드 선에 머리·어깨·양손을 맞춰주세요.
          </p>
        )}
      </div>
  )

  const errorBlock = error && (
        <div className="rounded-2xl bg-red-50 p-3.5 flex items-start gap-2.5">
          <AlertCircle size={16} className="text-red-500 shrink-0 mt-0.5" />
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )

  const actionArea = submitting ? (
        <div className="w-full flex items-center justify-center gap-2 py-4 text-teal-600 font-semibold">
          <div className="w-5 h-5 border-2 border-teal-500 border-t-transparent rounded-full animate-spin" />
          수어를 분석하고 있어요...
        </div>
      ) : preparing ? (
        <div className="w-full flex items-center justify-center gap-2 py-4 rounded-xl border-2 border-amber-200 bg-amber-50 text-amber-800 font-semibold">
          <Timer size={16} />
          {preparationSecondsLeft}초 후 촬영을 시작해요
        </div>
      ) : recording ? (
        <>
          <div className="rounded-2xl bg-slate-50 p-3.5 flex items-start gap-2.5">
            <Lightbulb size={16} className="text-slate-400 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-slate-600">더 정확한 인식을 위해 이렇게 해주세요.</p>
              <ul className="text-xs text-slate-400 mt-1 space-y-1 list-disc list-inside">
                <li>양손과 상반신이 모두 화면에 보이도록 해주세요.</li>
                <li>밝은 곳에서 촬영해주세요.</li>
                <li>한 동작을 하고 1초 정도 정지해주세요.</li>
              </ul>
            </div>
          </div>
          <div className="w-full flex items-center justify-center gap-2 py-4 rounded-xl border-2 border-teal-200 bg-teal-50 text-teal-700 font-semibold">
            <Timer size={16} />
            {recordingSecondsLeft}초 후 자동으로 분석해요
          </div>
        </>
      ) : (
        <>
          <button
            onClick={startRecording}
            disabled={!recorder.stream || previewBroken}
            className="w-full flex items-center justify-center gap-2 py-4 rounded-xl bg-teal-700 text-white font-semibold disabled:bg-slate-200 disabled:text-slate-400"
          >
            <Camera size={16} />
            {!recorder.stream
              ? '카메라 준비 중...'
              : judgeGuideMode
              ? words.length === 0
                ? '1단어 ‘머리’ 촬영하기'
                : words.length === 1
                  ? '2단어 ‘아파요’ 촬영하기'
                  : '다른 단어 추가 촬영하기'
              : words.length > 0
                ? '다음 단어 촬영하기'
                : '답변 촬영 시작하기'}
          </button>
          {words.length > 0 && (
            <button
              onClick={finishAnswer}
              className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl border-2 border-teal-500 text-teal-700 font-semibold"
            >
              {judgeGuideMode && words.length >= 2 ? '가이드 답변 확인하기' : '답변 완료하기'}
            </button>
          )}
          <div>
            <p className="text-xs font-semibold text-slate-400 mb-2">수어 촬영 가이드</p>
            <div className="grid grid-cols-3 gap-2">
              {[
                { icon: Sun, label: '밝은 곳에서 촬영해주세요.' },
                { icon: Hand, label: '양손이 모두 보이게 해주세요.' },
                { icon: User, label: '상반신이 화면에 보이도록 해주세요.' },
              ].map(({ icon: Icon, label }) => (
                <div
                  key={label}
                  className="flex flex-col items-center gap-1.5 rounded-xl bg-slate-50 p-3 text-center"
                >
                  <Icon size={16} className="text-slate-400" />
                  <span className="text-[10px] text-slate-500 leading-tight">{label}</span>
                </div>
              ))}
            </div>
          </div>
        </>
      )

  const header = (
    <>
      <QuestionCard questionText={questionText} guideText="증상을 설명해주세요." time={time} />
      {judgeGuideMode && <SignJudgeGuide completedCount={words.length} />}
    </>
  )

  // 모바일/기본 폰 카드에서는 위에서부터 순서대로 쌓아 보여주던 걸 그대로 유지하고,
  // 데스크톱 체험 모드에서는 카메라가 좁은 세로 카드 안에 갇혀 작아 보이지 않도록
  // 왼쪽에 큰 카메라, 오른쪽에 나머지 정보(단어 칩·안내·버튼)를 두는 2단 구성으로 바꿉니다.
  if (desktopMode) {
    return (
      <>
        {header}
        <div className="grid flex-1 min-h-0 grid-cols-[1.5fr_1fr] gap-6">
          <div className="flex min-h-0 flex-col gap-3">
            {statusLine}
            {cameraBox}
          </div>
          <div className="flex min-h-0 flex-col gap-3 overflow-y-auto pr-1">
            {wordChips}
            {errorBlock}
            {actionArea}
          </div>
        </div>
      </>
    )
  }

  return (
    <>
      {header}
      {wordChips}
      {statusLine}
      {cameraBox}
      {errorBlock}
      {actionArea}
    </>
  )
}
