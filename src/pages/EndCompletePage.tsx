import { useLocation, useNavigate } from 'react-router-dom'
import { Check, Sparkle, Trash2, Home, FileText } from 'lucide-react'
import PhoneScreen from '../components/PhoneScreen'
import TalkDacLogo from '../components/TalkDacLogo'
import { useDesktopMode } from '../context/DesktopModeContext'

function EndIcon({ size }: { size: number }) {
  return (
    <div
      className="relative flex items-center justify-center shrink-0"
      style={{ width: size, height: size }}
    >
      <div className="absolute inset-0 rounded-full bg-teal-50" />
      <Sparkle size={size * 0.11} className="absolute top-[17%] left-[19%] text-teal-300 fill-teal-300" />
      <Sparkle size={size * 0.08} className="absolute top-[28%] right-[17%] text-teal-300 fill-teal-300" />
      <Sparkle size={size * 0.08} className="absolute bottom-[22%] left-[22%] text-teal-300 fill-teal-300" />
      <div
        className="relative rounded-full border-4 border-teal-500 bg-white flex items-center justify-center"
        style={{ width: size * 0.44, height: size * 0.44 }}
      >
        <Check size={size * 0.19} className="text-teal-500" strokeWidth={3} />
      </div>
    </div>
  )
}

export default function EndCompletePage() {
  const navigate = useNavigate()
  const location = useLocation()
  const summary = (location.state as { summary?: string } | null)?.summary
  const { desktopMode } = useDesktopMode()

  if (desktopMode) {
    return (
      <PhoneScreen wide>
        <div className="flex items-center mb-2">
          <TalkDacLogo size="sm" />
        </div>

        <div className="flex-1 grid grid-cols-2 items-center gap-12 max-w-4xl mx-auto w-full">
          <div className="flex justify-center">
            <EndIcon size={224} />
          </div>

          <div className="flex flex-col gap-4">
            <p className="text-3xl font-bold text-slate-900">대화가 종료되었습니다.</p>

            {summary && (
              <div className="rounded-xl border border-slate-100 p-4 text-left">
                <div className="flex items-center gap-1.5 mb-1.5">
                  <FileText size={15} className="text-teal-500 shrink-0" />
                  <p className="text-sm font-semibold text-slate-500">진료 요약</p>
                </div>
                <p className="text-base text-slate-700 leading-relaxed">{summary}</p>
              </div>
            )}

            <p className="text-base text-slate-400">이번 대화 내용은 저장되지 않습니다.</p>
            <div className="flex items-start gap-2 bg-teal-50 rounded-xl p-4">
              <Trash2 size={18} className="text-teal-500 shrink-0 mt-0.5" />
              <p className="text-sm text-teal-700 leading-relaxed text-left">
                현재 세션의 모든 데이터는 종료와 동시에 삭제됩니다.
              </p>
            </div>

            <button
              onClick={() => navigate('/')}
              className="mt-2 flex items-center justify-center gap-2 py-4 rounded-full bg-gradient-to-r from-teal-600 to-teal-700 text-white font-semibold shadow-lg shadow-teal-700/25"
            >
              <Home size={16} />
              처음으로
            </button>
          </div>
        </div>
      </PhoneScreen>
    )
  }

  return (
    <PhoneScreen>
      <div className="flex items-center mb-2">
        <TalkDacLogo size="sm" />
      </div>

      <div className="flex-1 flex flex-col items-center justify-center text-center gap-4 overflow-y-auto">
        <EndIcon size={144} />
        <p className="text-lg font-bold text-slate-900 shrink-0">대화가 종료되었습니다.</p>
        <div className="w-10 border-t-2 border-teal-200 shrink-0" />

        {summary && (
          <div className="w-full rounded-xl border border-slate-100 p-3 text-left">
            <div className="flex items-center gap-1.5 mb-1.5">
              <FileText size={14} className="text-teal-500 shrink-0" />
              <p className="text-xs font-semibold text-slate-500">진료 요약</p>
            </div>
            <p className="text-sm text-slate-700 leading-relaxed">{summary}</p>
          </div>
        )}

        <p className="text-sm text-slate-400 shrink-0">이번 대화 내용은 저장되지 않습니다.</p>
        <div className="w-full flex items-start gap-2 bg-teal-50 rounded-xl p-3 mt-2 shrink-0">
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
