import type { ReactNode } from 'react'
import { useAccessibility } from '../context/AccessibilityContext'

// 이 프로젝트는 "환자 휴대폰 한 대"에서만 동작하는 모바일 전용 서비스입니다.
// 그래서 모든 화면을 이 컴포넌트로 감싸서, PC로 봐도 항상 휴대폰 비율(폭 좁게)로 보이게 만들었습니다.
// 디자인이 나오면 이 틀 안에 내용만 갈아끼우면 됩니다.
// data-large-text / data-high-contrast 속성은 index.css의 접근성 스타일과 연결됩니다.
export default function PhoneScreen({ children }: { children: ReactNode }) {
  const { largeText, highContrast } = useAccessibility()

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
      <div
        data-large-text={largeText || undefined}
        data-high-contrast={highContrast || undefined}
        className="a11y-scope w-full max-w-sm min-h-[640px] bg-white rounded-3xl shadow-lg flex flex-col p-6"
      >
        {children}
      </div>
    </div>
  )
}
