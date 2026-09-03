import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import PhoneScreen from '../components/PhoneScreen'
import StatusBanner from './conversation/StatusBanner'
import DoctorQuestionStep from './conversation/DoctorQuestionStep'
import PatientConfirmStep from './conversation/PatientConfirmStep'
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

export default function ConversationPage() {
  const navigate = useNavigate()
  const [step, setStep] = useState<ConversationStep>('doctor-question')
  const [questionText, setQuestionText] = useState('')
  const [answerText, setAnswerText] = useState('')
  const [showEndConfirm, setShowEndConfirm] = useState(false)

  const resetForNextQuestion = () => {
    setQuestionText('')
    setAnswerText('')
    setStep('doctor-question')
  }

  return (
    <PhoneScreen>
      <div className="relative flex-1 flex flex-col">
        <StatusBanner step={step} onRequestEnd={() => setShowEndConfirm(true)} />

        {step === 'doctor-question' && (
          <DoctorQuestionStep
            onQuestionReady={(text) => {
              setQuestionText(text)
              setStep('patient-confirm')
            }}
          />
        )}

        {step === 'patient-confirm' && (
          <PatientConfirmStep
            questionText={questionText}
            onAnswerWithSign={() => setStep('sign-camera')}
            onAnswerWithText={() => setStep('text-input')}
          />
        )}

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
