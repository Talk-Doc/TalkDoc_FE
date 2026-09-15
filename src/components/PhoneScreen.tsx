import type { ReactNode } from 'react'
import { useAccessibility } from '../context/AccessibilityContext'

// 이 프로젝트는 "환자 휴대폰 한 대"에서만 동작하는 모바일 전용 서비스입니다.
// 실제 휴대폰(좁은 화면)에서는 화면 전체를 그대로 채우고, PC 등 넓은 화면(sm 이상)에서만
// 보기 편하도록 휴대폰 모양의 카드로 보여줍니다.
// data-large-text / data-high-contrast 속성은 index.css의 접근성 스타일과 연결됩니다.
export default function PhoneScreen({ children }: { children: ReactNode }) {
  const { largeText, highContrast } = useAccessibility()

  return (
    <div className="min-h-screen bg-white sm:bg-slate-100 flex items-center justify-center sm:p-4">
      <div
        data-large-text={largeText || undefined}
        data-high-contrast={highContrast || undefined}
        className="a11y-scope w-full h-full min-h-screen sm:h-auto sm:max-w-sm sm:min-h-[640px] bg-white sm:rounded-3xl sm:shadow-lg flex flex-col p-5 sm:p-6"
      >
        {children}
      </div>
    </div>
  )
}
