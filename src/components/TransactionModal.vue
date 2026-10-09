<script setup lang="ts">
import { computed, reactive, ref, watch } from 'vue'
import { X, LoaderCircle } from 'lucide-vue-next'
import { toast } from 'vue-sonner'
import { getErrorMessage } from '~/helpers/apiHelper'
import { useCashFlowsStore } from '~/features/cashflows/states/cashFlowsStore'
import type { CashFlow, CashFlowPayload, CashFlowSource, CashFlowType } from '~/features/cashflows/types'

const props = defineProps<{ open: boolean; transaction?: CashFlow | null }>()
const emit = defineEmits<{ close: []; saved: [] }>()
const store = useCashFlowsStore()
const form = reactive<{ type: CashFlowType; source: CashFlowSource; label: string; description: string; nominal: number | null }>({
  type: 'outflow', source: 'cash', label: '', description: '', nominal: null,
})
const fieldErrors = reactive({ label: '', nominal: '', description: '' })
const submitting = ref(false)
const serverError = ref('')
const editing = computed(() => Boolean(props.transaction))

watch(() => [props.open, props.transaction] as const, ([open, transaction]) => {
  if (!open) return
  Object.assign(form, transaction
    ? { type: transaction.type, source: transaction.source, label: transaction.label, description: transaction.description, nominal: transaction.nominal }
    : { type: 'outflow', source: 'cash', label: '', description: '', nominal: null })
}, { immediate: true })

async function submit(): Promise<void> {
  serverError.value = ''
  fieldErrors.label = form.label.trim() ? '' : 'Kategori wajib diisi.'
  fieldErrors.nominal =
    form.nominal !== null && Number.isFinite(form.nominal) && form.nominal > 0
      ? ''
      : 'Nominal harus lebih dari nol.'
  fieldErrors.description = form.description.trim() ? '' : 'Keterangan wajib diisi.'
  if (Object.values(fieldErrors).some(Boolean)) return

  const payload: CashFlowPayload = {
    type: form.type,
    source: form.source,
    label: form.label.trim(),
    description: form.description.trim(),
    nominal: Number(form.nominal),
  }
  submitting.value = true
  try {
    if (props.transaction) await store.update(props.transaction.id, payload)
    else await store.create(payload)
    toast.success(editing.value ? 'Transaksi berhasil diperbarui.' : 'Transaksi berhasil dicatat.')
    emit('saved')
    emit('close')
  } catch (error) {
    serverError.value = getErrorMessage(error)
    toast.error(serverError.value)
  } finally {
    submitting.value = false
  }
}
</script>

<template>
  <Teleport to="body">
    <Transition name="modal">
      <div v-if="open" role="region" aria-label="Area dialog transaksi yang dapat digulir" tabindex="0" class="fixed inset-0 z-50 grid place-items-center overflow-y-auto bg-[#18223a]/45 p-4 backdrop-blur-sm" @click.self="emit('close')">
        <section class="card w-full max-w-[520px] p-6 shadow-2xl sm:p-8" role="dialog" aria-modal="true" aria-labelledby="transaction-title">
          <div class="mb-7 flex items-start justify-between"><div><p class="text-[10px] font-bold uppercase tracking-[.16em] text-[#566277]">Catatan keuangan</p><h2 id="transaction-title" class="mt-1 text-xl font-extrabold text-[#24314a]">{{ editing ? 'Ubah transaksi' : 'Tambah transaksi baru' }}</h2></div><button aria-label="Tutup" class="rounded-lg p-2 text-[#566277] hover:bg-[#f5f6fa]" @click="emit('close')"><X :size="19" /></button></div>
          <form class="space-y-5" novalidate @submit.prevent="submit">
            <p v-if="serverError" role="alert" class="rounded-xl border border-[#ffd7d4] bg-[#fff5f4] px-4 py-3 text-xs leading-5 text-[#bb4548]">{{ serverError }}</p>
            <fieldset><legend class="label">Jenis transaksi</legend><div class="grid grid-cols-2 gap-3"><button type="button" class="rounded-xl border px-4 py-3 text-left transition" :class="form.type === 'inflow' ? 'border-[#a2dfc5] bg-[#f0fbf5]' : 'border-[#e9edf4] bg-white'" @click="form.type = 'inflow'"><span class="text-xs font-bold" :class="form.type === 'inflow' ? 'text-[#176647]' : 'text-[#566277]'">Pemasukan</span><span class="mt-1 block text-[10px] text-[#566277]">Uang masuk ke kamu</span></button><button type="button" class="rounded-xl border px-4 py-3 text-left transition" :class="form.type === 'outflow' ? 'border-[#f2b7b8] bg-[#fff6f5]' : 'border-[#e9edf4] bg-white'" @click="form.type = 'outflow'"><span class="text-xs font-bold" :class="form.type === 'outflow' ? 'text-[#b9383e]' : 'text-[#566277]'">Pengeluaran</span><span class="mt-1 block text-[10px] text-[#566277]">Uang keluar dari kamu</span></button></div></fieldset>
            <div class="grid gap-4 sm:grid-cols-2"><div><label for="source" class="label">Sumber dana</label><select id="source" v-model="form.source" class="field"><option value="cash">Tunai</option><option value="savings">Tabungan</option><option value="loans">Pinjaman</option></select></div><div><label for="label" class="label">Kategori</label><input id="label" v-model="form.label" class="field" placeholder="Contoh: belanja, gaji" maxlength="80" required><p v-if="fieldErrors.label" class="mt-1 text-xs text-red-700">{{ fieldErrors.label }}</p></div></div>
            <div><label for="nominal" class="label">Nominal (Rupiah)</label><div class="flex items-center rounded-xl border border-[#e5e9f0] px-3 focus-within:border-[#5b7cfa] focus-within:ring-[3px] focus-within:ring-[#5b7cfa]/10"><span class="text-sm font-bold text-[#566277]">Rp</span><input id="nominal" v-model.number="form.nominal" type="number" min="1" step="1" class="w-full bg-transparent px-3 py-[11px] text-sm font-semibold outline-none" placeholder="0" required></div><p v-if="fieldErrors.nominal" class="mt-1 text-xs text-red-700">{{ fieldErrors.nominal }}</p></div>
            <div><label for="description" class="label">Keterangan</label><textarea id="description" v-model="form.description" rows="3" class="field resize-none" placeholder="Tambahkan catatan singkat..." required></textarea><p v-if="fieldErrors.description" class="mt-1 text-xs text-red-700">{{ fieldErrors.description }}</p></div>
            <div class="flex justify-end gap-3 border-t border-[#f0f2f6] pt-5"><button type="button" class="btn-ghost" @click="emit('close')">Batal</button><button type="submit" class="btn-primary" :disabled="submitting">{{ submitting ? 'Menyimpan...' : editing ? 'Simpan perubahan' : 'Simpan transaksi' }}<LoaderCircle v-if="submitting" :size="15" class="animate-spin" /></button></div>
          </form>
        </section>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>.modal-enter-active,.modal-leave-active{transition:opacity .18s}.modal-enter-active section,.modal-leave-active section{transition:transform .18s}.modal-enter-from,.modal-leave-to{opacity:0}.modal-enter-from section,.modal-leave-to section{transform:translateY(12px) scale(.98)}</style>
