// pages/login/github/index.ts
import { generateState } from "arctic";
import { github } from "../../../auth";

import type { APIContext } from "astro";

export const prerender = false;

export async function GET(context: APIContext): Promise<Response> {
  const state = generateState();
  const url = await github(context.locals.runtime.env).createAuthorizationURL(
    state
  );

  context.cookies.set("github_oauth_state", state, {
    path: "/",
    secure: true,
    httpOnly: true,
    maxAge: 60 * 10,
    sameSite: "lax",
  });

  return context.redirect(url.toString());
}
