<script setup lang="ts">
import { ArrowRight, Eye, EyeOff, LoaderCircle, WalletCards } from 'lucide-vue-next'
import { toast } from 'vue-sonner'
import { getErrorMessage } from '~/helpers/apiHelper'
import { useAuthStore } from '~/features/auth/states/authStore'

definePageMeta({ layout: 'auth' })

const auth = useAuthStore()
const form = reactive({ email: '', password: '' })
const showPassword = ref(false)
const submitting = ref(false)
const fieldErrors = reactive({ email: '', password: '' })

async function submit(): Promise<void> {
  fieldErrors.email = ''
  fieldErrors.password = ''
  if (!form.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
    fieldErrors.email = 'Masukkan alamat email yang valid.'
  }
  if (!form.password) fieldErrors.password = 'Kata sandi wajib diisi.'
  if (fieldErrors.email || fieldErrors.password) return

  submitting.value = true
  try {
    await auth.login({ email: form.email.trim(), password: form.password })
    toast.success('Berhasil masuk. Selamat datang!')
    await navigateTo('/')
  } catch (error) {
    toast.error(getErrorMessage(error))
  } finally {
    submitting.value = false
  }
}
</script>

<template>
  <div>
    <div class="mb-8 flex h-12 w-12 items-center justify-center rounded-2xl bg-[#edf1ff] text-[#344dbd] lg:hidden"><WalletCards :size="23" /></div>
    <p class="mb-2 text-xs font-bold uppercase tracking-[.16em] text-[#566277]">Selamat datang kembali</p>
    <h1 class="text-3xl font-extrabold tracking-tight text-[#202b40]">Masuk ke akunmu</h1>
    <p class="mt-2 text-sm text-[#566277]">Lanjutkan perjalanan finansialmu hari ini.</p>
    <form class="mt-8 space-y-5" @submit.prevent="submit">
      <div><label for="login-email-input" class="label">Alamat email</label><input id="login-email-input" v-model="form.email" autocomplete="email" type="email" class="field" placeholder="nama@email.com" required><p v-if="fieldErrors.email" class="mt-1 text-xs text-red-700">{{ fieldErrors.email }}</p></div>
      <div><label for="login-password-input" class="label">Kata sandi</label><div class="relative"><input id="login-password-input" v-model="form.password" autocomplete="current-password" :type="showPassword ? 'text' : 'password'" class="field pr-11" placeholder="Masukkan kata sandi" required><button type="button" class="absolute right-3 top-1/2 -translate-y-1/2 text-[#566277]" :aria-label="showPassword ? 'Sembunyikan kata sandi' : 'Tampilkan kata sandi'" @click="showPassword = !showPassword"><EyeOff v-if="showPassword" :size="17" /><Eye v-else :size="17" /></button></div><p v-if="fieldErrors.password" class="mt-1 text-xs text-red-700">{{ fieldErrors.password }}</p></div>
      <button id="login-submit-button" class="btn-primary w-full !py-3" type="submit" :disabled="submitting">{{ submitting ? 'Sedang masuk...' : 'Masuk ke akun' }}<LoaderCircle v-if="submitting" :size="16" class="animate-spin" /><ArrowRight v-else :size="16" /></button>
    </form>
    <p class="mt-7 flex min-h-11 items-center justify-center gap-1 text-center text-xs text-[#566277]">Belum punya akun? <NuxtLink to="/auth/register" class="inline-flex min-h-11 items-center px-2 font-bold text-[#344dbd] hover:underline">Daftar sekarang</NuxtLink></p>
    <p class="mt-8 text-center text-[10px] text-[#566277]">Akun menggunakan Delcom Open API · koneksi aman</p>
  </div>
</template>
