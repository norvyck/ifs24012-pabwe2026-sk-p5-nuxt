import Swal from 'sweetalert2'

export async function showSuccessDialog(title: string, text?: string): Promise<void> {
  await Swal.fire({ title, text, icon: 'success', confirmButtonColor: '#4969f5' })
}

export async function showErrorDialog(title: string, text?: string): Promise<void> {
  await Swal.fire({ title, text, icon: 'error', confirmButtonColor: '#4969f5' })
}

export async function showConfirmDialog(title: string, text?: string): Promise<boolean> {
  const result = await Swal.fire({
    title,
    text,
    icon: 'warning',
    showCancelButton: true,
    confirmButtonText: 'Ya, lanjutkan',
    cancelButtonText: 'Batal',
    confirmButtonColor: '#e5484d',
    cancelButtonColor: '#7b8494',
  })
  return result.isConfirmed
}

export function formatRupiah(value: number): string {
  if (!Number.isFinite(value)) throw new TypeError('Nilai rupiah harus berupa angka yang valid.')
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(value)
}

export function formatDate(value: string | Date, options?: Intl.DateTimeFormatOptions): string {
  const date = value instanceof Date ? value : new Date(value)
  if (Number.isNaN(date.getTime())) throw new RangeError('Tanggal yang diberikan tidak valid.')
  return new Intl.DateTimeFormat('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    ...options,
  }).format(date)
}

export function formatDateTime(value: string | Date): string {
  const date = value instanceof Date ? value : new Date(value)
  if (Number.isNaN(date.getTime())) throw new RangeError('Tanggal yang diberikan tidak valid.')
  return new Intl.DateTimeFormat('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date)
}

export function formatLabel(value: string): string {
  return value
    .replace(/[-_]+/g, ' ')
    .trim()
    .replace(/\b\w/g, (character) => character.toLocaleUpperCase('id-ID'))
}

export function normalizePhotoUrl(photo: string | null | undefined): string | undefined {
  if (!photo) return undefined
  if (/^https?:\/\/(127\.0\.0\.1|localhost)(:\d+)?\//i.test(photo)) {
    return photo.replace(/^https?:\/\/(127\.0\.0\.1|localhost)(:\d+)?/i, 'https://open-api.delcom.org')
  }
  if (photo.startsWith('/')) return `https://open-api.delcom.org${photo}`
  if (!/^https?:\/\//i.test(photo)) return `https://open-api.delcom.org/${photo.replace(/^\.?\//, '')}`
  return photo
}
