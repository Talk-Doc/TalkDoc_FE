import { useEffect, useRef, useState } from 'react'
import { Mic, Square, Hand, Keyboard, ListChecks, ChevronDown, Volume2 } from 'lucide-react'

// TODO(백엔드 연동): 실제로는 녹음 중 오디오를 STT API로 스트리밍하고,
// [질문 종료]를 누르면 최종 텍스트를 LLM이 다듬어서 questionText로 받게 됩니다.
const MOCK_QUESTION = '어디가 아파서 오셨어요?'

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
  onAnswerWithSign,
  onAnswerWithText,
  onPhaseChange,
}: {
  onAnswerWithSign: (questionText: string) => void
  onAnswerWithText: (questionText: string) => void
  onPhaseChange: (phase: 'asking' | 'ready') => void
}) {
  const [phase, setPhase] = useState<'asking' | 'ready'>('asking')
  const [seconds, setSeconds] = useState(0)
  const [voiceGuide, setVoiceGuide] = useState(false)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    timerRef.current = setInterval(() => setSeconds((s) => s + 1), 1000)
    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [])

  useEffect(() => {
    onPhaseChange(phase)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase])

  const finishQuestion = () => {
    if (timerRef.current) clearInterval(timerRef.current)
    setPhase('ready')
  }

  return (
    <>
      {/* 상태 카드 */}
      <div className="rounded-2xl bg-teal-50 p-4 flex items-center justify-between">
        <div>
          <p className="text-xs text-teal-700 mb-1">현재 상태</p>
          <p className="font-bold text-teal-900">
            {phase === 'asking' ? '의료진이 질문하는 중입니다' : '환자 답변을 기다리는 중'}
          </p>
          <p className="text-xs text-teal-700 mt-1">
            {phase === 'asking'
              ? '질문이 끝나면 환자에게 휴대폰을 전달해주세요.'
              : '아래에서 답변 방법을 선택해주세요.'}
          </p>
        </div>
        <Mic size={28} className="text-teal-600 shrink-0" />
      </div>

      {/* 의료진 질문 카드 */}
      <div className="rounded-2xl border border-slate-100 p-4">
        <p className="text-xs text-slate-400 mb-2">의료진의 질문</p>
        {phase === 'asking' ? (
          <>
            <p className="text-lg font-bold text-slate-900 mb-4">듣고 있어요…</p>
            <div className="flex items-end gap-[3px] h-7 mb-2">
              {WAVEFORM_BARS.map((h, i) => (
                <span
                  key={i}
                  className="w-[3px] rounded-full bg-teal-400 animate-pulse"
                  style={{ height: h, animationDelay: `${i * 60}ms` }}
                />
              ))}
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-400">{formatTime(seconds)}</span>
              <button
                onClick={finishQuestion}
                className="flex items-center gap-1.5 text-sm font-semibold text-red-500 border border-red-200 rounded-full px-3 py-1.5"
              >
                <Square size={12} fill="currentColor" />
                질문 종료
              </button>
            </div>
          </>
        ) : (
          <p className="text-xl font-bold text-slate-900 leading-relaxed">
            “{MOCK_QUESTION}”
          </p>
        )}
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
            <p className="font-bold text-emerald-900 mb-1">
              질문이 끝나면 수어로 답변해주세요
            </p>
            <p className="text-xs text-emerald-600 mb-4">
              수어가 어려우면 다른 방법을 선택할 수 있어요.
            </p>
            <div className="flex flex-col gap-2">
              <button
                onClick={() => onAnswerWithSign(MOCK_QUESTION)}
                className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl bg-emerald-500 text-white font-semibold"
              >
                <Hand size={16} />
                수어로 답변하기
              </button>
              <div className="flex gap-2">
                <button
                  onClick={() => onAnswerWithText(MOCK_QUESTION)}
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
              <p className="text-xs text-slate-400 mt-0.5">주 증상 확인 중 · 0/6 완료</p>
            </div>
            <ChevronDown size={16} className="text-slate-300 -rotate-90" />
          </button>
        </>
      )}

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
