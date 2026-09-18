import type { ReactNode } from 'react'
import { useAccessibility } from '../context/AccessibilityContext'

// 이 프로젝트는 "환자 휴대폰 한 대"에서만 동작하는 모바일 전용 서비스입니다.
// 실제 휴대폰(좁은 화면)에서는 화면 전체를 그대로 채우고, PC 등 넓은 화면(sm 이상)에서는
// 휴대폰 모양의 카드로 보여줍니다.
//
// 처음엔 데스크톱에서도 폰 비율(9:19)을 억지로 고정했는데, 그러면 창 폭이 넓어져도
// 카드가 어느 지점부터 더 안 커지거나(높이에 막혀서) 억지로 좁게 유지되는 문제가
// 있었습니다. 데스크톱에서는 폰 모양을 그대로 유지할 필요는 없고, 화면에 맞게 비율이
// 자연스럽게 넓어지는 게 맞다는 방향으로 정리해서 — 폭과 높이를 각각 독립적으로
// 화면 크기에 비례해 키웁니다.
//
// "최소값 + vw%" 형태의 단순 clamp는 최소값에 도달하는 지점이 의도한 시작 지점(640px)
// 보다 훨씬 뒤(약 1412px)라서, 그 사이 구간에서는 화면을 늘려도 전혀 안 커지는 "정체
// 구간"이 생겼습니다. 그래서 "640px 폭일 때 480px, 1920px 폭일 때 640px"처럼 두 지점을
// 직접 잇는 선형 보간(linear interpolation, calc(최소값 + 기울기 * 100vw)) 공식을 써서
// 640px를 넘는 순간부터 정체 구간 없이 계속 자라도록 했습니다.
// 상한(1920px 이후로는 안 커지게 한 것)은 요청에 따라 제거했습니다 — max()를 써서
// 최소값(모바일 화면 바로 다음 크기) 밑으로는 안 내려가되, 위쪽은 제한 없이 같은
// 기울기로 계속 커집니다.
// data-large-text / data-high-contrast 속성은 index.css의 접근성 스타일과 연결됩니다.
export default function PhoneScreen({ children }: { children: ReactNode }) {
  const { largeText, highContrast } = useAccessibility()

  return (
    <div className="min-h-screen bg-white sm:bg-slate-100 flex items-center justify-center sm:p-4">
      <div
        data-large-text={largeText || undefined}
        data-high-contrast={highContrast || undefined}
        className="a11y-scope w-full h-full min-h-screen sm:min-h-0 sm:h-[max(700px,500px_+_37vh)] sm:w-[max(480px,400px_+_12.5vw)] bg-white sm:rounded-3xl sm:shadow-lg flex flex-col p-5 sm:p-6 lg:p-8 overflow-y-auto transition-[width,height] duration-200 ease-out"
      >
        {children}
      </div>
    </div>
  )
}
