import { beforeEach, describe, expect, it, vi } from 'vitest'
import { apiFetch } from '~/helpers/apiHelper'
import { cashFlowApi } from './cashFlowApi'

vi.mock('~/helpers/apiHelper', () => ({ apiFetch: vi.fn() }))

describe('cashFlowApi', () => {
  beforeEach(() => { vi.clearAllMocks(); vi.mocked(apiFetch).mockResolvedValue({}) })

  it('fetches a filtered list with the API response mapped to app types', async () => {
    await cashFlowApi.getAll()
    expect(apiFetch).toHaveBeenLastCalledWith('/cash-flows')
    vi.mocked(apiFetch).mockResolvedValue({ cash_flows: [{ id: 3 }], stats: { cashflow: 10 } })
    await expect(cashFlowApi.getAll({ type: 'outflow', source: 'cash', label: 'food', start_date: '', end_date: '2025-01-01 23:59:59' })).resolves.toEqual({ cashFlows: [{ id: 3 }], stats: { cashflow: 10 } })
    expect(apiFetch).toHaveBeenCalledWith('/cash-flows?type=outflow&source=cash&label=food&end_date=2025-01-01+23%3A59%3A59')
  })

  it('supports all cash-flow CRUD operations with encoded IDs', async () => {
    const payload = { type: 'inflow' as const, source: 'cash' as const, label: 'gaji', description: '', nominal: 100 }
    vi.mocked(apiFetch).mockResolvedValue({ cash_flow_id: 12 })
    await expect(cashFlowApi.create(payload)).resolves.toEqual({ cash_flow_id: 12 })
    expect(apiFetch).toHaveBeenCalledWith('/cash-flows', { method: 'POST', body: payload })
    await cashFlowApi.update('id 2', payload)
    expect(apiFetch).toHaveBeenCalledWith('/cash-flows/id%202', { method: 'PUT', body: payload })
    await cashFlowApi.remove(2)
    expect(apiFetch).toHaveBeenCalledWith('/cash-flows/2', { method: 'DELETE' })
    await cashFlowApi.removeAll()
    expect(apiFetch).toHaveBeenCalledWith('/cash-flows', { method: 'DELETE' })
    vi.mocked(apiFetch).mockResolvedValue({ cash_flow: { id: 12 } })
    await expect(cashFlowApi.getById(12)).resolves.toEqual({ id: 12 })
  })

  it('fetches labels and optional daily and monthly statistics', async () => {
    vi.mocked(apiFetch).mockResolvedValue({ labels: ['gaji'] })
    await expect(cashFlowApi.getLabels()).resolves.toEqual(['gaji'])
    await cashFlowApi.getDailyStats()
    expect(apiFetch).toHaveBeenLastCalledWith('/cash-flows/stats/daily')
    await cashFlowApi.getDailyStats('2025-01-01 23:59:59', 7)
    expect(apiFetch).toHaveBeenLastCalledWith('/cash-flows/stats/daily?end_date=2025-01-01+23%3A59%3A59&total_data=7')
    await cashFlowApi.getMonthlyStats()
    expect(apiFetch).toHaveBeenLastCalledWith('/cash-flows/stats/monthly')
    await cashFlowApi.getMonthlyStats('2025-01-31 23:59:59', 12)
    expect(apiFetch).toHaveBeenLastCalledWith('/cash-flows/stats/monthly?end_date=2025-01-31+23%3A59%3A59&total_data=12')
  })
})
