import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import PhoneScreen from '../components/PhoneScreen'
import StatusBanner from './conversation/StatusBanner'
import ConversationScreenShell from './conversation/ConversationScreenShell'
import QuestionAnswerStep from './conversation/QuestionAnswerStep'
import SignCameraStep from './conversation/SignCameraStep'
import AnalyzingStep from './conversation/AnalyzingStep'
import ResultConfirmStep from './conversation/ResultConfirmStep'
import RecognitionFailedStep from './conversation/RecognitionFailedStep'
import TextInputStep from './conversation/TextInputStep'
import DoctorAnswerStep from './conversation/DoctorAnswerStep'
import EndConfirmModal from './conversation/EndConfirmModal'
import type { ConversationStep } from '../types/conversation'

// TODO(백엔드 연동): recognizedAnswer는 실제로는 Vision AI + LLM 응답으로 채워집니다.
const MOCK_RECOGNIZED_ANSWER = '배가 아파요.'

// 시작 화면 / 종료 화면 / 답변 확인 등 아직 디자인이 나오지 않은 화면들은
// 새 디자인이 나올 때까지 예전 뼈대(StatusBanner) 그대로 둡니다.
// -> 'question' 단계만 새 디자인(ConversationScreenShell)을 씁니다.
export default function ConversationPage() {
  const navigate = useNavigate()
  const [step, setStep] = useState<ConversationStep>('question')
  const [questionPhase, setQuestionPhase] = useState<'asking' | 'ready'>('asking')
  const [questionText, setQuestionText] = useState('')
  const [answerText, setAnswerText] = useState('')
  const [showEndConfirm, setShowEndConfirm] = useState(false)

  const resetForNextQuestion = () => {
    setQuestionText('')
    setAnswerText('')
    setQuestionPhase('asking')
    setStep('question')
  }

  if (step === 'question') {
    return (
      <PhoneScreen>
        <div className="relative flex-1 flex flex-col">
          <ConversationScreenShell
            activeIndex={questionPhase === 'asking' ? 0 : 1}
            onRequestEnd={() => setShowEndConfirm(true)}
          >
            <QuestionAnswerStep
              onPhaseChange={setQuestionPhase}
              onAnswerWithSign={(q) => {
                setQuestionText(q)
                setStep('sign-camera')
              }}
              onAnswerWithText={(q) => {
                setQuestionText(q)
                setStep('text-input')
              }}
            />
          </ConversationScreenShell>

          {showEndConfirm && (
            <EndConfirmModal
              onConfirmEnd={() => navigate('/end')}
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

        {step === 'sign-camera' && (
          <SignCameraStep onDone={() => setStep('analyzing')} />
        )}

        {step === 'analyzing' && (
          <AnalyzingStep
            onSuccess={() => {
              setAnswerText(MOCK_RECOGNIZED_ANSWER)
              setStep('result-confirm')
            }}
            onFailure={() => setStep('recognition-failed')}
          />
        )}

        {step === 'result-confirm' && (
          <ResultConfirmStep
            answerText={answerText}
            onConfirm={() => setStep('doctor-answer')}
            onRetry={() => setStep('sign-camera')}
            onEditAsText={() => setStep('text-input')}
          />
        )}

        {step === 'recognition-failed' && (
          <RecognitionFailedStep
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

        {step === 'doctor-answer' && (
          <DoctorAnswerStep
            questionText={questionText}
            answerText={answerText}
            onNextQuestion={resetForNextQuestion}
          />
        )}

        {showEndConfirm && (
          <EndConfirmModal
            onConfirmEnd={() => navigate('/end')}
            onCancel={() => setShowEndConfirm(false)}
          />
        )}
      </div>
    </PhoneScreen>
  )
}
