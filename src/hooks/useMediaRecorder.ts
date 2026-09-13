import { useRef, useState } from 'react'

// 마이크(질문 녹음)와 카메라(수어 촬영) 둘 다에서 쓰는 녹화 훅입니다.
// start()가 getUserMedia로 스트림을 얻고 MediaRecorder로 녹화를 시작하고,
// stop()이 녹화를 마치고 Blob으로 모아서 돌려줍니다.
export function useMediaRecorder() {
  const [stream, setStream] = useState<MediaStream | null>(null)
  const [error, setError] = useState<string | null>(null)
  const recorderRef = useRef<MediaRecorder | null>(null)
  const chunksRef = useRef<Blob[]>([])

  const start = async (constraints: MediaStreamConstraints) => {
    setError(null)
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia(constraints)
      chunksRef.current = []
      const recorder = new MediaRecorder(mediaStream)
      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data)
      }
      recorderRef.current = recorder
      recorder.start()
      setStream(mediaStream)
      return true
    } catch {
      setError('카메라/마이크 권한이 필요해요. 브라우저 설정에서 허용해주세요.')
      return false
    }
  }

  const stop = (): Promise<Blob> =>
    new Promise((resolve) => {
      const recorder = recorderRef.current
      if (!recorder || recorder.state === 'inactive') {
        resolve(new Blob())
        return
      }
      recorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: recorder.mimeType })
        recorder.stream.getTracks().forEach((track) => track.stop())
        setStream(null)
        resolve(blob)
      }
      recorder.stop()
    })

  return { stream, start, stop, error }
}
