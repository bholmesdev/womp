// src/auth.ts
import { Lucia } from "lucia";
import { AstroDBAdapter } from "lucia-adapter-astrodb";
import { db, Session, User } from "astro:db";
import { GitHub } from "arctic";

export const github = (env: { GITHUB_ID: string; GITHUB_SECRET: string }) =>
  new GitHub(env.GITHUB_ID, env.GITHUB_SECRET);

const adapter = new AstroDBAdapter(db, Session, User);

export const lucia = new Lucia(adapter, {
  sessionCookie: {
    attributes: {
      // set to `true` when using HTTPS
      secure: true,
    },
  },
  getUserAttributes: (attributes) => {
    return {
      // attributes has the type of DatabaseUserAttributes
      githubId: attributes.github_id,
      username: attributes.username,
    };
  },
});

declare module "lucia" {
  interface Register {
    Lucia: typeof lucia;
    DatabaseUserAttributes: DatabaseUserAttributes;
  }
}

interface DatabaseUserAttributes {
  github_id: number;
  username: string;
}
