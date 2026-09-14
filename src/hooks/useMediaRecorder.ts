import { useEffect, useRef, useState } from 'react'

// 마이크(질문 녹음)와 카메라(수어 촬영) 둘 다에서 쓰는 녹화 훅입니다.
// startPreview()로 녹화 전에 미리 스트림만 켜서 화면에 보여줄 수 있고,
// start()는 (미리 켜둔 스트림이 있으면 그걸 재사용해서) MediaRecorder로 녹화를 시작하고,
// stop()이 녹화를 마치고 Blob으로 모아서 돌려줍니다.
// 미리보기 없이 바로 start()만 쓰는 경우(질문 녹음의 마이크)는 기존과 동일하게
// stop() 시점에 스트림도 함께 정리됩니다.
export function useMediaRecorder() {
  const [stream, setStream] = useState<MediaStream | null>(null)
  const [error, setError] = useState<string | null>(null)
  const recorderRef = useRef<MediaRecorder | null>(null)
  const chunksRef = useRef<Blob[]>([])
  const streamRef = useRef<MediaStream | null>(null)
  const previewOwnedRef = useRef(false)

  const startPreview = async (constraints: MediaStreamConstraints) => {
    setError(null)
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia(constraints)
      streamRef.current = mediaStream
      previewOwnedRef.current = true
      setStream(mediaStream)
      return true
    } catch {
      setError('카메라/마이크 권한이 필요해요. 브라우저 설정에서 허용해주세요.')
      return false
    }
  }

  const stopPreview = () => {
    streamRef.current?.getTracks().forEach((track) => track.stop())
    streamRef.current = null
    previewOwnedRef.current = false
    setStream(null)
  }

  const start = async (constraints: MediaStreamConstraints) => {
    setError(null)
    try {
      const mediaStream = streamRef.current ?? (await navigator.mediaDevices.getUserMedia(constraints))
      streamRef.current = mediaStream
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
        // 미리보기로 켜둔 스트림(카메라)은 그대로 두고, 이 호출로 임시로 얻은 스트림(마이크)만 정리합니다.
        if (!previewOwnedRef.current) {
          recorder.stream.getTracks().forEach((track) => track.stop())
          streamRef.current = null
          setStream(null)
        }
        resolve(blob)
      }
      recorder.stop()
    })

  useEffect(() => {
    return () => {
      streamRef.current?.getTracks().forEach((track) => track.stop())
    }
  }, [])

  return { stream, startPreview, stopPreview, start, stop, error }
}
