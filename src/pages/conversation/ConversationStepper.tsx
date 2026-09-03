import { Mic, User, Hand, Cpu, CheckCircle2, Send } from 'lucide-react'

const NODES = [
  { label: '의료진 질문 중', icon: Mic },
  { label: '환자 답변 대기', icon: User },
  { label: '수어 입력 중', icon: Hand },
  { label: 'AI 분석 중', icon: Cpu },
  { label: '답변 확인', icon: CheckCircle2 },
  { label: '전달 완료', icon: Send },
]

// 상단의 6단계 진행 표시줄입니다.
// activeIndex보다 앞선 단계는 "완료"(연한 색), activeIndex는 "진행 중"(파란색 강조), 뒤는 "아직"(회색)으로 표시합니다.
export default function ConversationStepper({ activeIndex }: { activeIndex: number }) {
  return (
    <div className="relative mb-5">
      <div className="absolute top-4 left-4 right-4 border-t border-dashed border-slate-200" />
      <div className="relative flex justify-between">
        {NODES.map(({ label, icon: Icon }, i) => {
          const state = i < activeIndex ? 'done' : i === activeIndex ? 'active' : 'upcoming'
          return (
            <div key={label} className="flex flex-col items-center gap-1 w-1/6">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center bg-white border-2 ${
                  state === 'active'
                    ? 'border-blue-500 text-blue-500'
                    : state === 'done'
                      ? 'border-blue-200 text-blue-300'
                      : 'border-slate-200 text-slate-300'
                }`}
              >
                <Icon size={15} />
              </div>
              <span
                className={`text-[9px] leading-tight text-center ${
                  state === 'active' ? 'text-blue-600 font-semibold' : 'text-slate-400'
                }`}
              >
                {label}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
