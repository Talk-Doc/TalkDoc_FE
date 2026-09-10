import { Sparkles, Volume2, Pencil, Send } from 'lucide-react'
import QuestionCard from './QuestionCard'
import HelpTipBox from './HelpTipBox'

export default function ResultConfirmStep({
  questionText,
  answerText,
  recognizedWords,
  onConfirm,
  onEditAsText,
}: {
  questionText: string
  answerText: string
  recognizedWords: string[]
  onConfirm: () => void
  onEditAsText: () => void
}) {
  return (
    <>
      <QuestionCard questionText={questionText} guideText="증상을 설명해주세요." time="오전 09:42" />

      <div className="rounded-2xl bg-teal-50 p-4">
        <div className="flex items-center gap-1.5 mb-3">
          <Sparkles size={15} className="text-teal-600" />
          <p className="text-sm font-bold text-teal-900">답변을 확인해 주세요.</p>
        </div>

        <div className="rounded-xl bg-white p-3 flex items-center justify-between gap-2 mb-3">
          <div>
            <p className="text-[11px] text-slate-400 mb-0.5">변환된 답변</p>
            <p className="text-lg font-bold text-slate-900">“{answerText}”</p>
          </div>
          <Volume2 size={18} className="text-teal-500 shrink-0" />
        </div>

        <p className="text-xs font-semibold text-slate-500 mb-2">인식된 수어</p>
        <div className="flex gap-2">
          {recognizedWords.map((word) => (
            <div key={word} className="flex-1 flex flex-col items-center gap-1.5">
              <div className="w-full aspect-square rounded-xl bg-slate-800 flex items-center justify-center text-white text-xs">
                {word}
              </div>
              <span className="text-xs font-medium text-slate-600">{word}</span>
            </div>
          ))}
        </div>
      </div>

      <HelpTipBox
        title="확인해 주세요."
        body="의미가 다르거나 어색한 부분이 있다면 수정할 수 있어요. 수정하지 않고 전달하면, 위 내용이 의료진에게 전송됩니다."
      />

      <div className="mt-auto flex flex-col gap-2">
        <button
          onClick={onEditAsText}
          className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl border border-slate-200 text-slate-600 font-medium"
        >
          <Pencil size={15} />
          답변 수정하기
        </button>
        <button
          onClick={onConfirm}
          className="w-full flex items-center justify-center gap-2 py-4 rounded-xl bg-teal-700 text-white font-semibold"
        >
          <Send size={15} />
          의료진에게 전달하기
        </button>
      </div>
    </>
  )
}
