import { useState } from 'react'
import { Calendar, Check } from 'lucide-react'
import QuestionCard from './QuestionCard'

const OPTIONS = ['오늘부터', '어제부터', '3일 전부터', '일주일 전부터', '한 달 전부터', '그보다 더 전부터']

// TODO(백엔드 연동): 실제로는 질문 의도에 맞는 선택지 목록을 LLM이 만들어서 내려주게 됩니다.
// 지금은 "언제부터 아프셨나요?" 같은 기간형 질문을 가정한 고정 목록입니다.
export default function ChoiceAnswerStep({
  questionText,
  onSubmit,
}: {
  questionText: string
  onSubmit: (choice: string) => void
}) {
  const [selected, setSelected] = useState<string | null>(null)

  return (
    <>
      <QuestionCard questionText={questionText} guideText="증상이 시작된 시점을 선택해주세요." time="오전 09:42" />

      <div className="grid grid-cols-3 gap-2">
        {OPTIONS.map((option) => {
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
