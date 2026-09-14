import { useState } from 'react'
import { Calendar, Check, AlertCircle } from 'lucide-react'
import QuestionCard from './QuestionCard'
import { useSession } from '../../context/SessionContext'
import { previewAnswer } from '../../api/answer'
import { ApiError } from '../../api/client'

// 선택지는 백엔드가 질문에 내려준 실제 수어 어휘(candidates)를 그대로 씁니다. 수어 촬영처럼
// 단어 여러 개를 모아 하나의 답변으로 합성하는 구조라, 하나만 고르도록 막을 이유가 없어서
// 여러 개를 골라 조합할 수 있게 합니다(예: "다리" + "아프다").
export default function ChoiceAnswerStep({
  questionText,
  time,
  candidates,
  onSubmit,
}: {
  questionText: string
  time?: string
  candidates: string[]
  onSubmit: (labels: string[], answerText: string) => void
}) {
  const { session_id: sessionId, patient_token: patientToken } = useSession()
  const [selected, setSelected] = useState<string[]>([])
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const toggle = (option: string) => {
    setSelected((prev) =>
      prev.includes(option) ? prev.filter((o) => o !== option) : [...prev, option],
    )
  }

  const handleSubmit = async () => {
    if (selected.length === 0) return
    setSubmitting(true)
    setError(null)
    try {
      const preview = await previewAnswer(sessionId, patientToken, selected)
      onSubmit(selected, preview.answer)
    } catch (err) {
      setError(err instanceof ApiError ? err.message : '답변을 생성하지 못했어요. 다시 시도해주세요.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <>
      <QuestionCard
        questionText={questionText}
        guideText="제공된 선택지 중에서 해당하는 것을 모두 골라주세요."
        time={time}
      />

      {candidates.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center gap-2 text-center">
          <AlertCircle size={24} className="text-slate-300" />
          <p className="text-sm font-semibold text-slate-500">이 질문엔 제공되는 선택지가 없어요.</p>
          <p className="text-xs text-slate-400">위로 돌아가서 수어나 텍스트로 답변해주세요.</p>
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-2">
          {candidates.map((option) => {
            const active = selected.includes(option)
            return (
              <button
                key={option}
                onClick={() => toggle(option)}
                className={`flex flex-col items-center gap-1.5 rounded-xl p-3 border-2 ${
                  active ? 'border-teal-500 bg-teal-50 text-teal-700' : 'border-slate-100 text-slate-600'
                }`}
              >
                <Calendar size={18} className={active ? 'text-teal-600' : 'text-slate-400'} />
                <span className="text-xs font-medium text-center leading-tight">{option}</span>
              </button>
            )
          })}
        </div>
      )}

      {error && (
        <div className="rounded-2xl bg-red-50 p-3.5 flex items-start gap-2.5">
          <AlertCircle size={16} className="text-red-500 shrink-0 mt-0.5" />
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      <button
        disabled={selected.length === 0 || submitting}
        onClick={handleSubmit}
        className="mt-auto w-full flex items-center justify-center gap-2 py-4 rounded-xl bg-teal-700 text-white font-semibold disabled:bg-slate-200 disabled:text-slate-400"
      >
        {submitting ? (
          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
        ) : (
          <Check size={16} />
        )}
        {submitting ? '답변을 만드는 중...' : `선택 완료${selected.length > 0 ? ` (${selected.length})` : ''}`}
      </button>
    </>
  )
}
