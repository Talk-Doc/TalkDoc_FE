// TODO(백엔드 연동): 실제로는 여기서 Vision AI 인식 API 응답을 기다렸다가
// 성공하면 result-confirm, 실패하면 recognition-failed로 넘어가게 됩니다.
// 지금은 실제 AI가 없으므로, 두 결과를 모두 화면에서 확인해볼 수 있도록
// 테스트용 버튼 두 개를 임시로 두었습니다. (디자인/AI 연동 전 임시 UI)
export default function AnalyzingStep({
  onSuccess,
  onFailure,
}: {
  onSuccess: () => void
  onFailure: () => void
}) {
  return (
    <div className="flex-1 flex flex-col items-center justify-center gap-6 text-center">
      <div className="w-12 h-12 border-4 border-teal-500 border-t-transparent rounded-full animate-spin" />
      <p className="text-slate-500">AI가 답변을 분석하고 있어요</p>

      <div className="w-full flex flex-col gap-2 mt-8 pt-8 border-t border-dashed border-slate-200">
        <p className="text-xs text-slate-400">임시 테스트 버튼 (AI 연동 전까지 사용)</p>
        <button
          onClick={onSuccess}
          className="w-full py-2 rounded-lg border border-slate-200 text-sm text-slate-600"
        >
          (테스트) 인식 성공으로 보기
        </button>
        <button
          onClick={onFailure}
          className="w-full py-2 rounded-lg border border-slate-200 text-sm text-slate-600"
        >
          (테스트) 인식 실패로 보기
        </button>
      </div>
    </div>
  )
}
