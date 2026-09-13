import type { ApiErrorBody } from './types'

// TalkDoc_BE 베이스 URL. .env(.local)에서 VITE_API_BASE_URL로 바꿀 수 있고,
// 지정 안 하면 로컬에서 기본 포트로 띄운 백엔드를 가리킵니다.
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8080'

// 백엔드의 통일된 에러 응답({code, message, timestamp})을 그대로 담아 던지는 에러입니다.
// 화면에서 code별로 다른 안내를 보여주고 싶을 때 err.code로 분기하면 됩니다.
export class ApiError extends Error {
  code: string
  status: number

  constructor(status: number, body: ApiErrorBody) {
    super(body.message)
    this.name = 'ApiError'
    this.code = body.code
    this.status = status
  }
}

async function handle<T>(res: Response): Promise<T> {
  if (!res.ok) {
    let body: ApiErrorBody
    try {
      body = await res.json()
    } catch {
      body = { code: 'UNKNOWN', message: `요청이 실패했어요. (HTTP ${res.status})`, timestamp: '' }
    }
    throw new ApiError(res.status, body)
  }
  if (res.status === 204) return undefined as T
  return res.json()
}

// 세션 생성처럼 토큰이 필요 없는 공개 엔드포인트용 JSON 요청.
export async function apiJson<T>(
  path: string,
  options: { method?: string; token?: string; body?: unknown } = {},
): Promise<T> {
  const res = await fetch(`${API_BASE_URL}${path}`, {
    method: options.method ?? 'GET',
    headers: {
      'Content-Type': 'application/json',
      ...(options.token ? { Authorization: `Bearer ${options.token}` } : {}),
    },
    body: options.body !== undefined ? JSON.stringify(options.body) : undefined,
  })
  return handle<T>(res)
}

// 오디오/영상 업로드용 multipart/form-data 요청. Content-Type은 브라우저가
// boundary를 포함해 자동으로 설정하므로 직접 지정하지 않습니다.
export async function apiMultipart<T>(
  path: string,
  options: { method?: string; token?: string; formData: FormData },
): Promise<T> {
  const res = await fetch(`${API_BASE_URL}${path}`, {
    method: options.method ?? 'POST',
    headers: {
      ...(options.token ? { Authorization: `Bearer ${options.token}` } : {}),
    },
    body: options.formData,
  })
  return handle<T>(res)
}
