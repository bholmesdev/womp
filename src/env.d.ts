/// <reference path="../.astro/types.d.ts" />
/// <reference path="../.astro/db-types.d.ts" />
/// <reference types="astro/client" />
/// <reference types="simple-stack-form/types" />
/// <reference types="vite-plugin-simple-scope/types" />

interface CfEnv extends Env {
  GITHUB_ID: string;
  GITHUB_SECRET: string;
}

type Runtime = import("@astrojs/cloudflare").Runtime<CfEnv>;

declare namespace App {
  interface Locals extends Runtime {
    session: import("lucia").Session | null;
    user: import("lucia").User | null;
  }
}

declare namespace App {
	interface Locals {
		getActionResult: <T extends (...args: any) => any>(
			action: T
		) => Promise<Awaited<ReturnType<T>> | undefined>;
	}
}

declare module 'astro:actions' {
	export * from 'astro/actions/runtime/virtual/server.js';
}
