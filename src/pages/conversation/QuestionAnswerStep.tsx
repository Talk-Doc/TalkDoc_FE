import { useEffect, useRef, useState } from 'react'
import { Mic, Square, Hand, Keyboard, ListChecks, Volume2, AlertCircle, Check, X } from 'lucide-react'
import doctorSolo from '../../assets/illustrations/doctor-solo.png'
import QuestionCard from './QuestionCard'
import UtilityToolbar from './UtilityToolbar'
import HelpTipBox from './HelpTipBox'
import { useMediaRecorder } from '../../hooks/useMediaRecorder'
import { useSession } from '../../context/SessionContext'
import { postQuestionAudio, updateQuestion } from '../../api/question'
import { ApiError } from '../../api/client'
import type { QuestionResponse } from '../../api/types'
import type { QuestionPhase } from '../../types/conversation'
import { formatQuestionTime } from '../../utils/time'
import { speak } from '../../utils/speech'

// 파형(waveform)은 실제 오디오 분석 없이, 보기용으로 높이가 제각각인 막대를 나열한 것입니다.
const WAVEFORM_BARS = [6, 14, 22, 10, 18, 26, 12, 20, 8, 16, 24, 10, 14, 20, 8, 18, 12, 22]

function formatTime(totalSeconds: number) {
  const m = Math.floor(totalSeconds / 60)
    .toString()
    .padStart(2, '0')
  const s = (totalSeconds % 60).toString().padStart(2, '0')
  return `${m}:${s}`
}

export default function QuestionAnswerStep({
  initialPhase,
  initialQuestion,
  onAnswerWithSign,
  onAnswerWithText,
  onAnswerWithChoice,
  onPhaseChange,
  onRequestEnd,
  onRestart,
}: {
  initialPhase?: QuestionPhase
  // 수어/텍스트/선택지 화면에서 뒤로가기로 돌아오면 이 컴포넌트가 새로 마운트되면서
  // 자체 question 상태가 초기화돼요. 그때 화면이 빈 채로 멈추지 않도록, 상위(ConversationPage)가
  // 이미 갖고 있는 질문을 넘겨받아 처음부터 채워둡니다.
  initialQuestion?: QuestionResponse | null
  onAnswerWithSign: (question: QuestionResponse) => void
  onAnswerWithText: (question: QuestionResponse) => void
  onAnswerWithChoice: (question: QuestionResponse) => void
  onPhaseChange: (phase: QuestionPhase) => void
  onRequestEnd: () => void
  onRestart: () => void
}) {
  const { session_id: sessionId, doctor_token: doctorToken } = useSession()
  const [phase, setPhase] = useState<QuestionPhase>(initialPhase ?? 'mic-waiting')
  const [seconds, setSeconds] = useState(0)
  const [voiceGuide, setVoiceGuide] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [question, setQuestion] = useState<QuestionResponse | null>(initialQuestion ?? null)
  const [editingQuestion, setEditingQuestion] = useState(false)
  const [editText, setEditText] = useState('')
  const [editSaving, setEditSaving] = useState(false)
  const [editError, setEditError] = useState<string | null>(null)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const recorder = useMediaRecorder()

  useEffect(() => {
    onPhaseChange(phase)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase])

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [])

  const startRecording = async () => {
    setError(null)
    const ok = await recorder.start({ audio: true })
    if (!ok) {
      setError(recorder.error)
      return
    }
    setSeconds(0)
    timerRef.current = setInterval(() => setSeconds((s) => s + 1), 1000)
    setPhase('mic-recording')
  }

  const finishRecording = async () => {
    if (timerRef.current) clearInterval(timerRef.current)
    const audioBlob = await recorder.stop()
    setSubmitting(true)
    setError(null)
    try {
      const question = await postQuestionAudio(sessionId, doctorToken, audioBlob)
      setQuestion(question)
      if (voiceGuide) speak(question.text)
      // 백엔드가 이미 이 질문을 선택지로 답할 수 있는 유형(CARD_SELECT)으로 분류해줬으면,
      // 굳이 "답변 방법 선택하기"에서 한 번 더 고르게 하지 않고 바로 선택지 화면으로 넘어갑니다.
      // 수어/텍스트로 바꾸고 싶으면 선택지 화면에서 뒤로가기로 여기(방법 선택)에 돌아올 수 있어요.
      if (question.answer_mode === 'CARD_SELECT') {
        onAnswerWithChoice(question)
      } else {
        setPhase('method-select')
      }
    } catch (err) {
      setError(err instanceof ApiError ? err.message : '질문을 처리하지 못했어요. 다시 시도해주세요.')
      setPhase('mic-waiting')
    } finally {
      setSubmitting(false)
    }
  }

  if (phase !== 'method-select') {
    const recording = phase === 'mic-recording'
    return (
      <>
        <img src={doctorSolo} alt="" className="w-40 mx-auto" />

        <div className="text-center">
          {submitting ? (
            <p className="text-lg font-bold text-slate-900 mb-4">질문을 분석하고 있어요...</p>
          ) : recording ? (
            <>
              <p className="text-lg font-bold text-slate-900 mb-4">의료진의 질문을 수집중입니다</p>
              <p className="text-2xl font-bold text-teal-600 mb-4">{formatTime(seconds)}</p>
            </>
          ) : (
            <p className="text-lg font-bold text-slate-900 leading-relaxed mb-6">
              의료진이 마이크 버튼을 눌러
              <br />
              질문을 시작해주세요
            </p>
          )}

          {submitting ? (
            <div className="w-12 h-12 mx-auto border-4 border-teal-500 border-t-transparent rounded-full animate-spin" />
          ) : (
            <button
              onClick={recording ? finishRecording : startRecording}
              aria-label={recording ? '질문 녹음 종료' : '질문 녹음 시작'}
              className="relative w-20 h-20 mx-auto flex items-center justify-center"
            >
              {recording && (
                <span className="absolute inset-0 rounded-full bg-teal-400 animate-ping opacity-40" />
              )}
              <span className="relative w-20 h-20 rounded-full bg-gradient-to-br from-teal-500 to-teal-600 flex items-center justify-center shadow-lg shadow-teal-600/30">
                {recording ? (
                  <Square size={26} className="text-white" fill="currentColor" />
                ) : (
                  <Mic size={30} className="text-white" />
                )}
              </span>
            </button>
          )}

          {recording && !submitting && (
            <div className="flex items-end justify-center gap-[3px] h-6 mt-4">
              {WAVEFORM_BARS.map((h, i) => (
                <span
                  key={i}
                  className="w-[3px] rounded-full bg-teal-300 animate-pulse"
                  style={{ height: h, animationDelay: `${i * 60}ms` }}
                />
              ))}
            </div>
          )}

          {!submitting && (
            <p className="text-xs text-slate-400 mt-4">
              {recording ? '질문이 끝나면 버튼을 다시 눌러주세요' : '의료진이 버튼을 눌러 질문하세요'}
            </p>
          )}
        </div>

        {error ? (
          <div className="rounded-2xl bg-red-50 p-3.5 flex items-start gap-2.5">
            <AlertCircle size={16} className="text-red-500 shrink-0 mt-0.5" />
            <p className="text-sm text-red-600">{error}</p>
          </div>
        ) : (
          <HelpTipBox
            title={recording ? '질문을 이해하기 어려우신가요?' : '의료진의 버튼을 누르고 음성으로 질문합니다.'}
            body={recording ? '질문을 이해하기 쉽게 도와드려요.' : '수집된 음성은 텍스트로 변환됩니다.'}
          />
        )}
      </>
    )
  }

  if (!question) return null

  const startEditQuestion = () => {
    setEditText(question.text)
    setEditError(null)
    setEditingQuestion(true)
  }

  const saveEditQuestion = async () => {
    const text = editText.trim()
    if (!text) return
    setEditSaving(true)
    setEditError(null)
    try {
      const updated = await updateQuestion(sessionId, doctorToken, question.question_id, text, question.version)
      setQuestion(updated)
      setEditingQuestion(false)
    } catch (err) {
      setEditError(err instanceof ApiError ? err.message : '질문을 수정하지 못했어요. 다시 시도해주세요.')
    } finally {
      setEditSaving(false)
    }
  }

  return (
    <>
      {editingQuestion ? (
        <div className="rounded-2xl bg-teal-50 p-4 flex flex-col gap-2">
          <p className="text-xs text-slate-400">의료진의 질문 수정하기</p>
          <textarea
            value={editText}
            onChange={(e) => setEditText(e.target.value)}
            autoFocus
            rows={2}
            className="rounded-xl border border-teal-300 p-2.5 text-base font-bold text-slate-900 resize-none bg-white"
          />
          {editError && (
            <p className="text-xs text-red-600 flex items-center gap-1">
              <AlertCircle size={12} />
              {editError}
            </p>
          )}
          <div className="flex gap-2">
            <button
              onClick={() => setEditingQuestion(false)}
              disabled={editSaving}
              className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl border border-slate-200 text-slate-500 text-sm disabled:opacity-40"
            >
              <X size={14} />
              취소
            </button>
            <button
              onClick={saveEditQuestion}
              disabled={editSaving || editText.trim().length === 0}
              className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-teal-700 text-white text-sm font-semibold disabled:bg-slate-200 disabled:text-slate-400"
            >
              {editSaving ? (
                <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <Check size={14} />
              )}
              수정 완료
            </button>
          </div>
        </div>
      ) : (
        <QuestionCard
          questionText={question.text}
          guideText="증상을 설명해주세요."
          time={formatQuestionTime(question.asked_at)}
          onEdit={startEditQuestion}
        />
      )}

      <UtilityToolbar onReplayQuestion={() => speak(question.text)} />

      <div>
        <p className="text-xs font-semibold text-slate-400 mb-2">답변 방법 선택하기</p>
        <div className="flex flex-col gap-2">
          <button
            onClick={() => onAnswerWithSign(question)}
            className="w-full flex flex-col items-center gap-1 py-3.5 rounded-xl bg-teal-50 border-2 border-teal-500 text-teal-700"
          >
            <Hand size={18} />
            <span className="font-semibold text-sm">수어로 답변하기</span>
            <span className="text-[11px] text-teal-500">카메라로 수어를 인식해요.</span>
          </button>
          <div className="flex gap-2">
            <button
              onClick={() => onAnswerWithText(question)}
              className="flex-1 flex flex-col items-center gap-1 py-3 rounded-xl border border-slate-200 text-slate-600"
            >
              <Keyboard size={16} />
              <span className="text-sm font-medium">텍스트로 답변하기</span>
              <span className="text-[10px] text-slate-400">직접 입력할 수 있어요.</span>
            </button>
            {/* 선택지(카드)는 answer_mode가 CARD_SELECT인 질문(언제부터/얼마나/얼마나 자주/예-아니오)에만
                제공됩니다. SIGN_REQUIRED 질문(부위/증상/병력 등)은 카드가 없어 이 버튼 자체를 숨깁니다. */}
            {question.answer_mode === 'CARD_SELECT' && (
              <button
                onClick={() => onAnswerWithChoice(question)}
                className="flex-1 flex flex-col items-center gap-1 py-3 rounded-xl border border-slate-200 text-slate-600"
              >
                <ListChecks size={16} />
                <span className="text-sm font-medium">선택지로 답변하기</span>
                <span className="text-[10px] text-slate-400">제공되는 보기 중 선택해요.</span>
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="flex gap-2">
        <button
          onClick={onRequestEnd}
          className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-500 text-sm"
        >
          대화 중지
        </button>
        <button
          onClick={onRestart}
          className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-500 text-sm"
        >
          대화 다시 시작
        </button>
      </div>

      <HelpTipBox title="질문을 이해하기 어려우신가요?" body="질문을 이해하기 쉽게 도와드려요." />

      <div className="mt-auto pt-2 flex items-center justify-between text-xs text-slate-400">
        <span>AI가 안전하고 정확하게 도와드려요.</span>
        <button
          onClick={() => setVoiceGuide((v) => !v)}
          className="flex items-center gap-1 shrink-0"
        >
          <Volume2 size={13} />
          음성 안내 {voiceGuide ? '끄기' : '켜기'}
        </button>
      </div>
    </>
  )
}
