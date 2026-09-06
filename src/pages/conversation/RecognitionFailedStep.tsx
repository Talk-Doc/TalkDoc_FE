export default function RecognitionFailedStep({
  onRetry,
  onEditAsText,
}: {
  onRetry: () => void
  onEditAsText: () => void
}) {
  return (
    <div className="flex-1 flex flex-col items-center justify-center gap-4 text-center">
      <span className="text-4xl">⚠️</span>
      <p className="text-lg font-semibold text-slate-900">
        수어를 인식하지 못했어요
      </p>
      <p className="text-sm text-slate-400">
        조금 더 천천히, 화면 중앙에서 다시 시도해주세요.
      </p>
      <div className="w-full flex flex-col gap-2 mt-4">
        <button
          onClick={onRetry}
          className="w-full py-4 rounded-xl bg-teal-500 text-white font-semibold"
        >
          다시 시도하기
        </button>
        <button
          onClick={onEditAsText}
          className="w-full py-3 rounded-xl border border-slate-200 text-slate-500"
        >
          텍스트로 입력하기
        </button>
      </div>
    </div>
  )
}
