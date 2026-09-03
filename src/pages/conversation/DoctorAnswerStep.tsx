export default function DoctorAnswerStep({
  questionText,
  answerText,
  onNextQuestion,
}: {
  questionText: string
  answerText: string
  onNextQuestion: () => void
}) {
  return (
    <div className="flex-1 flex flex-col">
      <div className="flex-1 flex flex-col justify-center gap-6">
        <div>
          <p className="text-xs text-slate-400 mb-1">의료진 질문</p>
          <p className="text-slate-600">{questionText}</p>
        </div>
        <div>
          <p className="text-xs text-slate-400 mb-1">환자 답변</p>
          <p className="text-2xl font-bold text-slate-900">{answerText}</p>
        </div>
      </div>
      <button
        onClick={onNextQuestion}
        className="w-full py-4 rounded-xl bg-blue-500 text-white font-semibold"
      >
        다음 질문
      </button>
    </div>
  )
}
