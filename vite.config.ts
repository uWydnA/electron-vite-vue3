// vite.config.ts
import vue from "@vitejs/plugin-vue";
import AutoImport from "unplugin-auto-import/vite";
import { ElementPlusResolver } from "unplugin-vue-components/resolvers";
import Components from "unplugin-vue-components/vite";
import { defineConfig } from "vite";
import optimizer from "vite-plugin-optimizer";
import { buildPlugin } from "./plugin/buildPlugin";
import { devPlugin, getReplacer } from "./plugin/devPlugin";
export default defineConfig({
  plugins: [
    AutoImport({
      resolvers: [ElementPlusResolver()],
    }),
    Components({
      resolvers: [ElementPlusResolver()],
    }),
    optimizer(getReplacer()),
    devPlugin(),
    vue(),
  ],
  build: {
    rollupOptions: {
      plugins: [buildPlugin()],
    },
  },
});
