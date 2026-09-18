import { useEffect, useRef, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
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
import { createSession, deleteSession, generateSummary } from '../api/session'
import { previewAnswer, confirmAnswer, confirmDraft, updateAnswer } from '../api/answer'
import { ApiError } from '../api/client'
import type { QuestionResponse } from '../api/types'
import type { ConversationStep, QuestionPhase, QuestionRecord } from '../types/conversation'
import { formatQuestionTime } from '../utils/time'

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
  // StrictMode(개발 모드)는 마운트를 일부러 두 번 실행해 effect가 정리(cleanup)를 잘 하는지
  // 검증합니다. 세션 생성은 멱등하지 않은(POST) 호출이라 두 번 나가면 세션이 하나 더 만들어져
  // 낭비이므로, 같은 컴포넌트 인스턴스 안에서 유지되는 ref로 한 번만 호출되게 막습니다.
  const sessionRequested = useRef(false)

  useEffect(() => {
    if (sessionRequested.current) return
    sessionRequested.current = true
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
  const [searchParams] = useSearchParams()
  const judgeGuideMode = searchParams.get('mode') === 'judge'
  const [step, setStep] = useState<ConversationStep>('question')
  const [questionPhase, setQuestionPhase] = useState<QuestionPhase>('mic-waiting')
  const [question, setQuestion] = useState<QuestionResponse | null>(null)
  const [answerText, setAnswerText] = useState('')
  const [answerSource, setAnswerSource] = useState<AnswerSource>('sign-camera')
  const [answerLabels, setAnswerLabels] = useState<string[]>([])
  // 수어 답변은 미리보기(preview)가 만든 초안(draft)의 id/버전을 들고 있다가, 그 초안으로 확정합니다.
  // 이러면 미리보기 이후 의사가 질문을 수정했을 때 백엔드가 자동으로 확정을 막아줘요(DRAFT_INVALIDATED).
  const [draftAnswerId, setDraftAnswerId] = useState<string | null>(null)
  const [draftVersion, setDraftVersion] = useState<number | null>(null)
  const [draftInvalidated, setDraftInvalidated] = useState(false)
  const [history, setHistory] = useState<QuestionRecord[]>([])
  const [showEndConfirm, setShowEndConfirm] = useState(false)
  const [showRestartConfirm, setShowRestartConfirm] = useState(false)
  const [delivering, setDelivering] = useState(false)
  const [deliverError, setDeliverError] = useState<string | null>(null)
  // QuestionAnswerStep은 자기 phase/question을 useState(initialPhase/initialQuestion)로
  // "마운트 시점에만" 초기화합니다. 방법 선택 화면(step==='question')에 머문 채로 재시작하면
  // step이 안 바뀌어서 리마운트가 안 되고, 부모가 questionPhase/question을 리셋해도 자식의
  // 오래된 내부 state가 그대로 남아 화면이 안 바뀌는 버그가 있었습니다. key를 바꿔 강제로
  // 리마운트시켜서 고칩니다.
  const [restartKey, setRestartKey] = useState(0)

  const resetForNextQuestion = () => {
    setQuestion(null)
    setAnswerText('')
    setDeliverError(null)
    setDraftAnswerId(null)
    setDraftVersion(null)
    setDraftInvalidated(false)
    setQuestionPhase('mic-waiting')
    setStep('question')
  }

  // "대화 다시 시작" 확정: 지금까지 확정된 답변 기록까지 전부 지우고 첫 질문 대기 상태로 되돌립니다.
  // 세션을 나가는 건 아니라서(/end로 이동하지 않음) "대화 종료"와는 다릅니다.
  const confirmRestart = () => {
    setHistory([])
    resetForNextQuestion()
    setShowRestartConfirm(false)
    setRestartKey((k) => k + 1)
  }

  // 답변 방법 선택 화면으로 되돌아갑니다 (질문 텍스트는 그대로 유지).
  const backToMethodSelect = () => {
    setQuestionPhase('method-select')
    setStep('question')
  }

  // 결과 확인 화면의 [의료진에게 전달하기]: 실제로 답변을 확정하고 대화 기록에 추가합니다.
  // 실패하면(네트워크 오류 등) 화면에 머물면서 에러를 보여주고, 같은 버튼으로 재시도할 수 있게 합니다.
  const deliverAnswer = async () => {
    setDelivering(true)
    setDeliverError(null)
    setDraftInvalidated(false)
    try {
      // 수어 답변은 미리보기가 만든 초안을 id로 확정합니다: 그 사이 질문이 바뀌었으면
      // 백엔드가 DRAFT_INVALIDATED로 막아줘요. 텍스트/선택지 답변은 라벨이 없어 이 방식을
      // 쓸 수 없으니(백엔드에 그런 안전장치 자체가 없음) 기존 방식 그대로 보냅니다.
      const conversation =
        answerSource === 'sign-camera' && draftAnswerId !== null && draftVersion !== null
          ? await confirmDraft(session.session_id, session.patient_token, draftAnswerId, draftVersion)
          : await confirmAnswer(session.session_id, session.patient_token, [], answerText)
      setHistory((prev) => [
        ...prev,
        {
          id: conversation.answer_id,
          doctorQuestionText: conversation.question,
          patientAnswerText: conversation.answer,
        },
      ])
      if (judgeGuideMode) {
        navigate('/guide/complete', {
          replace: true,
          state: {
            answer: conversation.answer,
            sessionId: session.session_id,
            doctorToken: session.doctor_token,
          },
        })
      } else {
        setStep('doctor-answer')
      }
    } catch (err) {
      if (err instanceof ApiError && err.code === 'DRAFT_INVALIDATED') {
        setDraftInvalidated(true)
        setDeliverError('의료진이 질문을 수정했어요. 질문을 다시 확인하고 답변해주세요.')
      } else {
        setDeliverError(
          err instanceof ApiError ? err.message : '답변을 전달하지 못했어요. 다시 시도해주세요.',
        )
      }
    } finally {
      setDelivering(false)
    }
  }

  // 대화 요약 안 결과 확인 화면의 [답변 수정하기]가 아니라, 전달 완료 후 요약에 남은 오타 등을
  // 고치는 용도입니다. doctor_token/patient_token 둘 다 허용되는 엔드포인트라 patient_token을 씁니다.
  const editAnswer = async (answerId: string, newText: string) => {
    const conversation = await updateAnswer(session.session_id, session.patient_token, answerId, newText)
    setHistory((prev) =>
      prev.map((record) =>
        record.id === answerId ? { ...record, patientAnswerText: conversation.answer } : record,
      ),
    )
  }

  const endSession = async () => {
    // 세션이 삭제되기 전에 지금까지 확정된 답변들의 진료 요약을 먼저 받아둡니다.
    let summary = ''
    if (history.length > 0) {
      try {
        summary = (await generateSummary(session.session_id, session.doctor_token)).summary
      } catch {
        // 요약 생성에 실패해도 종료 자체는 막지 않습니다.
      }
    }
    try {
      await deleteSession(session.session_id, session.doctor_token)
    } catch {
      // 세션이 이미 만료됐어도 종료 자체는 진행합니다.
    }
    navigate('/end', { state: { summary } })
  }

  const { activeIndex, phaseLabel } = getStepMeta(step, questionPhase)
  const questionText = question?.text ?? ''
  const questionTime = question ? formatQuestionTime(question.asked_at) : undefined

  // "AI 분석 중" 화면은 헤더/스테퍼가 없는 단독 화면이라 ConversationScreenShell 밖에서 렌더링하고,
  // 이 화면이 뜨는 동안 실제 자연어 변환(미리보기) API를 호출합니다.
  if (step === 'analyzing') {
    return (
      <PhoneScreen>
        <div className="relative flex-1 flex flex-col">
          <AnalyzingPreview
            session={session}
            labels={answerLabels}
            questionId={question?.question_id}
            questionVersion={question?.version}
            onSuccess={(answer, answerId, version) => {
              setAnswerText(answer)
              setDraftAnswerId(answerId)
              setDraftVersion(version)
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
                return () => {
                  setDeliverError(null)
                  setDraftInvalidated(false)
                  setStep(answerSource)
                }
              default:
                return undefined
            }
          })()}
        >
          {step === 'question' && (
            <QuestionAnswerStep
              key={restartKey}
              initialPhase={questionPhase}
              initialQuestion={question}
              onPhaseChange={setQuestionPhase}
              onRequestEnd={() => setShowEndConfirm(true)}
              onRestart={() => setShowRestartConfirm(true)}
              onAnswerWithSign={(q) => {
                setQuestion(q)
                setAnswerSource('sign-camera')
                setStep('sign-camera')
              }}
              onAnswerWithText={(q) => {
                setQuestion(q)
                setAnswerSource('text-input')
                setStep('text-input')
              }}
              onAnswerWithChoice={(q) => {
                setQuestion(q)
                setAnswerSource('choice-select')
                setStep('choice-select')
              }}
            />
          )}

          {step === 'sign-camera' && (
            <SignCameraStep
              questionText={questionText}
              time={questionTime}
              judgeGuideMode={judgeGuideMode}
              onSuccess={(labels) => {
                setAnswerLabels(labels)
                setStep('analyzing')
              }}
              onFailure={() => setStep('recognition-failed')}
            />
          )}

          {step === 'result-confirm' && (
            <ResultConfirmStep
              questionText={questionText}
              time={questionTime}
              answerText={answerText}
              answerSource={answerSource}
              recognizedWords={answerLabels}
              submitting={delivering}
              error={deliverError}
              draftInvalidated={draftInvalidated}
              onConfirm={deliverAnswer}
              onEditAsText={() => {
                setDeliverError(null)
                setDraftInvalidated(false)
                setAnswerSource('text-input')
                setStep('text-input')
              }}
              onQuestionChanged={backToMethodSelect}
            />
          )}

          {step === 'recognition-failed' && (
            <RecognitionFailedStep
              questionText={questionText}
              time={questionTime}
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
              time={questionTime}
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
              time={questionTime}
              cardOptions={question?.card_options ?? []}
              onSubmit={(answer) => {
                setAnswerLabels([])
                setAnswerText(answer)
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
              onEditAnswer={editAnswer}
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
  questionId,
  questionVersion,
  onSuccess,
  onFailure,
  onBack,
}: {
  session: SessionInfo
  labels: string[]
  questionId?: string
  questionVersion?: number
  onSuccess: (answer: string, answerId: string, version: number) => void
  onFailure: () => void
  onBack: () => void
}) {
  // 세션 생성과 달리 preview는 백엔드가 아무것도 저장하지 않는 순수 조회라서
  // (README: "저장하지 않습니다"), StrictMode가 개발 모드에서 두 번 호출해도 무해합니다.
  // ref로 막으면 StrictMode의 즉시 정리(cleanup)가 첫 호출의 cancelled만 true로 만들어
  // 두 번째(생략된) 호출이 결과를 받을 수 없게 되어 화면이 멈추므로, 표준적인
  // "마지막 호출만 반영" ignore 플래그 패턴을 그대로 씁니다.
  useEffect(() => {
    let cancelled = false
    previewAnswer(session.session_id, session.patient_token, labels, questionId, questionVersion)
      .then((res) => {
        if (!cancelled) onSuccess(res.answer, res.answer_id, res.version)
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
