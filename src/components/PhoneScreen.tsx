import type { ReactNode } from 'react'
import { useAccessibility } from '../context/AccessibilityContext'
import { useDesktopMode } from '../context/DesktopModeContext'

// 이 프로젝트는 "환자 휴대폰 한 대"에서만 동작하는 모바일 전용 서비스입니다.
// 실제 휴대폰(좁은 화면)에서는 화면 전체를 그대로 채우고, PC 등 넓은 화면(sm 이상)에서는
// 기본적으로 작은 휴대폰 모양의 카드로 보여줍니다(데스크톱에서도 실제 폰처럼 보이게).
//
// "데스크톱 환경에서 체험하기"를 켜면(useDesktopMode, ReadyPage의 토글 버튼) 화면 폭/높이의
// 92%를 차지하는 넓은 레이아웃으로 바뀝니다 — 심사처럼 데스크톱에서 편하게 크게 보고 싶을
// 때를 위한 별도 모드이고, 기본값은 계속 작은 폰 카드입니다.
// data-large-text / data-high-contrast 속성은 index.css의 접근성 스타일과 연결됩니다.
export default function PhoneScreen({ children }: { children: ReactNode }) {
  const { largeText, highContrast } = useAccessibility()
  const { desktopMode } = useDesktopMode()

  return (
    <div className={`min-h-screen bg-white sm:bg-slate-100 flex items-center justify-center ${desktopMode ? '' : 'sm:p-4'}`}>
      <div
        data-large-text={largeText || undefined}
        data-high-contrast={highContrast || undefined}
        className={`a11y-scope w-full h-full min-h-screen sm:min-h-0 bg-white sm:rounded-3xl sm:shadow-lg flex flex-col p-5 sm:p-6 overflow-y-auto ${
          desktopMode ? 'sm:w-[92vw] sm:h-[92vh] lg:p-8' : 'sm:w-full sm:max-w-sm sm:min-h-[640px]'
        }`}
      >
        {desktopMode ? (
          // 넓은 카드에 내용을 그냥 늘려서 채우면 버튼/글씨만 어색하게 벌어지므로,
          // 가운데에 원래 폰 화면 비율의 좁은 컬럼을 두고 나머지는 여백으로 둡니다.
          <div className="w-full h-full flex flex-col mx-auto max-w-md">{children}</div>
        ) : (
          children
        )}
      </div>
    </div>
  )
}
