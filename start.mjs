import { readFile } from 'node:fs/promises'
import { spawn } from 'node:child_process'

const envFile = await readFile(new URL('./.env', import.meta.url), 'utf8').catch((error) => {
  if (error.code === 'ENOENT') return ''
  throw error
})
const portLine = envFile.match(/^APP_PORT\s*=\s*(\d+)\s*$/m)
const port = Number(process.env.APP_PORT ?? portLine?.[1] ?? 3000)

if (!Number.isInteger(port) || port < 1 || port > 65535) {
  throw new Error('APP_PORT harus berupa angka antara 1 dan 65535.')
}

const child = spawn(process.execPath, ['.output/server/index.mjs'], {
  stdio: 'inherit',
  env: { ...process.env, APP_PORT: String(port), PORT: String(port), HOST: '0.0.0.0' },
})

child.on('error', (error) => {
  console.error('Gagal menjalankan Nuxt preview:', error)
  process.exitCode = 1
})
child.on('exit', (code, signal) => {
  if (signal) {
    process.kill(process.pid, signal)
    return
  }
  process.exitCode = code ?? 1
})
