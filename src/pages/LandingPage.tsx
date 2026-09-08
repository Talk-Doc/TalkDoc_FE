import { useNavigate } from 'react-router-dom'
import { ChevronRight } from 'lucide-react'
import PhoneScreen from '../components/PhoneScreen'
import TalkDacLogo from '../components/TalkDacLogo'
import doctorPatientIllustration from '../assets/illustration-doctor-patient.png'

export default function LandingPage() {
  const navigate = useNavigate()

  return (
    <PhoneScreen>
      <div className="flex-1 flex flex-col items-center justify-center text-center gap-4">
        <TalkDacLogo size="lg" stacked />
        <p className="text-sm text-slate-500">의료진과의 대화를 AI가 도와드릴게요.</p>
        <img
          src={doctorPatientIllustration}
          alt=""
          className="w-full max-w-[260px] mt-2"
        />
      </div>

      <button
        onClick={() => navigate('/conversation')}
        className="w-full flex items-center justify-center gap-1.5 py-4 rounded-full bg-gradient-to-r from-teal-600 to-teal-700 text-white font-semibold shadow-lg shadow-teal-700/25"
      >
        대화 시작하기
        <ChevronRight size={18} />
      </button>
    </PhoneScreen>
  )
}
