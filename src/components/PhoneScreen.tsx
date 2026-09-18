import type { ReactNode } from 'react'
import { useAccessibility } from '../context/AccessibilityContext'

// 이 프로젝트는 "환자 휴대폰 한 대"에서만 동작하는 모바일 전용 서비스입니다.
// 실제 휴대폰(좁은 화면)에서는 화면 전체를 그대로 채우고, PC 등 넓은 화면(sm 이상)에서는
// 휴대폰 모양의 카드로 보여줍니다.
//
// px 단위 clamp/보간 공식을 여러 번 시도했는데, 결국 원하신 건 "화면을 늘리면 카드도
// 화면 대비 꽉 차 보여야 한다"였습니다. px 기반 공식은 화면이 커질수록 카드가 화면에서
// 차지하는 비중이 점점 작아 보이는 문제가 있어서, 그냥 뷰포트 크기에 대한 비율(vw/vh)로
// 직접 잡는 훨씬 단순한 방식으로 바꿨습니다 — 어떤 화면 크기에서도 항상 폭의 92%,
// 높이의 92%를 차지해서 "꽉 찬" 느낌이 유지됩니다.
// data-large-text / data-high-contrast 속성은 index.css의 접근성 스타일과 연결됩니다.
export default function PhoneScreen({ children }: { children: ReactNode }) {
  const { largeText, highContrast } = useAccessibility()

  return (
    <div className="min-h-screen bg-white sm:bg-slate-100 flex items-center justify-center">
      <div
        data-large-text={largeText || undefined}
        data-high-contrast={highContrast || undefined}
        className="a11y-scope w-full h-full min-h-screen sm:min-h-0 sm:w-[92vw] sm:h-[92vh] bg-white sm:rounded-3xl sm:shadow-lg flex flex-col p-5 sm:p-6 lg:p-8 overflow-y-auto"
      >
        {children}
      </div>
    </div>
  )
}
