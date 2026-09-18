import type { ReactNode } from 'react'
import { useAccessibility } from '../context/AccessibilityContext'

// 이 프로젝트는 "환자 휴대폰 한 대"에서만 동작하는 모바일 전용 서비스입니다.
// 실제 휴대폰(좁은 화면)에서는 화면 전체를 그대로 채우고, PC 등 넓은 화면(sm 이상)에서는
// 휴대폰 모양의 카드로 보여줍니다.
//
// 처음엔 데스크톱에서도 폰 비율(9:19)을 억지로 고정했는데, 그러면 창 폭이 넓어져도
// 카드가 어느 지점부터 더 안 커지거나(높이에 막혀서) 억지로 좁게 유지되는 문제가
// 있었습니다. 데스크톱에서는 폰 모양을 그대로 유지할 필요는 없고, 화면에 맞게 비율이
// 자연스럽게 넓어지는 게 맞다는 방향으로 정리해서 — 폭과 높이를 각각 독립적으로
// (`clamp`) 화면 크기에 비례해 키웁니다. 그 결과 비율은 화면 크기에 따라 자유롭게
// 달라지고, 항상 폭이 커지는 만큼 실제로 카드도 커집니다.
// data-large-text / data-high-contrast 속성은 index.css의 접근성 스타일과 연결됩니다.
export default function PhoneScreen({ children }: { children: ReactNode }) {
  const { largeText, highContrast } = useAccessibility()

  return (
    <div className="min-h-screen bg-white sm:bg-slate-100 flex items-center justify-center sm:p-4">
      <div
        data-large-text={largeText || undefined}
        data-high-contrast={highContrast || undefined}
        className="a11y-scope w-full h-full min-h-screen sm:min-h-0 sm:h-[clamp(700px,84vh,900px)] sm:w-[clamp(480px,34vw,640px)] bg-white sm:rounded-3xl sm:shadow-lg flex flex-col p-5 sm:p-6 lg:p-8 overflow-y-auto transition-[width,height] duration-200 ease-out"
      >
        {children}
      </div>
    </div>
  )
}
