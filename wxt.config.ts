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
    description: "Try on clothes online before you buy.",
    action: { default_title: "Virtual Try-On" },
    permissions: ["storage", "activeTab", "contextMenus", "scripting"],
    host_permissions: ["https://*/*", "http://*/*"],
    web_accessible_resources: [
      {
        matches: ["<all_urls>"],
        resources: ["*.png", "*.jpg", "*.jpeg", "*.webp"],
      },
    ],
  },
});
