import { defineConfig } from 'vite';
import path from 'path';

export default defineConfig({
  root: path.resolve(__dirname, 'public'), // Set the root directory
  build: {
    outDir: path.join(__dirname, 'dist'), // Output directory for build files
    rollupOptions: {
      input: path.resolve(__dirname, 'public/index.html') // Explicitly set the entry point
    }
  }
});
