import { useState } from 'react'
import { Calendar, Check } from 'lucide-react'
import QuestionCard from './QuestionCard'

// 선택지는 백엔드가 질문에 내려준 실제 수어 어휘(candidates)를 그대로 씁니다.
// 답변 확정 시 이 라벨은 유효한 수어 어휘라서, 텍스트 입력과 달리 confirm의 labels로도 쓸 수 있습니다.
export default function ChoiceAnswerStep({
  questionText,
  time,
  candidates,
  onSubmit,
}: {
  questionText: string
  time?: string
  candidates: string[]
  onSubmit: (choice: string) => void
}) {
  const [selected, setSelected] = useState<string | null>(null)

  return (
    <>
      <QuestionCard questionText={questionText} guideText="제공된 선택지 중에서 골라주세요." time={time} />

      <div className="grid grid-cols-3 gap-2">
        {candidates.map((option) => {
          const active = selected === option
          return (
            <button
              key={option}
              onClick={() => setSelected(option)}
              className={`flex flex-col items-center gap-1.5 rounded-xl p-3 border-2 ${
                active ? 'border-teal-500 bg-teal-50 text-teal-700' : 'border-slate-100 text-slate-600'
              }`}
            >
              <Calendar size={18} className={active ? 'text-teal-600' : 'text-slate-400'} />
              <span className="text-xs font-medium text-center leading-tight">{option}</span>
            </button>
          )
        })}
      </div>

      <button
        disabled={!selected}
        onClick={() => selected && onSubmit(selected)}
        className="mt-auto w-full flex items-center justify-center gap-2 py-4 rounded-xl bg-teal-700 text-white font-semibold disabled:bg-slate-200 disabled:text-slate-400"
      >
        <Check size={16} />
        선택 완료
      </button>
    </>
  )
}
