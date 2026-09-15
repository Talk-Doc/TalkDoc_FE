import { ChevronLeft } from 'lucide-react'
import TalkDacLogo from '../../components/TalkDacLogo'
import patientWithPhone from '../../assets/illustrations/patient-with-phone.png'

// 디자인의 "AI 분석 중" 화면은 다른 대화 화면들과 달리 헤더/스테퍼 없이
// 로고 + 일러스트 + 안내 문구만 있는 단독 화면이라, ConversationScreenShell 밖에서 렌더링합니다.
// 실제 미리보기(자연어 변환) API 호출은 ConversationPage에서 이 화면이 뜨는 동안 실행됩니다.
export default function AnalyzingStep({ onBack }: { onBack: () => void }) {
  return (
    <div className="flex-1 flex flex-col">
      <div className="flex items-center mb-2">
        <TalkDacLogo size="sm" />
      </div>

      <div className="flex-1 flex flex-col items-center justify-center text-center gap-4">
        <img src={patientWithPhone} alt="" className="w-40" />
        <div>
          <p className="text-lg font-bold text-slate-900">AI가 답변을 분석중이에요.</p>
          <p className="text-sm text-slate-400 mt-1">잠시만 기다려주세요.</p>
        </div>
      </div>

      <button
        onClick={onBack}
        className="w-full flex items-center justify-center gap-1.5 py-3.5 rounded-full border border-slate-200 text-slate-500 font-medium"
      >
        <ChevronLeft size={18} />
        뒤로 가기
      </button>
    </div>
  )
}
