import { useState } from 'react'
import { Calendar, Check, AlertCircle, Keyboard } from 'lucide-react'
import QuestionCard from './QuestionCard'
import { useDesktopMode } from '../../context/DesktopModeContext'

// answer_mode가 CARD_SELECT인 질문에서만 뜨는 화면입니다. cardOptions는 서로 배타적인
// 미리 정해둔 문구(예: "오늘부터"/"어제부터")라 수어 어휘가 아니고, 하나만 고르는 게 맞습니다.
// (수어 단어 여러 개를 모아 조합하는 것과는 다른 개념이라, 텍스트 입력처럼 고른 문구를
// 그대로 답변으로 씁니다 — 별도의 자연어 변환(preview) 호출이 필요 없어요.)
// CHOICE 인텐트의 card_options는 서버가 질문마다 LLM으로 즉석 생성한 보기라(고정표가 아님),
// 환자 상황과 완전히 맞는 보기가 없을 수 있습니다. 백엔드는 "직접 입력"을 보기로 내려주지
// 않으므로(항상 프론트가 챙겨야 함) 텍스트로 직접 답할 수 있는 탈출구를 함께 보여줍니다.
export default function ChoiceAnswerStep({
  questionText,
  time,
  cardOptions,
  onSubmit,
  onSwitchToText,
}: {
  questionText: string
  time?: string
  cardOptions: string[]
  onSubmit: (answerText: string) => void
  onSwitchToText: () => void
}) {
  const [selected, setSelected] = useState<string | null>(null)
  const { desktopMode } = useDesktopMode()

  return (
    <>
      <QuestionCard
        questionText={questionText}
        guideText="제공된 선택지 중에서 하나를 골라주세요."
        time={time}
      />

      {cardOptions.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center gap-2 text-center">
          <AlertCircle size={24} className="text-slate-300" />
          <p className="text-sm font-semibold text-slate-500">이 질문엔 제공되는 선택지가 없어요.</p>
          <p className="text-xs text-slate-400">아래 버튼으로 직접 답변을 입력해주세요.</p>
        </div>
      ) : (
        <div className={`grid gap-2 ${desktopMode ? 'grid-cols-3' : 'grid-cols-2'}`}>
          {cardOptions.map((option) => {
            const active = selected === option
            return (
              <button
                key={option}
                onClick={() => setSelected(option)}
                className={`flex flex-col items-center gap-1.5 rounded-xl p-4 border-2 ${
                  active ? 'border-teal-500 bg-teal-50 text-teal-700' : 'border-slate-100 text-slate-600'
                }`}
              >
                <Calendar size={18} className={active ? 'text-teal-600' : 'text-slate-400'} />
                <span className="text-sm font-medium text-center leading-tight">{option}</span>
              </button>
            )
          })}
        </div>
      )}

      <div className="mt-auto flex flex-col gap-2">
        <button
          disabled={!selected}
          onClick={() => selected && onSubmit(selected)}
          className="w-full flex items-center justify-center gap-2 py-4 rounded-xl bg-teal-700 text-white font-semibold disabled:bg-slate-200 disabled:text-slate-400"
        >
          <Check size={16} />
          선택 완료
        </button>
        <button
          onClick={onSwitchToText}
          className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border border-slate-200 text-slate-500 font-medium"
        >
          <Keyboard size={16} />
          맞는 보기가 없어요, 직접 입력할게요
        </button>
      </div>
    </>
  )
}
