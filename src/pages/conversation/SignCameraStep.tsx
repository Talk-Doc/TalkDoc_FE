import { useState } from 'react'

// TODO(백엔드 연동): 실제로는 [수어 답변 시작]을 누르면 카메라 스트림을 녹화 시작하고,
// [답변 완료]를 누르면 그 영상(또는 프레임)을 Vision AI 서버로 전송하게 됩니다.
export default function SignCameraStep({
  onDone,
}: {
  onDone: () => void
}) {
  const [started, setStarted] = useState(false)

  return (
    <div className="flex-1 flex flex-col">
      <div className="flex-1 rounded-2xl bg-slate-900 flex flex-col items-center justify-center text-white gap-2 mb-4">
        <span className="text-4xl">📷</span>
        <p className="text-sm text-slate-300">
          {started ? '수어를 입력해주세요' : '카메라 미리보기'}
        </p>
      </div>
      <p className="text-xs text-slate-400 text-center mb-4">
        여러 수어를 이어 답할 땐 각 수어 사이에 약 0.8~1초 정도 멈춰주세요.
      </p>
      {!started ? (
        <button
          onClick={() => setStarted(true)}
          className="w-full py-4 rounded-xl bg-blue-500 text-white font-semibold"
        >
          수어 답변 시작
        </button>
      ) : (
        <button
          onClick={onDone}
          className="w-full py-4 rounded-xl bg-slate-900 text-white font-semibold"
        >
          답변 완료
        </button>
      )}
    </div>
  )
}
