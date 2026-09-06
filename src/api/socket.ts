import { useEffect, useRef, useState } from 'react'
import { wsUrl } from './client'
import type { SessionEvent } from './types'

const PING_INTERVAL_MS = 25_000

/**
 * 세션 WebSocket(/ws/sessions/{id}?token=...)에 붙어서 서버 이벤트를 받습니다.
 * 상태 변경은 전부 REST로 하고, 이 소켓은 "알림"만 받습니다(백엔드 SessionWebSocketHandler 규칙).
 * 반환값은 현재 연결 여부입니다.
 */
export function useSessionSocket(
  sessionId: string | null | undefined,
  token: string | null | undefined,
  onEvent: (event: SessionEvent) => void,
): boolean {
  const [connected, setConnected] = useState(false)
  const handlerRef = useRef(onEvent)

  useEffect(() => {
    handlerRef.current = onEvent
  }, [onEvent])

  useEffect(() => {
    if (!sessionId || !token) return

    const ws = new WebSocket(wsUrl(`/ws/sessions/${sessionId}?token=${encodeURIComponent(token)}`))

    ws.onopen = () => setConnected(true)
    ws.onclose = () => setConnected(false)
    ws.onmessage = (message) => {
      let data: unknown
      try {
        data = JSON.parse(String(message.data))
      } catch {
        return
      }
      if (data && typeof data === 'object' && 'type' in data && (data as { type: string }).type !== 'PONG') {
        handlerRef.current(data as SessionEvent)
      }
    }

    const ping = setInterval(() => {
      if (ws.readyState === WebSocket.OPEN) ws.send(JSON.stringify({ type: 'PING' }))
    }, PING_INTERVAL_MS)

    return () => {
      clearInterval(ping)
      ws.close()
    }
  }, [sessionId, token])

  return connected
}
