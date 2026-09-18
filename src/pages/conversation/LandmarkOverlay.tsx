import { useEffect, useRef, useState, type RefObject } from 'react'
import type {
  DrawingUtils,
  HolisticLandmarker,
  HolisticLandmarkerResult,
} from '@mediapipe/tasks-vision'

const MEDIAPIPE_WASM_ROOT =
  'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@1.0.1/wasm'
const HOLISTIC_MODEL_URL =
  'https://storage.googleapis.com/mediapipe-models/holistic_landmarker/holistic_landmarker/float16/1/holistic_landmarker.task'
const DETECTION_INTERVAL_MS = 80

type OverlayStatus = 'loading' | 'ready' | 'error'

interface DetectionState {
  pose: boolean
  leftHand: boolean
  rightHand: boolean
}

const EMPTY_DETECTION: DetectionState = {
  pose: false,
  leftHand: false,
  rightHand: false,
}

function drawResult(
  canvas: HTMLCanvasElement,
  video: HTMLVideoElement,
  result: HolisticLandmarkerResult,
  drawing: DrawingUtils,
  poseConnections: Parameters<DrawingUtils['drawConnectors']>[1],
  handConnections: Parameters<DrawingUtils['drawConnectors']>[1],
) {
  if (canvas.width !== video.videoWidth || canvas.height !== video.videoHeight) {
    canvas.width = video.videoWidth
    canvas.height = video.videoHeight
  }

  const context = canvas.getContext('2d')
  if (!context) return
  context.clearRect(0, 0, canvas.width, canvas.height)

  const pose = result.poseLandmarks[0]
  const leftHand = result.leftHandLandmarks[0]
  const rightHand = result.rightHandLandmarks[0]

  if (pose) {
    drawing.drawConnectors(pose, poseConnections, {
      color: '#5eead4',
      lineWidth: 3,
    })
    drawing.drawLandmarks(pose, {
      color: '#0f766e',
      fillColor: '#ccfbf1',
      lineWidth: 1.5,
      radius: 3,
    })
  }

  if (leftHand) {
    drawing.drawConnectors(leftHand, handConnections, {
      color: '#c4b5fd',
      lineWidth: 3,
    })
    drawing.drawLandmarks(leftHand, {
      color: '#6d28d9',
      fillColor: '#ede9fe',
      lineWidth: 1.5,
      radius: 3,
    })
  }

  if (rightHand) {
    drawing.drawConnectors(rightHand, handConnections, {
      color: '#fcd34d',
      lineWidth: 3,
    })
    drawing.drawLandmarks(rightHand, {
      color: '#b45309',
      fillColor: '#fef3c7',
      lineWidth: 1.5,
      radius: 3,
    })
  }
}

export default function LandmarkOverlay({
  videoRef,
  enabled,
}: {
  videoRef: RefObject<HTMLVideoElement | null>
  enabled: boolean
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [status, setStatus] = useState<OverlayStatus>('loading')
  const [detection, setDetection] = useState<DetectionState>(EMPTY_DETECTION)

  useEffect(() => {
    if (!enabled) return

    let disposed = false
    let animationFrame = 0
    let landmarker: HolisticLandmarker | null = null
    let lastDetectionAt = 0
    let lastVideoTime = -1
    const videoElement = videoRef.current
    const canvasElement = canvasRef.current

    const run = async () => {
      setStatus('loading')
      try {
        const { DrawingUtils, FilesetResolver, HolisticLandmarker } = await import(
          '@mediapipe/tasks-vision'
        )
        const vision = await FilesetResolver.forVisionTasks(MEDIAPIPE_WASM_ROOT)
        const createdLandmarker = await HolisticLandmarker.createFromOptions(vision, {
          baseOptions: {
            modelAssetPath: HOLISTIC_MODEL_URL,
            delegate: 'CPU',
          },
          runningMode: 'VIDEO',
          minPoseDetectionConfidence: 0.5,
          minPosePresenceConfidence: 0.5,
          minHandLandmarksConfidence: 0.5,
          outputFaceBlendshapes: false,
          outputPoseSegmentationMasks: false,
        })

        if (disposed) {
          createdLandmarker.close()
          return
        }
        landmarker = createdLandmarker
        const context = canvasElement?.getContext('2d')
        if (!context) throw new Error('랜드마크 캔버스를 초기화하지 못했습니다.')
        const drawing = new DrawingUtils(context)
        setStatus('ready')

        const detect = (now: number) => {
          if (disposed || !landmarker) return
          const video = videoElement
          const canvas = canvasElement

          if (
            video &&
            canvas &&
            video.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA &&
            video.videoWidth > 0 &&
            now - lastDetectionAt >= DETECTION_INTERVAL_MS &&
            video.currentTime !== lastVideoTime
          ) {
            lastDetectionAt = now
            lastVideoTime = video.currentTime
            try {
              const result = landmarker.detectForVideo(video, now)
              drawResult(
                canvas,
                video,
                result,
                drawing,
                HolisticLandmarker.POSE_CONNECTIONS,
                HolisticLandmarker.HAND_CONNECTIONS,
              )
              const next = {
                pose: result.poseLandmarks.length > 0,
                leftHand: result.leftHandLandmarks.length > 0,
                rightHand: result.rightHandLandmarks.length > 0,
              }
              setDetection((previous) =>
                previous.pose === next.pose &&
                previous.leftHand === next.leftHand &&
                previous.rightHand === next.rightHand
                  ? previous
                  : next,
              )
            } catch {
              setStatus('error')
              canvas.getContext('2d')?.clearRect(0, 0, canvas.width, canvas.height)
              return
            }
          }
          animationFrame = requestAnimationFrame(detect)
        }

        animationFrame = requestAnimationFrame(detect)
      } catch {
        if (!disposed) setStatus('error')
      }
    }

    void run()

    return () => {
      disposed = true
      cancelAnimationFrame(animationFrame)
      landmarker?.close()
      const canvas = canvasElement
      canvas?.getContext('2d')?.clearRect(0, 0, canvas.width, canvas.height)
    }
  }, [enabled, videoRef])

  if (!enabled) return null

  return (
    <>
      <canvas
        ref={canvasRef}
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-[5] h-full w-full object-cover -scale-x-100"
      />
      <div className="pointer-events-none absolute left-3 top-3 z-10 flex flex-wrap gap-1.5">
        {status === 'loading' && (
          <span className="rounded-full bg-black/55 px-2.5 py-1 text-[10px] font-semibold text-white backdrop-blur-sm">
            랜드마크 준비 중
          </span>
        )}
        {status === 'error' && (
          <span className="rounded-full bg-black/55 px-2.5 py-1 text-[10px] font-semibold text-white backdrop-blur-sm">
            랜드마크 표시 불가
          </span>
        )}
        {status === 'ready' &&
          [
            ['상체', detection.pose],
            ['왼손', detection.leftHand],
            ['오른손', detection.rightHand],
          ].map(([label, detected]) => (
            <span
              key={label as string}
              className={`rounded-full px-2 py-1 text-[9px] font-bold backdrop-blur-sm ${
                detected ? 'bg-teal-500/85 text-white' : 'bg-black/50 text-white/60'
              }`}
            >
              {label as string}
            </span>
          ))}
      </div>
    </>
  )
}
