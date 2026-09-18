import type { ReactNode } from 'react'
import { useAccessibility } from '../context/AccessibilityContext'

// 이 프로젝트는 "환자 휴대폰 한 대"에서만 동작하는 모바일 전용 서비스입니다.
// 실제 휴대폰(좁은 화면)에서는 화면 전체를 그대로 채우고, PC 등 넓은 화면(sm 이상)에서는
// 휴대폰 모양의 카드로 보여줍니다. 심사 등에서 데스크톱으로 볼 때 카메라 미리보기 같은
// 요소가 너무 작아 보이지 않도록, 카드 "높이"를 뷰포트 높이에 비례해 매끄럽게 늘리고
// (`clamp`, 대부분의 데스크톱 창은 세로보다 가로가 넉넉해서 높이를 기준으로 잡는 게
// 자연스럽습니다) 폭은 `aspect-ratio`로 실제 스마트폰 비율(9:19)을 그대로 따라가게
// 해서, 화면이 넓어져도 뚱뚱해지지 않고 늘 폰처럼 좁고 긴 모양을 유지합니다.
// data-large-text / data-high-contrast 속성은 index.css의 접근성 스타일과 연결됩니다.
export default function PhoneScreen({ children }: { children: ReactNode }) {
  const { largeText, highContrast } = useAccessibility()

  return (
    <div className="min-h-screen bg-white sm:bg-slate-100 flex items-center justify-center sm:p-4">
      <div
        data-large-text={largeText || undefined}
        data-high-contrast={highContrast || undefined}
        className="a11y-scope w-full h-full min-h-screen sm:min-h-0 sm:w-auto sm:h-[clamp(640px,88vh,900px)] sm:aspect-[9/19] bg-white sm:rounded-3xl sm:shadow-lg flex flex-col p-5 sm:p-6 lg:p-8 overflow-y-auto"
      >
        {children}
      </div>
    </div>
  )
}
