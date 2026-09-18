// TalkDoc_BE 응답 타입입니다. 백엔드가 Jackson SNAKE_CASE 전략으로 직렬화하므로
// 필드명이 그대로 snake_case인 점에 유의하세요 (프론트 컨벤션과 다름).

export type Intent =
  | 'BODY_LOCATION'
  | 'SYMPTOM'
  | 'HISTORY_STATE'
  | 'DURATION'
  | 'SEVERITY'
  | 'FREQUENCY'
  | 'YES_NO'
  | 'CHOICE'
  | 'OTHER'

export type AnswerMode = 'SIGN_REQUIRED' | 'CARD_SELECT'

export interface CreateSessionResponse {
  session_id: string
  doctor_token: string
  patient_token: string
  created_at: string
  patient_join_path: string
}

export interface QuestionResponse {
  question_id: string
  text: string
  intent: Intent
  intents: Intent[]
  candidates: string[]
  supported: boolean
  answer_mode: AnswerMode
  card_options: string[]
  asked_at: string
  version: number
  updated_at: string | null
}

export interface RecognizedSign {
  label: string | null
  confidence: number | null
  accepted: boolean
  reason: 'LOW_CONFIDENCE' | 'INSUFFICIENT_LANDMARKS' | null
}

export interface SignResponse {
  question_id: string | null
  question_version: number | null
  recognition_id: string | null
  intents: Intent[]
  candidates: string[]
  sign: RecognizedSign
  signs: RecognizedSign[]
  all_accepted: boolean
  accepted_labels: string[]
  model_version: string | null
  request_id: string | null
  processing_ms: number | null
}

export interface PreviewResponse {
  question_id: string
  question_version: number
  labels: string[]
  answer: string
  answer_id: string
  version: number
  recognition_ids: string[] | null
}

export interface PendingEdit {
  answer: string
  proposed_by: 'DOCTOR' | 'PATIENT'
  proposed_at: string
}

export interface Conversation {
  answer_id: string
  question_id: string
  question: string
  intents: Intent[]
  signs: string[]
  answer: string
  confirmed_at: string
  question_version: number
  version: number
  edited_by: 'DOCTOR' | 'PATIENT' | null
  edited_at: string | null
  pending_edit: PendingEdit | null
}

// GET 세션 상세의 current_question은 PendingQuestion을 그대로 직렬화한 것이라
// QuestionResponse(POST 응답 전용, QuestionResponse.of()로 만들어짐)와 필드가 다릅니다.
// 특히 QuestionResponse.of()가 계산해서 채우는 intent(단일)는 없습니다.
export interface PendingQuestionSummary {
  question_id: string
  text: string
  intents: Intent[]
  candidates: string[]
  answer_mode: AnswerMode
  card_options: string[]
  asked_at: string
  version: number
  updated_at: string | null
}

// POST /answer/preview가 만드는 초안(AnswerDraft)을 세션 상세에서 그대로 보여줄 때의 모양입니다.
// PreviewResponse(그 엔드포인트 자체의 응답)와는 필드가 달라서 별도 타입으로 둡니다.
export interface AnswerDraftSummary {
  answer_id: string
  question_id: string
  question_version: number
  labels: string[]
  recognition_ids: string[] | null
  answer: string
  version: number
  status: 'DRAFT' | 'CONFIRMED' | 'INVALIDATED'
  created_at: string
  updated_at: string
}

// POST /sign이 저장하는 인식 기록(Recognition)입니다. SignResponse(그 호출 자체의 응답)와는
// 필드가 달라서(둘러싼 question_id/intents/candidates 등이 없고 단일 레코드) 별도 타입입니다.
export interface RecognitionSummary {
  recognition_id: string
  question_id: string
  question_version: number
  label: string | null
  confidence: number | null
  accepted: boolean
  reason: 'LOW_CONFIDENCE' | 'INSUFFICIENT_LANDMARKS' | null
  model_version: string | null
  request_id: string | null
  recognized_at: string
}

export interface SessionDetailResponse {
  session_id: string
  status: 'ACTIVE' | 'CLOSED'
  created_at: string
  current_question: PendingQuestionSummary | null
  question_version: number | null
  conversations: Conversation[]
  // 환자(patient_token)로 조회할 때만 내려옵니다. 의료진 응답에는 없음(역할별 공개 범위).
  drafts?: AnswerDraftSummary[]
  recognitions?: RecognitionSummary[]
}

export interface SummaryResponse {
  summary: string
  conversation_count: number
  generated_at: string
}

export interface ApiErrorBody {
  code: string
  message: string
  timestamp: string
}
