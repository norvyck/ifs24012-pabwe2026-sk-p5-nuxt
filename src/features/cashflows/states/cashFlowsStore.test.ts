import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { cashFlowApi } from '~/features/cashflows/api/cashFlowApi'
import type { CashFlow, CashFlowSeries, CashFlowStats } from '~/features/cashflows/types'
import { useCashFlowsStore } from './cashFlowsStore'

vi.mock('~/features/cashflows/api/cashFlowApi', () => ({
  cashFlowApi: {
    getAll: vi.fn(), getById: vi.fn(), getLabels: vi.fn(), getDailyStats: vi.fn(),
    getMonthlyStats: vi.fn(), create: vi.fn(), update: vi.fn(), remove: vi.fn(), removeAll: vi.fn(),
  },
}))

const flow: CashFlow = {
  id: 4, user_id: 9, type: 'inflow', source: 'cash', label: 'gaji', description: 'Bulanan',
  nominal: 1000, created_at: '2025-01-01T00:00:00Z', updated_at: '2025-01-01T00:00:00Z',
}
const stats: CashFlowStats = { cashflow: 1000, total_inflow: 1000, total_outflow: 0 }
const series: CashFlowSeries = { stats_inflow: {}, stats_outflow: {}, stats_cashflow: {} }

describe('useCashFlowsStore', () => {
  beforeEach(() => { setActivePinia(createPinia()); vi.resetAllMocks() })

  it('starts with empty financial state and loads filtered transactions', async () => {
    const store = useCashFlowsStore()
    expect(store.cashFlows).toEqual([])
    expect(store.cashFlow).toBeNull()
    expect(store.stats).toEqual({ cashflow: 0, total_inflow: 0, total_outflow: 0 })
    vi.mocked(cashFlowApi.getAll).mockResolvedValue({ cashFlows: [flow], stats })
    await store.fetchAll({ type: 'inflow' })
    expect(cashFlowApi.getAll).toHaveBeenCalledWith({ type: 'inflow' })
    expect(store.cashFlows).toEqual([flow])
    expect(store.stats).toEqual(stats)
    expect(store.isLoading).toBe(false)
  })

  it('resets list loading after a failed request', async () => {
    vi.mocked(cashFlowApi.getAll).mockRejectedValue(new Error('offline'))
    const store = useCashFlowsStore()
    await expect(store.fetchAll()).rejects.toThrow('offline')
    expect(store.isLoading).toBe(false)
  })

  it('fetches a transaction, labels, and both chart series', async () => {
    const store = useCashFlowsStore()
    vi.mocked(cashFlowApi.getById).mockResolvedValue(flow)
    expect(await store.fetchById(flow.id)).toEqual(flow)
    expect(store.cashFlow).toEqual(flow)
    vi.mocked(cashFlowApi.getLabels).mockResolvedValue(['gaji'])
    await store.fetchLabels()
    expect(store.labels).toEqual(['gaji'])
    vi.mocked(cashFlowApi.getDailyStats).mockResolvedValue(series)
    vi.mocked(cashFlowApi.getMonthlyStats).mockResolvedValue(series)
    await store.fetchDailyStats('2025-01-01', 7)
    await store.fetchMonthlyStats('2025-01-31', 12)
    expect(store.dailyStats).toEqual(series)
    expect(store.monthlyStats).toEqual(series)
  })

  it('creates a transaction, reloads the summary and resets the add flag on success or failure', async () => {
    vi.mocked(cashFlowApi.create).mockResolvedValue({ cash_flow_id: flow.id })
    vi.mocked(cashFlowApi.getAll).mockResolvedValue({ cashFlows: [flow], stats })
    const store = useCashFlowsStore()
    await expect(store.create({ type: 'inflow', source: 'cash', label: 'gaji', description: '', nominal: 1000 })).resolves.toBe(flow.id)
    expect(store.isCashFlowAdd).toBe(false)
    expect(store.isCashFlowAdded).toBe(true)
    vi.mocked(cashFlowApi.create).mockRejectedValue(new Error('offline'))
    await expect(store.create({ type: 'inflow', source: 'cash', label: 'gaji', description: '', nominal: 1000 })).rejects.toThrow('offline')
    expect(store.isCashFlowAdd).toBe(false)
    expect(store.isCashFlowAdded).toBe(false)
  })

  it('updates a transaction and refreshes its summary', async () => {
    vi.mocked(cashFlowApi.update).mockResolvedValue(undefined)
    vi.mocked(cashFlowApi.getAll).mockResolvedValue({ cashFlows: [flow], stats })
    const store = useCashFlowsStore()
    const payload = { type: 'inflow' as const, source: 'cash' as const, label: 'gaji', description: '', nominal: 1200 }
    await store.update(flow.id, payload)
    expect(store.isCashFlowChange).toBe(false)
    expect(store.isCashFlowChanged).toBe(true)
    vi.mocked(cashFlowApi.update).mockRejectedValue(new Error('offline'))
    await expect(store.update(flow.id, payload)).rejects.toThrow('offline')
    expect(store.isCashFlowChange).toBe(false)
    expect(store.isCashFlowChanged).toBe(false)
  })

  it('deletes one transaction and resets deletion state on errors', async () => {
    vi.mocked(cashFlowApi.remove).mockResolvedValue(undefined)
    vi.mocked(cashFlowApi.getAll).mockResolvedValue({ cashFlows: [], stats })
    const store = useCashFlowsStore()
    await store.remove(flow.id)
    expect(store.isCashFlowDelete).toBe(false)
    expect(store.isCashFlowDeleted).toBe(true)
    vi.mocked(cashFlowApi.remove).mockRejectedValue(new Error('offline'))
    await expect(store.remove(flow.id)).rejects.toThrow('offline')
    expect(store.isCashFlowDelete).toBe(false)
    expect(store.isCashFlowDeleted).toBe(false)
  })

  it('deletes the entire ledger and resets deletion state on errors', async () => {
    vi.mocked(cashFlowApi.removeAll).mockResolvedValue(undefined)
    vi.mocked(cashFlowApi.getAll).mockResolvedValue({ cashFlows: [], stats })
    const store = useCashFlowsStore()
    await store.removeAll()
    expect(store.isCashFlowDeleteAll).toBe(false)
    expect(store.isCashFlowDeletedAll).toBe(true)
    vi.mocked(cashFlowApi.removeAll).mockRejectedValue(new Error('offline'))
    await expect(store.removeAll()).rejects.toThrow('offline')
    expect(store.isCashFlowDeleteAll).toBe(false)
    expect(store.isCashFlowDeletedAll).toBe(false)
  })
})
