// https://nuxt.com/docs/api/configuration/nuxt-config
import Aura from "@primeuix/themes/aura";
import tailwindcss from "@tailwindcss/vite";

export default defineNuxtConfig({
  compatibilityDate: "2026-04-07",
  devtools: { enabled: true },
  ssr: false, // Pure client-side tool for best performance and privacy

  modules: [
    "@primevue/nuxt-module",
    "@nuxt/eslint",
    "@vercel/analytics/nuxt",
    "@vercel/speed-insights/nuxt",
  ],

  css: ["@/assets/css/main.css"],

  vite: {
    plugins: [tailwindcss()],
    build: {
      sourcemap: false,
    },
    optimizeDeps: {
      include: [
        "date-fns",
        "date-fns/locale",
        "csv-parse/sync",
        "read-excel-file/browser",
        "csv-parse/browser/esm",
      ],
    },
  },

  primevue: {
    options: {
      theme: {
        preset: Aura,
        options: {
          darkModeSelector: ".dark-mode",
        },
      },
    },
  },

  app: {
    head: {
      htmlAttrs: {
        lang: "th",
      },
      title: "Doctor Aek DF Helper",
      meta: [
        { charset: "utf-8" },
        { name: "viewport", content: "width=device-width, initial-scale=1" },
        {
          name: "description",
          content:
            "ระบบช่วยสร้างรายงาน Doctor Fee สำหรับแพทย์เพิ่มพูนทักษะ โรงพยาบาลวิเศษชัยชาญ",
        },
      ],
      link: [
        {
          rel: "stylesheet",
          href: "https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap",
        },
      ],
    },
  },
});
