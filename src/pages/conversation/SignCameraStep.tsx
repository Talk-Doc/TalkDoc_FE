import { useEffect, useRef, useState } from 'react'
import { useMediaRecorder } from '../../media/useMediaRecorder'

// 화면이 열리면 전면 카메라를 켜서 미리보기를 보여주고,
// [수어 답변 시작]으로 녹화를 시작, [답변 완료]로 녹화를 끝내 영상 Blob을 부모에게 넘깁니다.
// 실제 인식 호출(POST /sign)은 다음 단계(AnalyzingStep)에서 합니다.
export default function SignCameraStep({
  onDone,
  onFallbackToText,
}: {
  onDone: (video: Blob) => void
  onFallbackToText: () => void
}) {
  const recorder = useMediaRecorder('video')
  const videoRef = useRef<HTMLVideoElement | null>(null)
  const [stopping, setStopping] = useState(false)

  useEffect(() => {
    let cancelled = false
    recorder.open().catch(() => {
      // recorder.error 에 사유가 들어가며 아래에서 안내합니다.
    })
    return () => {
      cancelled = true
      if (!cancelled) return
      recorder.release()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    const el = videoRef.current
    if (!el) return
    el.srcObject = recorder.stream
    if (recorder.stream) el.play().catch(() => {})
  }, [recorder.stream])

  const finish = async () => {
    setStopping(true)
    try {
      const video = await recorder.stop()
      recorder.release()
      onDone(video)
    } catch {
      setStopping(false)
    }
  }

  return (
    <div className="flex-1 flex flex-col">
      <div className="flex-1 rounded-2xl bg-slate-900 overflow-hidden relative flex items-center justify-center text-white mb-4 min-h-[260px]">
        {recorder.stream ? (
          <video
            ref={videoRef}
            autoPlay
            muted
            playsInline
            className="absolute inset-0 w-full h-full object-cover -scale-x-100"
          />
        ) : (
          <div className="flex flex-col items-center gap-2">
            <span className="text-4xl">📷</span>
            <p className="text-sm text-slate-300">{recorder.error ?? '카메라를 켜는 중…'}</p>
          </div>
        )}
        {recorder.recording && (
          <span className="absolute top-3 left-3 flex items-center gap-1.5 text-xs bg-black/50 rounded-full px-2 py-1">
            <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
            녹화 중 · 수어를 입력해주세요
          </span>
        )}
      </div>
      <p className="text-xs text-slate-400 text-center mb-4">
        여러 수어를 이어 답할 땐 각 수어 사이에 약 0.8~1초 정도 멈춰주세요.
      </p>

      {recorder.error ? (
        <button
          onClick={onFallbackToText}
          className="w-full py-4 rounded-xl bg-blue-500 text-white font-semibold"
        >
          텍스트로 답변하기
        </button>
      ) : !recorder.recording ? (
        <button
          onClick={() => recorder.start().catch(() => {})}
          disabled={!recorder.stream}
          className="w-full py-4 rounded-xl bg-blue-500 text-white font-semibold disabled:bg-blue-300"
        >
          수어 답변 시작
        </button>
      ) : (
        <button
          onClick={finish}
          disabled={stopping}
          className="w-full py-4 rounded-xl bg-slate-900 text-white font-semibold disabled:bg-slate-500"
        >
          답변 완료
        </button>
      )}
    </div>
  )
}
