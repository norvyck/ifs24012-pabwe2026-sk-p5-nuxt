<script setup lang="ts">
import { ArrowLeft, ArrowDownLeft, ArrowUpRight, CalendarDays, Clock3, Tag, Wallet, Pencil, Trash2 } from 'lucide-vue-next'
import { toast } from 'vue-sonner'
import { formatDateTime, formatLabel, formatRupiah, showConfirmDialog } from '~/helpers/toolsHelper'
import { getErrorMessage } from '~/helpers/apiHelper'
import { useCashFlowsStore } from '~/features/cashflows/states/cashFlowsStore'

const route = useRoute()
const store = useCashFlowsStore()
const flow = ref<Awaited<ReturnType<typeof store.fetchById>> | null>(null)
const isLoading = ref(true)
const errorMessage = ref('')
const modalOpen = ref(false)

async function load(): Promise<void> {
  isLoading.value = true
  errorMessage.value = ''
  try { flow.value = await store.fetchById(String(route.params.cashFlowId)) }
  catch (error) { errorMessage.value = getErrorMessage(error) }
  finally { isLoading.value = false }
}
async function remove(): Promise<void> {
  if (!flow.value || !await showConfirmDialog('Hapus transaksi ini?', 'Catatan yang dihapus tidak dapat dikembalikan.')) return
  try { await store.remove(flow.value.id); toast.success('Transaksi berhasil dihapus.'); await navigateTo('/') }
  catch (error) { toast.error(getErrorMessage(error)) }
}
onMounted(load)
</script>

<template>
  <div class="mx-auto max-w-3xl">
    <NuxtLink to="/" class="mb-5 inline-flex items-center gap-2 text-xs font-bold text-[#566277] hover:text-[#344dbd]"><ArrowLeft :size="15" /> Kembali ke ringkasan</NuxtLink>
    <div v-if="isLoading" class="card grid min-h-64 place-items-center text-xs text-[#566277]">Memuat detail transaksi...</div>
    <div v-else-if="errorMessage" class="card p-8 text-center"><p class="text-sm font-bold text-[#bf4e50]">{{ errorMessage }}</p><button class="btn-ghost mt-4" @click="load">Coba lagi</button></div>
    <article v-else-if="flow" class="card overflow-hidden">
      <div class="bg-gradient-to-br from-[#edf1ff] to-[#f8f9ff] p-7 sm:p-10"><div class="flex items-start justify-between"><div class="flex items-center gap-3"><div class="grid h-12 w-12 place-items-center rounded-2xl" :class="flow.type === 'inflow' ? 'bg-[#ddf5e9] text-[#239b70]' : 'bg-[#ffe8e6] text-[#da5e61]'"><ArrowDownLeft v-if="flow.type === 'inflow'" :size="22" /><ArrowUpRight v-else :size="22" /></div><div><p class="text-[10px] font-bold uppercase tracking-wider text-[#566277]">{{ flow.type === 'inflow' ? 'Pemasukan' : 'Pengeluaran' }}</p><h1 class="mt-1 text-lg font-extrabold text-[#29364f]">{{ formatLabel(flow.label) }}</h1></div></div><span class="rounded-lg bg-white/80 px-3 py-1.5 text-[10px] font-bold text-[#66728a]">{{ formatLabel(flow.source) }}</span></div><p class="mt-7 text-3xl font-extrabold tracking-tight" :class="flow.type === 'inflow' ? 'text-[#176647]' : 'text-[#b9383e]'">{{ flow.type === 'inflow' ? '+' : '−' }}{{ formatRupiah(flow.nominal) }}</p><p class="mt-2 max-w-lg text-xs leading-6 text-[#566277]">{{ flow.description || 'Tidak ada keterangan tambahan.' }}</p></div>
      <div class="grid gap-4 p-6 sm:grid-cols-2 sm:p-8"><div class="flex items-center gap-3 rounded-xl bg-[#fafbfe] p-4"><CalendarDays :size="18" class="text-[#7287e8]" /><div><p class="text-[10px] text-[#566277]">Tanggal transaksi</p><p class="mt-1 text-xs font-bold text-[#43506a]">{{ formatDateTime(flow.created_at) }}</p></div></div><div class="flex items-center gap-3 rounded-xl bg-[#fafbfe] p-4"><Clock3 :size="18" class="text-[#7287e8]" /><div><p class="text-[10px] text-[#566277]">Terakhir diperbarui</p><p class="mt-1 text-xs font-bold text-[#43506a]">{{ formatDateTime(flow.updated_at) }}</p></div></div><div class="flex items-center gap-3 rounded-xl bg-[#fafbfe] p-4"><Tag :size="18" class="text-[#7287e8]" /><div><p class="text-[10px] text-[#566277]">Kategori</p><p class="mt-1 text-xs font-bold text-[#43506a]">{{ formatLabel(flow.label) }}</p></div></div><div class="flex items-center gap-3 rounded-xl bg-[#fafbfe] p-4"><Wallet :size="18" class="text-[#7287e8]" /><div><p class="text-[10px] text-[#566277]">Sumber dana</p><p class="mt-1 text-xs font-bold text-[#43506a]">{{ formatLabel(flow.source) }}</p></div></div></div>
      <div class="flex justify-end gap-2 border-t border-[#f0f2f6] px-6 py-5 sm:px-8"><button class="btn-ghost !text-[#b9383e]" @click="remove"><Trash2 :size="15" /> Hapus</button><button class="btn-primary" @click="modalOpen = true"><Pencil :size="15" /> Ubah transaksi</button></div>
    </article>
    <TransactionModal :open="modalOpen" :transaction="flow" @close="modalOpen = false" @saved="load" />
  </div>
</template>
