// 백엔드 TTS 응답(Blob)을 재생합니다. 재생이 끝나거나 실패하면 만든 object URL을 정리합니다.
export function playAudioBlob(blob: Blob): Promise<void> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(blob)
    const audio = new Audio(url)
    const cleanup = () => URL.revokeObjectURL(url)
    audio.onended = () => {
      cleanup()
      resolve()
    }
    audio.onerror = () => {
      cleanup()
      reject(new Error('오디오를 재생할 수 없어요.'))
    }
    audio.play().catch((err) => {
      cleanup()
      reject(err)
    })
  })
}
