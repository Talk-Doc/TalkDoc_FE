import { useNavigate } from 'react-router-dom'
import PhoneScreen from '../components/PhoneScreen'

export default function LandingPage() {
  const navigate = useNavigate()

  return (
    <PhoneScreen>
      <div className="flex-1 flex flex-col items-center justify-center text-center gap-4">
        <div className="w-20 h-20 rounded-2xl bg-blue-500 flex items-center justify-center text-white text-2xl font-bold">
          T
        </div>
        <h1 className="text-2xl font-bold text-slate-900">Talk-Doc</h1>
        <p className="text-slate-500">의료진과의 대화를 AI가 도와드릴게요.</p>
      </div>
      <button
        onClick={() => navigate('/conversation')}
        className="w-full py-4 rounded-xl bg-blue-500 text-white font-semibold active:bg-blue-600"
      >
        대화 시작하기
      </button>
    </PhoneScreen>
  )
}
