import { useNavigate } from 'react-router-dom'
import { ChevronRight } from 'lucide-react'
import PhoneScreen from '../components/PhoneScreen'
import TalkDacLogo from '../components/TalkDacLogo'

// "공통 화면 홈" 디자인 그대로: 로고 + 태그라인 + 버튼만 있고 일러스트는 없습니다.
// 의사-환자 일러스트는 /ready, 질문 대기 화면에서만 씁니다.
export default function LandingPage() {
  const navigate = useNavigate()

  return (
    <PhoneScreen>
      <div className="flex-1 flex flex-col items-center justify-center text-center gap-4">
        <TalkDacLogo size="lg" stacked />
        <p className="text-sm text-slate-500">의료진과의 대화를 AI가 도와드릴게요.</p>
      </div>

      <button
        onClick={() => navigate('/ready')}
        className="w-full flex items-center justify-center gap-1.5 py-4 rounded-full bg-gradient-to-r from-teal-600 to-teal-700 text-white font-semibold shadow-lg shadow-teal-700/25"
      >
        대화 시작하기
        <ChevronRight size={18} />
      </button>
    </PhoneScreen>
  )
}
