import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/vue'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import TransactionModal from './TransactionModal.vue'

const { create, update, toast } = vi.hoisted(() => ({
  create: vi.fn(),
  update: vi.fn(),
  toast: { success: vi.fn(), error: vi.fn() },
}))

vi.mock('~/features/cashflows/states/cashFlowsStore', () => ({
  useCashFlowsStore: () => ({ create, update }),
}))

vi.mock('vue-sonner', () => ({ toast }))

describe('TransactionModal', () => {
  afterEach(cleanup)

  beforeEach(() => {
    vi.clearAllMocks()
    create.mockResolvedValue(1)
  })

  it('requires a description before sending a transaction to the API', async () => {
    render(TransactionModal, { props: { open: true } })

    await fireEvent.update(screen.getByLabelText('Kategori'), 'Kiriman')
    await fireEvent.update(screen.getByLabelText('Nominal (Rupiah)'), '140000')
    await fireEvent.click(screen.getByRole('button', { name: 'Simpan transaksi' }))

    expect(screen.getByText('Keterangan wajib diisi.')).toBeInTheDocument()
    expect(create).not.toHaveBeenCalled()
  })

  it('sends a complete transaction to the API', async () => {
    render(TransactionModal, { props: { open: true } })

    await fireEvent.update(screen.getByLabelText('Kategori'), 'Kiriman')
    await fireEvent.update(screen.getByLabelText('Nominal (Rupiah)'), '140000')
    await fireEvent.update(screen.getByLabelText('Keterangan'), 'Transfer dana')
    await fireEvent.click(screen.getByRole('button', { name: 'Simpan transaksi' }))

    await waitFor(() => expect(create).toHaveBeenCalledWith({
      type: 'outflow',
      source: 'cash',
      label: 'Kiriman',
      description: 'Transfer dana',
      nominal: 140000,
    }))
  })
})
