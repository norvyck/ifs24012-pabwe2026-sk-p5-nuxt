<script setup lang="ts">
import { Camera, KeyRound, Save, UserRound, LoaderCircle } from 'lucide-vue-next'
import { toast } from 'vue-sonner'
import { formatDate, normalizePhotoUrl } from '~/helpers/toolsHelper'
import { getErrorMessage } from '~/helpers/apiHelper'
import { useAuthStore } from '~/features/auth/states/authStore'
import { useUsersStore } from '~/features/users/states/usersStore'
import type { ProfileUpdate } from '~/features/users/types'

const auth = useAuthStore()
const users = useUsersStore()
const profile = reactive<ProfileUpdate>({ name: '', email: '' })
const passwords = reactive({ password: '', new_password: '', new_password_confirmation: '' })
const photoInput = ref<HTMLInputElement | null>(null)
const profileLoading = ref(false)
const passwordLoading = ref(false)
const photoLoading = ref(false)
const fieldErrors = reactive({ name: '', email: '', password: '', new_password: '', new_password_confirmation: '' })
watch(() => auth.user, (user) => {
  if (user) { profile.name = user.name; profile.email = user.email }
}, { immediate: true })

async function saveProfile(): Promise<void> {
  fieldErrors.name = ''
  fieldErrors.email = ''
  if (profile.name.trim().length < 2) fieldErrors.name = 'Nama minimal 2 karakter.'
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(profile.email)) fieldErrors.email = 'Masukkan alamat email yang valid.'
  if (fieldErrors.name || fieldErrors.email) return
  profileLoading.value = true
  try { await users.updateProfile({ name: profile.name.trim(), email: profile.email.trim() }); toast.success('Profil berhasil diperbarui.') }
  catch (error) { toast.error(getErrorMessage(error)) }
  finally { profileLoading.value = false }
}
async function uploadPhoto(event: Event): Promise<void> {
  const file = (event.target as HTMLInputElement).files?.[0]
  if (!file) return
  if (!file.type.startsWith('image/')) { toast.error('Pilih berkas gambar yang valid.'); return }
  if (file.size > 5 * 1024 * 1024) { toast.error('Ukuran foto maksimal 5 MB.'); return }
  photoLoading.value = true
  try { await users.uploadPhoto(file); toast.success('Foto profil berhasil diperbarui.') }
  catch (error) { toast.error(getErrorMessage(error)) }
  finally { photoLoading.value = false; if (photoInput.value) photoInput.value.value = '' }
}
async function changePassword(): Promise<void> {
  Object.keys(fieldErrors).forEach((key) => { if (key !== 'name' && key !== 'email') fieldErrors[key as keyof typeof fieldErrors] = '' })
  if (passwords.password.length < 6) fieldErrors.password = 'Masukkan kata sandi saat ini (minimal 6 karakter).'
  if (passwords.new_password.length < 6) fieldErrors.new_password = 'Kata sandi baru minimal 6 karakter.'
  if (passwords.new_password !== passwords.new_password_confirmation) fieldErrors.new_password_confirmation = 'Konfirmasi kata sandi belum cocok.'
  if (fieldErrors.password || fieldErrors.new_password || fieldErrors.new_password_confirmation) return
  passwordLoading.value = true
  try {
    await users.updatePassword({ ...passwords })
    passwords.password = ''; passwords.new_password = ''; passwords.new_password_confirmation = ''
    toast.success('Kata sandi berhasil diubah.')
  } catch (error) { toast.error(getErrorMessage(error)) }
  finally { passwordLoading.value = false }
}
</script>

<template>
  <div class="mx-auto max-w-4xl space-y-6">
    <section><p class="text-xs text-[#566277]">Kelola informasi akun dan keamananmu</p><h2 class="mt-1 text-2xl font-extrabold tracking-tight text-[#24314a]">Profil Saya</h2></section>
    <section class="card overflow-hidden"><div class="h-28 bg-gradient-to-r from-[#405fe8] to-[#7991ff]"></div><div class="px-6 pb-7 sm:px-8"><div class="-mt-10 flex flex-wrap items-end justify-between gap-4"><div class="relative"><img v-if="normalizePhotoUrl(auth.user?.photo)" :src="normalizePhotoUrl(auth.user?.photo)" class="h-20 w-20 rounded-2xl border-4 border-white bg-white object-cover shadow-md" alt="Foto profil"><div v-else class="grid h-20 w-20 place-items-center rounded-2xl border-4 border-white bg-[#edf1ff] text-[#344dbd] shadow-md"><UserRound :size="30" /></div><button class="absolute -bottom-1 -right-1 grid h-8 w-8 place-items-center rounded-full bg-[#4969f5] text-white shadow" aria-label="Unggah foto profil" :disabled="photoLoading" @click="photoInput?.click()"><LoaderCircle v-if="photoLoading" :size="15" class="animate-spin" /><Camera v-else :size="15" /></button><input ref="photoInput" type="file" accept="image/*" class="hidden" @change="uploadPhoto"></div><span class="rounded-lg bg-[#edf1ff] px-3 py-1.5 text-[10px] font-bold text-[#344dbd]">ID pengguna #{{ auth.user?.id }}</span></div><div class="mt-4"><h3 class="text-lg font-extrabold text-[#29364f]">{{ auth.user?.name }}</h3><p class="mt-1 text-xs text-[#566277]">{{ auth.user?.email }}</p><p v-if="auth.user?.created_at" class="mt-2 text-[10px] text-[#566277]">Bergabung {{ formatDate(auth.user.created_at) }}</p></div></div></section>
    <section class="card p-6 sm:p-8"><div class="mb-6"><h3 class="text-sm font-extrabold text-[#2c3850]">Informasi pribadi</h3><p class="mt-1 text-[10px] text-[#566277]">Perbarui nama dan email yang terhubung dengan akunmu.</p></div><form class="grid gap-5 sm:grid-cols-2" @submit.prevent="saveProfile"><div><label for="name" class="label">Nama lengkap</label><input id="name" v-model="profile.name" class="field" autocomplete="name"><p v-if="fieldErrors.name" class="mt-1 text-xs text-red-700">{{ fieldErrors.name }}</p></div><div><label for="email" class="label">Alamat email</label><input id="email" v-model="profile.email" type="email" class="field" autocomplete="email"><p v-if="fieldErrors.email" class="mt-1 text-xs text-red-700">{{ fieldErrors.email }}</p></div><div class="sm:col-span-2"><button class="btn-primary" :disabled="profileLoading"><LoaderCircle v-if="profileLoading" :size="15" class="animate-spin" /><Save v-else :size="15" /> Simpan perubahan</button></div></form></section>
    <section class="card p-6 sm:p-8"><div class="mb-6 flex items-start gap-3"><div class="grid h-9 w-9 place-items-center rounded-xl bg-[#fff4e7] text-[#d48c35]"><KeyRound :size="17" /></div><div><h3 class="text-sm font-extrabold text-[#2c3850]">Ubah kata sandi</h3><p class="mt-1 text-[10px] text-[#566277]">Gunakan kata sandi kuat yang belum pernah kamu gunakan.</p></div></div><form class="grid gap-5 sm:grid-cols-2" @submit.prevent="changePassword"><div class="sm:col-span-2"><label for="current-password" class="label">Kata sandi saat ini</label><input id="current-password" v-model="passwords.password" type="password" autocomplete="current-password" class="field"><p v-if="fieldErrors.password" class="mt-1 text-xs text-red-700">{{ fieldErrors.password }}</p></div><div><label for="new-password" class="label">Kata sandi baru</label><input id="new-password" v-model="passwords.new_password" type="password" autocomplete="new-password" class="field"><p v-if="fieldErrors.new_password" class="mt-1 text-xs text-red-700">{{ fieldErrors.new_password }}</p></div><div><label for="confirm-password" class="label">Konfirmasi kata sandi</label><input id="confirm-password" v-model="passwords.new_password_confirmation" type="password" autocomplete="new-password" class="field"><p v-if="fieldErrors.new_password_confirmation" class="mt-1 text-xs text-red-700">{{ fieldErrors.new_password_confirmation }}</p></div><div class="sm:col-span-2"><button class="btn-ghost" :disabled="passwordLoading"><LoaderCircle v-if="passwordLoading" :size="15" class="animate-spin" /><KeyRound v-else :size="15" /> Ubah kata sandi</button></div></form></section>
  </div>
</template>
