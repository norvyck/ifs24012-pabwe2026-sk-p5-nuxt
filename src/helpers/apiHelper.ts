export type ApiEnvelope<T> = {
  status: 'success' | 'fail'
  message: string
  data?: T
}

export class ApiError extends Error {
  readonly statusCode: number
  readonly fields: Record<string, string[]>

  constructor(message: string, statusCode = 0, fields: Record<string, string[]> = {}) {
    super(message)
    this.name = 'ApiError'
    this.statusCode = statusCode
    this.fields = fields
  }
}

const ACCESS_TOKEN_KEY = 'delcom_access_token'

export function getAccessToken(): string | null {
  if (typeof localStorage === 'undefined') return null
  return localStorage.getItem(ACCESS_TOKEN_KEY)
}

export function putAccessToken(token: string): void {
  if (!token.trim()) throw new Error('Access token tidak boleh kosong.')
  if (typeof localStorage === 'undefined') return
  localStorage.setItem(ACCESS_TOKEN_KEY, token)
}

export function clearAccessToken(): void {
  if (typeof localStorage === 'undefined') return
  localStorage.removeItem(ACCESS_TOKEN_KEY)
}

function getApiBaseUrl(): string {
  const config = useRuntimeConfig()
  const baseUrl = String(config.public.delcomBaseUrl ?? '').trim()
  if (!baseUrl) throw new ApiError('URL API Delcom belum dikonfigurasi.')
  return baseUrl.replace(/\/+$/, '')
}

export async function apiFetch<T>(
  path: string,
  options: {
    method?: 'GET' | 'POST' | 'PUT' | 'DELETE'
    body?: unknown
    token?: string | null
    headers?: HeadersInit
  } = {},
): Promise<T> {
  const token = options.token === undefined ? getAccessToken() : options.token
  const headers = new Headers(options.headers)
  headers.set('Accept', 'application/json')
  const baseUrl = getApiBaseUrl()

  if (token) headers.set('Authorization', `Bearer ${token}`)
  if (options.body !== undefined && !(options.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json')
  }

  let response: Response
  try {
    response = await fetch(`${baseUrl}${path.startsWith('/') ? path : `/${path}`}`, {
      method: options.method ?? 'GET',
      headers,
      body:
        options.body === undefined
          ? undefined
          : options.body instanceof FormData
            ? options.body
            : JSON.stringify(options.body),
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Koneksi ke server gagal.'
    throw new ApiError(`Tidak dapat menghubungi Delcom API: ${message}`)
  }

  const payload = (await response.json().catch(() => null)) as ApiEnvelope<T> | null
  if (!response.ok || payload?.status === 'fail') {
    const rawFields = payload?.data as { field?: string[] | Record<string, string[]> } | undefined
    const fieldErrors = rawFields?.field
    const fields = Array.isArray(fieldErrors)
      ? { field: fieldErrors }
      : fieldErrors && typeof fieldErrors === 'object'
        ? fieldErrors
        : {}
    throw new ApiError(payload?.message ?? `Permintaan gagal (${response.status}).`, response.status, fields)
  }

  if (!payload || payload.status !== 'success') {
    throw new ApiError('Respons dari Delcom API tidak valid.', response.status)
  }

  return payload.data as T
}

export function getErrorMessage(error: unknown): string {
  if (error instanceof ApiError) {
    const details = Object.values(error.fields)
      .flat()
      .filter((message) => message && message !== error.message)
    if (details.length) return `${error.message}: ${details.join(' ')}`
  }
  return error instanceof Error ? error.message : 'Terjadi kesalahan yang tidak diketahui.'
}
