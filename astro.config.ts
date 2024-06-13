import cloudflare from "@astrojs/cloudflare";
import tailwind from "@astrojs/tailwind";
import simpleStackForm from "simple-stack-form";
import react from "@astrojs/react";
import { defineConfig } from "astro/config";
import db from "@astrojs/db";

import icon from "astro-icon";

// https://astro.build/config
export default defineConfig({
  output: "hybrid",
  adapter: cloudflare({
    platformProxy: {
      enabled: true,
    },
  }),
  integrations: [tailwind(), simpleStackForm(), react(), db(), icon()],
  vite: {
    optimizeDeps: {
      exclude: ["astro:db", "oslo"],
    },
  },
  experimental: {
    actions: true,
  },
});
