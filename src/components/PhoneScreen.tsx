import type { ReactNode } from 'react'
import { useAccessibility } from '../context/AccessibilityContext'

// 이 프로젝트는 "환자 휴대폰 한 대"에서만 동작하는 모바일 전용 서비스입니다.
// 실제 휴대폰(좁은 화면)에서는 화면 전체를 그대로 채우고, PC 등 넓은 화면(sm 이상)에서는
// 휴대폰 모양의 카드로 보여줍니다. 심사 등에서 데스크톱으로 볼 때 카메라 미리보기 같은
// 요소가 너무 작아 보이지 않도록, 카드 폭을 뷰포트 폭에 비례해 매끄럽게 늘리고
// (`clamp`) 높이는 `aspect-ratio`로 폭을 그대로 따라가게 해서, 화면이 아무리 넓어져도
// "휴대폰 비율"이 구간마다 흐트러지지 않고 항상 같은 모양으로 커지도록 했습니다.
// data-large-text / data-high-contrast 속성은 index.css의 접근성 스타일과 연결됩니다.
export default function PhoneScreen({ children }: { children: ReactNode }) {
  const { largeText, highContrast } = useAccessibility()

  return (
    <div className="min-h-screen bg-white sm:bg-slate-100 flex items-center justify-center sm:p-4">
      <div
        data-large-text={largeText || undefined}
        data-high-contrast={highContrast || undefined}
        className="a11y-scope w-full h-full min-h-screen sm:min-h-0 sm:h-auto sm:w-[clamp(352px,34vw,600px)] sm:aspect-[5/8] sm:max-h-[92vh] bg-white sm:rounded-3xl sm:shadow-lg flex flex-col p-5 sm:p-6 lg:p-8 overflow-y-auto"
      >
        {children}
      </div>
    </div>
  )
}
