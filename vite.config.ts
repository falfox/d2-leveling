import { defineConfig } from "vite";
import reactRefresh from "@vitejs/plugin-react-refresh";
import removeConsolePlugin from "./plugins/remove-console";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [reactRefresh(), removeConsolePlugin()],
});
