import { useCallback, useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import PhoneScreen from '../components/PhoneScreen'
import StatusBanner from './conversation/StatusBanner'
import ConversationScreenShell from './conversation/ConversationScreenShell'
import QuestionAnswerStep from './conversation/QuestionAnswerStep'
import SignCameraStep from './conversation/SignCameraStep'
import AnalyzingStep, { type RecognitionResult } from './conversation/AnalyzingStep'
import ResultConfirmStep from './conversation/ResultConfirmStep'
import RecognitionFailedStep from './conversation/RecognitionFailedStep'
import TextInputStep from './conversation/TextInputStep'
import DoctorAnswerStep from './conversation/DoctorAnswerStep'
import EndConfirmModal from './conversation/EndConfirmModal'
import type { ConversationStep } from '../types/conversation'
import { useSession } from '../session/useSession'
import { useSessionSocket } from '../api/socket'
import { talkdocApi } from '../api/talkdoc'
import { errorMessage } from '../api/client'
import type { Conversation, QuestionResponse, SessionEvent } from '../api/types'

// 한 세션 안에서 "질문 → 답변 → 전달"이 여러 번 반복됩니다.
// 각 단계의 서버 호출은 해당 Step 컴포넌트 안에서 하고, 이 페이지는 단계 사이의 데이터
// (질문, 인식 라벨, 답변 문장, 확정된 대화)를 들고 있다가 다음 단계로 넘겨줍니다.
//
// 시작 화면 / 종료 화면 / 답변 확인 등 아직 디자인이 나오지 않은 화면들은
// 새 디자인이 나올 때까지 예전 뼈대(StatusBanner) 그대로 둡니다.
// -> 'question' 단계만 새 디자인(ConversationScreenShell)을 씁니다.
export default function ConversationPage() {
  const navigate = useNavigate()
  const { session, endSession, clearSession } = useSession()
  // 우리가 세션을 닫는 중인지(또는 서버가 닫았는지) 표시. 리다이렉트/소켓 이벤트 처리에서 참고합니다.
  const endingRef = useRef(false)

  const [step, setStep] = useState<ConversationStep>('question')
  const [questionPhase, setQuestionPhase] = useState<'asking' | 'ready'>('asking')
  const [question, setQuestion] = useState<QuestionResponse | null>(null)
  const [signVideo, setSignVideo] = useState<Blob | null>(null)
  const [labels, setLabels] = useState<string[]>([])
  const [answerText, setAnswerText] = useState('')
  const [failureReason, setFailureReason] = useState<string | null>(null)
  const [conversation, setConversation] = useState<Conversation | null>(null)
  const [conversationCount, setConversationCount] = useState(0)
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [showEndConfirm, setShowEndConfirm] = useState(false)
  const [ending, setEnding] = useState(false)

  // 세션 없이 이 화면에 오면(주소 직접 입력 등) 시작 화면으로 돌려보냅니다.
  // 종료 처리 중에는 세션이 비워진 직후 종료 화면으로 직접 이동하므로 여기서 끼어들지 않습니다.
  useEffect(() => {
    if (!session && !endingRef.current) navigate('/', { replace: true })
  }, [session, navigate])

  // 서버 알림: 세션이 (다른 곳에서) 닫히면 종료 화면으로 보냅니다.
  // 우리가 직접 종료하는 중이면 confirmEnd 쪽에서 요약과 함께 이동하므로 여기선 무시합니다.
  const handleEvent = useCallback(
    (event: SessionEvent) => {
      if (event.type === 'SESSION_CLOSED' && !endingRef.current) {
        endingRef.current = true
        clearSession()
        navigate('/end', { replace: true })
      }
    },
    [clearSession, navigate],
  )
  useSessionSocket(session?.sessionId, session?.doctorToken, handleEvent)

  const resetForNextQuestion = () => {
    setQuestion(null)
    setSignVideo(null)
    setLabels([])
    setAnswerText('')
    setFailureReason(null)
    setConversation(null)
    setSubmitError(null)
    setQuestionPhase('asking')
    setStep('question')
  }

  // 환자 토큰으로 답변을 확정합니다(POST /answer/confirm). 확정 후 대기 중인 질문이 해제됩니다.
  const confirmAnswer = async () => {
    if (!session) return
    setSubmitting(true)
    setSubmitError(null)
    try {
      const confirmed = await talkdocApi.confirmAnswer(
        session.sessionId,
        session.patientToken,
        labels,
        answerText,
      )
      setConversation(confirmed)
      setConversationCount((n) => n + 1)
      setStep('doctor-answer')
    } catch (e) {
      setSubmitError(errorMessage(e))
    } finally {
      setSubmitting(false)
    }
  }

  // 요약을 뽑고(POST /summary) 세션을 삭제한(DELETE /sessions/{id}) 뒤 종료 화면으로 갑니다.
  const confirmEnd = async () => {
    endingRef.current = true
    setEnding(true)
    try {
      const summary = await endSession()
      navigate('/end', { replace: true, state: { summary } })
    } catch (e) {
      endingRef.current = false
      setSubmitError(errorMessage(e))
      setEnding(false)
      setShowEndConfirm(false)
    }
  }

  if (!session) return null

  if (step === 'question') {
    return (
      <PhoneScreen>
        <div className="relative flex-1 flex flex-col">
          <ConversationScreenShell
            activeIndex={questionPhase === 'asking' ? 0 : 1}
            onRequestEnd={() => setShowEndConfirm(true)}
          >
            <QuestionAnswerStep
              conversationCount={conversationCount}
              onPhaseChange={setQuestionPhase}
              onQuestionReady={setQuestion}
              onAnswerWithSign={() => setStep('sign-camera')}
              onAnswerWithText={() => setStep('text-input')}
            />
          </ConversationScreenShell>

          {showEndConfirm && (
            <EndConfirmModal
              ending={ending}
              onConfirmEnd={confirmEnd}
              onCancel={() => setShowEndConfirm(false)}
            />
          )}
        </div>
      </PhoneScreen>
    )
  }

  return (
    <PhoneScreen>
      <div className="relative flex-1 flex flex-col">
        <StatusBanner step={step} onRequestEnd={() => setShowEndConfirm(true)} />

        {question && step !== 'doctor-answer' && (
          <p className="text-xs text-slate-400 mb-3 truncate">질문: “{question.text}”</p>
        )}

        {step === 'sign-camera' && (
          <SignCameraStep
            onDone={(video) => {
              setSignVideo(video)
              setStep('analyzing')
            }}
            onFallbackToText={() => setStep('text-input')}
          />
        )}

        {step === 'analyzing' && signVideo && (
          <AnalyzingStep
            video={signVideo}
            onSuccess={(result: RecognitionResult) => {
              setLabels(result.labels)
              setAnswerText(result.answer)
              setStep('result-confirm')
            }}
            onFailure={(reason) => {
              setFailureReason(reason ?? null)
              setStep('recognition-failed')
            }}
          />
        )}

        {step === 'result-confirm' && (
          <ResultConfirmStep
            answerText={answerText}
            labels={labels}
            submitting={submitting}
            error={submitError}
            onConfirm={confirmAnswer}
            onRetry={() => {
              setLabels([])
              setStep('sign-camera')
            }}
            onEditAsText={() => setStep('text-input')}
          />
        )}

        {step === 'recognition-failed' && (
          <RecognitionFailedStep
            reason={failureReason}
            onRetry={() => setStep('sign-camera')}
            onEditAsText={() => setStep('text-input')}
          />
        )}

        {step === 'text-input' && (
          <TextInputStep
            initialText={answerText}
            onSubmit={(text) => {
              setAnswerText(text)
              setStep('result-confirm')
            }}
          />
        )}

        {step === 'doctor-answer' && conversation && (
          <DoctorAnswerStep conversation={conversation} onNextQuestion={resetForNextQuestion} />
        )}

        {showEndConfirm && (
          <EndConfirmModal
            ending={ending}
            onConfirmEnd={confirmEnd}
            onCancel={() => setShowEndConfirm(false)}
          />
        )}
      </div>
    </PhoneScreen>
  )
}
