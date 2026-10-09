import { describe, expect, it, vi } from 'vitest'
import { formatDate, formatDateTime, formatLabel, formatRupiah, normalizePhotoUrl } from './toolsHelper'
import Swal from 'sweetalert2'

vi.mock('sweetalert2', () => ({ default: { fire: vi.fn() } }))

describe('toolsHelper', () => {
  it('formats Indonesian rupiah and rejects invalid amounts', () => {
    expect(formatRupiah(125000)).toBe('Rp 125.000')
    expect(formatRupiah(0)).toBe('Rp 0')
    expect(formatRupiah(-1250)).toBe('-Rp 1.250')
    expect(() => formatRupiah(Number.NaN)).toThrow(TypeError)
    expect(() => formatRupiah(Number.POSITIVE_INFINITY)).toThrow(TypeError)
  })

  it('formats dates and throws for invalid dates', () => {
    expect(formatDate('2024-10-05T00:00:00.000Z', { timeZone: 'UTC' })).toContain('2024')
    expect(formatDate('2024-10-05T00:00:00.000Z')).toContain('2024')
    expect(formatDate(new Date('2024-10-05T00:00:00Z'))).toContain('2024')
    expect(formatDateTime(new Date('2024-10-05T12:30:00Z'))).toContain('2024')
    expect(formatDateTime('2024-10-05T12:30:00Z')).toContain('2024')
    expect(() => formatDate('invalid')).toThrow(RangeError)
    expect(() => formatDateTime('invalid')).toThrow(RangeError)
  })

  it('humanizes category labels', () => {
    expect(formatLabel('alat-elektronik')).toBe('Alat Elektronik')
    expect(formatLabel('alat_mandi umum')).toBe('Alat Mandi Umum')
    expect(formatLabel('  ')).toBe('')
  })

  it('normalizes local API photo paths and preserves absolute URLs', () => {
    expect(normalizePhotoUrl(null)).toBeUndefined()
    expect(normalizePhotoUrl('')).toBeUndefined()
    expect(normalizePhotoUrl('http://127.0.0.1:8000/img/user.png')).toBe('https://open-api.delcom.org/img/user.png')
    expect(normalizePhotoUrl('http://localhost:8000/img/user.png')).toBe('https://open-api.delcom.org/img/user.png')
    expect(normalizePhotoUrl('https://127.0.0.1/img/user.png')).toBe('https://open-api.delcom.org/img/user.png')
    expect(normalizePhotoUrl('https://cdn.example.com/photo.png')).toBe('https://cdn.example.com/photo.png')
    expect(normalizePhotoUrl('/img/user.png')).toBe('https://open-api.delcom.org/img/user.png')
    expect(normalizePhotoUrl('img/user.png')).toBe('https://open-api.delcom.org/img/user.png')
    expect(normalizePhotoUrl('./img/user.png')).toBe('https://open-api.delcom.org/img/user.png')
  })

  it('shows success and error dialogs with clear feedback', async () => {
    vi.mocked(Swal.fire).mockResolvedValue({} as never)
    const { showErrorDialog, showSuccessDialog } = await import('./toolsHelper')
    await showSuccessDialog('Tersimpan', 'Data sukses diperbarui')
    expect(Swal.fire).toHaveBeenLastCalledWith({
      title: 'Tersimpan', text: 'Data sukses diperbarui', icon: 'success', confirmButtonColor: '#4969f5',
    })
    await showSuccessDialog('Tersimpan')
    expect(Swal.fire).toHaveBeenLastCalledWith({
      title: 'Tersimpan', text: undefined, icon: 'success', confirmButtonColor: '#4969f5',
    })
    await showErrorDialog('Gagal', 'Coba lagi')
    expect(Swal.fire).toHaveBeenLastCalledWith({
      title: 'Gagal', text: 'Coba lagi', icon: 'error', confirmButtonColor: '#4969f5',
    })
    await showErrorDialog('Gagal')
    expect(Swal.fire).toHaveBeenLastCalledWith({
      title: 'Gagal', text: undefined, icon: 'error', confirmButtonColor: '#4969f5',
    })
  })

  it('returns the result of the destructive-action confirmation dialog', async () => {
    vi.mocked(Swal.fire).mockResolvedValue({ isConfirmed: true } as never)
    const { showConfirmDialog } = await import('./toolsHelper')
    await expect(showConfirmDialog('Hapus semua?', 'Tidak dapat dibatalkan')).resolves.toBe(true)
    expect(Swal.fire).toHaveBeenLastCalledWith(expect.objectContaining({
      title: 'Hapus semua?',
      text: 'Tidak dapat dibatalkan',
      icon: 'warning',
      showCancelButton: true,
    }))
    vi.mocked(Swal.fire).mockResolvedValue({ isConfirmed: false } as never)
    await expect(showConfirmDialog('Hapus?')).resolves.toBe(false)
  })
})
