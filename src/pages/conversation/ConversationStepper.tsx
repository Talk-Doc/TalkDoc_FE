import { Circle, Sparkles, FileText, Send } from 'lucide-react'
import { useDesktopMode } from '../../context/DesktopModeContext'

const NODES = [
  { label: '질문 확인 중', sub: '(의료진 음성 입력)' },
  { label: 'AI 분석 중', sub: '(수어 → 텍스트)' },
  { label: '결과 확인 대기', sub: '(환자)' },
  { label: '의료진에게 전달', sub: '(다음 질문)' },
]

const ICONS = [Circle, Sparkles, FileText, Send]

// 상단의 4단계 진행 표시줄입니다. Figma 최종 디자인 기준:
// 진행 중 단계는 채워진 청록 원 + 펄스 링, 지난 단계는 연한 청록 테두리, 아직 안 온 단계는 회색.
// phaseLabel은 원 위에 뜨는 상태 배지("현재 질문 확인 중" 등)입니다.
// 데스크톱 모드에서는 원/아이콘/글자를 한 단계씩 키워서, 넓어진 헤더 폭에 비해
// 점 4개만 작게 떠 있는 것처럼 보이지 않게 합니다.
export default function ConversationStepper({
  activeIndex,
  phaseLabel,
}: {
  activeIndex: number
  phaseLabel?: string
}) {
  const { desktopMode } = useDesktopMode()

  return (
    <div className="mb-5">
      {phaseLabel && (
        <span
          className={`inline-block mb-3 font-semibold text-teal-700 bg-teal-50 rounded-full ${
            desktopMode ? 'text-sm px-4 py-2' : 'text-xs px-3 py-1.5'
          }`}
        >
          {phaseLabel}
        </span>
      )}
      <div className="relative">
        <div
          className={`absolute border-t border-dashed border-slate-200 ${
            desktopMode ? 'top-6 left-6 right-6' : 'top-4 left-4 right-4'
          }`}
        />
        <div className="relative flex justify-between">
          {NODES.map(({ label, sub }, i) => {
            const Icon = ICONS[i]
            const state = i < activeIndex ? 'done' : i === activeIndex ? 'active' : 'upcoming'
            return (
              <div key={label} className="flex flex-col items-center gap-1.5 w-1/4">
                <div className="relative">
                  {state === 'active' && (
                    <span className="absolute inset-0 rounded-full bg-teal-400 animate-ping opacity-40" />
                  )}
                  <div
                    className={`relative rounded-full flex items-center justify-center ${
                      desktopMode ? 'w-12 h-12' : 'w-8 h-8'
                    } ${
                      state === 'active'
                        ? 'bg-teal-600 text-white'
                        : state === 'done'
                          ? 'bg-white border-2 border-teal-400 text-teal-600'
                          : 'bg-white border-2 border-slate-200 text-slate-300'
                    }`}
                  >
                    <Icon size={desktopMode ? 22 : 15} />
                  </div>
                </div>
                <span
                  className={`leading-tight text-center font-semibold ${
                    desktopMode ? 'text-sm' : 'text-[9px]'
                  } ${state === 'active' ? 'text-teal-700' : 'text-slate-400'}`}
                >
                  {label}
                </span>
                <span className={`leading-tight text-center text-slate-300 ${desktopMode ? 'text-xs' : 'text-[8px]'}`}>
                  {sub}
                </span>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
