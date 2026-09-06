import { createContext, useContext, useState, type ReactNode } from 'react'

// 디자인의 "글자 크게 보기 / 고대비 모드" 버튼을 실제로 동작하게 만드는 전역 상태입니다.
// PhoneScreen 최상단에 이 값을 data-attribute로 내려주고, index.css에서 그 값에 따라
// 글자 크기 / 색상 대비를 바꿉니다.
interface AccessibilityState {
  largeText: boolean
  highContrast: boolean
  toggleLargeText: () => void
  toggleHighContrast: () => void
}

const AccessibilityContext = createContext<AccessibilityState | null>(null)

export function AccessibilityProvider({ children }: { children: ReactNode }) {
  const [largeText, setLargeText] = useState(false)
  const [highContrast, setHighContrast] = useState(false)

  return (
    <AccessibilityContext.Provider
      value={{
        largeText,
        highContrast,
        toggleLargeText: () => setLargeText((v) => !v),
        toggleHighContrast: () => setHighContrast((v) => !v),
      }}
    >
      {children}
    </AccessibilityContext.Provider>
  )
}

export function useAccessibility() {
  const ctx = useContext(AccessibilityContext)
  if (!ctx) throw new Error('useAccessibility는 AccessibilityProvider 안에서만 쓸 수 있어요.')
  return ctx
}
