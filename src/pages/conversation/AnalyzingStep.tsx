import { ChevronRight } from 'lucide-react'
import TalkDacLogo from '../../components/TalkDacLogo'
import patientWithPhone from '../../assets/illustrations/patient-with-phone.png'

// 디자인의 "AI 분석 중" 화면은 다른 대화 화면들과 달리 헤더/스테퍼 없이
// 로고 + 일러스트 + 안내 문구만 있는 단독 화면이라, ConversationScreenShell 밖에서 렌더링합니다.
// TODO(백엔드 연동): 실제로는 여기서 Vision AI 인식 API 응답을 기다렸다가
// 성공하면 result-confirm, 실패하면 recognition-failed로 넘어가게 됩니다.
// 지금은 실제 AI가 없으므로, 두 결과를 모두 화면에서 확인해볼 수 있도록
// 테스트용 버튼 두 개를 임시로 두었습니다. (디자인/AI 연동 전 임시 UI)
export default function AnalyzingStep({
  onBack,
  onSuccess,
  onFailure,
}: {
  onBack: () => void
  onSuccess: () => void
  onFailure: () => void
}) {
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

      <div className="flex flex-col items-center gap-3">
        <button
          onClick={onBack}
          className="w-full flex items-center justify-center gap-1.5 py-4 rounded-full bg-gradient-to-r from-teal-600 to-teal-700 text-white font-semibold shadow-lg shadow-teal-700/25"
        >
          뒤로 가기
          <ChevronRight size={18} />
        </button>

        <div className="w-full flex flex-col gap-2 pt-2 border-t border-dashed border-slate-200">
          <p className="text-xs text-slate-400 text-center">임시 테스트 버튼 (AI 연동 전까지 사용)</p>
          <button
            onClick={onSuccess}
            className="w-full py-2 rounded-lg border border-slate-200 text-sm text-slate-600"
          >
            (테스트) 인식 성공으로 보기
          </button>
          <button
            onClick={onFailure}
            className="w-full py-2 rounded-lg border border-slate-200 text-sm text-slate-600"
          >
            (테스트) 인식 실패로 보기
          </button>
        </div>
      </div>
    </div>
  )
}
