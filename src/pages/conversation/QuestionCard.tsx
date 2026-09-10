import { Stethoscope } from 'lucide-react'

// 답변 방법 선택 화면 이후 여러 화면(촬영, 결과 확인 등)에서 계속 보여주는
// "의료진의 질문" 카드입니다. 화면 최상단에 항상 질문을 다시 확인할 수 있게 해줍니다.
export default function QuestionCard({
  questionText,
  guideText,
  time,
}: {
  questionText: string
  guideText?: string
  time?: string
}) {
  return (
    <div className="rounded-2xl bg-teal-50 p-4 flex items-start gap-3">
      <div className="w-9 h-9 rounded-full bg-white flex items-center justify-center shrink-0 mt-0.5">
        <Stethoscope size={16} className="text-teal-600" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2">
          <p className="text-xs text-slate-400">의료진의 질문</p>
          {time && <p className="text-[11px] text-slate-300 shrink-0">{time}</p>}
        </div>
        <p className="text-lg font-bold text-slate-900 leading-snug">{questionText}</p>
        {guideText && <p className="text-xs text-slate-400 mt-0.5">{guideText}</p>}
      </div>
    </div>
  )
}
