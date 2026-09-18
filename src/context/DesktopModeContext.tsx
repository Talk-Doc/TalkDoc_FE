import { createContext, useContext, useState, type ReactNode } from 'react'

// "데스크톱 환경에서 체험하기"를 켜면, PhoneScreen이 작은 폰 카드 대신 화면에 맞는
// 넓은 데스크톱 레이아웃으로 렌더링합니다. 처음 접속(또는 새로고침)했을 땐 항상
// 기본 폰 화면으로 보여야 해서 localStorage에 저장하지 않고, 매번 false로 시작합니다.
// 토글 상태는 페이지를 이동해도(react-router 클라이언트 내비게이션) React state로 유지됩니다.
interface DesktopModeState {
  desktopMode: boolean
  toggleDesktopMode: () => void
}

const DesktopModeContext = createContext<DesktopModeState | null>(null)

export function DesktopModeProvider({ children }: { children: ReactNode }) {
  const [desktopMode, setDesktopMode] = useState(false)

  return (
    <DesktopModeContext.Provider value={{ desktopMode, toggleDesktopMode: () => setDesktopMode((v) => !v) }}>
      {children}
    </DesktopModeContext.Provider>
  )
}

export function useDesktopMode() {
  const ctx = useContext(DesktopModeContext)
  if (!ctx) throw new Error('useDesktopMode는 DesktopModeProvider 안에서만 쓸 수 있어요.')
  return ctx
}
