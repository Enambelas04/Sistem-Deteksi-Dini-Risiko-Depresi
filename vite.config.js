import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    host: true,
    port: 5173,
    proxy: {
      // Saat dev (npm run dev / docker-compose.dev.yml), permintaan /api
      // diteruskan ke Flask. Di dalam docker, "backend" adalah nama service;
      // di luar docker (npm run dev biasa), ganti ke http://localhost:5000
      '/api': {
        target: 'http://backend:5000',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''),
      },
    },
  },
})
