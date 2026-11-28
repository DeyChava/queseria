import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
// tailwindcss(): activa Tailwind (las clases de tu diseño HTML: bg-[#1a1a1a], text-amber-300, etc.)
export default defineConfig({
  plugins: [react(), tailwindcss()],
  // Pruebas (npm test): componentes con jsdom y servicios simulados
  test: { environment: 'jsdom', setupFiles: ['./src/test/setup.js'], css: false, include: ['src/**/*.test.{js,jsx}'] },
})
