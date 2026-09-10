import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import PhoneScreen from '../components/PhoneScreen'
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
import type { ConversationStep, QuestionPhase, QuestionRecord } from '../types/conversation'

// TODO(백엔드 연동): recognizedWords/answerText는 실제로는 Vision AI + LLM 응답으로 채워집니다.
const MOCK_RECOGNIZED_WORDS = ['배', '아프다']
const MOCK_RECOGNIZED_ANSWER = '배가 아파요.'

// 화면 상단 스테퍼의 진행도(0~3)와 배지 문구는 step/phase 조합으로 정해집니다.
function getStepMeta(step: ConversationStep, phase: QuestionPhase) {
  switch (step) {
    case 'question':
      return phase === 'method-select'
        ? { activeIndex: 0, phaseLabel: '현재 답변 입력 중' }
        : { activeIndex: 0, phaseLabel: '현재 질문 확인 중' }
    case 'analyzing':
      return { activeIndex: 1, phaseLabel: '현재 답변 입력 중' }
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
  const [step, setStep] = useState<ConversationStep>('question')
  const [questionPhase, setQuestionPhase] = useState<QuestionPhase>('mic-waiting')
  const [questionText, setQuestionText] = useState('')
  const [answerText, setAnswerText] = useState('')
  const [history, setHistory] = useState<QuestionRecord[]>([])
  const [showEndConfirm, setShowEndConfirm] = useState(false)

  const resetForNextQuestion = () => {
    setQuestionText('')
    setAnswerText('')
    setQuestionPhase('mic-waiting')
    setStep('question')
  }

  const deliverAnswer = () => {
    setHistory((prev) => [
      ...prev,
      { id: crypto.randomUUID(), doctorQuestionText: questionText, patientAnswerText: answerText },
    ])
    setStep('doctor-answer')
  }

  const { activeIndex, phaseLabel } = getStepMeta(step, questionPhase)

  return (
    <PhoneScreen>
      <div className="relative flex-1 flex flex-col">
        <ConversationScreenShell
          activeIndex={activeIndex}
          phaseLabel={phaseLabel}
          onRequestEnd={() => setShowEndConfirm(true)}
        >
          {step === 'question' && (
            <QuestionAnswerStep
              onPhaseChange={setQuestionPhase}
              onRequestEnd={() => setShowEndConfirm(true)}
              onRestart={resetForNextQuestion}
              onAnswerWithSign={(q) => {
                setQuestionText(q)
                setStep('sign-camera')
              }}
              onAnswerWithText={(q) => {
                setQuestionText(q)
                setStep('text-input')
              }}
              onAnswerWithChoice={(q) => {
                setQuestionText(q)
                setStep('choice-select')
              }}
            />
          )}

          {step === 'sign-camera' && (
            <SignCameraStep questionText={questionText} onDone={() => setStep('analyzing')} />
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
              questionText={questionText}
              answerText={answerText}
              recognizedWords={MOCK_RECOGNIZED_WORDS}
              onConfirm={deliverAnswer}
              onEditAsText={() => setStep('text-input')}
            />
          )}

          {step === 'recognition-failed' && (
            <RecognitionFailedStep
              questionText={questionText}
              onRetry={() => setStep('sign-camera')}
              onEditAsText={() => setStep('text-input')}
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
              onRestart={resetForNextQuestion}
              onNextQuestion={resetForNextQuestion}
            />
          )}
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
