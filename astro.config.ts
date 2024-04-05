import cloudflare from "@astrojs/cloudflare";
import tailwind from "@astrojs/tailwind";
import simpleStackForm from "simple-stack-form";
import react from "@astrojs/react";
import simpleScope from "vite-plugin-simple-scope";
import { defineConfig } from "astro/config";
import db from "@astrojs/db";

// https://astro.build/config
export default defineConfig({
  output: "server",
  adapter: cloudflare({
    platformProxy: {
      enabled: true,
    },
  }),
  integrations: [tailwind(), simpleStackForm(), react(), db()],
  vite: {
    plugins: [simpleScope()],
    optimizeDeps: {
      exclude: ["astro:db", "oslo"],
    },
  },
});
