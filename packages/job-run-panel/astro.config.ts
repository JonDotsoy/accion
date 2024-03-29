import { defineConfig } from "astro/config";
import tailwind from "@astrojs/tailwind";
import react from "@astrojs/react";

import node from "@astrojs/node";

// https://astro.build/config
export default defineConfig({
  // your configuration options here...
  // https://docs.astro.build/en/reference/configuration-reference/
  output: "static",
  cacheDir: new URL("./.cache/", import.meta.url).pathname,
  outDir: new URL("./static/", import.meta.url).pathname,
  srcDir: new URL("./www/", import.meta.url).pathname,
  server: {},
  devToolbar: {
    enabled: true,
  },
  integrations: [
    tailwind({
      configFile: new URL("./tailwind.config.mjs", import.meta.url).pathname,
    }),
    react(),
  ],
  adapter: node({
    mode: "standalone",
  }),
});
