import { useNavigate } from 'react-router-dom'
import { ChevronRight, Lightbulb } from 'lucide-react'
import PhoneScreen from '../components/PhoneScreen'
import TalkDacLogo from '../components/TalkDacLogo'
import doctorPatient from '../assets/illustrations/doctor-patient.png'

// 랜딩(스플래시) 화면에서 "대화 시작하기"를 누르면 오는 중간 확인 화면입니다.
// 실제로 대화(의료진 질문 대기)로 들어가기 전에 한 번 더 준비 상태를 알려줍니다.
export default function ReadyPage() {
  const navigate = useNavigate()

  return (
    <PhoneScreen>
      <div className="flex items-center mb-2">
        <TalkDacLogo size="sm" />
      </div>

      <div className="flex-1 flex flex-col items-center justify-center text-center gap-4">
        <img src={doctorPatient} alt="" className="w-full max-w-[260px]" />
        <div>
          <p className="text-xl font-bold text-slate-900 leading-snug">
            대화를 시작할
            <br />
            준비가 되었어요
          </p>
          <p className="text-sm text-slate-400 mt-2 leading-relaxed">
            아래 버튼을 눌러 의료진과의 대화를
            <br />
            시작할 수 있어요.
            <br />
            언제든지 편한 시간에 시작해 주세요.
          </p>
        </div>
        <div className="w-full flex items-start gap-2 bg-teal-50 rounded-xl p-3 text-left">
          <Lightbulb size={16} className="text-teal-500 shrink-0 mt-0.5" />
          <p className="text-xs text-teal-700 leading-relaxed">
            대화 중에는 텍스트와 수어로 편하게 소통할 수 있어요.
          </p>
        </div>
      </div>

      <div className="flex flex-col items-center gap-2">
        <button
          onClick={() => navigate('/conversation')}
          className="w-full flex items-center justify-center gap-1.5 py-4 rounded-full bg-gradient-to-r from-teal-600 to-teal-700 text-white font-semibold shadow-lg shadow-teal-700/25"
        >
          대화 시작하기
          <ChevronRight size={18} />
        </button>
        <button onClick={() => navigate('/')} className="text-xs text-slate-400 py-1">
          잠시 둘러보기
        </button>
      </div>
    </PhoneScreen>
  )
}
