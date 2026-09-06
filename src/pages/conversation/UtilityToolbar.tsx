import { RotateCcw, CaseSensitive, CircleDashed } from 'lucide-react'
import { useAccessibility } from '../../context/AccessibilityContext'

// 디자인의 "더 편하게 이용하기" 3버튼(질문 다시 보기 / 글자 크게 보기 / 고대비 모드)입니다.
// 글자 크게 보기·고대비 모드는 AccessibilityContext에 바로 연결되어 실제로 화면에 적용되고,
// 질문 다시 보기는 화면마다 "다시 보여줄 질문"이 다르므로 onReplayQuestion으로 위임받습니다.
export default function UtilityToolbar({
  onReplayQuestion,
}: {
  onReplayQuestion?: () => void
}) {
  const { largeText, highContrast, toggleLargeText, toggleHighContrast } = useAccessibility()

  return (
    <div>
      <p className="text-xs font-semibold text-slate-400 mb-2">더 편하게 이용하기</p>
      <div className="grid grid-cols-3 gap-2">
        <button
          onClick={onReplayQuestion}
          disabled={!onReplayQuestion}
          className="flex flex-col items-center gap-1.5 py-3 rounded-xl bg-slate-50 text-slate-600 text-[11px] font-medium disabled:opacity-40"
        >
          <RotateCcw size={17} />
          질문 다시 보기
        </button>
        <button
          onClick={toggleLargeText}
          aria-pressed={largeText}
          className={`flex flex-col items-center gap-1.5 py-3 rounded-xl text-[11px] font-medium ${
            largeText ? 'bg-teal-500 text-white' : 'bg-slate-50 text-slate-600'
          }`}
        >
          <CaseSensitive size={17} />
          글자 크게 보기
        </button>
        <button
          onClick={toggleHighContrast}
          aria-pressed={highContrast}
          className={`flex flex-col items-center gap-1.5 py-3 rounded-xl text-[11px] font-medium ${
            highContrast ? 'bg-teal-500 text-white' : 'bg-slate-50 text-slate-600'
          }`}
        >
          <CircleDashed size={17} />
          고대비 모드
        </button>
      </div>
    </div>
  )
}
