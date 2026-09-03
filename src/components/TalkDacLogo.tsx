import { Hand } from 'lucide-react'

// 서비스 로고. 실제 로고 파일이 아직 없어서(디자이너 확인 전) 비슷한 느낌의
// 아이콘 + 워드마크 조합으로 대체했습니다. 나중에 실제 로고 이미지(svg/png)가
// 오면 이 컴포넌트 내부만 교체하면 됩니다.
export default function TalkDacLogo({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) {
  const sizes = {
    sm: { icon: 'w-6 h-6', iconInner: 14, text: 'text-base' },
    md: { icon: 'w-10 h-10', iconInner: 22, text: 'text-2xl' },
    lg: { icon: 'w-20 h-20', iconInner: 40, text: 'text-4xl' },
  }[size]

  return (
    <div className="flex items-center gap-2">
      <div
        className={`${sizes.icon} rounded-xl bg-gradient-to-br from-blue-500 to-emerald-400 flex items-center justify-center shrink-0`}
      >
        <Hand size={sizes.iconInner} className="text-white" strokeWidth={2.25} />
      </div>
      <span className={`${sizes.text} font-extrabold tracking-tight`}>
        <span className="text-slate-900">TALK</span>
        <span className="bg-gradient-to-r from-blue-500 to-emerald-400 bg-clip-text text-transparent">
          DAC
        </span>
      </span>
    </div>
  )
}
