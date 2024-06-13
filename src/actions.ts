import { defineAction, z } from "astro:actions";
import { CO2, db, eq } from "astro:db";

type Result = Array<{
  client: number;
  server: number;
  route: string;
  referer: string;
}>;

export const server = {
  getCo2: defineAction({
    input: z.object({
      referer: z.string(),
    }),
    handler: async ({ referer }): Promise<Result> => {
      const metrics = await db
        .select({
          client: CO2.client,
          server: CO2.server,
          route: CO2.route,
        })
        .from(CO2)
        .where(eq(CO2.referer, referer));
      return metrics;
    },
  }),
};