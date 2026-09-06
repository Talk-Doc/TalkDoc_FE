export default function ResultConfirmStep({
  answerText,
  onConfirm,
  onRetry,
  onEditAsText,
}: {
  answerText: string
  onConfirm: () => void
  onRetry: () => void
  onEditAsText: () => void
}) {
  return (
    <div className="flex-1 flex flex-col">
      <div className="flex-1 flex flex-col justify-center gap-3">
        <p className="text-xs text-slate-400">AI가 인식한 답변</p>
        <p className="text-xl font-semibold text-slate-900 leading-relaxed">
          “{answerText}”
        </p>
        <p className="text-sm text-slate-400">
          맞으면 전달하기를, 다르면 다시 답변하거나 직접 수정해주세요.
        </p>
      </div>
      <div className="flex flex-col gap-2">
        <button
          onClick={onConfirm}
          className="w-full py-4 rounded-xl bg-teal-500 text-white font-semibold"
        >
          의료진에게 전달하기
        </button>
        <button
          onClick={onRetry}
          className="w-full py-3 rounded-xl border border-slate-200 text-slate-500"
        >
          다시 답변하기
        </button>
        <button
          onClick={onEditAsText}
          className="w-full py-3 rounded-xl border border-slate-200 text-slate-500"
        >
          텍스트로 직접 수정
        </button>
      </div>
    </div>
  )
}
