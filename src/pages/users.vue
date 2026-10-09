<script setup lang="ts">
import { Search, Users, UserRound, Mail, CalendarDays, RotateCcw } from 'lucide-vue-next'
import { formatDate, normalizePhotoUrl } from '~/helpers/toolsHelper'
import { getErrorMessage } from '~/helpers/apiHelper'
import { useAuthStore } from '~/features/auth/states/authStore'
import { useUsersStore } from '~/features/users/states/usersStore'

const store = useUsersStore()
const auth = useAuthStore()
const search = ref('')
const errorMessage = ref('')
const filteredUsers = computed(() => store.users.filter((user) => `${user.name} ${user.email}`.toLocaleLowerCase('id-ID').includes(search.value.trim().toLocaleLowerCase('id-ID'))))
async function load(): Promise<void> {
  errorMessage.value = ''
  try { await store.fetchUsers() }
  catch (error) { errorMessage.value = getErrorMessage(error) }
}
onMounted(load)
</script>

<template>
  <div class="mx-auto max-w-[1440px] space-y-6">
    <section class="flex flex-wrap items-end justify-between gap-3"><div><p class="text-xs text-[#566277]">Kenali komunitas pengguna Delcom</p><h2 class="mt-1 text-2xl font-extrabold tracking-tight text-[#24314a]">Direktori Pengguna</h2></div><button class="btn-ghost" :disabled="store.isLoading" @click="load"><RotateCcw :size="14" :class="store.isLoading ? 'animate-spin' : ''" /> Perbarui daftar</button></section>
    <div v-if="errorMessage" class="rounded-xl border border-[#ffd7d4] bg-[#fff5f4] px-4 py-3 text-xs text-[#bb4548]">{{ errorMessage }} <button class="ml-2 font-bold underline" @click="load">Coba lagi</button></div>
    <section class="card overflow-hidden"><div class="flex flex-col justify-between gap-4 border-b border-[#f0f2f6] px-5 py-5 sm:flex-row sm:items-center sm:px-6"><div class="flex items-center gap-3"><div class="grid h-10 w-10 place-items-center rounded-xl bg-[#edf1ff] text-[#344dbd]"><Users :size="18" /></div><div><h3 class="text-sm font-extrabold text-[#2c3850]">Semua pengguna</h3><p class="mt-1 text-[10px] text-[#566277]">{{ store.users.length }} akun terdaftar</p></div></div><label class="relative w-full sm:max-w-xs"><Search :size="15" class="absolute left-3 top-1/2 -translate-y-1/2 text-[#566277]" /><input v-model="search" type="search" class="field !rounded-lg !py-2 !pl-9 text-xs" placeholder="Cari nama atau email..."></label></div>
      <div v-if="store.isLoading" class="grid min-h-48 place-items-center text-xs text-[#566277]">Memuat daftar pengguna...</div>
      <div v-else-if="filteredUsers.length" role="region" aria-label="Tabel pengguna yang dapat digulir" tabindex="0" class="overflow-x-auto"><table class="w-full min-w-[600px] text-left"><thead><tr class="bg-[#fafbfe] text-[10px] font-bold uppercase tracking-wider text-[#566277]"><th class="px-6 py-3">Pengguna</th><th class="px-4 py-3">Alamat email</th><th class="px-4 py-3">Bergabung</th><th class="px-6 py-3 text-right">Status</th></tr></thead><tbody class="divide-y divide-[#f2f4f8]"><tr v-for="user in filteredUsers" :key="user.id" class="table-row"><td class="px-6 py-4"><div class="flex items-center gap-3"><img v-if="normalizePhotoUrl(user.photo)" :src="normalizePhotoUrl(user.photo)" class="h-9 w-9 rounded-full object-cover" :alt="`Foto ${user.name}`"><span v-else class="grid h-9 w-9 place-items-center rounded-full bg-[#e8edff] text-xs font-bold text-[#344dbd]">{{ user.name.slice(0, 1).toUpperCase() }}</span><div><p class="text-xs font-bold text-[#38455f]">{{ user.name }}</p><p class="mt-0.5 text-[10px] text-[#566277]">ID pengguna #{{ user.id }}</p></div></div></td><td class="px-4 py-4"><span class="inline-flex items-center gap-2 text-xs text-[#566277]"><Mail :size="13" />{{ user.email }}</span></td><td class="px-4 py-4"><span class="inline-flex items-center gap-2 text-[10px] text-[#566277]"><CalendarDays :size="13" />{{ user.created_at ? formatDate(user.created_at) : '—' }}</span></td><td class="px-6 py-4 text-right"><span v-if="user.email_verified_at" class="rounded-md bg-[#eaf9f1] px-2 py-1 text-[10px] font-bold text-[#176647]">Terverifikasi</span><span v-else-if="user.id === auth.user?.id" class="rounded-md bg-[#edf1ff] px-2 py-1 text-[10px] font-bold text-[#344dbd]">Kamu</span><span v-else class="rounded-md bg-[#f4f5f8] px-2 py-1 text-[10px] font-bold text-[#566277]">Pengguna</span></td></tr></tbody></table></div>
      <div v-else class="grid min-h-48 place-items-center text-center"><div><UserRound :size="24" class="mx-auto text-[#566277]" /><p class="mt-2 text-xs text-[#566277]">Pengguna tidak ditemukan.</p></div></div>
    </section>
  </div>
</template>
