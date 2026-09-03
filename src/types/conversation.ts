// 대화 진행 화면이 가질 수 있는 "상태" 목록입니다.
// 기획 문서의 흐름(의료진 질문 -> 환자 확인 -> 수어 입력 -> AI 분석 -> 결과 확인 -> 의료진 전달)을
// 그대로 옮긴 것이라, 새 화면이 생기면 여기에 한 줄만 추가하면 됩니다.
export type ConversationStep =
  | 'question' // 의료진 질문(녹음) ~ 환자 답변 방법 선택까지, 한 화면에서 진행
  | 'sign-camera' // 환자가 카메라로 수어 답변 입력 중
  | 'analyzing' // AI가 수어를 분석 중 (로딩)
  | 'result-confirm' // 인식된 답변을 환자가 확인
  | 'recognition-failed' // 인식 실패
  | 'text-input' // 수어 대신 텍스트로 직접 입력
  | 'doctor-answer' // 의료진에게 최종 답변 표시

export interface QuestionRecord {
  id: string
  doctorQuestionText: string // STT + LLM으로 정리된 의료진 질문
  patientAnswerText: string | null // AI가 수어를 변환한 최종 문장
}
