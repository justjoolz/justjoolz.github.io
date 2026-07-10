import { defineConfig } from 'vite'
import { resolve } from 'path'

export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        music: resolve(__dirname, 'music/index.html'),
        story: resolve(__dirname, 'story/index.html'),
        process: resolve(__dirname, 'process/index.html'),
        systems: resolve(__dirname, 'systems/index.html'),
        notFound: resolve(__dirname, '404.html'),
      }
    }
  }
})
