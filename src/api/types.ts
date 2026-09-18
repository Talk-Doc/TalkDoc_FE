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

export interface SessionDetailResponse {
  session_id: string
  status: 'ACTIVE' | 'CLOSED'
  created_at: string
  current_question?: QuestionResponse
  question_version: number | null
  conversations: Conversation[]
  // 환자(patient_token)로 조회할 때만 내려옵니다. 의료진 응답에는 없음(역할별 공개 범위).
  drafts?: PreviewResponse[]
  recognitions?: SignResponse[]
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
