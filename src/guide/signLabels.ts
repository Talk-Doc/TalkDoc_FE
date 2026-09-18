const DISPLAY_LABELS: Record<string, string> = {
  아프다: '아파요',
}

export const SUPPORTED_SIGN_LABELS = [
  '감기',
  '다리',
  '답답하다',
  '당뇨병',
  '머리',
  '목',
  '배',
  '붓다',
  '설사',
  '숨차다',
  '아프다',
  '약',
  '어지럽다',
  '임신',
  '팔',
] as const

// 모델과 API에는 학습 클래스명(예: "아프다")을 그대로 유지하고,
// 환자에게 보이는 문구만 자연스러운 존댓말로 바꿉니다.
export function getSignDisplayLabel(label: string) {
  return DISPLAY_LABELS[label] ?? label
}
