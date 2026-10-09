<script setup lang="ts">
import { ArrowLeft, ArrowRight, Eye, EyeOff, LoaderCircle } from 'lucide-vue-next'
import { toast } from 'vue-sonner'
import { getErrorMessage } from '~/helpers/apiHelper'
import { useAuthStore } from '~/features/auth/states/authStore'

definePageMeta({ layout: 'auth' })
const auth = useAuthStore()
const form = reactive({ name: '', email: '', password: '', confirmation: '' })
const showPassword = ref(false)
const submitting = ref(false)
const fieldErrors = reactive({ name: '', email: '', password: '', confirmation: '' })

async function submit(): Promise<void> {
  Object.keys(fieldErrors).forEach((key) => (fieldErrors[key as keyof typeof fieldErrors] = ''))
  if (form.name.trim().length < 2) fieldErrors.name = 'Nama minimal 2 karakter.'
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) fieldErrors.email = 'Masukkan alamat email yang valid.'
  if (form.password.length < 6) fieldErrors.password = 'Kata sandi minimal 6 karakter.'
  if (form.password !== form.confirmation) fieldErrors.confirmation = 'Konfirmasi kata sandi belum cocok.'
  if (Object.values(fieldErrors).some(Boolean)) return

  submitting.value = true
  try {
    await auth.register({ name: form.name.trim(), email: form.email.trim(), password: form.password })
    toast.success('Pendaftaran berhasil. Silakan masuk.')
    await navigateTo('/auth/login')
  } catch (error) {
    toast.error(getErrorMessage(error))
  } finally {
    submitting.value = false
  }
}
</script>

<template>
  <div>
    <NuxtLink to="/auth/login" class="mb-7 inline-flex min-h-11 items-center gap-2 text-xs font-bold text-[#566277] hover:text-[#344dbd]"><ArrowLeft :size="15" /> Kembali ke halaman masuk</NuxtLink>
    <p class="mb-2 text-xs font-bold uppercase tracking-[.16em] text-[#566277]">Mulai sekarang</p>
    <h1 class="text-3xl font-extrabold tracking-tight text-[#202b40]">Buat akun baru</h1>
    <p class="mt-2 text-sm text-[#566277]">Hanya perlu beberapa langkah sederhana.</p>
    <form class="mt-7 space-y-4" @submit.prevent="submit">
      <div><label for="name" class="label">Nama lengkap</label><input id="name" v-model="form.name" autocomplete="name" class="field" placeholder="Nama kamu"><p v-if="fieldErrors.name" class="mt-1 text-xs text-red-700">{{ fieldErrors.name }}</p></div>
      <div><label for="email" class="label">Alamat email</label><input id="email" v-model="form.email" autocomplete="email" type="email" class="field" placeholder="nama@email.com"><p v-if="fieldErrors.email" class="mt-1 text-xs text-red-700">{{ fieldErrors.email }}</p></div>
      <div><label for="password" class="label">Kata sandi</label><div class="relative"><input id="password" v-model="form.password" autocomplete="new-password" :type="showPassword ? 'text' : 'password'" class="field pr-11" placeholder="Minimal 6 karakter"><button type="button" class="absolute right-3 top-1/2 -translate-y-1/2 text-[#566277]" :aria-label="showPassword ? 'Sembunyikan kata sandi' : 'Tampilkan kata sandi'" @click="showPassword = !showPassword"><EyeOff v-if="showPassword" :size="17" /><Eye v-else :size="17" /></button></div><p v-if="fieldErrors.password" class="mt-1 text-xs text-red-700">{{ fieldErrors.password }}</p></div>
      <div><label for="confirmation" class="label">Konfirmasi kata sandi</label><input id="confirmation" v-model="form.confirmation" autocomplete="new-password" type="password" class="field" placeholder="Ulangi kata sandi"><p v-if="fieldErrors.confirmation" class="mt-1 text-xs text-red-700">{{ fieldErrors.confirmation }}</p></div>
      <button class="btn-primary w-full !py-3" type="submit" :disabled="submitting">{{ submitting ? 'Mendaftarkan akun...' : 'Daftar sekarang' }}<LoaderCircle v-if="submitting" :size="16" class="animate-spin" /><ArrowRight v-else :size="16" /></button>
    </form>
    <p class="mt-5 flex min-h-11 items-center justify-center gap-1 text-center text-xs text-[#566277]">Sudah terdaftar? <NuxtLink to="/auth/login" class="inline-flex min-h-11 items-center px-2 font-bold text-[#344dbd] hover:underline">Masuk di sini</NuxtLink></p>
  </div>
</template>
