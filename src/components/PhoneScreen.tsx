import type { ReactNode } from 'react'
import { useAccessibility } from '../context/AccessibilityContext'

// 이 프로젝트는 "환자 휴대폰 한 대"에서만 동작하는 모바일 전용 서비스입니다.
// 실제 휴대폰(좁은 화면)에서는 화면 전체를 그대로 채우고, PC 등 넓은 화면(sm 이상)에서는
// 휴대폰 모양의 카드로 보여줍니다. 심사 등에서 데스크톱으로 볼 때 카메라 미리보기 같은
// 요소가 너무 작아 보이지 않도록, 화면이 넓어질수록(md/lg/xl) 카드 자체를 점점 더 큰
// "가상 휴대폰"처럼 비례해서 키웁니다 — 좌우로 나뉘는 별도 PC 레이아웃은 아니고,
// 세로 1단 구성은 그대로 유지한 채 카드 크기만 커지는 방식입니다.
// data-large-text / data-high-contrast 속성은 index.css의 접근성 스타일과 연결됩니다.
export default function PhoneScreen({ children }: { children: ReactNode }) {
  const { largeText, highContrast } = useAccessibility()

  return (
    <div className="min-h-screen bg-white sm:bg-slate-100 flex items-center justify-center sm:p-4">
      <div
        data-large-text={largeText || undefined}
        data-high-contrast={highContrast || undefined}
        className="a11y-scope w-full h-full min-h-screen sm:h-auto sm:max-w-sm sm:min-h-[640px] md:max-w-md md:min-h-[720px] lg:max-w-lg lg:min-h-[820px] xl:max-w-xl xl:min-h-[880px] bg-white sm:rounded-3xl sm:shadow-lg flex flex-col p-5 sm:p-6 lg:p-8"
      >
        {children}
      </div>
    </div>
  )
}
