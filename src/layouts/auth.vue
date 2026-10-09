<template>
  <main id="main-content" class="flex min-h-screen bg-white">
    <a href="#auth-content" class="skip-link">Lewati ke konten utama</a>
    <section class="relative hidden w-1/2 overflow-hidden bg-[#233da6] p-14 text-white lg:flex lg:flex-col lg:justify-between">
      <div class="absolute -right-32 -top-24 h-96 w-96 rounded-full bg-white/10" />
      <div class="absolute -bottom-40 -left-24 h-[30rem] w-[30rem] rounded-full border-[70px] border-white/10" />
      <NuxtLink to="/auth/login" class="relative flex items-center gap-3 font-extrabold tracking-tight">
        <span class="grid h-10 w-10 place-items-center rounded-xl bg-white text-[#3454db]">D</span>
        <span>delcom<span class="text-blue-200">.</span></span>
      </NuxtLink>
      <div class="relative max-w-xl">
        <p class="mb-4 text-xs font-bold uppercase tracking-[.25em] text-blue-200">Your money, in focus</p>
        <p class="text-5xl font-extrabold leading-[1.15] tracking-tight">Keuangan tertata,<br>hidup lebih lega.</p>
        <p class="mt-6 max-w-md text-sm leading-7 text-blue-100">Catat setiap pemasukan dan pengeluaran. Lihat gambaran keuanganmu dengan lebih jernih.</p>
        <div class="mt-10 inline-flex items-center gap-3 rounded-2xl border border-white/15 bg-white/10 p-4">
          <div class="flex -space-x-2"><span v-for="avatar in ['A', 'N', 'R']" :key="avatar" class="grid h-8 w-8 place-items-center rounded-full border-2 border-[#314aa9] bg-white text-xs font-bold text-[#3654d8]">{{ avatar }}</span></div>
          <span class="text-xs text-blue-100">Satu langkah kecil menuju kebiasaan finansial yang lebih baik.</span>
        </div>
      </div>
      <p class="relative text-xs text-blue-200">© 2026 Delcom Cash Flow. Kelola uang, jalani hari.</p>
    </section>
    <section id="auth-content" tabindex="-1" class="flex flex-1 items-center justify-center px-6 py-12 sm:px-12">
      <div class="w-full max-w-[430px]"><slot /></div>
    </section>
  </main>
</template>
