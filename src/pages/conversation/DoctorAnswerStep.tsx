import { useEffect, useState } from 'react'
import { Send, Volume2, Pencil, Check, X } from 'lucide-react'
import doctorSolo from '../../assets/illustrations/doctor-solo.png'
import HelpTipBox from './HelpTipBox'
import type { QuestionRecord } from '../../types/conversation'
import { useSession } from '../../context/SessionContext'
import { getAnswerTts } from '../../api/answer'
import { playAudioBlob } from '../../utils/audio'
import { speak } from '../../utils/speech'

// 확정된 답변을 읽어줄 때는 백엔드의 실제 TTS API(음성 합성)를 우선 쓰고,
// 실패하면(네트워크 오류 등) 브라우저 내장 음성 합성으로 대체합니다.
async function playAnswer(sessionId: string, doctorToken: string, answerId: string, text: string) {
  try {
    const blob = await getAnswerTts(sessionId, doctorToken, answerId)
    await playAudioBlob(blob)
  } catch {
    speak(text)
  }
}

export default function DoctorAnswerStep({
  history,
  onRequestEnd,
  onRestart,
  onNextQuestion,
  onEditAnswer,
}: {
  history: QuestionRecord[]
  onRequestEnd: () => void
  onRestart: () => void
  onNextQuestion: () => void
  onEditAnswer: (answerId: string, newText: string) => Promise<void>
}) {
  const { session_id: sessionId, doctor_token: doctorToken } = useSession()
  const lastRecord = history[history.length - 1]
  const lastAnswer = lastRecord?.patientAnswerText ?? ''
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editText, setEditText] = useState('')
  const [savingId, setSavingId] = useState<string | null>(null)

  // 이 화면에 들어올 때 방금 전달된 답변을 한 번 음성으로 읽어줍니다.
  // (안내 문구 "전달된 내용이 음성으로도 재생되었습니다"가 가리키는 재생)
  useEffect(() => {
    if (lastRecord) playAnswer(sessionId, doctorToken, lastRecord.id, lastAnswer)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const startEdit = (record: QuestionRecord) => {
    setEditingId(record.id)
    setEditText(record.patientAnswerText ?? '')
  }

  const cancelEdit = () => {
    setEditingId(null)
    setEditText('')
  }

  const saveEdit = async (answerId: string) => {
    const text = editText.trim()
    if (!text) return
    setSavingId(answerId)
    try {
      await onEditAnswer(answerId, text)
      setEditingId(null)
      setEditText('')
    } catch {
      // 실패하면 편집 상태를 유지해서 다시 시도할 수 있게 둡니다.
    } finally {
      setSavingId(null)
    }
  }

  return (
    <>
      <div className="rounded-2xl bg-teal-50 p-4 flex flex-col items-center text-center gap-1.5">
        <span className="w-11 h-11 rounded-full bg-teal-500 flex items-center justify-center text-white mb-1">
          <Send size={18} />
        </span>
        <p className="text-lg font-bold text-slate-900">답변이 전달되었습니다.</p>
        <p className="text-xs text-slate-500 leading-relaxed">
          의료진이 환자의 답변을 확인했습니다.
          <br />
          이제 의료진의 다음 질문을 기다려주세요.
        </p>
      </div>

      <HelpTipBox
        title="전달된 내용이 음성으로도 재생되었습니다."
        body="의료진 화면에 텍스트와 음성으로 함께 표시됩니다."
      />

      <div className="rounded-2xl border border-slate-100 p-4">
        <p className="text-xs font-semibold text-slate-500 mb-2">
          대화 요약 · 확정된 답변 {history.length}건
        </p>
        <div className="flex flex-col gap-2.5">
          {history.map((record, i) => (
            <div key={record.id} className="text-sm">
              <p className="text-slate-500">
                {i + 1}. {record.doctorQuestionText}
              </p>
              {editingId === record.id ? (
                <div className="flex items-center gap-1.5 mt-1">
                  <input
                    value={editText}
                    onChange={(e) => setEditText(e.target.value)}
                    autoFocus
                    className="flex-1 rounded-lg border border-teal-300 px-2 py-1 text-sm font-semibold text-slate-900"
                  />
                  <button
                    onClick={() => saveEdit(record.id)}
                    disabled={savingId === record.id}
                    aria-label="답변 수정 저장"
                    className="text-teal-600 shrink-0 disabled:opacity-40"
                  >
                    <Check size={16} />
                  </button>
                  <button
                    onClick={cancelEdit}
                    disabled={savingId === record.id}
                    aria-label="답변 수정 취소"
                    className="text-slate-400 shrink-0 disabled:opacity-40"
                  >
                    <X size={16} />
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-1.5">
                  <p className="font-semibold text-slate-900">{record.patientAnswerText}</p>
                  <button
                    onClick={() => startEdit(record)}
                    aria-label="답변 수정하기"
                    className="text-slate-300 shrink-0"
                  >
                    <Pencil size={13} />
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      <button
        onClick={onNextQuestion}
        className="flex-1 w-full flex flex-col items-center justify-center text-center gap-2 py-2"
        title="눌러서 다음 질문 받기"
      >
        <img src={doctorSolo} alt="" className="w-28" />
        <p className="text-base font-bold text-slate-900">의료진의 다음 질문을 기다리는 중이에요.</p>
        <p className="text-xs text-slate-400">질문이 오면 화면에 자동으로 표시됩니다.</p>
      </button>

      <div className="flex gap-2">
        <button
          onClick={onRequestEnd}
          className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-500 text-sm"
        >
          대화 중지
        </button>
        <button
          onClick={onRestart}
          className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-500 text-sm"
        >
          대화 다시 시작
        </button>
      </div>

      <div className="flex items-center justify-between text-xs text-slate-400">
        <span>더 편하게 이용하고 싶다면 아래 기능을 활용해보세요.</span>
        <button
          onClick={() => lastRecord && playAnswer(sessionId, doctorToken, lastRecord.id, lastAnswer)}
          disabled={!lastRecord}
          aria-label="전달된 답변 다시 듣기"
          className="shrink-0 disabled:opacity-40"
        >
          <Volume2 size={13} />
        </button>
      </div>
    </>
  )
}
