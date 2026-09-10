import { RotateCcw, ShieldAlert, X } from 'lucide-react'

// "대화 다시 시작"은 세션을 나가지는 않지만, 지금까지 확정된 답변을 전부 지우고
// 첫 질문 대기 상태로 되돌리는 파괴적인 동작이라 "대화 종료"와 같은 확인 절차를 거칩니다.
export default function RestartConfirmModal({
  confirmedCount,
  onConfirmRestart,
  onCancel,
}: {
  confirmedCount: number
  onConfirmRestart: () => void
  onCancel: () => void
}) {
  return (
    <div className="absolute inset-0 bg-black/40 rounded-3xl flex items-end z-10">
      <div className="w-full bg-white rounded-t-3xl p-6 flex flex-col gap-4">
        <div className="flex flex-col items-center text-center gap-3">
          <div className="relative w-14 h-14 rounded-full bg-teal-50 text-teal-500 flex items-center justify-center">
            <RotateCcw size={22} />
            <span className="absolute -bottom-0.5 -right-0.5 w-5 h-5 rounded-full bg-teal-500 text-white flex items-center justify-center">
              <X size={12} strokeWidth={3} />
            </span>
          </div>
          <p className="text-lg font-bold text-slate-900">대화를 처음부터 다시 시작할까요?</p>
        </div>
        <div className="border-t border-slate-100 pt-4 text-center">
          <p className="text-sm text-slate-500 leading-relaxed">
            {confirmedCount > 0 ? (
              <>
                지금까지 확정된 답변 <span className="text-teal-600 font-medium">{confirmedCount}건</span>을
                포함해 현재 대화 내용이
                <br />
                모두 <span className="text-teal-600 font-medium">삭제되고</span> 첫 질문부터 다시 시작돼요.
              </>
            ) : (
              <>
                지금 입력 중인 내용이 <span className="text-teal-600 font-medium">삭제되고</span>
                <br />
                첫 질문부터 다시 시작돼요.
              </>
            )}
          </p>
        </div>
        <div className="flex items-start gap-2 bg-teal-50 rounded-xl p-3">
          <ShieldAlert size={16} className="text-teal-500 shrink-0 mt-0.5" />
          <p className="text-xs text-teal-700 leading-relaxed">
            삭제된 내용은 복구할 수 없어요. 대화 세션 자체는 종료되지 않아요.
          </p>
        </div>
        <button
          onClick={onConfirmRestart}
          className="w-full flex items-center justify-center gap-2 py-4 rounded-xl bg-teal-700 text-white font-semibold"
        >
          <RotateCcw size={16} />
          대화 다시 시작
        </button>
        <button
          onClick={onCancel}
          className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border border-slate-200 text-slate-500"
        >
          계속 진행하기
        </button>
      </div>
    </div>
  )
}
