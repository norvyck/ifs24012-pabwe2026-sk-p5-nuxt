import { apiFetch } from '~/helpers/apiHelper'
import type {
  CashFlow,
  CashFlowPayload,
  CashFlowQueryParams,
  CashFlowSeries,
  CashFlowStats,
} from '~/features/cashflows/types'

function buildQuery(params: CashFlowQueryParams = {}): string {
  const query = new URLSearchParams()
  for (const [key, value] of Object.entries(params)) {
    if (value) query.set(key, value)
  }
  const serialized = query.toString()
  return serialized ? `?${serialized}` : ''
}

export const cashFlowApi = {
  async getAll(params: CashFlowQueryParams = {}): Promise<{ cashFlows: CashFlow[]; stats: CashFlowStats }> {
    const response = await apiFetch<{ cash_flows: CashFlow[]; stats: CashFlowStats }>(
      `/cash-flows${buildQuery(params)}`,
    )
    return { cashFlows: response.cash_flows, stats: response.stats }
  },
  async getById(id: number | string): Promise<CashFlow> {
    const response = await apiFetch<{ cash_flow: CashFlow }>(`/cash-flows/${encodeURIComponent(id)}`)
    return response.cash_flow
  },
  async create(payload: CashFlowPayload): Promise<{ cash_flow_id: number }> {
    return apiFetch('/cash-flows', { method: 'POST', body: payload })
  },
  async update(id: number | string, payload: CashFlowPayload): Promise<void> {
    await apiFetch(`/cash-flows/${encodeURIComponent(id)}`, { method: 'PUT', body: payload })
  },
  async remove(id: number | string): Promise<void> {
    await apiFetch(`/cash-flows/${encodeURIComponent(id)}`, { method: 'DELETE' })
  },
  async removeAll(): Promise<void> {
    await apiFetch('/cash-flows', { method: 'DELETE' })
  },
  async getLabels(): Promise<string[]> {
    const response = await apiFetch<{ labels: string[] }>('/cash-flows/labels')
    return response.labels
  },
  async getDailyStats(endDate?: string, totalData?: number): Promise<CashFlowSeries> {
    const query = new URLSearchParams()
    if (endDate) query.set('end_date', endDate)
    if (totalData) query.set('total_data', String(totalData))
    const suffix = query.size ? `?${query.toString()}` : ''
    return apiFetch(`/cash-flows/stats/daily${suffix}`)
  },
  async getMonthlyStats(endDate?: string, totalData?: number): Promise<CashFlowSeries> {
    const query = new URLSearchParams()
    if (endDate) query.set('end_date', endDate)
    if (totalData) query.set('total_data', String(totalData))
    const suffix = query.size ? `?${query.toString()}` : ''
    return apiFetch(`/cash-flows/stats/monthly${suffix}`)
  },
}
