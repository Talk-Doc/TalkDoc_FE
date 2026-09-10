import logoMark from '../assets/logo-mark.png'

// 서비스 로고. Figma 최종 디자인에서 크롭한 실제 로고 이미지를 씁니다.
// stacked=true면 아이콘 아래에 워드마크가 오는 세로 배치(랜딩 화면용),
// 기본값은 아이콘 옆에 워드마크가 오는 가로 배치(헤더용)입니다.
export default function TalkDacLogo({
  size = 'md',
  stacked = false,
}: {
  size?: 'sm' | 'md' | 'lg'
  stacked?: boolean
}) {
  const sizes = {
    sm: { icon: 24, text: 'text-base' },
    md: { icon: 40, text: 'text-2xl' },
    lg: { icon: 76, text: 'text-4xl' },
  }[size]

  const mark = <img src={logoMark} alt="" style={{ width: sizes.icon, height: sizes.icon }} className="shrink-0" />

  const wordmark = (
    <span className={`${sizes.text} font-extrabold tracking-tight`}>
      <span className="text-slate-900">TALK</span>
      <span className="bg-gradient-to-r from-teal-500 to-teal-600 bg-clip-text text-transparent">
        DAC
      </span>
    </span>
  )

  if (stacked) {
    return (
      <div className="flex flex-col items-center gap-3">
        {mark}
        {wordmark}
      </div>
    )
  }

  return (
    <div className="flex items-center gap-2">
      {mark}
      {wordmark}
    </div>
  )
}
