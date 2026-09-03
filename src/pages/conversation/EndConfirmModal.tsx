import { MessageCircleX, ShieldAlert, Trash2, MessageCircle } from 'lucide-react'

export default function EndConfirmModal({
  onConfirmEnd,
  onCancel,
}: {
  onConfirmEnd: () => void
  onCancel: () => void
}) {
  return (
    <div className="absolute inset-0 bg-black/40 rounded-3xl flex items-end z-10">
      <div className="w-full bg-white rounded-t-3xl p-6 flex flex-col gap-4">
        <div className="flex flex-col items-center text-center gap-3">
          <div className="w-14 h-14 rounded-full bg-emerald-50 text-emerald-500 flex items-center justify-center">
            <MessageCircleX size={26} />
          </div>
          <p className="text-lg font-bold text-slate-900">대화를 종료할까요?</p>
        </div>
        <div className="border-t border-slate-100 pt-4 text-center">
          <p className="text-sm text-slate-500 leading-relaxed">
            대화를 종료하면 현재 대화 내용은
            <br />
            저장되지 않고 <span className="text-emerald-600 font-medium">삭제됩니다.</span>
          </p>
        </div>
        <div className="flex items-start gap-2 bg-emerald-50 rounded-xl p-3">
          <ShieldAlert size={16} className="text-emerald-500 shrink-0 mt-0.5" />
          <p className="text-xs text-emerald-700 leading-relaxed">
            현재 세션의 모든 데이터는 종료와 동시에 삭제되며 복구할 수 없습니다.
          </p>
        </div>
        <button
          onClick={onConfirmEnd}
          className="w-full flex items-center justify-center gap-2 py-4 rounded-xl bg-red-500 text-white font-semibold"
        >
          <Trash2 size={16} />
          대화 종료
        </button>
        <button
          onClick={onCancel}
          className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border border-slate-200 text-slate-500"
        >
          <MessageCircle size={16} />
          계속 대화하기
        </button>
      </div>
    </div>
  )
}
