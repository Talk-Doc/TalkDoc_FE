import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'

// "데스크톱 환경에서 체험하기"를 켜면, PhoneScreen이 작은 폰 카드 대신 화면에 맞는
// 넓은 데스크톱 레이아웃으로 렌더링합니다. 새로고침해도 유지되도록 localStorage에
// 저장해두고, 마운트 시 그 값으로 초기화합니다.
const STORAGE_KEY = 'talkdoc:desktopMode'

interface DesktopModeState {
  desktopMode: boolean
  toggleDesktopMode: () => void
}

const DesktopModeContext = createContext<DesktopModeState | null>(null)

function readInitial(): boolean {
  try {
    return localStorage.getItem(STORAGE_KEY) === '1'
  } catch {
    return false
  }
}

export function DesktopModeProvider({ children }: { children: ReactNode }) {
  const [desktopMode, setDesktopMode] = useState(readInitial)

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, desktopMode ? '1' : '0')
    } catch {
      // 저장 실패해도(시크릿 모드 등) 이번 세션 안에서는 정상 동작합니다.
    }
  }, [desktopMode])

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
