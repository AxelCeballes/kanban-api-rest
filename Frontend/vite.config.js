import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Sin proxy: la API usa CORS abierto y su URL se define en VITE_API_URL (.env)
export default defineConfig({
  plugins: [react()],
});
