import type { APIRoute } from "astro";
// import { Headers, Response } from "@cloudflare/workers-types";

export const GET: APIRoute = async (ctx) => {
  const { key } = ctx.params;
  if (!key) return new Response(null, { status: 400 });

  const { R2 } = ctx.locals.runtime.env;
  const obj = await R2.get(key);

  if (obj === null) {
    return new Response(`${key} not found`, { status: 404 });
  }

  // const headers = new Headers();
  // obj.writeHttpMetadata(headers);

  // headers.set("etag", obj.httpEtag);

  return new Response(obj.body);
};
