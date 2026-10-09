export type CashFlowType = 'inflow' | 'outflow'
export type CashFlowSource = 'cash' | 'savings' | 'loans'

export interface CashFlow {
  id: number
  user_id: number
  type: CashFlowType
  source: CashFlowSource
  label: string
  description: string
  nominal: number
  created_at: string
  updated_at: string
}

export interface CashFlowPayload {
  type: CashFlowType
  source: CashFlowSource
  label: string
  description: string
  nominal: number
}

export interface CashFlowQueryParams {
  type?: CashFlowType | ''
  source?: CashFlowSource | ''
  label?: string
  start_date?: string
  end_date?: string
}

export interface CashFlowStats {
  cashflow: number
  total_inflow: number
  total_outflow: number
  total_outflow_cash?: number
  total_outflow_savings?: number
  total_outflow_loans?: number
  [key: string]: number | undefined
}

export interface CashFlowSummary {
  cashFlows: CashFlow[]
  stats: CashFlowStats
}

export interface CashFlowSeries {
  stats_inflow: Record<string, number>
  stats_outflow: Record<string, number>
  stats_cashflow: Record<string, number>
}
