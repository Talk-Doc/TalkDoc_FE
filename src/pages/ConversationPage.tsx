import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import PhoneScreen from '../components/PhoneScreen'
import TalkDacLogo from '../components/TalkDacLogo'
import ConversationScreenShell from './conversation/ConversationScreenShell'
import QuestionAnswerStep from './conversation/QuestionAnswerStep'
import SignCameraStep from './conversation/SignCameraStep'
import AnalyzingStep from './conversation/AnalyzingStep'
import ResultConfirmStep from './conversation/ResultConfirmStep'
import RecognitionFailedStep from './conversation/RecognitionFailedStep'
import TextInputStep from './conversation/TextInputStep'
import ChoiceAnswerStep from './conversation/ChoiceAnswerStep'
import DoctorAnswerStep from './conversation/DoctorAnswerStep'
import EndConfirmModal from './conversation/EndConfirmModal'
import RestartConfirmModal from './conversation/RestartConfirmModal'
import { SessionProvider, type SessionInfo } from '../context/SessionContext'
import { createSession, deleteSession } from '../api/session'
import { previewAnswer, confirmAnswer } from '../api/answer'
import { ApiError } from '../api/client'
import type { ConversationStep, QuestionPhase, QuestionRecord } from '../types/conversation'

type AnswerSource = 'sign-camera' | 'text-input' | 'choice-select'

// 화면 상단 스테퍼의 진행도(0~3)와 배지 문구는 step/phase 조합으로 정해집니다.
function getStepMeta(step: ConversationStep, phase: QuestionPhase) {
  switch (step) {
    case 'question':
      return phase === 'method-select'
        ? { activeIndex: 0, phaseLabel: '현재 답변 입력 중' }
        : { activeIndex: 0, phaseLabel: '현재 질문 확인 중' }
    case 'result-confirm':
      return { activeIndex: 2, phaseLabel: '현재 답변 입력 중' }
    case 'doctor-answer':
      return { activeIndex: 3, phaseLabel: '현재 답변 입력 중' }
    default:
      return { activeIndex: 0, phaseLabel: '현재 답변 입력 중' }
  }
}

export default function ConversationPage() {
  const navigate = useNavigate()
  const [session, setSession] = useState<SessionInfo | null>(null)
  const [sessionError, setSessionError] = useState<string | null>(null)

  useEffect(() => {
    createSession()
      .then(setSession)
      .catch((err) =>
        setSessionError(err instanceof ApiError ? err.message : '서버에 연결하지 못했어요.'),
      )
  }, [])

  if (sessionError) {
    return (
      <PhoneScreen>
        <div className="flex-1 flex flex-col items-center justify-center text-center gap-3">
          <TalkDacLogo size="md" />
          <p className="text-sm text-red-500">{sessionError}</p>
          <button
            onClick={() => navigate('/ready')}
            className="mt-2 px-4 py-2 rounded-full border border-slate-200 text-sm text-slate-600"
          >
            돌아가기
          </button>
        </div>
      </PhoneScreen>
    )
  }

  if (!session) {
    return (
      <PhoneScreen>
        <div className="flex-1 flex flex-col items-center justify-center gap-3">
          <TalkDacLogo size="md" />
          <div className="w-8 h-8 border-4 border-teal-500 border-t-transparent rounded-full animate-spin" />
        </div>
      </PhoneScreen>
    )
  }

  return (
    <SessionProvider value={session}>
      <ConversationFlow session={session} />
    </SessionProvider>
  )
}

function ConversationFlow({ session }: { session: SessionInfo }) {
  const navigate = useNavigate()
  const [step, setStep] = useState<ConversationStep>('question')
  const [questionPhase, setQuestionPhase] = useState<QuestionPhase>('mic-waiting')
  const [questionText, setQuestionText] = useState('')
  const [answerText, setAnswerText] = useState('')
  const [answerSource, setAnswerSource] = useState<AnswerSource>('sign-camera')
  const [signLabels, setSignLabels] = useState<string[]>([])
  const [history, setHistory] = useState<QuestionRecord[]>([])
  const [showEndConfirm, setShowEndConfirm] = useState(false)
  const [showRestartConfirm, setShowRestartConfirm] = useState(false)

  const resetForNextQuestion = () => {
    setQuestionText('')
    setAnswerText('')
    setQuestionPhase('mic-waiting')
    setStep('question')
  }

  // "대화 다시 시작" 확정: 지금까지 확정된 답변 기록까지 전부 지우고 첫 질문 대기 상태로 되돌립니다.
  // 세션을 나가는 건 아니라서(/end로 이동하지 않음) "대화 종료"와는 다릅니다.
  const confirmRestart = () => {
    setHistory([])
    resetForNextQuestion()
    setShowRestartConfirm(false)
  }

  // 답변 방법 선택 화면으로 되돌아갑니다 (질문 텍스트는 그대로 유지).
  const backToMethodSelect = () => {
    setQuestionPhase('method-select')
    setStep('question')
  }

  // 결과 확인 화면의 [의료진에게 전달하기]: 실제로 답변을 확정하고 대화 기록에 추가합니다.
  const deliverAnswer = async () => {
    const labels = answerSource === 'sign-camera' ? signLabels : [answerText]
    try {
      const conversation = await confirmAnswer(
        session.session_id,
        session.patient_token,
        labels,
        answerText,
      )
      setHistory((prev) => [
        ...prev,
        {
          id: conversation.answer_id,
          doctorQuestionText: conversation.question,
          patientAnswerText: conversation.answer,
        },
      ])
      setStep('doctor-answer')
    } catch {
      // TODO: 사용자에게 실패를 알리고 재시도할 수 있게 하기 (지금은 결과 확인 화면에 머무름)
    }
  }

  const endSession = async () => {
    try {
      await deleteSession(session.session_id, session.doctor_token)
    } catch {
      // 세션이 이미 만료됐어도 종료 자체는 진행합니다.
    }
    navigate('/end')
  }

  const { activeIndex, phaseLabel } = getStepMeta(step, questionPhase)

  // "AI 분석 중" 화면은 헤더/스테퍼가 없는 단독 화면이라 ConversationScreenShell 밖에서 렌더링하고,
  // 이 화면이 뜨는 동안 실제 자연어 변환(미리보기) API를 호출합니다.
  if (step === 'analyzing') {
    return (
      <PhoneScreen>
        <div className="relative flex-1 flex flex-col">
          <AnalyzingPreview
            session={session}
            labels={signLabels}
            onSuccess={(answer) => {
              setAnswerText(answer)
              setStep('result-confirm')
            }}
            onFailure={() => setStep('recognition-failed')}
            onBack={() => setStep('sign-camera')}
          />
        </div>
      </PhoneScreen>
    )
  }

  return (
    <PhoneScreen>
      <div className="relative flex-1 flex flex-col">
        <ConversationScreenShell
          activeIndex={activeIndex}
          phaseLabel={phaseLabel}
          onRequestEnd={() => setShowEndConfirm(true)}
          onBack={(() => {
            switch (step) {
              case 'question':
                return () => navigate('/ready')
              case 'sign-camera':
              case 'text-input':
              case 'choice-select':
              case 'recognition-failed':
                return backToMethodSelect
              case 'result-confirm':
                return () => setStep(answerSource)
              default:
                return undefined
            }
          })()}
        >
          {step === 'question' && (
            <QuestionAnswerStep
              initialPhase={questionPhase}
              onPhaseChange={setQuestionPhase}
              onRequestEnd={() => setShowEndConfirm(true)}
              onRestart={() => setShowRestartConfirm(true)}
              onAnswerWithSign={(q) => {
                setQuestionText(q)
                setAnswerSource('sign-camera')
                setStep('sign-camera')
              }}
              onAnswerWithText={(q) => {
                setQuestionText(q)
                setAnswerSource('text-input')
                setStep('text-input')
              }}
              onAnswerWithChoice={(q) => {
                setQuestionText(q)
                setAnswerSource('choice-select')
                setStep('choice-select')
              }}
            />
          )}

          {step === 'sign-camera' && (
            <SignCameraStep
              questionText={questionText}
              onSuccess={(labels) => {
                setSignLabels(labels)
                setStep('analyzing')
              }}
              onFailure={() => setStep('recognition-failed')}
            />
          )}

          {step === 'result-confirm' && (
            <ResultConfirmStep
              questionText={questionText}
              answerText={answerText}
              answerSource={answerSource}
              recognizedWords={signLabels}
              onConfirm={deliverAnswer}
              onEditAsText={() => {
                setAnswerSource('text-input')
                setStep('text-input')
              }}
            />
          )}

          {step === 'recognition-failed' && (
            <RecognitionFailedStep
              questionText={questionText}
              onRetry={() => setStep('sign-camera')}
              onEditAsText={() => {
                setAnswerSource('text-input')
                setStep('text-input')
              }}
            />
          )}

          {step === 'text-input' && (
            <TextInputStep
              questionText={questionText}
              initialText={answerText}
              onSubmit={(text) => {
                setAnswerText(text)
                setStep('result-confirm')
              }}
            />
          )}

          {step === 'choice-select' && (
            <ChoiceAnswerStep
              questionText={questionText}
              onSubmit={(choice) => {
                setAnswerText(choice)
                setStep('result-confirm')
              }}
            />
          )}

          {step === 'doctor-answer' && (
            <DoctorAnswerStep
              history={history}
              onRequestEnd={() => setShowEndConfirm(true)}
              onRestart={() => setShowRestartConfirm(true)}
              onNextQuestion={resetForNextQuestion}
            />
          )}
        </ConversationScreenShell>

        {showEndConfirm && (
          <EndConfirmModal onConfirmEnd={endSession} onCancel={() => setShowEndConfirm(false)} />
        )}

        {showRestartConfirm && (
          <RestartConfirmModal
            confirmedCount={history.length}
            onConfirmRestart={confirmRestart}
            onCancel={() => setShowRestartConfirm(false)}
          />
        )}
      </div>
    </PhoneScreen>
  )
}

// "AI 분석 중" 화면이 떠 있는 동안 자연어 변환(미리보기) API를 호출하는 작은 컴포넌트입니다.
// 화면 자체(AnalyzingStep)는 순수 표시용이라, 네트워크 호출은 여기서 감싸서 처리합니다.
function AnalyzingPreview({
  session,
  labels,
  onSuccess,
  onFailure,
  onBack,
}: {
  session: SessionInfo
  labels: string[]
  onSuccess: (answer: string) => void
  onFailure: () => void
  onBack: () => void
}) {
  useEffect(() => {
    let cancelled = false
    previewAnswer(session.session_id, session.patient_token, labels)
      .then((res) => {
        if (!cancelled) onSuccess(res.answer)
      })
      .catch(() => {
        if (!cancelled) onFailure()
      })
    return () => {
      cancelled = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return <AnalyzingStep onBack={onBack} />
}
