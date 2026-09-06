// 백엔드 호출 공통 모듈.
// - 토큰을 Authorization: Bearer 헤더에 실어 보냅니다 (백엔드 SessionAuthInterceptor 규칙).
// - 백엔드 에러 응답({code, message, timestamp})을 ApiError로 바꿔 던집니다.

const rawBase = (import.meta.env.VITE_API_BASE_URL as string | undefined) ?? ''
export const API_BASE = rawBase.replace(/\/+$/, '')

export class ApiError extends Error {
  readonly status: number
  readonly code: string

  constructor(status: number, code: string, message: string) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.code = code
  }
}

interface RequestOptions {
  method?: 'GET' | 'POST' | 'PATCH' | 'DELETE'
  token?: string
  json?: unknown
  form?: FormData
  signal?: AbortSignal
}

async function send(path: string, opts: RequestOptions): Promise<Response> {
  const headers: Record<string, string> = {}
  if (opts.token) headers.Authorization = `Bearer ${opts.token}`

  let body: BodyInit | undefined
  if (opts.form) {
    body = opts.form
  } else if (opts.json !== undefined) {
    headers['Content-Type'] = 'application/json'
    body = JSON.stringify(opts.json)
  }

  let res: Response
  try {
    res = await fetch(`${API_BASE}${path}`, {
      method: opts.method ?? 'GET',
      headers,
      body,
      signal: opts.signal,
    })
  } catch (e) {
    if (e instanceof DOMException && e.name === 'AbortError') throw e
    throw new ApiError(0, 'NETWORK_ERROR', '서버에 연결할 수 없어요. 백엔드가 실행 중인지 확인해주세요.')
  }

  if (!res.ok) throw await toApiError(res)
  return res
}

export async function request<T>(path: string, opts: RequestOptions = {}): Promise<T> {
  const res = await send(path, opts)
  if (res.status === 204) return undefined as T
  return (await res.json()) as T
}

export async function requestBlob(path: string, opts: RequestOptions = {}): Promise<Blob> {
  const res = await send(path, opts)
  return res.blob()
}

async function toApiError(res: Response): Promise<ApiError> {
  try {
    const body = (await res.json()) as { code?: string; message?: string }
    return new ApiError(res.status, body.code ?? 'UNKNOWN', body.message ?? res.statusText)
  } catch {
    return new ApiError(res.status, 'UNKNOWN', `요청에 실패했어요 (HTTP ${res.status})`)
  }
}

/** WebSocket 주소. API_BASE가 비어 있으면 현재 페이지 origin을 씁니다(vite 프록시). */
export function wsUrl(path: string): string {
  if (API_BASE) {
    const u = new URL(API_BASE)
    const proto = u.protocol === 'https:' ? 'wss:' : 'ws:'
    return `${proto}//${u.host}${path}`
  }
  const proto = window.location.protocol === 'https:' ? 'wss:' : 'ws:'
  return `${proto}//${window.location.host}${path}`
}

/** 화면에 보여줄 에러 문구를 뽑아냅니다. */
export function errorMessage(e: unknown): string {
  if (e instanceof ApiError) return e.message
  if (e instanceof Error) return e.message
  return '알 수 없는 오류가 발생했어요.'
}
