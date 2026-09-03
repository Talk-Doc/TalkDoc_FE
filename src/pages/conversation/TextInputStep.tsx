import { useState } from 'react'

export default function TextInputStep({
  initialText,
  onSubmit,
}: {
  initialText: string
  onSubmit: (text: string) => void
}) {
  const [text, setText] = useState(initialText)

  return (
    <div className="flex-1 flex flex-col">
      <p className="text-xs text-slate-400 mb-2">답변을 텍스트로 입력해주세요</p>
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        className="flex-1 rounded-xl border border-slate-200 p-3 text-slate-900 resize-none mb-4"
        placeholder="예: 배가 아파요"
        autoFocus
      />
      <button
        disabled={text.trim().length === 0}
        onClick={() => onSubmit(text.trim())}
        className="w-full py-4 rounded-xl bg-blue-500 text-white font-semibold disabled:bg-slate-200 disabled:text-slate-400"
      >
        확인
      </button>
    </div>
  )
}
