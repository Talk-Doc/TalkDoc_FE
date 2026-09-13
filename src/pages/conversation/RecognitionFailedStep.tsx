import { AlertTriangle, RotateCcw, Keyboard } from 'lucide-react'
import QuestionCard from './QuestionCard'

export default function RecognitionFailedStep({
  questionText,
  onRetry,
  onEditAsText,
}: {
  questionText: string
  onRetry: () => void
  onEditAsText: () => void
}) {
  return (
    <>
      <QuestionCard questionText={questionText} guideText="증상을 설명해주세요." time="오전 09:42" />

      <div className="flex-1 flex flex-col items-center justify-center gap-3 text-center">
        <div className="w-14 h-14 rounded-full bg-amber-50 text-amber-500 flex items-center justify-center">
          <AlertTriangle size={26} />
        </div>
        <p className="text-lg font-bold text-slate-900">수어를 인식하지 못했어요</p>
        <p className="text-sm text-slate-400">조금 더 천천히, 화면 중앙에서 다시 시도해주세요.</p>
      </div>

      <div className="flex flex-col gap-2">
        <button
          onClick={onRetry}
          className="w-full flex items-center justify-center gap-2 py-4 rounded-xl bg-teal-700 text-white font-semibold"
        >
          <RotateCcw size={16} />
          다시 시도하기
        </button>
        <button
          onClick={onEditAsText}
          className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border border-slate-200 text-slate-500"
        >
          <Keyboard size={16} />
          텍스트로 입력하기
        </button>
      </div>
    </>
  )
}
