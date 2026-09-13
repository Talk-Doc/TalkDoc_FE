import { MessageCircle, ShieldAlert, Trash2, X } from 'lucide-react'

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
          <div className="relative w-14 h-14 rounded-full bg-teal-50 text-teal-500 flex items-center justify-center">
            <MessageCircle size={24} />
            <span className="absolute -bottom-0.5 -right-0.5 w-5 h-5 rounded-full bg-teal-500 text-white flex items-center justify-center">
              <X size={12} strokeWidth={3} />
            </span>
          </div>
          <p className="text-lg font-bold text-slate-900">대화를 종료할까요?</p>
        </div>
        <div className="border-t border-slate-100 pt-4 text-center">
          <p className="text-sm text-slate-500 leading-relaxed">
            대화를 종료하면 현재 대화 내용은
            <br />
            저장되지 않고 <span className="text-teal-600 font-medium">삭제됩니다.</span>
          </p>
        </div>
        <div className="flex items-start gap-2 bg-teal-50 rounded-xl p-3">
          <ShieldAlert size={16} className="text-teal-500 shrink-0 mt-0.5" />
          <p className="text-xs text-teal-700 leading-relaxed">
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
