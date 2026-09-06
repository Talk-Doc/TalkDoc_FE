import { useEffect, useRef, useState } from 'react'
import { Volume2, Loader2 } from 'lucide-react'
import { useSession } from '../../session/useSession'
import { talkdocApi } from '../../api/talkdoc'
import { errorMessage } from '../../api/client'
import type { Conversation } from '../../api/types'

// 확정된 답변(Conversation)을 의료진에게 보여주고,
// [음성으로 듣기]를 누르면 GET /answer/{id}/tts 로 합성 음성을 받아 재생합니다.
export default function DoctorAnswerStep({
  conversation,
  onNextQuestion,
}: {
  conversation: Conversation
  onNextQuestion: () => void
}) {
  const { session } = useSession()
  const [loadingAudio, setLoadingAudio] = useState(false)
  const [audioError, setAudioError] = useState<string | null>(null)
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const urlRef = useRef<string | null>(null)

  useEffect(() => {
    return () => {
      audioRef.current?.pause()
      if (urlRef.current) URL.revokeObjectURL(urlRef.current)
    }
  }, [])

  const playAnswer = async () => {
    if (!session) return
    setAudioError(null)
    setLoadingAudio(true)
    try {
      const blob = await talkdocApi.fetchAnswerAudio(
        session.sessionId,
        session.doctorToken,
        conversation.answer_id,
      )
      if (urlRef.current) URL.revokeObjectURL(urlRef.current)
      const url = URL.createObjectURL(blob)
      urlRef.current = url
      const audio = new Audio(url)
      audioRef.current = audio
      await audio.play()
    } catch (e) {
      setAudioError(errorMessage(e))
    } finally {
      setLoadingAudio(false)
    }
  }

  return (
    <div className="flex-1 flex flex-col">
      <div className="flex-1 flex flex-col justify-center gap-6">
        <div>
          <p className="text-xs text-slate-400 mb-1">의료진 질문</p>
          <p className="text-slate-600">{conversation.question}</p>
        </div>
        <div>
          <p className="text-xs text-slate-400 mb-1">환자 답변</p>
          <p className="text-2xl font-bold text-slate-900">{conversation.answer}</p>
          {conversation.signs.length > 0 && (
            <p className="text-xs text-slate-400 mt-2">인식된 수어: {conversation.signs.join(' · ')}</p>
          )}
        </div>
        <button
          onClick={playAnswer}
          disabled={loadingAudio}
          className="self-start flex items-center gap-1.5 text-sm text-blue-600 border border-blue-200 rounded-full px-3 py-1.5 disabled:opacity-50"
        >
          {loadingAudio ? <Loader2 size={14} className="animate-spin" /> : <Volume2 size={14} />}
          음성으로 듣기
        </button>
        {audioError && <p className="text-xs text-red-500">{audioError}</p>}
      </div>
      <button
        onClick={onNextQuestion}
        className="w-full py-4 rounded-xl bg-blue-500 text-white font-semibold"
      >
        다음 질문
      </button>
    </div>
  )
}
