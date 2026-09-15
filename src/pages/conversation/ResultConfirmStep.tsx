import { Sparkles, Volume2, Pencil, Send, Calendar, AlertCircle, Check } from 'lucide-react'
import QuestionCard from './QuestionCard'
import HelpTipBox from './HelpTipBox'
import { speak } from '../../utils/speech'

export default function ResultConfirmStep({
  questionText,
  time,
  answerText,
  answerSource,
  recognizedWords,
  submitting,
  error,
  draftInvalidated,
  onConfirm,
  onEditAsText,
  onQuestionChanged,
}: {
  questionText: string
  time?: string
  answerText: string
  answerSource: 'sign-camera' | 'text-input' | 'choice-select'
  recognizedWords: string[]
  submitting?: boolean
  error?: string | null
  // 미리보기 이후 의료진이 질문을 수정해서 이 답변 초안이 무효화된 경우: 같은 요청을
  // 재시도해도 항상 같은 이유로 다시 실패하므로, "다시 전달하기" 대신 질문부터 다시
  // 확인하도록 안내합니다.
  draftInvalidated?: boolean
  onConfirm: () => void
  onEditAsText: () => void
  onQuestionChanged?: () => void
}) {
  return (
    <>
      <QuestionCard questionText={questionText} guideText="증상을 설명해주세요." time={time} />

      <div className="rounded-2xl bg-teal-50 p-4">
        <div className="flex items-center gap-1.5 mb-3">
          <Sparkles size={15} className="text-teal-600" />
          <p className="text-sm font-bold text-teal-900">답변을 확인해 주세요.</p>
        </div>

        <div className="rounded-xl bg-white p-3 flex items-center justify-between gap-2 mb-3">
          <div>
            <p className="text-[11px] text-slate-400 mb-0.5">변환된 답변</p>
            <p className="text-lg font-bold text-slate-900">“{answerText}”</p>
          </div>
          <button
            onClick={() => speak(answerText)}
            aria-label="변환된 답변 음성으로 듣기"
            className="text-teal-500 shrink-0"
          >
            <Volume2 size={18} />
          </button>
        </div>

        {answerSource === 'sign-camera' && (
          <>
            <p className="text-xs font-semibold text-slate-500 mb-2">인식된 수어</p>
            <div className="flex flex-wrap gap-1.5">
              {recognizedWords.map((word, i) => (
                <span
                  key={`${word}-${i}`}
                  className="inline-flex items-center gap-1 rounded-full bg-white border border-teal-200 px-2.5 py-1 text-xs font-semibold text-teal-700"
                >
                  <Check size={11} className="text-teal-500" />
                  {word}
                </span>
              ))}
            </div>
          </>
        )}

        {answerSource === 'choice-select' && (
          <>
            <p className="text-xs font-semibold text-slate-500 mb-2">선택지</p>
            <div className="w-1/3 flex flex-col items-center gap-1.5 rounded-xl border-2 border-teal-500 bg-white p-3">
              <Calendar size={18} className="text-teal-600" />
              <span className="text-xs font-medium text-slate-700 text-center">{answerText}</span>
            </div>
          </>
        )}
      </div>

      {error ? (
        <div className="rounded-2xl bg-red-50 p-3.5 flex items-start gap-2.5">
          <AlertCircle size={16} className="text-red-500 shrink-0 mt-0.5" />
          <p className="text-sm text-red-600">{error}</p>
        </div>
      ) : (
        <HelpTipBox
          title="확인해 주세요."
          body="의미가 다르거나 어색한 부분이 있다면 수정할 수 있어요. 수정하지 않고 전달하면, 위 내용이 의료진에게 전송됩니다."
        />
      )}

      <div className="mt-auto flex flex-col gap-2">
        <button
          onClick={onEditAsText}
          disabled={submitting}
          className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl border border-slate-200 text-slate-600 font-medium disabled:opacity-40"
        >
          <Pencil size={15} />
          답변 수정하기
        </button>
        <button
          onClick={draftInvalidated ? onQuestionChanged : onConfirm}
          disabled={submitting}
          className="w-full flex items-center justify-center gap-2 py-4 rounded-xl bg-teal-700 text-white font-semibold disabled:opacity-60"
        >
          {submitting ? (
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <Send size={15} />
          )}
          {submitting
            ? '전달하는 중...'
            : draftInvalidated
              ? '질문 다시 확인하기'
              : error
                ? '다시 전달하기'
                : '의료진에게 전달하기'}
        </button>
      </div>
    </>
  )
}
