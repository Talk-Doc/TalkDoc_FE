import { Check, HeartHandshake, Home, Sparkles } from 'lucide-react'
import { useLocation, useNavigate } from 'react-router-dom'
import PhoneScreen from '../components/PhoneScreen'
import TalkDacLogo from '../components/TalkDacLogo'
import { deleteSession } from '../api/session'
import { getSignDisplayLabel, SUPPORTED_SIGN_LABELS } from './signLabels'
import { useDesktopMode } from '../context/DesktopModeContext'

interface CompletionState {
  answer?: string
  sessionId?: string
  doctorToken?: string
}

export default function JudgeCompletePage() {
  const navigate = useNavigate()
  const location = useLocation()
  const state = (location.state as CompletionState | null) ?? {}
  const answer = state.answer || '머리가 아파요.'
  const { desktopMode } = useDesktopMode()

  const goHome = async () => {
    if (state.sessionId && state.doctorToken) {
      try {
        await deleteSession(state.sessionId, state.doctorToken)
      } catch {
        // 체험 세션이 이미 만료됐어도 메인 화면으로 이동합니다.
      }
    }
    navigate('/', { replace: true })
  }

  if (desktopMode) {
    return (
      <PhoneScreen wide>
        <header className="mb-4 flex items-center">
          <TalkDacLogo size="sm" />
        </header>

        <div className="flex-1 grid grid-cols-2 items-center gap-12 max-w-4xl mx-auto w-full">
          <div className="flex flex-col items-center text-center gap-3">
            <div className="relative flex h-32 w-32 items-center justify-center">
              <div className="absolute inset-0 rounded-full bg-teal-50" />
              <Sparkles size={20} className="absolute left-1 top-4 text-teal-300" />
              <Sparkles size={15} className="absolute bottom-5 right-1 text-teal-300" />
              <div className="relative flex h-20 w-20 items-center justify-center rounded-full bg-teal-600 shadow-lg shadow-teal-600/20">
                <Check size={36} className="text-white" strokeWidth={3} />
              </div>
            </div>
            <span className="rounded-full bg-teal-50 px-3 py-1 text-xs font-bold text-teal-700">
              심사 체험 완료
            </span>
            <h1 className="text-3xl font-bold text-slate-900">수고하셨습니다!</h1>
            <p className="text-base leading-relaxed text-slate-500">
              수어 답변이 자연스러운 문장으로 변환되어
              <br />
              의료진에게 전달되었어요.
            </p>
            <div className="w-full rounded-2xl bg-teal-50 p-4">
              <div className="flex items-center justify-center gap-2">
                <HeartHandshake size={17} className="shrink-0 text-teal-600" />
                <p className="text-sm font-semibold text-teal-700">의료진에게 전달한 답변</p>
              </div>
              <p className="mt-2 text-center text-2xl font-bold text-slate-900">“{answer}”</p>
            </div>
          </div>

          <div className="flex flex-col gap-4">
            <section className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
              <div className="flex items-end justify-between gap-2">
                <div>
                  <p className="text-base font-bold text-slate-900">TalkDoc이 인식하는 수어</p>
                  <p className="mt-0.5 text-sm leading-relaxed text-slate-400">
                    병원 외래 문진에 필요한 15개 단어를 지원해요.
                  </p>
                </div>
                <strong className="text-3xl font-bold text-teal-600">15</strong>
              </div>

              <div className="mt-4 flex flex-wrap gap-1.5">
                {SUPPORTED_SIGN_LABELS.map((label) => (
                  <span
                    key={label}
                    className="rounded-full border border-teal-100 bg-teal-50 px-2.5 py-1 text-xs font-semibold text-teal-800"
                  >
                    {getSignDisplayLabel(label)}
                  </span>
                ))}
              </div>

              <div className="mt-4 border-t border-slate-100 pt-4">
                <p className="text-xs leading-relaxed text-slate-500">
                  단어별로 수어를 촬영하면 AI가 인식 결과를 문장으로 정리하고, 환자가 직접 확인·수정한 뒤 의료진에게 전달합니다.
                </p>
              </div>
            </section>

            <button
              onClick={goHome}
              className="flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-teal-600 to-teal-700 py-4 font-semibold text-white shadow-lg shadow-teal-700/25"
            >
              <Home size={17} />
              메인으로 가기
            </button>
          </div>
        </div>
      </PhoneScreen>
    )
  }

  return (
    <PhoneScreen>
      <header className="mb-3 flex items-center justify-center">
        <TalkDacLogo size="sm" />
      </header>

      <main className="flex-1 overflow-y-auto pb-3">
        <section className="flex flex-col items-center px-2 pb-5 pt-2 text-center">
          <div className="relative flex h-24 w-24 items-center justify-center">
            <div className="absolute inset-0 rounded-full bg-teal-50" />
            <Sparkles size={15} className="absolute left-0 top-3 text-teal-300" />
            <Sparkles size={11} className="absolute bottom-4 right-0 text-teal-300" />
            <div className="relative flex h-14 w-14 items-center justify-center rounded-full bg-teal-600 shadow-lg shadow-teal-600/20">
              <Check size={28} className="text-white" strokeWidth={3} />
            </div>
          </div>
          <span className="mt-1 rounded-full bg-teal-50 px-3 py-1 text-[11px] font-bold text-teal-700">
            심사 체험 완료
          </span>
          <h1 className="mt-2 text-2xl font-bold text-slate-900">수고하셨습니다!</h1>
          <p className="mt-1 text-sm leading-relaxed text-slate-500">
            수어 답변이 자연스러운 문장으로 변환되어
            <br />
            의료진에게 전달되었어요.
          </p>
        </section>

        <section className="mb-4 rounded-2xl bg-teal-50 p-4">
          <div className="flex items-center gap-2">
            <HeartHandshake size={17} className="shrink-0 text-teal-600" />
            <p className="text-xs font-semibold text-teal-700">의료진에게 전달한 답변</p>
          </div>
          <p className="mt-2 text-center text-xl font-bold text-slate-900">“{answer}”</p>
        </section>

        <section className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
          <div className="flex items-end justify-between gap-2">
            <div>
              <p className="text-sm font-bold text-slate-900">TalkDoc이 인식하는 수어</p>
              <p className="mt-0.5 text-[11px] leading-relaxed text-slate-400">
                병원 외래 문진에 필요한 15개 단어를 지원해요.
              </p>
            </div>
            <strong className="text-2xl font-bold text-teal-600">15</strong>
          </div>

          <div className="mt-3 flex flex-wrap gap-1.5">
            {SUPPORTED_SIGN_LABELS.map((label) => (
              <span
                key={label}
                className="rounded-full border border-teal-100 bg-teal-50 px-2.5 py-1 text-[11px] font-semibold text-teal-800"
              >
                {getSignDisplayLabel(label)}
              </span>
            ))}
          </div>

          <div className="mt-3 border-t border-slate-100 pt-3">
            <p className="text-[11px] leading-relaxed text-slate-500">
              단어별로 수어를 촬영하면 AI가 인식 결과를 문장으로 정리하고, 환자가 직접 확인·수정한 뒤 의료진에게 전달합니다.
            </p>
          </div>
        </section>
      </main>

      <button
        onClick={goHome}
        className="mt-3 flex w-full shrink-0 items-center justify-center gap-2 rounded-full bg-gradient-to-r from-teal-600 to-teal-700 py-4 font-semibold text-white shadow-lg shadow-teal-700/25"
      >
        <Home size={17} />
        메인으로 가기
      </button>
    </PhoneScreen>
  )
}
