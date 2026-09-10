// 대화 진행 화면이 가질 수 있는 "상태" 목록입니다.
// Figma 최종 디자인의 흐름(마이크로 질문 -> 답변 방법 선택 -> 수어/텍스트/선택지 입력 ->
// AI 분석 -> 결과 확인 -> 의료진 전달)을 그대로 옮긴 것이라, 새 화면이 생기면 여기에 한 줄만 추가하면 됩니다.
export type ConversationStep =
  | 'question' // 마이크 대기 ~ 답변 방법 선택까지, QuestionAnswerStep 안에서 phase로 세분화
  | 'sign-camera' // 환자가 카메라로 수어 답변 입력 중 (준비 -> 촬영/인식)
  | 'analyzing' // AI가 수어를 분석 중 (로딩)
  | 'result-confirm' // 인식된 답변을 환자가 확인
  | 'recognition-failed' // 인식 실패
  | 'text-input' // 수어 대신 텍스트로 직접 입력
  | 'choice-select' // 제공된 선택지 중 골라서 답변
  | 'doctor-answer' // 의료진에게 최종 답변 표시(전달 완료)

// QuestionAnswerStep 내부에서 쓰는 세부 단계.
// mic-waiting: 의료진이 마이크 버튼을 눌러주길 기다림
// mic-recording: 의료진 음성을 녹음/수집 중 (STT 대상)
// method-select: 질문이 텍스트로 변환된 뒤, 환자가 답변 방법을 고르는 중
export type QuestionPhase = 'mic-waiting' | 'mic-recording' | 'method-select'

export interface QuestionRecord {
  id: string
  doctorQuestionText: string // STT + LLM으로 정리된 의료진 질문
  patientAnswerText: string | null // AI가 수어를 변환한 최종 문장
}
