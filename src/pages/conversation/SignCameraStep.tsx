import { useEffect, useRef, useState } from 'react'
import { Camera, Square, Sun, Hand, User, Lightbulb, AlertCircle, Check, X, Pencil } from 'lucide-react'
import QuestionCard from './QuestionCard'
import { useMediaRecorder, MEDIA_PERMISSION_ERROR } from '../../hooks/useMediaRecorder'
import { useSession } from '../../context/SessionContext'
import { postSign } from '../../api/sign'
import { ApiError } from '../../api/client'

// TalkDoc-VisionAI는 영상 1개당 단어 1개만 인식합니다. 그래서 이 화면은 촬영을 여러 번 반복해
// 인식된 단어들을 클라이언트에서 모아두고, 환자가 [답변 완료하기]를 누르면 그 단어 목록으로
// 다음 단계(분석)로 넘어갑니다.
const RETRY_MESSAGE: Record<string, string> = {
  LOW_CONFIDENCE: '동작을 다시 인식하지 못했어요. 한 동작을 천천히, 정확하게 다시 촬영해주세요.',
  INSUFFICIENT_LANDMARKS: '양손과 상반신이 화면에 보이지 않아요. 손과 상반신이 모두 보이도록 다시 촬영해주세요.',
}

export default function SignCameraStep({
  questionText,
  time,
  onSuccess,
  onFailure,
}: {
  questionText: string
  time?: string
  onSuccess: (labels: string[]) => void
  onFailure: () => void
}) {
  const { session_id: sessionId, patient_token: patientToken } = useSession()
  const [words, setWords] = useState<string[]>([])
  const [recording, setRecording] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [editingIndex, setEditingIndex] = useState<number | null>(null)
  const [editValue, setEditValue] = useState('')
  const recorder = useMediaRecorder()
  const videoRef = useRef<HTMLVideoElement>(null)
  const startedAtRef = useRef(0)

  useEffect(() => {
    if (videoRef.current) videoRef.current.srcObject = recorder.stream
  }, [recorder.stream])

  // 이 화면에 들어오자마자 카메라 미리보기를 켜서, [답변 촬영 시작하기]를 누르기 전에도
  // 환자가 자기 모습이 어떻게 잡히는지 바로 볼 수 있게 합니다. 실제 녹화는 버튼을 눌러야 시작됩니다.
  useEffect(() => {
    let cancelled = false
    recorder.startPreview({ video: { facingMode: 'user' }, audio: false }).then((ok) => {
      // 이 컴포넌트가 이미 정리(cleanup)된 뒤에 도착한 응답이면, 상태 업데이트를 하지 않습니다.
      // (스트림 자체는 useMediaRecorder가 요청 번호로 알아서 정리합니다.)
      if (cancelled) return
      if (!ok) setError(MEDIA_PERMISSION_ERROR)
    })
    return () => {
      cancelled = true
      recorder.stopPreview()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const startRecording = async () => {
    setError(null)
    const ok = await recorder.start({ video: { facingMode: 'user' }, audio: false })
    if (!ok) {
      setError(recorder.error)
      return
    }
    startedAtRef.current = Date.now()
    setRecording(true)
  }

  const stopRecording = async () => {
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

  return (
    <>
      <QuestionCard questionText={questionText} guideText="증상을 설명해주세요." time={time} />

      {words.length > 0 && (
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
                  {word}
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
      )}

      {recording ? (
        <div className="rounded-2xl bg-teal-50 p-4 flex items-center justify-between gap-3">
          <div>
            <p className="text-sm font-bold text-teal-900">지금 수어로 한 단어를 답변해주세요.</p>
            <p className="text-xs text-teal-600 mt-0.5">
              한 동작을 하고 정지한 뒤, 촬영을 마치면 단어가 인식돼요.
            </p>
          </div>
          <span className="relative w-9 h-9 rounded-full bg-teal-500 flex items-center justify-center shrink-0">
            <span className="absolute inset-0 rounded-full bg-teal-400 animate-ping opacity-50" />
            <Camera size={16} className="relative text-white" />
          </span>
        </div>
      ) : (
        <div className="flex items-center gap-1.5 text-xs text-teal-600 font-medium">
          <span className="w-1.5 h-1.5 rounded-full bg-teal-500 inline-block" />
          {words.length > 0 ? '다음 단어를 촬영하거나 답변을 완료하세요.' : '카메라 준비 완료'}
        </div>
      )}

      <div className="relative flex-1 min-h-[220px] rounded-2xl bg-slate-800 overflow-hidden flex items-center justify-center">
        <div className="absolute inset-3 border-2 border-transparent z-10">
          <span className="absolute -top-0.5 -left-0.5 w-6 h-6 border-t-4 border-l-4 border-teal-400 rounded-tl-xl" />
          <span className="absolute -top-0.5 -right-0.5 w-6 h-6 border-t-4 border-r-4 border-teal-400 rounded-tr-xl" />
        </div>
        {recorder.stream ? (
          <video
            ref={videoRef}
            autoPlay
            muted
            playsInline
            className="absolute inset-0 w-full h-full object-cover -scale-x-100"
          />
        ) : (
          <User size={72} className="text-slate-500" strokeWidth={1} />
        )}
        {recording ? (
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 z-10">
            <p className="text-xs text-white/80">수어를 인식하고 있어요...</p>
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
          <p className="absolute bottom-4 left-1/2 -translate-x-1/2 text-xs text-white/80 bg-black/30 rounded-full px-3 py-1 z-10">
            양손과 상반신이 모두 보이도록 해주세요.
          </p>
        )}
      </div>

      {error && (
        <div className="rounded-2xl bg-red-50 p-3.5 flex items-start gap-2.5">
          <AlertCircle size={16} className="text-red-500 shrink-0 mt-0.5" />
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      {submitting ? (
        <div className="w-full flex items-center justify-center gap-2 py-4 text-teal-600 font-semibold">
          <div className="w-5 h-5 border-2 border-teal-500 border-t-transparent rounded-full animate-spin" />
          수어를 분석하고 있어요...
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
          <button
            onClick={stopRecording}
            className="w-full flex items-center justify-center gap-2 py-4 rounded-xl border-2 border-teal-500 text-teal-600 font-semibold"
          >
            <Square size={16} fill="currentColor" />
            답변 중지하기
          </button>
        </>
      ) : (
        <>
          <button
            onClick={startRecording}
            className="w-full flex items-center justify-center gap-2 py-4 rounded-xl bg-teal-700 text-white font-semibold"
          >
            <Camera size={16} />
            {words.length > 0 ? '다음 단어 촬영하기' : '답변 촬영 시작하기'}
          </button>
          {words.length > 0 && (
            <button
              onClick={finishAnswer}
              className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl border-2 border-teal-500 text-teal-700 font-semibold"
            >
              답변 완료하기
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
      )}
    </>
  )
}
