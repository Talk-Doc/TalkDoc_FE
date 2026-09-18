import type { ReactNode } from 'react'
import { useAccessibility } from '../context/AccessibilityContext'

// 이 프로젝트는 "환자 휴대폰 한 대"에서만 동작하는 모바일 전용 서비스입니다.
// 실제 휴대폰(좁은 화면)에서는 화면 전체를 그대로 채우고, PC 등 넓은 화면(sm 이상)에서는
// 휴대폰 모양의 카드로 보여줍니다. 창 폭을 늘릴수록 카드가 그에 비례해 매끄럽게 커지도록
// (`clamp`) 폭을 기준으로 잡고, 높이는 `aspect-ratio`로 실제 스마트폰 비율(9:19)을 그대로
// 따라가게 했습니다. 다만 세로로 아주 짧은 창에서는 카드가 뷰포트보다 커질 수 있어서
// max-h로 상한을 두고, 넘치는 내용은 카드 안에서 스크롤되게 했습니다(overflow-y-auto).
// data-large-text / data-high-contrast 속성은 index.css의 접근성 스타일과 연결됩니다.
export default function PhoneScreen({ children }: { children: ReactNode }) {
  const { largeText, highContrast } = useAccessibility()

  return (
    <div className="min-h-screen bg-white sm:bg-slate-100 flex items-center justify-center sm:p-4">
      <div
        data-large-text={largeText || undefined}
        data-high-contrast={highContrast || undefined}
        className="a11y-scope w-full h-full min-h-screen sm:min-h-0 sm:w-[clamp(352px,32vw,460px)] sm:aspect-[9/19] sm:max-h-[92vh] bg-white sm:rounded-3xl sm:shadow-lg flex flex-col p-5 sm:p-6 lg:p-8 overflow-y-auto"
      >
        {children}
      </div>
    </div>
  )
}
