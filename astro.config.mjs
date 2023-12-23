import { defineConfig, defineCollection, field } from "studio-private-beta";
import cloudflare from "@astrojs/cloudflare";
import tailwind from "@astrojs/tailwind";
import simpleStackForm from "simple-stack-form";
import react from "@astrojs/react";
import simpleScope from "vite-plugin-simple-scope";

const Board = defineCollection({
  fields: {
    name: field.text(),
  },
});

const Sound = defineCollection({
  fields: {
    boardId: field.text(),
    name: field.text(),
    audioUrl: field.text(),
  },
});

// https://astro.build/config
export default defineConfig({
  output: "server",
  adapter: cloudflare({
    runtime: {
      mode: "local",
    },
  }),
  integrations: [tailwind(), simpleStackForm(), react()],
  studio: {
    collections: { Board, Sound },
  },
  vite: {
    plugins: [simpleScope()],
  },
});
