import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig(({ mode }) => ({
  plugins: [react()],
  define: {
    // Ensure proper environment variable handling
    'import.meta.env.DEV': mode === 'development',
    'import.meta.env.PROD': mode === 'production',
  },
  build: {
    // Additional security: drop console statements in production
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: mode === 'production',
        drop_debugger: true,
      },
    },
  },
}))
