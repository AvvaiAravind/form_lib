import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
import tsconfigPaths from 'vite-tsconfig-paths';
import path from "path"

export default defineConfig({
  plugins: [react(), tailwindcss(), tsconfigPaths()],
  // alias path
  resolve: {
    alias: {
      "@/src": path.resolve(__dirname, "./src"),
    },
  },
});
