import { useEffect, useRef, useState } from 'react'
import { useSession } from '../../session/useSession'
import { talkdocApi } from '../../api/talkdoc'
import { errorMessage } from '../../api/client'

export interface RecognitionResult {
  labels: string[]
  answer: string
}

// 녹화된 수어 영상을 POST /sign 으로 보내 라벨을 인식하고,
// 인식된 라벨로 POST /answer/preview 를 호출해 답변 문장을 미리 만들어 옵니다.
// 인식된 라벨이 하나도 없으면(신뢰도 미달 포함) 실패로 처리합니다.
export default function AnalyzingStep({
  video,
  onSuccess,
  onFailure,
}: {
  video: Blob
  onSuccess: (result: RecognitionResult) => void
  onFailure: (reason?: string) => void
}) {
  const { session } = useSession()
  const [status, setStatus] = useState('수어를 인식하고 있어요')
  const startedRef = useRef(false)

  useEffect(() => {
    if (!session || startedRef.current) return
    startedRef.current = true // React StrictMode의 이중 실행으로 두 번 업로드되지 않게 막습니다.

    const run = async () => {
      try {
        const sign = await talkdocApi.recognizeSign(session.sessionId, session.patientToken, video)
        if (sign.accepted_labels.length === 0) {
          onFailure(
            sign.signs.length === 0
              ? '수어를 찾지 못했어요.'
              : '인식 신뢰도가 낮아요. 조금 더 천천히 다시 해주세요.',
          )
          return
        }
        setStatus(`인식된 수어: ${sign.accepted_labels.join(', ')} · 문장으로 정리 중`)
        const preview = await talkdocApi.previewAnswer(
          session.sessionId,
          session.patientToken,
          sign.accepted_labels,
        )
        onSuccess({ labels: preview.labels, answer: preview.answer })
      } catch (e) {
        onFailure(errorMessage(e))
      }
    }
    void run()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session, video])

  return (
    <div className="flex-1 flex flex-col items-center justify-center gap-6 text-center">
      <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
      <div>
        <p className="text-slate-700 font-medium">AI가 답변을 분석하고 있어요</p>
        <p className="text-xs text-slate-400 mt-1">{status}</p>
      </div>
    </div>
  )
}
