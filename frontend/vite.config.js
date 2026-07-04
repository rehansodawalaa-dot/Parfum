import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('react') || id.includes('react-dom') || id.includes('react-router')) {
              return 'vendor'
            }
            if (id.includes('@tanstack') || id.includes('zustand') || id.includes('axios')) {
              return 'query'
            }
            if (id.includes('lucide') || id.includes('react-hot-toast') || id.includes('embla')) {
              return 'ui'
            }
          }
        },
      },
    },
    chunkSizeWarningLimit: 600,
  },
})
