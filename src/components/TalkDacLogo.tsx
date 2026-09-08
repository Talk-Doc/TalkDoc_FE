import { Hand } from 'lucide-react'

// 서비스 로고. 실제 로고 파일(svg/png)이 아직 없어서, Figma 목업 속 모양(파란 'T' +
// 청록색 말풍선-손 심볼이 겹친 형태)을 최대한 비슷하게 흉내 낸 대체 마크입니다.
// 실제 에셋을 받으면 LogoMark 부분만 <img>로 교체하면 됩니다.
// stacked=true면 아이콘 아래에 워드마크가 오는 세로 배치(랜딩 화면용),
// 기본값은 아이콘 옆에 워드마크가 오는 가로 배치(헤더용)입니다.
function LogoMark({ size }: { size: number }) {
  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <div className="absolute inset-0 rounded-[28%] bg-gradient-to-br from-blue-900 via-blue-600 to-teal-400 flex items-center justify-start pl-[16%]">
        <span
          className="font-black text-white leading-none"
          style={{ fontSize: size * 0.55 }}
        >
          T
        </span>
      </div>
      <div
        className="absolute rounded-full bg-gradient-to-br from-teal-400 to-teal-500 flex items-center justify-center ring-4 ring-white"
        style={{ width: size * 0.58, height: size * 0.58, right: '-8%', bottom: '-8%' }}
      >
        <Hand size={size * 0.32} className="text-white" strokeWidth={2.5} />
      </div>
    </div>
  )
}

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
        <LogoMark size={sizes.icon} />
        {wordmark}
      </div>
    )
  }

  return (
    <div className="flex items-center gap-2">
      <LogoMark size={sizes.icon} />
      {wordmark}
    </div>
  )
}
