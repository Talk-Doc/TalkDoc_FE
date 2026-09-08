import talkdacIcon from '../assets/talkdac-icon.png'
import talkdacWordmark from '../assets/talkdac-wordmark.png'

// 서비스 로고. 디자이너가 만든 실제 로고 파일(src/assets/talkdac-icon.png,
// talkdac-wordmark.png)을 사용합니다.
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
    sm: { icon: 24, wordmarkHeight: 16 },
    md: { icon: 40, wordmarkHeight: 28 },
    lg: { icon: 76, wordmarkHeight: 52 },
  }[size]

  const icon = (
    <img
      src={talkdacIcon}
      alt="TalkDac"
      width={sizes.icon}
      height={sizes.icon}
      className="shrink-0"
    />
  )
  const wordmark = (
    <img src={talkdacWordmark} alt="TalkDac" style={{ height: sizes.wordmarkHeight }} />
  )

  if (stacked) {
    return (
      <div className="flex flex-col items-center gap-3">
        {icon}
        {wordmark}
      </div>
    )
  }

  return (
    <div className="flex items-center gap-2">
      {icon}
      {wordmark}
    </div>
  )
}
