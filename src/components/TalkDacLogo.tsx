import talkdacIcon from '../assets/talkdac-icon.png'
import talkdacWordmark from '../assets/talkdac-wordmark.png'
import { useDesktopMode } from '../context/DesktopModeContext'

// 서비스 로고. 디자이너가 만든 실제 로고 파일(src/assets/talkdac-icon.png,
// talkdac-wordmark.png)을 사용합니다.
// stacked=true면 아이콘 아래에 워드마크가 오는 세로 배치(랜딩 화면용),
// 기본값은 아이콘 옆에 워드마크가 오는 가로 배치(헤더용)입니다.
// 데스크톱 체험 모드에서는 호출하는 쪽에서 size를 따로 바꾸지 않아도 자동으로
// 조금 더 크게 보이도록, 여기서 일괄적으로 스케일을 올립니다.
export default function TalkDacLogo({
  size = 'md',
  stacked = false,
}: {
  size?: 'sm' | 'md' | 'lg'
  stacked?: boolean
}) {
  const { desktopMode } = useDesktopMode()
  const scale = desktopMode ? 1.35 : 1

  const sizes = {
    sm: { icon: 24, wordmarkHeight: 16 },
    md: { icon: 40, wordmarkHeight: 28 },
    lg: { icon: 76, wordmarkHeight: 52 },
  }[size]

  const icon = (
    <img
      src={talkdacIcon}
      alt="TalkDac"
      width={Math.round(sizes.icon * scale)}
      height={Math.round(sizes.icon * scale)}
      className="shrink-0"
    />
  )
  const wordmark = (
    <img
      src={talkdacWordmark}
      alt="TalkDac"
      style={{ height: Math.round(sizes.wordmarkHeight * scale) }}
    />
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
