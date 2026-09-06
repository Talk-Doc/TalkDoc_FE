import { useLocation, useNavigate } from 'react-router-dom'
import { Check, Sparkle, Trash2, Home, FileText } from 'lucide-react'
import PhoneScreen from '../components/PhoneScreen'
import type { SummaryResponse } from '../api/types'

// 종료 직전에 뽑은 진료 요약(POST /summary)을 navigate state로 넘겨받아 보여줍니다.
// 서버 데이터는 이미 삭제된 뒤라, 새로고침하면 요약도 사라집니다(의도된 동작).
export default function EndCompletePage() {
  const navigate = useNavigate()
  const location = useLocation()
  const summary = (location.state as { summary?: SummaryResponse | null } | null)?.summary ?? null

  return (
    <PhoneScreen>
      <div className="flex-1 flex flex-col items-center justify-center text-center gap-4">
        <div className="relative w-24 h-24 flex items-center justify-center">
          <Sparkle size={14} className="absolute -top-1 -left-2 text-emerald-300 fill-emerald-300" />
          <Sparkle size={10} className="absolute top-2 right-0 text-emerald-300 fill-emerald-300" />
          <Sparkle size={10} className="absolute bottom-0 -left-1 text-emerald-300 fill-emerald-300" />
          <div className="w-16 h-16 rounded-full border-4 border-emerald-500 flex items-center justify-center">
            <Check size={28} className="text-emerald-500" strokeWidth={3} />
          </div>
        </div>
        <p className="text-lg font-bold text-slate-900">대화가 종료되었습니다.</p>
        <div className="w-10 border-t border-emerald-200" />
        <p className="text-sm text-slate-400">이번 대화 내용은 저장되지 않습니다.</p>

        {summary && summary.summary && (
          <div className="w-full text-left bg-slate-50 rounded-xl p-3 mt-2">
            <p className="flex items-center gap-1.5 text-xs text-slate-500 mb-1">
              <FileText size={14} />
              진료 요약 · 답변 {summary.conversation_count}개
            </p>
            <p className="text-sm text-slate-800 leading-relaxed">{summary.summary}</p>
            <p className="text-[11px] text-slate-400 mt-2">
              환자 진술을 정리한 것으로, 진단이 아닙니다.
            </p>
          </div>
        )}

        <div className="w-full flex items-start gap-2 bg-emerald-50 rounded-xl p-3 mt-2">
          <Trash2 size={16} className="text-emerald-500 shrink-0 mt-0.5" />
          <p className="text-xs text-emerald-700 leading-relaxed text-left">
            현재 세션의 모든 데이터는 종료와 동시에 삭제됩니다.
          </p>
        </div>
      </div>
      <button
        onClick={() => navigate('/')}
        className="w-full flex items-center justify-center gap-2 py-4 rounded-xl bg-emerald-500 text-white font-semibold"
      >
        <Home size={16} />
        처음으로
      </button>
    </PhoneScreen>
  )
}
