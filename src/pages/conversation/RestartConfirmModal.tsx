import { AlertCircle, RotateCcw, ShieldAlert, X } from 'lucide-react'

// "대화 다시 시작"은 화면만 초기화하는 게 아니라 실제로 세션을 지우고 새로 발급받는
// 동작입니다(ConversationPage.confirmRestart 참고 — 백엔드에 세션 안의 답변만 골라
// 지우는 API가 없어서, 세션째로 교체하는 방식으로 "완전히 지워짐"을 보장합니다).
// 그래서 이전엔 없던 네트워크 요청이 필요해 submitting/error 상태를 함께 받습니다.
export default function RestartConfirmModal({
  confirmedCount,
  submitting,
  error,
  onConfirmRestart,
  onCancel,
}: {
  confirmedCount: number
  submitting?: boolean
  error?: string | null
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
            삭제된 내용은 복구할 수 없어요. 화면은 그대로 유지되고, 처음부터 바로 다시 진행할 수 있어요.
          </p>
        </div>
        {error && (
          <div className="flex items-start gap-2 bg-red-50 rounded-xl p-3">
            <AlertCircle size={16} className="text-red-500 shrink-0 mt-0.5" />
            <p className="text-xs text-red-600 leading-relaxed">{error}</p>
          </div>
        )}
        <button
          onClick={onConfirmRestart}
          disabled={submitting}
          className="w-full flex items-center justify-center gap-2 py-4 rounded-xl bg-teal-700 text-white font-semibold disabled:opacity-60"
        >
          {submitting ? (
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <RotateCcw size={16} />
          )}
          {submitting ? '다시 시작하는 중...' : '대화 다시 시작'}
        </button>
        <button
          onClick={onCancel}
          disabled={submitting}
          className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border border-slate-200 text-slate-500 disabled:opacity-40"
        >
          계속 진행하기
        </button>
      </div>
    </div>
  )
}
