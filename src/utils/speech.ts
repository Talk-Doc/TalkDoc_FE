// 브라우저 내장 음성 합성(Web Speech API)으로 텍스트를 읽어줍니다.
// 지원하지 않는 환경(구형 브라우저 등)에서는 조용히 무시합니다.
export function speak(text: string) {
  if (!text || typeof window === 'undefined' || !window.speechSynthesis) return
  window.speechSynthesis.cancel()
  const utterance = new SpeechSynthesisUtterance(text)
  utterance.lang = 'ko-KR'
  window.speechSynthesis.speak(utterance)
}
