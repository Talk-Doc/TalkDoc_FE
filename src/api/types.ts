// 백엔드 응답/이벤트 타입. 백엔드 Jackson 설정이 snake_case라서 필드명도 그대로 맞춥니다.
// null 필드는 응답에서 아예 빠지므로(non_null) optional로 둡니다.

export type Role = 'DOCTOR' | 'PATIENT'
export type Intent = 'BODY_LOCATION' | 'SYMPTOM' | 'HISTORY_STATE' | 'OTHER'
export type SessionStatus = 'ACTIVE' | 'CLOSED'

export interface CreateSessionResponse {
  session_id: string
  doctor_token: string
  patient_token: string
  created_at: string
  patient_join_path: string
}

export interface PendingQuestion {
  question_id: string
  text: string
  intents: Intent[]
  candidates: string[]
  asked_at: string
}

export interface QuestionResponse extends PendingQuestion {
  intent: Intent
  supported: boolean
}

export interface RecognizedSign {
  label: string
  confidence: number
  accepted: boolean
}

export interface SignResponse {
  question_id?: string
  intents: Intent[]
  candidates: string[]
  signs: RecognizedSign[]
  all_accepted: boolean
  accepted_labels: string[]
}

export interface PreviewResponse {
  question_id: string
  labels: string[]
  answer: string
}

export interface Conversation {
  answer_id: string
  question_id: string
  question: string
  intents: Intent[]
  signs: string[]
  answer: string
  confirmed_at: string
}

export interface SessionDetailResponse {
  session_id: string
  status: SessionStatus
  created_at: string
  current_question?: PendingQuestion
  conversations: Conversation[]
}

export interface SummaryResponse {
  summary: string
  conversation_count: number
  generated_at: string
}

// WebSocket으로 내려오는 이벤트: {"type":..., "session_id":..., "payload":..., "timestamp":...}
export type SessionEvent =
  | { type: 'QUESTION_POSTED'; session_id: string; payload: PendingQuestion; timestamp: string }
  | { type: 'ANSWER_CONFIRMED'; session_id: string; payload: Conversation; timestamp: string }
  | { type: 'ANSWER_UPDATED'; session_id: string; payload: Conversation; timestamp: string }
  | { type: 'SESSION_CLOSED'; session_id: string; payload: { session_id: string }; timestamp: string }
  | { type: 'PEER_JOINED'; session_id: string; payload: { role: Role }; timestamp: string }
