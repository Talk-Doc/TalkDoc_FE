import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'vite'

// 개발 서버에서 /api, /ws 요청을 백엔드(기본 localhost:8080)로 넘겨줍니다.
// 이렇게 하면 브라우저 입장에서는 같은 origin이라 CORS 설정 없이 바로 붙습니다.
// 백엔드 주소가 다르면 VITE_DEV_BACKEND_URL 환경변수로 바꿀 수 있습니다.
const backend = process.env.VITE_DEV_BACKEND_URL ?? 'http://localhost:8080'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    proxy: {
      '/api': { target: backend, changeOrigin: true },
      '/ws': { target: backend, changeOrigin: true, ws: true },
    },
  },
})
