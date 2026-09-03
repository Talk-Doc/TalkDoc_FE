import type { ConversationStep } from '../../types/conversation'

// 상태(step) 값을 사람이 읽을 수 있는 한글 라벨로 바꿔주는 표
const STEP_LABEL: Record<ConversationStep, string> = {
  question: '의료진 질문 중',
  'sign-camera': '수어 입력 중',
  analyzing: 'AI 분석 중',
  'result-confirm': '답변 확인',
  'recognition-failed': '인식 실패',
  'text-input': '텍스트 입력 중',
  'doctor-answer': '답변 전달 완료',
}

export default function StatusBanner({
  step,
  onRequestEnd,
}: {
  step: ConversationStep
  onRequestEnd: () => void
}) {
  return (
    <div className="flex items-center justify-between mb-4">
      <div>
        <p className="text-xs text-slate-400">현재 상태</p>
        <p className="font-semibold text-slate-900">{STEP_LABEL[step]}</p>
      </div>
      <button
        onClick={onRequestEnd}
        className="text-sm text-slate-400 border border-slate-200 rounded-lg px-3 py-1.5"
      >
        대화 종료
      </button>
    </div>
  )
}
