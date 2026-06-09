import { defineConfig } from 'vite'
import { resolve } from 'path'

export default defineConfig({
  base: '/portfolio-hosting/',

  build: {
    sourcemap: false,
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        about: resolve(__dirname, 'about.html'),
        orbit: resolve(__dirname, 'orbit.html'),
        sentinel: resolve(__dirname, 'sentinel.html'),
        jsms: resolve(__dirname, 'jsms.html'),
        tools: resolve(__dirname, 'tools.html'),
      }
    }
  }
})