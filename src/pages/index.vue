<script setup lang="ts">
import { ArrowDownLeft, ArrowUpRight, Banknote, Plus, RotateCcw, Search, SlidersHorizontal, Wallet, X, ArrowRight, ChevronDown } from 'lucide-vue-next'
import { toast } from 'vue-sonner'
import { cashFlowApi } from '~/features/cashflows/api/cashFlowApi'
import { formatDate, formatRupiah, formatLabel, formatDateTime, showConfirmDialog } from '~/helpers/toolsHelper'
import { getErrorMessage } from '~/helpers/apiHelper'
import { useAuthStore } from '~/features/auth/states/authStore'
import { useCashFlowsStore } from '~/features/cashflows/states/cashFlowsStore'
import type { CashFlow, CashFlowQueryParams, CashFlowType, CashFlowSource } from '~/features/cashflows/types'

const store = useCashFlowsStore()
const auth = useAuthStore()
const modalOpen = ref(false)
const editingTransaction = ref<CashFlow | null>(null)
const selectedTransaction = ref<CashFlow | null>(null)
const filters = reactive<{ type: CashFlowType | ''; source: CashFlowSource | ''; label: string; startDate: string; endDate: string }>({
  type: '', source: '', label: '', startDate: '', endDate: '',
})
const search = ref('')
const loadingError = ref('')
const firstName = computed(() => auth.user?.name?.split(' ')[0] ?? 'teman')
const filteredTransactions = computed(() => {
  const term = search.value.trim().toLocaleLowerCase('id-ID')
  if (!term) return store.cashFlows
  return store.cashFlows.filter((flow) =>
    [flow.label, flow.description, flow.source, flow.type].some((value) => value.toLocaleLowerCase('id-ID').includes(term)),
  )
})
const activeFilters = computed(() => Object.values(filters).filter(Boolean).length)
const metricCards = computed(() => [
  { label: 'Saldo kas bersih', value: store.stats.cashflow ?? 0, icon: Wallet, tone: 'blue', hint: 'Dari seluruh transaksi' },
  { label: 'Total pemasukan', value: store.stats.total_inflow ?? 0, icon: ArrowDownLeft, tone: 'green', hint: 'Uang yang masuk' },
  { label: 'Total pengeluaran', value: store.stats.total_outflow ?? 0, icon: ArrowUpRight, tone: 'red', hint: 'Uang yang keluar' },
  { label: 'Saldo kas tunai', value: store.stats.total_inflow_cash !== undefined ? store.stats.total_inflow_cash - (store.stats.total_outflow_cash ?? 0) : store.cashFlows.filter((flow) => flow.source === 'cash').reduce((sum, flow) => sum + (flow.type === 'inflow' ? flow.nominal : -flow.nominal), 0), icon: Banknote, tone: 'violet', hint: 'Saldo sumber tunai' },
])
const maxDailyValue = computed(() => {
  const values = Object.values(store.dailyStats?.stats_cashflow ?? {}).map(Math.abs)
  return Math.max(...values, 1)
})
const dailyEntries = computed(() => Object.entries(store.dailyStats?.stats_cashflow ?? {}).slice(-7))
function sourceBalance(source: CashFlowSource): number {
  return store.cashFlows
    .filter((flow) => flow.source === source)
    .reduce((sum, flow) => sum + (flow.type === 'inflow' ? flow.nominal : -flow.nominal), 0)
}
function sourceProgress(source: CashFlowSource): number {
  return store.stats.cashflow ? Math.max(5, Math.min(100, Math.abs(sourceBalance(source) / store.stats.cashflow * 100))) : 5
}

async function loadDashboard(): Promise<void> {
  loadingError.value = ''
  try {
    const query: CashFlowQueryParams = {
      type: filters.type, source: filters.source, label: filters.label,
      start_date: filters.startDate ? `${filters.startDate} 00:00:00` : '',
      end_date: filters.endDate ? `${filters.endDate} 23:59:59` : '',
    }
    await Promise.all([store.fetchAll(query), store.fetchLabels(), store.fetchDailyStats(undefined, 7)])
  } catch (error) {
    loadingError.value = getErrorMessage(error)
  }
}
function openCreate(): void { editingTransaction.value = null; modalOpen.value = true }
function openEdit(flow: CashFlow): void { editingTransaction.value = flow; modalOpen.value = true }
function openDetail(flow: CashFlow): void { selectedTransaction.value = null; void navigateTo(`/cash-flows/${flow.id}`) }
function applyFilters(): void { void loadDashboard() }
function clearFilters(): void {
  Object.assign(filters, { type: '', source: '', label: '', startDate: '', endDate: '' })
  void loadDashboard()
}
async function deleteTransaction(flow: CashFlow): Promise<void> {
  if (!await showConfirmDialog('Hapus transaksi ini?', 'Catatan yang dihapus tidak dapat dikembalikan.')) return
  try {
    await store.remove(flow.id)
    toast.success('Transaksi berhasil dihapus.')
    if (selectedTransaction.value?.id === flow.id) selectedTransaction.value = null
  } catch (error) { toast.error(getErrorMessage(error)) }
}
async function resetAll(): Promise<void> {
  if (!await showConfirmDialog('Hapus semua transaksi?', 'Seluruh catatan arus kas akan dihapus permanen.')) return
  try {
    await store.removeAll()
    toast.success('Semua transaksi berhasil dihapus.')
  } catch (error) { toast.error(getErrorMessage(error)) }
}
function onEscape(event: KeyboardEvent): void {
  if (event.key === 'Escape') selectedTransaction.value = null
}
onMounted(() => {
  void loadDashboard()
  window.addEventListener('keydown', onEscape)
})
onBeforeUnmount(() => window.removeEventListener('keydown', onEscape))
</script>

<template>
  <div class="mx-auto max-w-[1440px] space-y-6">
    <section class="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
      <div><p class="text-xs text-[#566277]">{{ formatDate(new Date(), { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }) }}</p><h2 class="mt-1 text-2xl font-extrabold tracking-tight text-[#24314a] sm:text-[28px]">Halo, {{ firstName }} <span aria-hidden="true">👋</span></h2><p class="mt-1 text-xs text-[#566277]">Begini gambaran keuanganmu hari ini.</p></div>
      <div class="flex flex-wrap items-center gap-2"><button class="btn-ghost" :disabled="store.isLoading" @click="loadDashboard"><RotateCcw :size="14" :class="store.isLoading ? 'animate-spin' : ''" /> Perbarui</button><button class="btn-primary sm:hidden" @click="openCreate"><Plus :size="15" /> Catat transaksi</button></div>
    </section>

    <div v-if="loadingError" class="flex items-center justify-between gap-3 rounded-xl border border-[#ffd7d4] bg-[#fff5f4] px-4 py-3 text-xs text-[#bb4548]"><span>{{ loadingError }}</span><button class="font-bold underline" @click="loadDashboard">Coba lagi</button></div>

    <section class="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <article v-for="metric in metricCards" :key="metric.label" class="card p-5 transition hover:-translate-y-0.5 hover:shadow-md">
        <div class="flex items-start justify-between"><p class="text-[11px] font-semibold text-[#566277]">{{ metric.label }}</p><div class="grid h-9 w-9 place-items-center rounded-xl" :class="{ 'bg-[#edf1ff] text-[#344dbd]': metric.tone === 'blue', 'bg-[#eaf9f1] text-[#25a878]': metric.tone === 'green', 'bg-[#fff0ef] text-[#e36567]': metric.tone === 'red', 'bg-[#f4efff] text-[#9066d8]': metric.tone === 'violet' }"><component :is="metric.icon" :size="17" /></div></div>
        <p class="mt-4 text-xl font-extrabold tracking-tight text-[#26334d]">{{ formatRupiah(metric.value) }}</p><p class="mt-1 text-[10px] text-[#566277]">{{ metric.hint }}</p>
      </article>
    </section>

    <section class="grid gap-5 xl:grid-cols-[1.6fr_1fr]">
      <article class="card p-5 sm:p-6"><div class="flex items-center justify-between"><div><h3 class="text-sm font-extrabold text-[#2c3850]">Arus kas harian</h3><p class="mt-1 text-[10px] text-[#566277]">Ringkasan saldo selama 7 hari terakhir</p></div><span class="rounded-lg bg-[#f3f5ff] px-2.5 py-1.5 text-[10px] font-bold text-[#344dbd]">7 hari</span></div>
        <div v-if="dailyEntries.length" class="mt-7 flex h-36 items-end justify-between gap-2 sm:gap-4">
          <div v-for="[day, amount] in dailyEntries" :key="day" class="flex h-full flex-1 flex-col items-center justify-end gap-2"><div class="flex h-full w-full items-end justify-center"><div class="stat-chart-bar w-full max-w-9" :style="{ height: `${Math.max(Math.abs(amount) / maxDailyValue * 100, amount === 0 ? 5 : 12)}%`, opacity: amount < 0 ? .65 : 1 }" :title="`${day}: ${formatRupiah(amount)}`"></div></div><span class="text-[9px] text-[#566277]">{{ day.split('-')[0] }}</span></div>
        </div>
        <div v-else class="mt-6 grid h-32 place-items-center rounded-xl bg-[#fafbfe] text-xs text-[#566277]">Grafik akan tampil setelah data tersedia.</div>
        <div class="mt-4 flex items-center gap-2 text-[10px] text-[#566277]"><span class="h-2 w-2 rounded-full bg-[#5272f4]"></span>Saldo kas bersih</div>
      </article>
      <article class="card p-5 sm:p-6"><div class="flex items-start justify-between"><div><h3 class="text-sm font-extrabold text-[#2c3850]">Saldo per sumber dana</h3><p class="mt-1 text-[10px] text-[#566277]">Perkiraan berdasarkan transaksi tercatat</p></div><Wallet :size="17" class="text-[#566277]" /></div>
        <div class="mt-5 space-y-4"><div v-for="source in ['cash', 'savings', 'loans'] as const" :key="source"><div class="mb-2 flex justify-between text-xs"><span class="font-semibold text-[#677287]">{{ formatLabel(source === 'cash' ? 'tunai' : source === 'savings' ? 'tabungan' : 'pinjaman') }}</span><span class="font-bold text-[#303d57]">{{ formatRupiah(sourceBalance(source)) }}</span></div><div class="h-1.5 overflow-hidden rounded-full bg-[#f0f2f7]"><div class="h-full rounded-full" :class="source === 'cash' ? 'bg-[#5373f4]' : source === 'savings' ? 'bg-[#37bb87]' : 'bg-[#f2ac59]'" :style="{ width: `${sourceProgress(source)}%` }"></div></div></div></div>
      </article>
    </section>

    <section class="card overflow-hidden">
      <div class="flex flex-col justify-between gap-4 border-b border-[#f0f2f6] px-5 py-5 sm:flex-row sm:items-center sm:px-6"><div><h3 class="text-sm font-extrabold text-[#2c3850]">Riwayat transaksi</h3><p class="mt-1 text-[10px] text-[#566277]">Pantau semua pemasukan dan pengeluaranmu</p></div><div class="flex flex-wrap items-center gap-2"><button class="btn-ghost !px-3 !py-2" @click="resetAll"><RotateCcw :size="13" /> <span class="hidden sm:inline">Reset semua</span><span class="sm:hidden">Reset</span></button><button class="btn-primary !px-3 !py-2 text-[11px]" @click="openCreate"><Plus :size="14" /> Tambah transaksi</button></div></div>
      <div class="flex flex-col gap-3 border-b border-[#f0f2f6] px-5 py-4 sm:flex-row sm:items-center sm:px-6">
        <label class="relative flex-1"><Search :size="15" class="absolute left-3 top-1/2 -translate-y-1/2 text-[#566277]" /><input v-model="search" class="field !rounded-lg !py-2 !pl-9 text-xs" type="search" placeholder="Cari kategori atau keterangan..."></label>
        <div class="flex flex-wrap gap-2"><select v-model="filters.type" aria-label="Filter jenis transaksi" class="field !w-auto !rounded-lg !py-2 text-[11px]" @change="applyFilters"><option value="">Semua jenis</option><option value="inflow">Pemasukan</option><option value="outflow">Pengeluaran</option></select><select v-model="filters.source" aria-label="Filter sumber dana" class="field !w-auto !rounded-lg !py-2 text-[11px]" @change="applyFilters"><option value="">Semua sumber</option><option value="cash">Tunai</option><option value="savings">Tabungan</option><option value="loans">Pinjaman</option></select><select v-model="filters.label" aria-label="Filter kategori" class="field !w-auto !rounded-lg !py-2 text-[11px]" @change="applyFilters"><option value="">Semua kategori</option><option v-for="label in store.labels" :key="label" :value="label">{{ formatLabel(label) }}</option></select><button class="btn-ghost !px-2.5 !py-2 text-[11px]" aria-label="Bersihkan filter" @click="clearFilters"><SlidersHorizontal :size="14" />{{ activeFilters || 'Filter' }}<X v-if="activeFilters" :size="13" /></button></div>
      </div>
      <div class="grid gap-3 border-b border-[#f0f2f6] px-5 py-4 sm:grid-cols-2 sm:px-6"><div><label for="start-date" class="label !mb-1">Tanggal mulai</label><input id="start-date" v-model="filters.startDate" type="date" class="field !rounded-lg !py-2 text-[11px]" @change="applyFilters"></div><div><label for="end-date" class="label !mb-1">Tanggal akhir</label><input id="end-date" v-model="filters.endDate" type="date" class="field !rounded-lg !py-2 text-[11px]" @change="applyFilters"></div></div>
      <div v-if="store.isLoading" class="grid min-h-48 place-items-center text-xs text-[#566277]">Memuat transaksi...</div>
      <template v-else-if="filteredTransactions.length">
        <div role="region" aria-label="Tabel transaksi yang dapat digulir" tabindex="0" class="overflow-x-auto"><table class="w-full min-w-[700px] text-left"><thead><tr class="bg-[#fafbfe] text-[10px] font-bold uppercase tracking-wider text-[#566277]"><th class="px-6 py-3">Transaksi</th><th class="px-4 py-3">Sumber</th><th class="px-4 py-3">Tanggal</th><th class="px-4 py-3 text-right">Nominal</th><th class="px-6 py-3 text-right">Aksi</th></tr></thead><tbody class="divide-y divide-[#f2f4f8]">
          <tr v-for="flow in filteredTransactions" :key="flow.id" class="table-row transition"><td class="px-6 py-4"><div class="flex items-center gap-3"><div class="grid h-9 w-9 shrink-0 place-items-center rounded-xl" :class="flow.type === 'inflow' ? 'bg-[#eaf9f1] text-[#25a878]' : 'bg-[#fff0ef] text-[#e36567]'"><ArrowDownLeft v-if="flow.type === 'inflow'" :size="16" /><ArrowUpRight v-else :size="16" /></div><div><button class="text-left text-xs font-bold text-[#38455f] hover:text-[#344dbd]" @click="selectedTransaction = flow">{{ formatLabel(flow.label) }}</button><p class="mt-0.5 max-w-64 truncate text-[10px] text-[#566277]">{{ flow.description || 'Tanpa keterangan' }}</p></div></div></td><td class="px-4 py-4"><span class="rounded-md bg-[#f3f5f9] px-2 py-1 text-[10px] font-semibold text-[#566277]">{{ formatLabel(flow.source) }}</span></td><td class="px-4 py-4 text-[10px] text-[#566277]">{{ formatDateTime(flow.created_at) }}</td><td class="px-4 py-4 text-right text-xs font-extrabold" :class="flow.type === 'inflow' ? 'text-[#176647]' : 'text-[#3a465d]'">{{ flow.type === 'inflow' ? '+' : '−' }}{{ formatRupiah(flow.nominal) }}</td><td class="px-6 py-4"><div class="flex justify-end gap-1"><button class="rounded-lg p-2 text-[#566277] hover:bg-[#f1f4ff] hover:text-[#344dbd]" :aria-label="`Lihat ${flow.label}`" @click="selectedTransaction = flow"><ArrowRight :size="15" /></button><button class="rounded-lg p-2 text-[#566277] hover:bg-[#f1f4ff] hover:text-[#344dbd]" :aria-label="`Ubah ${flow.label}`" @click="openEdit(flow)"><ChevronDown :size="15" /></button><button class="rounded-lg p-2 text-[#566277] hover:bg-[#fff0ef] hover:text-[#b9383e]" :aria-label="`Hapus ${flow.label}`" @click="deleteTransaction(flow)"><X :size="15" /></button></div></td></tr>
        </tbody></table></div>
        <div class="flex items-center justify-between px-6 py-4 text-[10px] text-[#566277]"><span>{{ filteredTransactions.length }} transaksi ditampilkan</span><span>Diperbarui {{ formatDate(new Date(), { day: 'numeric', month: 'short' }) }}</span></div>
      </template>
      <div v-else class="grid min-h-56 place-items-center px-4 py-10 text-center"><div><div class="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-[#f3f5ff] text-[#8798ed]"><Wallet :size="22" /></div><p class="mt-3 text-sm font-bold text-[#46526a]">{{ search || activeFilters ? 'Tidak ada transaksi yang cocok' : 'Belum ada transaksi' }}</p><p class="mt-1 text-xs text-[#566277]">{{ search || activeFilters ? 'Coba ubah kata kunci atau filter pencarian.' : 'Mulai dengan mencatat pemasukan atau pengeluaran pertamamu.' }}</p><button v-if="!search && !activeFilters" class="btn-primary mt-4 !text-xs" @click="openCreate"><Plus :size="14" /> Catat transaksi pertama</button></div></div>
    </section>

    <Teleport to="body"><div v-if="selectedTransaction" class="fixed inset-0 z-40 grid place-items-center bg-[#18223a]/40 p-4 backdrop-blur-sm" @click.self="selectedTransaction = null"><section class="card w-full max-w-md p-6 shadow-xl"><div class="flex items-start justify-between"><div><p class="text-[10px] font-bold uppercase tracking-wider text-[#566277]">Detail transaksi</p><h3 class="mt-1 text-xl font-extrabold text-[#29364f]">{{ formatLabel(selectedTransaction.label) }}</h3></div><button class="rounded-lg p-2 text-[#566277] hover:bg-[#f5f6fa]" aria-label="Tutup detail" @click="selectedTransaction = null"><X :size="18" /></button></div><p class="mt-4 text-2xl font-extrabold" :class="selectedTransaction.type === 'inflow' ? 'text-[#176647]' : 'text-[#b9383e]'">{{ selectedTransaction.type === 'inflow' ? '+' : '−' }}{{ formatRupiah(selectedTransaction.nominal) }}</p><p class="mt-2 text-xs leading-6 text-[#566277]">{{ selectedTransaction.description || 'Tidak ada keterangan.' }}</p><dl class="mt-5 space-y-3 border-t border-[#f0f2f6] pt-4 text-xs"><div class="flex justify-between"><dt class="text-[#566277]">Jenis</dt><dd class="font-semibold">{{ selectedTransaction.type === 'inflow' ? 'Pemasukan' : 'Pengeluaran' }}</dd></div><div class="flex justify-between"><dt class="text-[#566277]">Sumber dana</dt><dd class="font-semibold">{{ formatLabel(selectedTransaction.source) }}</dd></div><div class="flex justify-between"><dt class="text-[#566277]">Dicatat</dt><dd class="font-semibold">{{ formatDateTime(selectedTransaction.created_at) }}</dd></div><div class="flex justify-between"><dt class="text-[#566277]">Terakhir diperbarui</dt><dd class="font-semibold">{{ formatDateTime(selectedTransaction.updated_at) }}</dd></div></dl><div class="mt-6 flex gap-2"><button class="btn-ghost flex-1" @click="openDetail(selectedTransaction)">Buka detail</button><button class="btn-primary flex-1" @click="openEdit(selectedTransaction); selectedTransaction = null">Ubah transaksi</button></div></section></div></Teleport>
    <TransactionModal :open="modalOpen" :transaction="editingTransaction" @close="modalOpen = false" @saved="loadDashboard" />
  </div>
</template>
