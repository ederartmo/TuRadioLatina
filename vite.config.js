import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/stream-live': {
        target: 'http://31.97.168.251:8000',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/stream-live/, '/live'),
      },
      '/stream-status': {
        target: 'http://31.97.168.251:8000',
        changeOrigin: true,
        secure: false,
        rewrite: () => '/status-json.xsl',
      },
    },
  },
  preview: {
    proxy: {
      '/stream-live': {
        target: 'http://31.97.168.251:8000',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/stream-live/, '/live'),
      },
      '/stream-status': {
        target: 'http://31.97.168.251:8000',
        changeOrigin: true,
        secure: false,
        rewrite: () => '/status-json.xsl',
      },
    },
  },
})
