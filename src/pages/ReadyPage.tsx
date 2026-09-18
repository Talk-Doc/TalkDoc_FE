import { useNavigate } from 'react-router-dom'
import { ChevronRight, Lightbulb, Monitor, Smartphone } from 'lucide-react'
import PhoneScreen from '../components/PhoneScreen'
import TalkDacLogo from '../components/TalkDacLogo'
import judgeGuideIcon from '../assets/guides/judge-guide-icon.png'
import patientWithPhone from '../assets/illustrations/patient-with-phone.png'
import { useDesktopMode } from '../context/DesktopModeContext'

// 랜딩(스플래시) 화면에서 "대화 시작하기"를 누르면 오는 중간 확인 화면입니다.
// 실제로 대화(의료진 질문 대기)로 들어가기 전에 한 번 더 준비 상태를 알려줍니다.
export default function ReadyPage() {
  const navigate = useNavigate()
  const { desktopMode, toggleDesktopMode } = useDesktopMode()

  const desktopToggle = (
    // 실제 휴대폰(모바일 화면)에서는 의미가 없는 버튼이라 sm 이상에서만 보여줍니다.
    <button
      onClick={toggleDesktopMode}
      aria-pressed={desktopMode}
      className="hidden sm:flex items-center gap-1.5 rounded-full px-4 py-2 text-xs font-semibold text-slate-500 transition-colors hover:bg-slate-100"
    >
      {desktopMode ? <Smartphone size={14} /> : <Monitor size={14} />}
      {desktopMode ? '휴대폰 화면으로 보기' : '데스크톱 환경에서 체험하기'}
    </button>
  )

  if (desktopMode) {
    // 좁은 폰 카드를 그대로 늘리면 버튼만 어색하게 벌어지므로, 데스크톱에서는 왼쪽에 큰
    // 일러스트, 오른쪽에 안내 문구·버튼을 두는 좌우 분할 레이아웃으로 공간을 실제로 씁니다.
    return (
      <PhoneScreen wide>
        <div className="flex items-center mb-2">
          <TalkDacLogo size="sm" />
        </div>

        <div className="flex-1 grid grid-cols-2 items-center gap-12 max-w-4xl mx-auto w-full">
          <div className="flex justify-center">
            <img src={patientWithPhone} alt="" className="w-72" />
          </div>

          <div className="flex flex-col gap-5">
            <div>
              <p className="text-3xl font-bold text-slate-900 leading-snug">
                대화를 시작할
                <br />
                준비가 되었어요
              </p>
              <p className="text-base text-slate-400 mt-3 leading-relaxed">
                아래 버튼을 눌러 의료진과의 대화를 시작할 수 있어요.
                <br />
                언제든지 편한 시간에 시작해 주세요.
              </p>
            </div>
            <div className="flex items-start gap-2 bg-teal-50 rounded-xl p-4 text-left">
              <Lightbulb size={18} className="text-teal-500 shrink-0 mt-0.5" />
              <p className="text-sm text-teal-700 leading-relaxed">
                대화 중에는 텍스트와 수어로 편하게 소통할 수 있어요.
              </p>
            </div>

            <div className="flex flex-col items-start gap-2 mt-2">
              <button
                onClick={() => navigate('/conversation')}
                className="w-full flex items-center justify-center gap-1.5 py-4 rounded-full bg-gradient-to-r from-teal-600 to-teal-700 text-white font-semibold shadow-lg shadow-teal-700/25"
              >
                대화 시작하기
                <ChevronRight size={18} />
              </button>
              <button
                onClick={() => navigate('/guide')}
                className="flex items-center gap-1.5 rounded-full px-4 py-2 text-xs font-semibold text-teal-700 transition-colors hover:bg-teal-50"
              >
                <img src={judgeGuideIcon} alt="" className="h-4 w-6 object-contain" />
                심사 체험 가이드 보기
              </button>
              {desktopToggle}
            </div>
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

      <div className="flex-1 flex flex-col items-center justify-center text-center gap-4">
        <img src={patientWithPhone} alt="" className="w-40" />
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
        <button
          onClick={() => navigate('/guide')}
          className="flex items-center gap-1.5 rounded-full px-4 py-2 text-xs font-semibold text-teal-700 transition-colors hover:bg-teal-50"
        >
          <img src={judgeGuideIcon} alt="" className="h-4 w-6 object-contain" />
          심사 체험 가이드 보기
        </button>
        {desktopToggle}
      </div>
    </PhoneScreen>
  )
}
