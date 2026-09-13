import { useEffect, useRef, useState } from 'react'
import { Camera, Square, Sun, Hand, User, Lightbulb, AlertCircle } from 'lucide-react'
import QuestionCard from './QuestionCard'
import { useMediaRecorder } from '../../hooks/useMediaRecorder'
import { useSession } from '../../context/SessionContext'
import { postSign } from '../../api/sign'
import { ApiError } from '../../api/client'

export default function SignCameraStep({
  questionText,
  onSuccess,
  onFailure,
}: {
  questionText: string
  onSuccess: (labels: string[]) => void
  onFailure: () => void
}) {
  const { session_id: sessionId, patient_token: patientToken } = useSession()
  const [recording, setRecording] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const recorder = useMediaRecorder()
  const videoRef = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    if (videoRef.current) videoRef.current.srcObject = recorder.stream
  }, [recorder.stream])

  const startRecording = async () => {
    setError(null)
    const ok = await recorder.start({ video: { facingMode: 'user' }, audio: false })
    if (!ok) {
      setError(recorder.error)
      return
    }
    setRecording(true)
  }

  const stopRecording = async () => {
    const videoBlob = await recorder.stop()
    setRecording(false)
    setSubmitting(true)
    setError(null)
    try {
      const result = await postSign(sessionId, patientToken, videoBlob)
      if (result.all_accepted && result.accepted_labels.length > 0) {
        onSuccess(result.accepted_labels)
      } else {
        onFailure()
      }
    } catch (err) {
      setError(err instanceof ApiError ? err.message : '수어 인식에 실패했어요. 다시 시도해주세요.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <>
      <QuestionCard questionText={questionText} guideText="증상을 설명해주세요." time="오전 09:42" />

      {recording ? (
        <div className="rounded-2xl bg-teal-50 p-4 flex items-center justify-between gap-3">
          <div>
            <p className="text-sm font-bold text-teal-900">지금 수어로 답변해주세요.</p>
            <p className="text-xs text-teal-600 mt-0.5">
              카메라가 수어를 인식하고 있어요. 답변이 끝나면 자동으로 분석이 시작됩니다.
            </p>
          </div>
          <span className="relative w-9 h-9 rounded-full bg-teal-500 flex items-center justify-center shrink-0">
            <span className="absolute inset-0 rounded-full bg-teal-400 animate-ping opacity-50" />
            <Camera size={16} className="relative text-white" />
          </span>
        </div>
      ) : (
        <div className="flex items-center gap-1.5 text-xs text-teal-600 font-medium">
          <span className="w-1.5 h-1.5 rounded-full bg-teal-500 inline-block" />
          카메라 준비 완료
        </div>
      )}

      <div className="relative flex-1 min-h-[220px] rounded-2xl bg-slate-800 overflow-hidden flex items-center justify-center">
        <div className="absolute inset-3 border-2 border-transparent z-10">
          <span className="absolute -top-0.5 -left-0.5 w-6 h-6 border-t-4 border-l-4 border-teal-400 rounded-tl-xl" />
          <span className="absolute -top-0.5 -right-0.5 w-6 h-6 border-t-4 border-r-4 border-teal-400 rounded-tr-xl" />
        </div>
        {recorder.stream ? (
          <video
            ref={videoRef}
            autoPlay
            muted
            playsInline
            className="absolute inset-0 w-full h-full object-cover -scale-x-100"
          />
        ) : (
          <User size={72} className="text-slate-500" strokeWidth={1} />
        )}
        {recording ? (
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 z-10">
            <p className="text-xs text-white/80">수어를 인식하고 있어요...</p>
            <div className="flex items-end gap-[3px] h-4">
              {[4, 9, 6, 12, 5, 10, 7, 4].map((h, i) => (
                <span
                  key={i}
                  className="w-[3px] rounded-full bg-teal-300 animate-pulse"
                  style={{ height: h, animationDelay: `${i * 80}ms` }}
                />
              ))}
            </div>
          </div>
        ) : (
          <p className="absolute bottom-4 left-1/2 -translate-x-1/2 text-xs text-white/80 bg-black/30 rounded-full px-3 py-1 z-10">
            양손과 상반신이 모두 보이도록 해주세요.
          </p>
        )}
      </div>

      {error && (
        <div className="rounded-2xl bg-red-50 p-3.5 flex items-start gap-2.5">
          <AlertCircle size={16} className="text-red-500 shrink-0 mt-0.5" />
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      {submitting ? (
        <div className="w-full flex items-center justify-center gap-2 py-4 text-teal-600 font-semibold">
          <div className="w-5 h-5 border-2 border-teal-500 border-t-transparent rounded-full animate-spin" />
          수어를 분석하고 있어요...
        </div>
      ) : recording ? (
        <>
          <div className="rounded-2xl bg-slate-50 p-3.5 flex items-start gap-2.5">
            <Lightbulb size={16} className="text-slate-400 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-slate-600">더 정확한 인식을 위해 이렇게 해주세요.</p>
              <ul className="text-xs text-slate-400 mt-1 space-y-1 list-disc list-inside">
                <li>양손과 상반신이 모두 화면에 보이도록 해주세요.</li>
                <li>밝은 곳에서 촬영해주세요.</li>
                <li>한 동작을 하고 1초 정도 정지해주세요.</li>
              </ul>
            </div>
          </div>
          <button
            onClick={stopRecording}
            className="w-full flex items-center justify-center gap-2 py-4 rounded-xl border-2 border-teal-500 text-teal-600 font-semibold"
          >
            <Square size={16} fill="currentColor" />
            답변 중지하기
          </button>
        </>
      ) : (
        <>
          <button
            onClick={startRecording}
            className="w-full flex items-center justify-center gap-2 py-4 rounded-xl bg-teal-700 text-white font-semibold"
          >
            <Camera size={16} />
            답변 촬영 시작하기
          </button>
          <div>
            <p className="text-xs font-semibold text-slate-400 mb-2">수어 촬영 가이드</p>
            <div className="grid grid-cols-3 gap-2">
              {[
                { icon: Sun, label: '밝은 곳에서 촬영해주세요.' },
                { icon: Hand, label: '양손이 모두 보이게 해주세요.' },
                { icon: User, label: '상반신이 화면에 보이도록 해주세요.' },
              ].map(({ icon: Icon, label }) => (
                <div
                  key={label}
                  className="flex flex-col items-center gap-1.5 rounded-xl bg-slate-50 p-3 text-center"
                >
                  <Icon size={16} className="text-slate-400" />
                  <span className="text-[10px] text-slate-500 leading-tight">{label}</span>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </>
  )
}
