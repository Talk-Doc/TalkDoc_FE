import { useState } from 'react'
import QuestionCard from './QuestionCard'

export default function TextInputStep({
  questionText,
  initialText,
  onSubmit,
}: {
  questionText: string
  initialText: string
  onSubmit: (text: string) => void
}) {
  const [text, setText] = useState(initialText)

  return (
    <>
      <QuestionCard questionText={questionText} guideText="증상을 설명해주세요." time="오전 09:42" />

      <p className="text-xs text-slate-400">답변을 텍스트로 입력해주세요</p>
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        className="flex-1 rounded-xl border border-slate-200 p-3 text-slate-900 resize-none"
        placeholder="예: 배가 아파요"
        autoFocus
      />
      <button
        disabled={text.trim().length === 0}
        onClick={() => onSubmit(text.trim())}
        className="w-full py-4 rounded-xl bg-teal-700 text-white font-semibold disabled:bg-slate-200 disabled:text-slate-400"
      >
        확인
      </button>
    </>
  )
}
