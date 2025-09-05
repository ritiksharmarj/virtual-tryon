import tailwindcss from "@tailwindcss/vite";
import { defineConfig, type WxtViteConfig } from "wxt";

// See https://wxt.dev/api/config.html
export default defineConfig({
  srcDir: "src",
  outDir: "dist",
  entrypointsDir: "app",
  modules: ["@wxt-dev/module-react"],
  vite: () =>
    ({
      plugins: [tailwindcss()],
    }) as WxtViteConfig,
  manifest: {
    name: "Virtual Try-On",
    description: "Replace e-commerce models with your own photo using AI",
    permissions: ["storage", "activeTab", "contextMenus", "scripting"],
    host_permissions: ["https://*/*"],
    web_accessible_resources: [
      {
        resources: ["*.png", "*.jpg", "*.jpeg", "*.gif", "loading.gif"],
        matches: ["<all_urls>"],
      },
    ],
  },
});
