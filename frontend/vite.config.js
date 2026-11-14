import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
<<<<<<< HEAD
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
// tailwindcss(): activa Tailwind (las clases de tu diseño HTML: bg-[#1a1a1a], text-amber-300, etc.)
export default defineConfig({
  plugins: [react(), tailwindcss()],
=======

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
>>>>>>> 6326c845b05ad7531bfcc6e2b845d3dbf811b438
})
