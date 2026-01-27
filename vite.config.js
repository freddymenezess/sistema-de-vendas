import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@components": path.resolve(__dirname, "src/components"),
      "@pages": path.resolve(__dirname, "src/pages"),
      "@widgets": path.resolve(__dirname, "src/components/widgets"),
      "@services": path.resolve(__dirname, "src/services"),
      "@data": path.resolve(__dirname, "src/data"),
      "@routes": path.resolve(__dirname, "src/routes"),
      "@auth": path.resolve(__dirname, "src/auth"),
      "@hooks": path.resolve(__dirname, "src/hooks"),
      "@templates": path.resolve(__dirname, "src/templates"),
      "@context": path.resolve(__dirname, "src/context"),
      "@utils": path.resolve(__dirname, "src/utils"),
    },
  },
});
