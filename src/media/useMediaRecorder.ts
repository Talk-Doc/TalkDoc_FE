import { useCallback, useEffect, useRef, useState } from 'react'

type Kind = 'audio' | 'video'

const MIME_CANDIDATES: Record<Kind, string[]> = {
  audio: ['audio/webm;codecs=opus', 'audio/webm', 'audio/mp4', 'audio/ogg'],
  video: ['video/webm;codecs=vp8,opus', 'video/webm', 'video/mp4'],
}

const CONSTRAINTS: Record<Kind, MediaStreamConstraints> = {
  audio: { audio: true },
  video: { video: { facingMode: 'user', width: { ideal: 640 }, height: { ideal: 480 } }, audio: false },
}

function pickMimeType(kind: Kind): string | undefined {
  return MIME_CANDIDATES[kind].find((t) => MediaRecorder.isTypeSupported(t))
}

function describeError(e: unknown, kind: Kind): string {
  const device = kind === 'audio' ? '마이크' : '카메라'
  if (e instanceof DOMException) {
    if (e.name === 'NotAllowedError') return `${device} 사용 권한이 없어요. 브라우저 설정에서 허용해주세요.`
    if (e.name === 'NotFoundError') return `사용할 수 있는 ${device}를 찾지 못했어요.`
    if (e.name === 'NotReadableError') return `${device}를 다른 앱이 사용 중이에요.`
  }
  return `${device}를 켤 수 없어요.`
}

/**
 * 브라우저 MediaRecorder를 감싼 훅. open() → start() → stop() 순서로 쓰고, 끝나면 release().
 * 녹음/녹화된 결과는 Blob(webm 또는 mp4)으로 돌려주며, 그대로 백엔드 multipart로 올립니다.
 */
export function useMediaRecorder(kind: Kind) {
  const [stream, setStream] = useState<MediaStream | null>(null)
  const [recording, setRecording] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const streamRef = useRef<MediaStream | null>(null)
  const recorderRef = useRef<MediaRecorder | null>(null)
  const chunksRef = useRef<Blob[]>([])

  const release = useCallback(() => {
    const rec = recorderRef.current
    if (rec && rec.state !== 'inactive') {
      try {
        rec.stop()
      } catch {
        // 이미 멈춘 경우
      }
    }
    recorderRef.current = null
    streamRef.current?.getTracks().forEach((t) => t.stop())
    streamRef.current = null
    setStream(null)
    setRecording(false)
  }, [])

  const open = useCallback(async (): Promise<MediaStream> => {
    if (streamRef.current) return streamRef.current
    if (typeof MediaRecorder === 'undefined' || !navigator.mediaDevices?.getUserMedia) {
      const msg = '이 브라우저는 녹음/녹화를 지원하지 않아요.'
      setError(msg)
      throw new Error(msg)
    }
    try {
      const s = await navigator.mediaDevices.getUserMedia(CONSTRAINTS[kind])
      streamRef.current = s
      setStream(s)
      setError(null)
      return s
    } catch (e) {
      const msg = describeError(e, kind)
      setError(msg)
      throw new Error(msg)
    }
  }, [kind])

  const start = useCallback(async () => {
    const s = streamRef.current ?? (await open())
    const mimeType = pickMimeType(kind)
    const rec = new MediaRecorder(s, mimeType ? { mimeType } : undefined)
    chunksRef.current = []
    rec.ondataavailable = (ev) => {
      if (ev.data && ev.data.size > 0) chunksRef.current.push(ev.data)
    }
    recorderRef.current = rec
    rec.start()
    setRecording(true)
  }, [kind, open])

  const stop = useCallback(
    () =>
      new Promise<Blob>((resolve, reject) => {
        const rec = recorderRef.current
        if (!rec || rec.state === 'inactive') {
          reject(new Error('녹화 중이 아니에요.'))
          return
        }
        rec.onstop = () => {
          const type = rec.mimeType || chunksRef.current[0]?.type || (kind === 'audio' ? 'audio/webm' : 'video/webm')
          setRecording(false)
          resolve(new Blob(chunksRef.current, { type }))
        }
        rec.stop()
      }),
    [kind],
  )

  useEffect(() => release, [release])

  return { stream, recording, error, open, start, stop, release }
}
