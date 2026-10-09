<script setup lang="ts">
import { ArrowLeft, Home } from 'lucide-vue-next'
</script>

<template>
  <section class="mx-auto grid min-h-[60vh] max-w-lg place-items-center text-center"><div><p class="text-6xl font-extrabold tracking-tight text-[#344dbd]">404</p><h1 class="mt-3 text-xl font-extrabold text-[#29364f]">Halaman tidak ditemukan</h1><p class="mt-2 text-xs leading-6 text-[#566277]">Tautan yang kamu buka mungkin salah atau halamannya sudah dipindahkan.</p><div class="mt-6 flex justify-center gap-2"><button class="btn-ghost" @click="useRouter().back()"><ArrowLeft :size="14" /> Kembali</button><NuxtLink to="/" class="btn-primary"><Home :size="14" /> Ke dashboard</NuxtLink></div></div></section>
</template>
