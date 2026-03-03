import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes('node_modules')) return

          if (id.includes('react') || id.includes('scheduler')) {
            return 'react-vendor'
          }

          if (id.includes('react-router-dom') || id.includes('@remix-run/router')) {
            return 'router-vendor'
          }

          if (id.includes('@supabase') || id.includes('@supabase/supabase-js')) {
            return 'supabase-vendor'
          }

          if (id.includes('lucide-react')) {
            return 'icons-vendor'
          }

          return 'vendor'
        },
      },
    },
  },
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
