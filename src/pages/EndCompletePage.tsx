import { useNavigate } from 'react-router-dom'
import { Check, Sparkle, Trash2, Home } from 'lucide-react'
import PhoneScreen from '../components/PhoneScreen'

export default function EndCompletePage() {
  const navigate = useNavigate()

  return (
    <PhoneScreen>
      <div className="flex-1 flex flex-col items-center justify-center text-center gap-4">
        <div className="relative w-36 h-36 flex items-center justify-center">
          <div className="absolute inset-0 rounded-full bg-teal-50" />
          <Sparkle size={14} className="absolute top-6 left-7 text-teal-300 fill-teal-300" />
          <Sparkle size={10} className="absolute top-10 right-6 text-teal-300 fill-teal-300" />
          <Sparkle size={10} className="absolute bottom-8 left-8 text-teal-300 fill-teal-300" />
          <div className="relative w-16 h-16 rounded-full border-4 border-teal-500 bg-white flex items-center justify-center">
            <Check size={28} className="text-teal-500" strokeWidth={3} />
          </div>
        </div>
        <p className="text-lg font-bold text-slate-900">대화가 종료되었습니다.</p>
        <div className="w-10 border-t-2 border-teal-200" />
        <p className="text-sm text-slate-400">이번 대화 내용은 저장되지 않습니다.</p>
        <div className="w-full flex items-start gap-2 bg-teal-50 rounded-xl p-3 mt-2">
          <Trash2 size={16} className="text-teal-500 shrink-0 mt-0.5" />
          <p className="text-xs text-teal-700 leading-relaxed text-left">
            현재 세션의 모든 데이터는 종료와 동시에 삭제됩니다.
          </p>
        </div>
      </div>
      <button
        onClick={() => navigate('/')}
        className="w-full flex items-center justify-center gap-2 py-4 rounded-full bg-gradient-to-r from-teal-600 to-teal-700 text-white font-semibold shadow-lg shadow-teal-700/25"
      >
        <Home size={16} />
        처음으로
      </button>
    </PhoneScreen>
  )
}
