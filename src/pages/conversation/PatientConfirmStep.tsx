export default function PatientConfirmStep({
  questionText,
  onAnswerWithSign,
  onAnswerWithText,
}: {
  questionText: string
  onAnswerWithSign: () => void
  onAnswerWithText: () => void
}) {
  return (
    <div className="flex-1 flex flex-col">
      <div className="flex-1 flex flex-col justify-center gap-3">
        <p className="text-xs text-slate-400">의료진 질문</p>
        <p className="text-xl font-semibold text-slate-900 leading-relaxed">
          “{questionText}”
        </p>
      </div>
      <div className="flex flex-col gap-2">
        <button
          onClick={onAnswerWithSign}
          className="w-full py-4 rounded-xl bg-blue-500 text-white font-semibold"
        >
          수어로 답변하기
        </button>
        <button
          onClick={onAnswerWithText}
          className="w-full py-3 rounded-xl border border-slate-200 text-slate-500"
        >
          텍스트로 직접 입력
        </button>
      </div>
    </div>
  )
}
