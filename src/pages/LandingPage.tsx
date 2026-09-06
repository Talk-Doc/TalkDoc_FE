import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ChevronRight, Lock, Stethoscope, User, MessageCircle } from 'lucide-react'
import PhoneScreen from '../components/PhoneScreen'
import TalkDacLogo from '../components/TalkDacLogo'
import { useSession } from '../session/useSession'
import { errorMessage } from '../api/client'

// 실제 로고/일러스트(의료진-환자 그림) 원본 파일이 아직 없어서,
// 비슷한 느낌의 아이콘 조합으로 대체해뒀습니다. 디자이너에게 최종 에셋을 받으면
// 이 파일의 "일러스트 자리"만 이미지로 바꾸면 됩니다.
export default function LandingPage() {
  const navigate = useNavigate()
  const { startSession, starting } = useSession()
  const [error, setError] = useState<string | null>(null)

  const handleStart = async () => {
    setError(null)
    try {
      // 백엔드에 익명 세션을 만들고(POST /api/sessions) 토큰을 받은 뒤 대화 화면으로 갑니다.
      await startSession()
      navigate('/conversation')
    } catch (e) {
      setError(errorMessage(e))
    }
  }

  return (
    <PhoneScreen>
      <div className="flex-1 flex flex-col items-center justify-center text-center gap-5">
        <TalkDacLogo size="lg" />
        <p className="text-slate-600 leading-relaxed">
          듣기 어려운 질문은 <span className="text-blue-500 font-semibold">쉽게</span>,
          <br />
          나의 답변은 <span className="text-blue-500 font-semibold">정확하게</span>.
        </p>

        {/* 일러스트 자리 (임시 아이콘 대체) */}
        <div className="w-full flex items-center justify-center gap-3 py-6">
          <div className="w-16 h-16 rounded-2xl bg-blue-50 flex items-center justify-center">
            <Stethoscope size={26} className="text-blue-500" />
          </div>
          <div className="flex flex-col items-center gap-1 text-slate-300">
            <span className="w-1 h-1 rounded-full bg-current" />
            <span className="w-1 h-1 rounded-full bg-current" />
            <span className="w-1 h-1 rounded-full bg-current" />
          </div>
          <MessageCircle size={20} className="text-emerald-400" />
          <div className="flex flex-col items-center gap-1 text-slate-300">
            <span className="w-1 h-1 rounded-full bg-current" />
            <span className="w-1 h-1 rounded-full bg-current" />
            <span className="w-1 h-1 rounded-full bg-current" />
          </div>
          <div className="w-16 h-16 rounded-2xl bg-emerald-50 flex items-center justify-center">
            <User size={26} className="text-emerald-500" />
          </div>
        </div>
      </div>

      <div className="flex flex-col items-center gap-3">
        {error && <p className="text-xs text-red-500 text-center">{error}</p>}
        <button
          onClick={handleStart}
          disabled={starting}
          className="w-full flex items-center justify-center gap-1.5 py-4 rounded-2xl bg-blue-600 text-white font-semibold shadow-lg shadow-blue-600/20 disabled:bg-blue-300"
        >
          {starting ? '세션을 만드는 중…' : '대화 시작하기'}
          {!starting && <ChevronRight size={18} />}
        </button>
        <p className="flex items-center gap-1.5 text-xs text-slate-400">
          <Lock size={12} />
          안전한 통신으로 보호됩니다.
        </p>
      </div>
    </PhoneScreen>
  )
}
