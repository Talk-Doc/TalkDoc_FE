import { useNavigate } from 'react-router-dom'
import PhoneScreen from '../components/PhoneScreen'

export default function EndCompletePage() {
  const navigate = useNavigate()

  return (
    <PhoneScreen>
      <div className="flex-1 flex flex-col items-center justify-center text-center gap-3">
        <div className="w-16 h-16 rounded-full bg-green-100 text-green-600 flex items-center justify-center text-2xl">
          ✓
        </div>
        <p className="text-lg font-bold text-slate-900">대화가 종료되었습니다.</p>
        <p className="text-sm text-slate-400">이번 대화 내용은 저장되지 않습니다.</p>
      </div>
      <button
        onClick={() => navigate('/')}
        className="w-full py-4 rounded-xl bg-blue-500 text-white font-semibold"
      >
        처음으로
      </button>
    </PhoneScreen>
  )
}
