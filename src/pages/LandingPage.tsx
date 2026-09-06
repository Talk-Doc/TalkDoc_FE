import { useNavigate } from 'react-router-dom'
import { ChevronRight, Lock, Stethoscope, User, MessageCircle } from 'lucide-react'
import PhoneScreen from '../components/PhoneScreen'
import TalkDacLogo from '../components/TalkDacLogo'

// 실제 로고/일러스트(의료진-환자 그림) 원본 파일이 아직 없어서,
// 비슷한 느낌의 아이콘 조합으로 대체해뒀습니다. 디자이너에게 최종 에셋을 받으면
// 이 파일의 "일러스트 자리"만 이미지로 바꾸면 됩니다.
export default function LandingPage() {
  const navigate = useNavigate()

  return (
    <PhoneScreen>
      <div className="flex-1 flex flex-col items-center justify-center text-center gap-5">
        <TalkDacLogo size="lg" />
        <p className="text-slate-600 leading-relaxed">
          듣기 어려운 질문은 <span className="text-teal-500 font-semibold">쉽게</span>,
          <br />
          나의 답변은 <span className="text-teal-500 font-semibold">정확하게</span>.
        </p>

        {/* 일러스트 자리 (임시 아이콘 대체) */}
        <div className="w-full flex items-center justify-center gap-3 py-6">
          <div className="w-16 h-16 rounded-2xl bg-teal-50 flex items-center justify-center">
            <Stethoscope size={26} className="text-teal-500" />
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
        <button
          onClick={() => navigate('/conversation')}
          className="w-full flex items-center justify-center gap-1.5 py-4 rounded-2xl bg-teal-600 text-white font-semibold shadow-lg shadow-teal-600/20"
        >
          대화 시작하기
          <ChevronRight size={18} />
        </button>
        <p className="flex items-center gap-1.5 text-xs text-slate-400">
          <Lock size={12} />
          안전한 통신으로 보호됩니다.
        </p>
      </div>
    </PhoneScreen>
  )
}
