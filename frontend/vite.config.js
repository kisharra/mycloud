import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    host: true, 
    strictPort: true,
    hmr: {
      host: 'mycloud.kisharra-storage.ru',
      protocol: 'wss', 
      port: 443,
    },
    proxy: {
      '/api': 'http://localhost:8000',
      '/public': 'http://localhost:8000'
    }
  }
})