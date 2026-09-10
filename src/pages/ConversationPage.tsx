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

// 답변 방법 선택 후 어느 입력 화면을 거쳐 왔는지 기억해뒀다가, result-confirm/인식 실패 화면에서
// "이전 단계로"를 누르면 그 입력 화면으로 되돌아갈 수 있게 합니다.
type AnswerSource = 'sign-camera' | 'text-input' | 'choice-select'

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
  const [answerSource, setAnswerSource] = useState<AnswerSource>('sign-camera')
  const [history, setHistory] = useState<QuestionRecord[]>([])
  const [showEndConfirm, setShowEndConfirm] = useState(false)

  const resetForNextQuestion = () => {
    setQuestionText('')
    setAnswerText('')
    setQuestionPhase('mic-waiting')
    setStep('question')
  }

  // 답변 방법 선택 화면으로 되돌아갑니다 (질문 텍스트는 그대로 유지).
  const backToMethodSelect = () => {
    setQuestionPhase('method-select')
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

  // 화면마다 "이전 단계로" 버튼이 어디로 이동할지 결정합니다. undefined면 버튼을 숨깁니다.
  const onBack: (() => void) | undefined = (() => {
    switch (step) {
      case 'question':
        // 대화 화면 안에서 더 되돌아갈 곳이 없으므로, 대화 시작 전 화면으로 나갑니다.
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
  })()

  return (
    <PhoneScreen>
      <div className="relative flex-1 flex flex-col">
        <ConversationScreenShell
          activeIndex={activeIndex}
          phaseLabel={phaseLabel}
          onRequestEnd={() => setShowEndConfirm(true)}
          onBack={onBack}
        >
          {step === 'question' && (
            <QuestionAnswerStep
              initialPhase={questionPhase}
              onPhaseChange={setQuestionPhase}
              onRequestEnd={() => setShowEndConfirm(true)}
              onRestart={resetForNextQuestion}
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
