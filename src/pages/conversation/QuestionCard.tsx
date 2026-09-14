import { Pencil } from 'lucide-react'
import doctorAvatar from '../../assets/illustration-doctor-avatar.png'

// 답변 방법 선택 화면 이후 여러 화면(촬영, 결과 확인 등)에서 계속 보여주는
// "의료진의 질문" 카드입니다. 화면 최상단에 항상 질문을 다시 확인할 수 있게 해줍니다.
// onEdit이 있으면(답변 방법 선택 화면에서만) 시간 옆에 수정 아이콘이 함께 뜹니다.
export default function QuestionCard({
  questionText,
  guideText,
  time,
  onEdit,
}: {
  questionText: string
  guideText?: string
  time?: string
  onEdit?: () => void
}) {
  return (
    <div className="rounded-2xl bg-teal-50 p-4 flex items-start gap-3">
      <img
        src={doctorAvatar}
        alt=""
        className="w-9 h-9 rounded-full object-cover bg-white shrink-0 mt-0.5"
      />
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2">
          <p className="text-xs text-slate-400">의료진의 질문</p>
          <div className="flex items-center gap-2 shrink-0">
            {time && <p className="text-[11px] text-slate-300">{time}</p>}
            {onEdit && (
              <button onClick={onEdit} aria-label="질문 수정하기" className="text-slate-300">
                <Pencil size={13} />
              </button>
            )}
          </div>
        </div>
        <p className="text-lg font-bold text-slate-900 leading-snug">{questionText}</p>
        {guideText && <p className="text-xs text-slate-400 mt-0.5">{guideText}</p>}
      </div>
    </div>
  )
}
