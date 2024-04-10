// pages/login/github/index.ts
import { generateState } from "arctic";
import { github } from "../../../auth";

import type { APIContext } from "astro";

export const prerender = false;

export async function GET(context: APIContext): Promise<Response> {
  const state = generateState();
  const url = await github.createAuthorizationURL(state);
  console.log(url, import.meta.env.GITHUB_ID);

  context.cookies.set("github_oauth_state", state, {
    path: "/",
    secure: import.meta.env.PROD,
    httpOnly: true,
    maxAge: 60 * 10,
    sameSite: "lax",
  });

  return context.redirect(url.toString());
}
