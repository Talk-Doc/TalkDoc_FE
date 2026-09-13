// 백엔드가 내려주는 ISO 타임스탬프(question.asked_at)를 디자인의 "오전 09:42" 형식으로 바꿉니다.
export function formatQuestionTime(iso: string): string {
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return ''
  const hours24 = date.getHours()
  const period = hours24 < 12 ? '오전' : '오후'
  const hours12 = hours24 % 12 === 0 ? 12 : hours24 % 12
  const hh = String(hours12).padStart(2, '0')
  const mm = String(date.getMinutes()).padStart(2, '0')
  return `${period} ${hh}:${mm}`
}
