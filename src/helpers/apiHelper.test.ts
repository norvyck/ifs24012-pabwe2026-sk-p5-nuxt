import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { apiFetch, ApiError, clearAccessToken, getAccessToken, getErrorMessage, putAccessToken } from './apiHelper'

describe('apiHelper', () => {
  beforeEach(() => {
    localStorage.clear()
    vi.stubGlobal('fetch', vi.fn())
    vi.stubGlobal('useRuntimeConfig', () => ({ public: { delcomBaseUrl: 'https://api.example.test/api/v1/' } }))
  })
  afterEach(() => { vi.unstubAllGlobals() })

  it('reads, stores, clears, and validates an access token', () => {
    expect(getAccessToken()).toBeNull()
    putAccessToken('token')
    expect(getAccessToken()).toBe('token')
    clearAccessToken()
    expect(getAccessToken()).toBeNull()
    expect(() => putAccessToken(' ')).toThrow('Access token tidak boleh kosong.')
  })

  it('supports environments without local storage', async () => {
    vi.stubGlobal('localStorage', undefined)
    expect(getAccessToken()).toBeNull()
    expect(() => putAccessToken('token')).not.toThrow()
    expect(() => clearAccessToken()).not.toThrow()
    vi.stubGlobal('localStorage', window.localStorage)
  })

  it('normalizes paths and sends JSON with a bearer token', async () => {
    putAccessToken('secret')
    vi.mocked(fetch).mockResolvedValue(new Response(JSON.stringify({ status: 'success', message: 'ok', data: { id: 2 } }), { status: 200 }))
    await expect(apiFetch<{ id: number }>('users/me', { method: 'PUT', body: { name: 'Ada' } })).resolves.toEqual({ id: 2 })
    expect(fetch).toHaveBeenCalledWith('https://api.example.test/api/v1/users/me', expect.objectContaining({
      method: 'PUT',
      body: '{"name":"Ada"}',
      headers: expect.any(Headers),
    }))
    const headers = vi.mocked(fetch).mock.calls[0]?.[1]?.headers as Headers
    expect(headers.get('Authorization')).toBe('Bearer secret')
    expect(headers.get('Content-Type')).toBe('application/json')
  })

  it('does not send authorization for public requests', async () => {
    vi.mocked(fetch).mockResolvedValue(new Response(JSON.stringify({ status: 'success', message: 'ok' }), { status: 200 }))
    await apiFetch('/auth/login', { method: 'POST', token: null, body: { email: 'ada@example.com' } })
    const headers = vi.mocked(fetch).mock.calls[0]?.[1]?.headers as Headers
    expect(headers.has('Authorization')).toBe(false)
  })

  it('supports explicit access tokens and caller-provided headers', async () => {
    vi.mocked(fetch).mockResolvedValue(new Response(JSON.stringify({ status: 'success', message: 'ok' }), { status: 200 }))
    await apiFetch('/users', { token: 'temporary', headers: { 'X-Request-Id': 'flow-1' } })
    const headers = vi.mocked(fetch).mock.calls[0]?.[1]?.headers as Headers
    expect(headers.get('Authorization')?.startsWith('Bearer ')).toBe(true)
    expect(headers.get('X-Request-Id')).toBe('flow-1')
    vi.mocked(fetch).mockResolvedValueOnce(new Response(JSON.stringify({ status: 'success', message: 'ok' }), { status: 200 }))
    await apiFetch('/users', { token: '' })
    expect((vi.mocked(fetch).mock.calls[1]?.[1]?.headers as Headers).has('Authorization')).toBe(false)
  })

  it('sends form data without forcing a JSON content type', async () => {
    const formData = new FormData()
    formData.append('photo', new Blob(['photo'], { type: 'image/png' }), 'photo.png')
    vi.mocked(fetch).mockResolvedValue(new Response(JSON.stringify({ status: 'success', message: 'ok', data: {} }), { status: 200 }))
    await apiFetch('/users/me/photo', { method: 'POST', body: formData })
    const headers = vi.mocked(fetch).mock.calls[0]?.[1]?.headers as Headers
    expect(headers.has('Content-Type')).toBe(false)
    expect(vi.mocked(fetch).mock.calls[0]?.[1]?.body).toBe(formData)
  })

  it('throws descriptive errors for HTTP, API, malformed, network, and configuration failures', async () => {
    vi.mocked(fetch).mockResolvedValue(new Response(JSON.stringify({ status: 'fail', message: 'Invalid input', data: { field: ['Invalid'] } }), { status: 422 }))
    await expect(apiFetch('/users')).rejects.toMatchObject({ name: 'ApiError', statusCode: 422, fields: { field: ['Invalid'] } })
    vi.mocked(fetch).mockResolvedValue(new Response(JSON.stringify({ status: 'fail', message: 'Invalid email', data: { field: { email: ['Required'] } } }), { status: 422 }))
    await expect(apiFetch('/users')).rejects.toMatchObject({ fields: { email: ['Required'] } })
    vi.mocked(fetch).mockResolvedValue(new Response(JSON.stringify({ status: 'fail', message: 'Invalid input' }), { status: 400 }))
    await expect(apiFetch('/users')).rejects.toMatchObject({ statusCode: 400, fields: {} })

    vi.mocked(fetch).mockResolvedValue(new Response('server error', { status: 500 }))
    await expect(apiFetch('/users')).rejects.toThrow('Permintaan gagal (500).')

    vi.mocked(fetch).mockResolvedValue(new Response('not JSON', { status: 500 }))
    await expect(apiFetch('/users')).rejects.toThrow('Permintaan gagal (500).')
    vi.mocked(fetch).mockResolvedValue(new Response(JSON.stringify({ status: 'unexpected', message: 'bad' }), { status: 200 }))
    await expect(apiFetch('/users')).rejects.toThrow('Respons dari Delcom API tidak valid.')

    vi.mocked(fetch).mockRejectedValue(new TypeError('offline'))
    await expect(apiFetch('/users')).rejects.toThrow('Tidak dapat menghubungi Delcom API: offline')
    vi.mocked(fetch).mockRejectedValue('offline')
    await expect(apiFetch('/users')).rejects.toThrow('Tidak dapat menghubungi Delcom API: Koneksi ke server gagal.')

    expect(getErrorMessage(new Error('oops'))).toBe('oops')
    expect(getErrorMessage(new ApiError('Data tidak valid', 422, { field: ['Kategori tidak dikenal.', 'Pilih kategori yang tersedia.'] })))
      .toBe('Data tidak valid: Kategori tidak dikenal. Pilih kategori yang tersedia.')
    expect(getErrorMessage(new ApiError('Data tidak valid', 422, { field: ['Data tidak valid'] }))).toBe('Data tidak valid')
    expect(getErrorMessage(null)).toBe('Terjadi kesalahan yang tidak diketahui.')
    expect(new ApiError('bad')).toMatchObject({ statusCode: 0, fields: {} })
  })

  it('reports missing API configuration instead of falling back to a fake URL', async () => {
    vi.stubGlobal('useRuntimeConfig', () => ({ public: { delcomBaseUrl: '  ' } }))
    await expect(apiFetch('/users')).rejects.toThrow('URL API Delcom belum dikonfigurasi.')
    vi.stubGlobal('useRuntimeConfig', () => ({ public: { delcomBaseUrl: undefined } }))
    await expect(apiFetch('/users')).rejects.toThrow('URL API Delcom belum dikonfigurasi.')
  })
})
