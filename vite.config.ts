import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/postcss'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  css: {
    postcss: {
      plugins: [tailwindcss],
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          // Separate vendor chunks
          if (id.includes('node_modules')) {
            if (id.includes('react') || id.includes('react-dom')) {
              return 'react-vendor';
            }
            return 'vendor';
          }
          
          // Separate component chunks
          if (id.includes('PropertyModal') || id.includes('CompareModal')) {
            return 'modal-components';
          }
          
          // Keep large data file separate
          if (id.includes('properties.json')) {
            return 'data-full';
          }
          
          // Other components
          if (id.includes('src/components/')) {
            return 'components';
          }
        },
        chunkFileNames: 'assets/[name]-[hash].js'
      }
    },
    // Set chunk size warning limit to 800KB as per requirement
    chunkSizeWarningLimit: 800
  }
})
