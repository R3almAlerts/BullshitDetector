// vite.config.ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173, // Fixed: Lock to port 5173 to prevent hopping
    host: true, // Optional: Allow access from network (e.g., 0.0.0.0:5173)
  },
});