import { Loader2 } from 'lucide-react'

export default function ResultConfirmStep({
  answerText,
  labels,
  submitting,
  error,
  onConfirm,
  onRetry,
  onEditAsText,
}: {
  answerText: string
  labels: string[]
  submitting: boolean
  error: string | null
  onConfirm: () => void
  onRetry: () => void
  onEditAsText: () => void
}) {
  return (
    <div className="flex-1 flex flex-col">
      <div className="flex-1 flex flex-col justify-center gap-3">
        <p className="text-xs text-slate-400">AI가 인식한 답변</p>
        <p className="text-xl font-semibold text-slate-900 leading-relaxed">“{answerText}”</p>
        {labels.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {labels.map((label, i) => (
              <span
                key={`${label}-${i}`}
                className="text-xs bg-blue-50 text-blue-600 rounded-full px-2.5 py-1"
              >
                {label}
              </span>
            ))}
          </div>
        )}
        <p className="text-sm text-slate-400">
          맞으면 전달하기를, 다르면 다시 답변하거나 직접 수정해주세요.
        </p>
        {error && <p className="text-xs text-red-500">{error}</p>}
      </div>
      <div className="flex flex-col gap-2">
        <button
          onClick={onConfirm}
          disabled={submitting}
          className="w-full flex items-center justify-center gap-2 py-4 rounded-xl bg-blue-500 text-white font-semibold disabled:bg-blue-300"
        >
          {submitting && <Loader2 size={16} className="animate-spin" />}
          의료진에게 전달하기
        </button>
        <button
          onClick={onRetry}
          disabled={submitting}
          className="w-full py-3 rounded-xl border border-slate-200 text-slate-500"
        >
          다시 답변하기
        </button>
        <button
          onClick={onEditAsText}
          disabled={submitting}
          className="w-full py-3 rounded-xl border border-slate-200 text-slate-500"
        >
          텍스트로 직접 수정
        </button>
      </div>
    </div>
  )
}
