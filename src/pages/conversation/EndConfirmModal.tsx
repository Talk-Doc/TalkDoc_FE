export default function EndConfirmModal({
  onConfirmEnd,
  onCancel,
}: {
  onConfirmEnd: () => void
  onCancel: () => void
}) {
  return (
    <div className="absolute inset-0 bg-black/40 rounded-3xl flex items-end">
      <div className="w-full bg-white rounded-2xl p-6 flex flex-col gap-4">
        <div className="text-center">
          <p className="text-lg font-bold text-slate-900">대화를 종료할까요?</p>
          <p className="text-sm text-slate-400 mt-2">
            대화를 종료하면 현재 대화 내용은 저장되지 않고 삭제됩니다.
          </p>
        </div>
        <button
          onClick={onConfirmEnd}
          className="w-full py-4 rounded-xl bg-red-500 text-white font-semibold"
        >
          대화 종료
        </button>
        <button
          onClick={onCancel}
          className="w-full py-3 rounded-xl border border-slate-200 text-slate-500"
        >
          계속 대화하기
        </button>
      </div>
    </div>
  )
}
