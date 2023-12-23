/// <reference path="../.astro/studio-types.d.ts" />
/// <reference path="../.astro/types.d.ts" />
/// <reference types="astro/client" />
/// <reference types="simple-stack-form/types" />
/// <reference types="vite-plugin-simple-scope/types" />

type ENV = {
  R2: import("@cloudflare/workers-types").R2Bucket;
};

type Runtime = import("@astrojs/cloudflare").AdvancedRuntime<ENV>;

declare namespace App {
  interface Locals extends Runtime {}
}
