import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  server: {
    host: true, // Cho phép truy cập từ bên ngoài container (0.0.0.0)
    port: 5173,
    strictPort: true, // Báo lỗi nếu cổng 5173 đã bị chiếm
    proxy: {
      '/api': {
        target: process.env.BACKEND_URL || 'http://127.0.0.1:8000', // Hỗ trợ biến môi trường khi deploy Docker
        changeOrigin: true,
      },
      '/ws': {
        target: process.env.WS_BACKEND_URL || 'ws://127.0.0.1:8000',
        ws: true,
      },
      '/media': {
        target: process.env.BACKEND_URL || 'http://127.0.0.1:8000',
        changeOrigin: true,
      }
    }
  }
})
