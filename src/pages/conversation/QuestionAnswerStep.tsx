import { useEffect, useRef, useState } from 'react'
import { Mic, Square, Hand, Keyboard, ListChecks, Volume2 } from 'lucide-react'
import doctorSolo from '../../assets/illustrations/doctor-solo.png'
import QuestionCard from './QuestionCard'
import UtilityToolbar from './UtilityToolbar'
import HelpTipBox from './HelpTipBox'
import type { QuestionPhase } from '../../types/conversation'

// TODO(백엔드 연동): 실제로는 녹음 중 오디오를 STT API로 스트리밍하고,
// 마이크 버튼을 다시 누르면 최종 텍스트를 LLM이 다듬어서 questionText로 받게 됩니다.
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
  initialPhase,
  onAnswerWithSign,
  onAnswerWithText,
  onAnswerWithChoice,
  onPhaseChange,
  onRequestEnd,
  onRestart,
}: {
  initialPhase?: QuestionPhase
  onAnswerWithSign: (questionText: string) => void
  onAnswerWithText: (questionText: string) => void
  onAnswerWithChoice: (questionText: string) => void
  onPhaseChange: (phase: QuestionPhase) => void
  onRequestEnd: () => void
  onRestart: () => void
}) {
  const [phase, setPhase] = useState<QuestionPhase>(initialPhase ?? 'mic-waiting')
  const [seconds, setSeconds] = useState(0)
  const [voiceGuide, setVoiceGuide] = useState(false)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    onPhaseChange(phase)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase])

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [])

  const startRecording = () => {
    setSeconds(0)
    timerRef.current = setInterval(() => setSeconds((s) => s + 1), 1000)
    setPhase('mic-recording')
  }

  const finishRecording = () => {
    if (timerRef.current) clearInterval(timerRef.current)
    setPhase('method-select')
  }

  if (phase !== 'method-select') {
    const recording = phase === 'mic-recording'
    return (
      <>
        <img src={doctorSolo} alt="" className="w-40 mx-auto" />

        <div className="text-center">
          {recording ? (
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

          {recording && (
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

          <p className="text-xs text-slate-400 mt-4">
            {recording ? '질문이 끝나면 버튼을 다시 눌러주세요' : '의료진이 버튼을 눌러 질문하세요'}
          </p>
        </div>

        <HelpTipBox
          title={recording ? '질문을 이해하기 어려우신가요?' : '의료진의 버튼을 누르고 음성으로 질문합니다.'}
          body={recording ? '질문을 이해하기 쉽게 도와드려요.' : '수집된 음성은 텍스트로 변환됩니다.'}
        />
      </>
    )
  }

  return (
    <>
      <QuestionCard questionText={MOCK_QUESTION} guideText="증상을 설명해주세요." time="오전 09:42" />

      <UtilityToolbar />

      <div>
        <p className="text-xs font-semibold text-slate-400 mb-2">답변 방법 선택하기</p>
        <div className="flex flex-col gap-2">
          <button
            onClick={() => onAnswerWithSign(MOCK_QUESTION)}
            className="w-full flex flex-col items-center gap-1 py-3.5 rounded-xl bg-teal-50 border-2 border-teal-500 text-teal-700"
          >
            <Hand size={18} />
            <span className="font-semibold text-sm">수어로 답변하기</span>
            <span className="text-[11px] text-teal-500">카메라로 수어를 인식해요.</span>
          </button>
          <div className="flex gap-2">
            <button
              onClick={() => onAnswerWithText(MOCK_QUESTION)}
              className="flex-1 flex flex-col items-center gap-1 py-3 rounded-xl border border-slate-200 text-slate-600"
            >
              <Keyboard size={16} />
              <span className="text-sm font-medium">텍스트로 답변하기</span>
              <span className="text-[10px] text-slate-400">직접 입력할 수 있어요.</span>
            </button>
            <button
              onClick={() => onAnswerWithChoice(MOCK_QUESTION)}
              className="flex-1 flex flex-col items-center gap-1 py-3 rounded-xl border border-slate-200 text-slate-600"
            >
              <ListChecks size={16} />
              <span className="text-sm font-medium">선택지로 답변하기</span>
              <span className="text-[10px] text-slate-400">제공되는 보기 중 선택해요.</span>
            </button>
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
