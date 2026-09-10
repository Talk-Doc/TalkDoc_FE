import { Send, Volume2 } from 'lucide-react'
import doctorSolo from '../../assets/illustrations/doctor-solo.png'
import HelpTipBox from './HelpTipBox'
import type { QuestionRecord } from '../../types/conversation'

export default function DoctorAnswerStep({
  history,
  onRequestEnd,
  onRestart,
  onNextQuestion,
}: {
  history: QuestionRecord[]
  onRequestEnd: () => void
  onRestart: () => void
  onNextQuestion: () => void
}) {
  return (
    <>
      <div className="rounded-2xl bg-teal-50 p-4 flex flex-col items-center text-center gap-1.5">
        <span className="w-11 h-11 rounded-full bg-teal-500 flex items-center justify-center text-white mb-1">
          <Send size={18} />
        </span>
        <p className="text-lg font-bold text-slate-900">답변이 전달되었습니다.</p>
        <p className="text-xs text-slate-500 leading-relaxed">
          의료진이 환자의 답변을 확인했습니다.
          <br />
          이제 의료진의 다음 질문을 기다려주세요.
        </p>
      </div>

      <HelpTipBox
        title="전달된 내용이 음성으로도 재생되었습니다."
        body="의료진 화면에 텍스트와 음성으로 함께 표시됩니다."
      />

      <div className="rounded-2xl border border-slate-100 p-4">
        <p className="text-xs font-semibold text-slate-500 mb-2">
          대화 요약 · 확정된 답변 {history.length}건
        </p>
        <div className="flex flex-col gap-2.5">
          {history.map((record, i) => (
            <div key={record.id} className="text-sm">
              <p className="text-slate-500">
                {i + 1}. {record.doctorQuestionText}
              </p>
              <p className="font-semibold text-slate-900">{record.patientAnswerText}</p>
            </div>
          ))}
        </div>
      </div>

      <button
        onClick={onNextQuestion}
        className="flex-1 w-full flex flex-col items-center justify-center text-center gap-2 py-2"
        title="(데모용) 눌러서 다음 질문 받기"
      >
        <img src={doctorSolo} alt="" className="w-28" />
        <p className="text-base font-bold text-slate-900">의료진의 다음 질문을 기다리는 중이에요.</p>
        <p className="text-xs text-slate-400">질문이 오면 화면에 자동으로 표시됩니다.</p>
      </button>

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

      <div className="flex items-center justify-between text-xs text-slate-400">
        <span>더 편하게 이용하고 싶다면 아래 기능을 활용해보세요.</span>
        <Volume2 size={13} className="shrink-0" />
      </div>
    </>
  )
}
