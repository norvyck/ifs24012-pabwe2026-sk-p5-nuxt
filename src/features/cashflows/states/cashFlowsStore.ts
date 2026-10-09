import { defineStore } from 'pinia'
import { cashFlowApi } from '~/features/cashflows/api/cashFlowApi'
import type {
  CashFlow,
  CashFlowPayload,
  CashFlowQueryParams,
  CashFlowSeries,
  CashFlowStats,
} from '~/features/cashflows/types'

function emptyStats(): CashFlowStats {
  return { cashflow: 0, total_inflow: 0, total_outflow: 0 }
}

export const useCashFlowsStore = defineStore('cashFlows', {
  state: () => ({
    cashFlows: [] as CashFlow[],
    cashFlow: null as CashFlow | null,
    stats: emptyStats(),
    labels: [] as string[],
    dailyStats: null as CashFlowSeries | null,
    monthlyStats: null as CashFlowSeries | null,
    isLoading: false,
    isCashFlowAdd: false,
    isCashFlowAdded: false,
    isCashFlowChange: false,
    isCashFlowChanged: false,
    isCashFlowDelete: false,
    isCashFlowDeleted: false,
    isCashFlowDeleteAll: false,
    isCashFlowDeletedAll: false,
  }),
  actions: {
    async fetchAll(params: CashFlowQueryParams = {}): Promise<void> {
      this.isLoading = true
      try {
        const result = await cashFlowApi.getAll(params)
        this.cashFlows = result.cashFlows
        this.stats = result.stats
      } finally {
        this.isLoading = false
      }
    },
    async fetchById(id: number | string): Promise<CashFlow> {
      this.cashFlow = await cashFlowApi.getById(id)
      return this.cashFlow
    },
    async fetchLabels(): Promise<void> {
      this.labels = await cashFlowApi.getLabels()
    },
    async fetchDailyStats(endDate?: string, totalData?: number): Promise<void> {
      this.dailyStats = await cashFlowApi.getDailyStats(endDate, totalData)
    },
    async fetchMonthlyStats(endDate?: string, totalData?: number): Promise<void> {
      this.monthlyStats = await cashFlowApi.getMonthlyStats(endDate, totalData)
    },
    async create(payload: CashFlowPayload): Promise<number> {
      this.isCashFlowAdd = true
      this.isCashFlowAdded = false
      try {
        const result = await cashFlowApi.create(payload)
        this.isCashFlowAdded = true
        await this.fetchAll()
        return result.cash_flow_id
      } finally {
        this.isCashFlowAdd = false
      }
    },
    async update(id: number | string, payload: CashFlowPayload): Promise<void> {
      this.isCashFlowChange = true
      this.isCashFlowChanged = false
      try {
        await cashFlowApi.update(id, payload)
        this.isCashFlowChanged = true
        await this.fetchAll()
      } finally {
        this.isCashFlowChange = false
      }
    },
    async remove(id: number | string): Promise<void> {
      this.isCashFlowDelete = true
      this.isCashFlowDeleted = false
      try {
        await cashFlowApi.remove(id)
        this.isCashFlowDeleted = true
        await this.fetchAll()
      } finally {
        this.isCashFlowDelete = false
      }
    },
    async removeAll(): Promise<void> {
      this.isCashFlowDeleteAll = true
      this.isCashFlowDeletedAll = false
      try {
        await cashFlowApi.removeAll()
        this.isCashFlowDeletedAll = true
        await this.fetchAll()
      } finally {
        this.isCashFlowDeleteAll = false
      }
    },
  },
})
