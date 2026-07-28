import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import * as path from "node:path";

export default defineConfig({
  base: '/admin/',
  plugins: [react()],
  server: {
    port: 5174,
    host: true
  },
  resolve:{
    alias:{
      '@shared' : path.resolve(__dirname,'../shared-frontend'),
    }
  }
})
