<script setup lang="ts">
import { LayoutDashboard, ArrowLeftRight, Users, UserRound, LogOut, Menu, X, Plus } from 'lucide-vue-next'
import { routes } from '~/routes'
import { getErrorMessage } from '~/helpers/apiHelper'
import { showErrorDialog } from '~/helpers/toolsHelper'
import { normalizePhotoUrl } from '~/helpers/toolsHelper'
import { useAuthStore } from '~/features/auth/states/authStore'

const auth = useAuthStore()
const menuOpen = ref(false)
const loggingOut = ref(false)
const route = useRoute()
const title = computed(() => {
  if (route.path === '/') return 'Dashboard'
  if (route.path === '/users') return 'Direktori Pengguna'
  if (route.path === '/profile') return 'Profil Saya'
  if (route.path.startsWith('/cash-flows/')) return 'Detail Transaksi'
  return 'Delcom Cash Flow'
})

async function logout(): Promise<void> {
  loggingOut.value = true
  try {
    await auth.logout()
    await navigateTo(routes.login)
  } catch (error) {
    await showErrorDialog('Gagal keluar', getErrorMessage(error))
  } finally {
    loggingOut.value = false
  }
}
</script>

<template>
  <div class="app-shell min-h-screen bg-[#f7f8fc]">
    <a href="#main-content" class="skip-link">Lewati ke konten utama</a>
    <aside class="sidebar fixed inset-y-0 left-0 z-30 hidden flex-col border-r border-[#edf0f5] bg-white px-5 py-6 sm:flex">
      <NuxtLink :to="routes.home" aria-label="Delcom Cash Flow - Beranda" class="mb-10 flex items-center gap-3 px-2">
        <span class="grid h-10 w-10 place-items-center rounded-xl bg-[#4969f5] text-lg font-extrabold text-white">D</span>
        <span class="sidebar-label text-[17px] font-extrabold tracking-tight text-[#1e2b46]">delcom<span class="text-[#344dbd]">.</span></span>
      </NuxtLink>
      <p class="sidebar-label mb-3 px-3 text-[10px] font-extrabold uppercase tracking-[.16em] text-[#566277]">Menu utama</p>
      <nav aria-label="Navigasi utama" class="flex flex-col gap-1.5">
        <NuxtLink :to="routes.home" aria-label="Ringkasan Arus Kas" class="nav-link"><LayoutDashboard :size="18" /><span class="sidebar-label">Ringkasan Arus Kas</span></NuxtLink>
        <NuxtLink to="/users" aria-label="Direktori Pengguna" class="nav-link"><Users :size="18" /><span class="sidebar-label">Direktori Pengguna</span></NuxtLink>
        <NuxtLink to="/profile" aria-label="Profil Saya" class="nav-link"><UserRound :size="18" /><span class="sidebar-label">Profil Saya</span></NuxtLink>
      </nav>
      <div class="mt-auto rounded-2xl bg-[#f4f6ff] p-4 sidebar-label">
        <div class="mb-2 grid h-9 w-9 place-items-center rounded-xl bg-white text-[#344dbd]"><ArrowLeftRight :size="17" /></div>
        <p class="text-xs font-bold text-[#344260]">Langkah kecil, hasil besar</p>
        <p class="mt-1 text-[10px] leading-5 text-[#566277]">Kebiasaan mencatat membantu kamu mengambil keputusan lebih baik.</p>
      </div>
      <div class="mt-4 flex items-center gap-3 rounded-xl px-2 py-3">
        <img v-if="auth.user?.photo" :src="normalizePhotoUrl(auth.user.photo)" class="h-9 w-9 rounded-full object-cover" alt="Foto profil">
        <div v-else class="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-[#e8edff] text-xs font-bold text-[#344dbd]">{{ auth.user?.name?.slice(0, 1).toUpperCase() ?? 'D' }}</div>
        <div class="sidebar-label min-w-0 flex-1"><p class="truncate text-xs font-bold text-[#303a4e]">{{ auth.user?.name ?? 'Pengguna' }}</p><p class="truncate text-[10px] text-[#566277]">{{ auth.user?.email }}</p></div>
      </div>
    </aside>

    <div class="main-area min-h-screen sm:ml-[78px] lg:ml-[256px]">
      <header class="sticky top-0 z-20 flex h-[76px] items-center justify-between border-b border-[#edf0f5] bg-white/90 px-5 backdrop-blur sm:px-8 lg:px-10">
        <div class="flex items-center gap-3">
          <button class="rounded-lg p-2 text-[#566277] sm:hidden" :aria-label="menuOpen ? 'Tutup menu' : 'Buka menu'" aria-controls="mobile-navigation" :aria-expanded="menuOpen" @click="menuOpen = !menuOpen"><Menu v-if="!menuOpen" :size="20" /><X v-else :size="20" /></button>
          <div><p class="text-[10px] font-semibold text-[#566277]">Delcom Cash Flow <span class="px-1">/</span> <span class="text-[#606c82]">{{ title }}</span></p><h1 class="mt-1 text-sm font-extrabold text-[#29364f] sm:text-base">{{ title }}</h1></div>
        </div>
        <div class="flex items-center gap-2 sm:gap-3">
          <NuxtLink to="/" class="btn-primary hidden !px-3 !py-2 text-[11px] sm:inline-flex"><Plus :size="15" /> Catat transaksi</NuxtLink>
          <button class="flex items-center gap-2 rounded-xl p-1.5 hover:bg-[#f5f6fa]" aria-label="Keluar" :disabled="loggingOut" @click="logout">
            <img v-if="auth.user?.photo" :src="normalizePhotoUrl(auth.user.photo)" class="h-8 w-8 rounded-full object-cover" alt="Foto profil">
            <span v-else class="grid h-8 w-8 place-items-center rounded-full bg-[#e8edff] text-xs font-bold text-[#344dbd]">{{ auth.user?.name?.slice(0, 1).toUpperCase() ?? 'D' }}</span>
            <span class="hidden max-w-32 truncate text-xs font-bold text-[#556176] md:inline">{{ auth.user?.name }}</span>
            <LogOut :size="15" class="text-[#566277]" />
          </button>
        </div>
      </header>
      <Transition name="fade">
        <nav v-if="menuOpen" id="mobile-navigation" aria-label="Navigasi utama" class="absolute inset-x-0 top-[76px] z-30 flex flex-col gap-1 border-b border-[#edf0f5] bg-white p-4 shadow-lg sm:hidden">
          <NuxtLink to="/" aria-label="Ringkasan Arus Kas" class="nav-link" @click="menuOpen = false"><LayoutDashboard :size="18" />Ringkasan Arus Kas</NuxtLink>
          <NuxtLink to="/users" aria-label="Direktori Pengguna" class="nav-link" @click="menuOpen = false"><Users :size="18" />Direktori Pengguna</NuxtLink>
          <NuxtLink to="/profile" aria-label="Profil Saya" class="nav-link" @click="menuOpen = false"><UserRound :size="18" />Profil Saya</NuxtLink>
        </nav>
      </Transition>
      <main id="main-content" tabindex="-1" class="px-5 py-7 sm:px-8 lg:px-10 lg:py-9">
        <slot />
      </main>
      <footer class="px-5 pb-6 text-center text-[10px] text-[#566277] sm:px-8 lg:px-10">Kelola keuangan dengan lebih sadar <span class="px-1">·</span> Delcom Cash Flow 2026</footer>
    </div>
  </div>
</template>

<style scoped>
.fade-enter-active,.fade-leave-active{transition:opacity .15s}.fade-enter-from,.fade-leave-to{opacity:0}
</style>
