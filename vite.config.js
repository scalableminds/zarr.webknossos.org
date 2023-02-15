import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/
let config = {
  plugins: [react()],
};

export default defineConfig(config);
