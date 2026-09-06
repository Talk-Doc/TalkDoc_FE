import { useEffect, useRef, useState } from 'react'
import { Mic, Square, Hand, Keyboard, ListChecks, ChevronDown, Volume2, Loader2 } from 'lucide-react'
import { useMediaRecorder } from '../../media/useMediaRecorder'
import { useSession } from '../../session/useSession'
import { talkdocApi } from '../../api/talkdoc'
import { errorMessage } from '../../api/client'
import type { QuestionResponse } from '../../api/types'

// 화면이 열리면 바로 마이크 녹음을 시작하고, [질문 종료]를 누르면 녹음 파일을
// POST /api/sessions/{id}/question 으로 보내 STT + 의도 분석 결과(질문 텍스트)를 받습니다.
// 마이크를 못 쓰는 환경(권한 거부, 데스크톱 등)에서는 텍스트로 질문을 입력할 수 있습니다.

// 파형(waveform)은 실제 오디오 분석 없이, 보기용으로 높이가 제각각인 막대를 나열한 것입니다.
const WAVEFORM_BARS = [6, 14, 22, 10, 18, 26, 12, 20, 8, 16, 24, 10, 14, 20, 8, 18, 12, 22]

function formatTime(totalSeconds: number) {
  const m = Math.floor(totalSeconds / 60)
    .toString()
    .padStart(2, '0')
  const s = (totalSeconds % 60).toString().padStart(2, '0')
  return `${m}:${s}`
}

type Phase = 'asking' | 'processing' | 'ready'

export default function QuestionAnswerStep({
  conversationCount,
  onQuestionReady,
  onAnswerWithSign,
  onAnswerWithText,
  onPhaseChange,
}: {
  conversationCount: number
  onQuestionReady: (question: QuestionResponse) => void
  onAnswerWithSign: () => void
  onAnswerWithText: () => void
  onPhaseChange: (phase: 'asking' | 'ready') => void
}) {
  const { session } = useSession()
  const recorder = useMediaRecorder('audio')

  const [phase, setPhase] = useState<Phase>('asking')
  const [question, setQuestion] = useState<QuestionResponse | null>(null)
  const [inputMode, setInputMode] = useState<'mic' | 'text'>('mic')
  const [typedQuestion, setTypedQuestion] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [seconds, setSeconds] = useState(0)
  const [voiceGuide, setVoiceGuide] = useState(false)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const stopTimer = () => {
    if (timerRef.current) clearInterval(timerRef.current)
    timerRef.current = null
  }

  // 화면이 열리면 마이크를 켜고 녹음을 시작합니다. 실패하면 텍스트 입력으로 전환합니다.
  useEffect(() => {
    let cancelled = false
    recorder
      .open()
      .then(() => {
        if (cancelled) return
        return recorder.start()
      })
      .catch(() => {
        if (!cancelled) setInputMode('text')
      })
    return () => {
      cancelled = true
      recorder.release()
    }
    // recorder의 함수들은 모두 useCallback으로 고정되어 있어 마운트 때 한 번만 실행됩니다.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    timerRef.current = setInterval(() => setSeconds((s) => s + 1), 1000)
    return stopTimer
  }, [])

  useEffect(() => {
    if (phase !== 'processing') onPhaseChange(phase)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase])

  const submitQuestion = async (input: { audio?: Blob; text?: string }) => {
    if (!session) return
    setError(null)
    setPhase('processing')
    try {
      const q = await talkdocApi.postQuestion(session.sessionId, session.doctorToken, input)
      setQuestion(q)
      onQuestionReady(q)
      setPhase('ready')
    } catch (e) {
      setError(errorMessage(e))
      setPhase('asking')
      // 음성 인식이 실패한 경우엔 텍스트로 다시 입력할 수 있게 열어둡니다.
      setInputMode('text')
    }
  }

  const finishRecording = async () => {
    stopTimer()
    let audio: Blob
    try {
      audio = await recorder.stop()
    } catch {
      setInputMode('text')
      return
    } finally {
      recorder.release()
    }
    if (audio.size === 0) {
      setError('녹음된 소리가 없어요. 텍스트로 질문을 입력해주세요.')
      setInputMode('text')
      return
    }
    await submitQuestion({ audio })
  }

  const finishTyped = async () => {
    stopTimer()
    recorder.release()
    await submitQuestion({ text: typedQuestion })
  }

  const supported = question?.supported ?? false

  return (
    <>
      {/* 상태 카드 */}
      <div className="rounded-2xl bg-blue-50 p-4 flex items-center justify-between">
        <div>
          <p className="text-xs text-blue-400 mb-1">현재 상태</p>
          <p className="font-bold text-blue-900">
            {phase === 'asking' && '의료진이 질문하는 중입니다'}
            {phase === 'processing' && '질문을 정리하는 중입니다'}
            {phase === 'ready' && '환자 답변을 기다리는 중'}
          </p>
          <p className="text-xs text-blue-400 mt-1">
            {phase === 'asking' && '질문이 끝나면 환자에게 휴대폰을 전달해주세요.'}
            {phase === 'processing' && 'AI가 질문을 텍스트로 바꾸고 있어요.'}
            {phase === 'ready' && '아래에서 답변 방법을 선택해주세요.'}
          </p>
        </div>
        {phase === 'processing' ? (
          <Loader2 size={28} className="text-blue-400 shrink-0 animate-spin" />
        ) : (
          <Mic size={28} className="text-blue-400 shrink-0" />
        )}
      </div>

      {/* 의료진 질문 카드 */}
      <div className="rounded-2xl border border-slate-100 p-4">
        <p className="text-xs text-slate-400 mb-2">의료진의 질문</p>

        {phase === 'asking' && inputMode === 'mic' && (
          <>
            <p className="text-lg font-bold text-slate-900 mb-4">듣고 있어요…</p>
            <div className="flex items-end gap-[3px] h-7 mb-2">
              {WAVEFORM_BARS.map((h, i) => (
                <span
                  key={i}
                  className="w-[3px] rounded-full bg-blue-400 animate-pulse"
                  style={{ height: h, animationDelay: `${i * 60}ms` }}
                />
              ))}
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-400">{formatTime(seconds)}</span>
              <button
                onClick={finishRecording}
                disabled={!recorder.recording}
                className="flex items-center gap-1.5 text-sm font-semibold text-red-500 border border-red-200 rounded-full px-3 py-1.5 disabled:opacity-40"
              >
                <Square size={12} fill="currentColor" />
                질문 종료
              </button>
            </div>
            <button
              onClick={() => {
                stopTimer()
                recorder.release()
                setInputMode('text')
              }}
              className="mt-3 flex items-center gap-1 text-xs text-slate-400"
            >
              <Keyboard size={12} />
              텍스트로 질문 입력하기
            </button>
          </>
        )}

        {phase === 'asking' && inputMode === 'text' && (
          <>
            {recorder.error && <p className="text-xs text-amber-600 mb-2">{recorder.error}</p>}
            <textarea
              value={typedQuestion}
              onChange={(e) => setTypedQuestion(e.target.value)}
              placeholder="예: 어디가 아파서 오셨어요?"
              className="w-full h-20 rounded-xl border border-slate-200 p-3 text-slate-900 resize-none mb-2"
              autoFocus
            />
            <button
              onClick={finishTyped}
              disabled={typedQuestion.trim().length === 0}
              className="w-full py-2.5 rounded-xl bg-blue-500 text-white text-sm font-semibold disabled:bg-slate-200 disabled:text-slate-400"
            >
              질문 등록
            </button>
          </>
        )}

        {phase === 'processing' && (
          <div className="flex items-center gap-2 text-slate-500 py-2">
            <Loader2 size={16} className="animate-spin" />
            <span className="text-sm">음성을 텍스트로 바꾸는 중…</span>
          </div>
        )}

        {phase === 'ready' && question && (
          <>
            <p className="text-xl font-bold text-slate-900 leading-relaxed">“{question.text}”</p>
            {!supported && (
              <p className="text-xs text-amber-600 mt-2">
                이 질문은 아직 수어 답변을 지원하지 않아요. 텍스트로 답변해주세요.
              </p>
            )}
          </>
        )}

        {error && <p className="text-xs text-red-500 mt-2">{error}</p>}
      </div>

      {phase === 'ready' && (
        <>
          {/* 환자 답변 영역 카드 */}
          <div className="rounded-2xl bg-emerald-50 p-4">
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs text-emerald-500 font-medium">환자 답변 영역</p>
              <span className="flex items-center gap-1 text-[11px] text-emerald-600">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block" />
                수어 인식 대기 중
              </span>
            </div>
            <p className="font-bold text-emerald-900 mb-1">질문이 끝나면 수어로 답변해주세요</p>
            <p className="text-xs text-emerald-600 mb-4">수어가 어려우면 다른 방법을 선택할 수 있어요.</p>
            <div className="flex flex-col gap-2">
              <button
                onClick={onAnswerWithSign}
                disabled={!supported}
                className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl bg-emerald-500 text-white font-semibold disabled:bg-emerald-200"
              >
                <Hand size={16} />
                수어로 답변하기
              </button>
              <div className="flex gap-2">
                <button
                  onClick={onAnswerWithText}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl border border-emerald-200 text-emerald-700 text-sm"
                >
                  <Keyboard size={14} />
                  텍스트로 답변하기
                </button>
                <button
                  disabled
                  title="준비 중인 기능이에요"
                  className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl border border-slate-200 text-slate-300 text-sm cursor-not-allowed"
                >
                  <ListChecks size={14} />
                  선택지로 답변하기
                </button>
              </div>
            </div>
          </div>

          {/* 대화 요약 카드 */}
          <button className="w-full rounded-2xl border border-slate-100 p-4 flex items-center justify-between text-left">
            <div>
              <p className="text-sm font-semibold text-slate-900">대화 요약 (현재까지)</p>
              <p className="text-xs text-slate-400 mt-0.5">답변 {conversationCount}개 전달 완료</p>
            </div>
            <ChevronDown size={16} className="text-slate-300 -rotate-90" />
          </button>
        </>
      )}

      <div className="mt-auto pt-2 flex items-center justify-between text-xs text-slate-400">
        <span>AI가 안전하고 정확하게 도와드려요.</span>
        <button onClick={() => setVoiceGuide((v) => !v)} className="flex items-center gap-1 shrink-0">
          <Volume2 size={13} />
          음성 안내 {voiceGuide ? '끄기' : '켜기'}
        </button>
      </div>
    </>
  )
}
