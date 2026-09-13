import type { ReactNode } from 'react'
import { ShieldAlert, ChevronLeft } from 'lucide-react'
import TalkDacLogo from '../../components/TalkDacLogo'
import ConversationStepper from './ConversationStepper'

// 대화 진행 중 화면들이 공통으로 쓰는 뼈대: 로고 + 대화 종료 버튼(헤더), 4단계 스테퍼.
// 화면마다 달라지는 내용(카드들)은 children으로 받습니다.
// onBack이 주어지면 로고 자리에 "이전 단계로" 화살표를 함께 보여줍니다(없으면 더 되돌아갈 곳이 없는 화면).
export default function ConversationScreenShell({
  activeIndex,
  phaseLabel,
  onRequestEnd,
  onBack,
  children,
}: {
  activeIndex: number
  phaseLabel?: string
  onRequestEnd: () => void
  onBack?: () => void
  children: ReactNode
}) {
  return (
    <div className="flex-1 flex flex-col">
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2">
          {onBack && (
            <button
              onClick={onBack}
              aria-label="이전 단계로"
              className="w-7 h-7 -ml-1 flex items-center justify-center text-slate-400 rounded-full hover:bg-slate-50"
            >
              <ChevronLeft size={18} />
            </button>
          )}
          <TalkDacLogo size="sm" />
        </div>
        <button
          onClick={onRequestEnd}
          className="flex items-center gap-1 text-xs font-medium text-red-500 border border-red-200 rounded-full px-3 py-1.5"
        >
          <ShieldAlert size={13} />
          대화 종료
        </button>
      </div>

      <ConversationStepper activeIndex={activeIndex} phaseLabel={phaseLabel} />

      <div className="flex-1 flex flex-col gap-4">{children}</div>
    </div>
  )
}
