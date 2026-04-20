import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// GitHub Pages serves the site under /<repo>/ — tomate
export default defineConfig({
  plugins: [react()],
  base: '/tomate/',
})
