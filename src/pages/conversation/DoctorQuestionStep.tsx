import { useState } from 'react'

// TODO(백엔드 연동): 실제로는 마이크 버튼을 누르면 음성을 녹음해서
// STT API로 보내고, 돌아온 텍스트를 LLM이 다듬어서 questionText로 받게 됩니다.
// 지금은 그 과정을 목(mock) 값으로 흉내만 냅니다.
const MOCK_QUESTION = '어디가 아파서 오셨어요?'

export default function DoctorQuestionStep({
  onQuestionReady,
}: {
  onQuestionReady: (questionText: string) => void
}) {
  const [recording, setRecording] = useState(false)

  return (
    <div className="flex-1 flex flex-col items-center justify-center gap-6 text-center">
      <p className="text-slate-500">의료진이 마이크를 눌러 질문해주세요</p>
      <button
        onClick={() => setRecording((r) => !r)}
        className={`w-24 h-24 rounded-full flex items-center justify-center text-white text-3xl ${
          recording ? 'bg-red-500 animate-pulse' : 'bg-blue-500'
        }`}
      >
        🎤
      </button>
      <p className="text-sm text-slate-400">
        {recording ? '듣고 있어요...' : '버튼을 눌러 질문을 시작하세요'}
      </p>
      {recording && (
        <button
          onClick={() => onQuestionReady(MOCK_QUESTION)}
          className="w-full py-3 rounded-xl bg-slate-900 text-white font-semibold"
        >
          질문 완료
        </button>
      )}
    </div>
  )
}
