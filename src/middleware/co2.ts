import { CO2, db, eq } from "astro:db";
import { defineMiddleware } from "astro:middleware";

const awsTotalMachineWatts = 174;
const awsUtilization = 0.3;
const awskW = (awsTotalMachineWatts * awsUtilization) / 1000;
const awsCO2_per_kWh = 0.000415755 * Math.pow(10, 6);

const userOperationalkWh_per_GB =
  (421 * Math.pow(10, 9)) / (5.29 * Math.pow(10, 12));
const userEmbodiedCO2_per_GB =
  (430 * Math.pow(10, 9)) / (5.29 * Math.pow(10, 12));
const userCO2_per_GB = userOperationalkWh_per_GB + userEmbodiedCO2_per_GB;

export const co2 = defineMiddleware(async (context, next) => {
  const referer = context.request.headers.get("Referer");
  // If no referer, we don't have a key to track for co2 analytics
  if (!referer) return next();

  const start = performance.now();
  const response = await next();

  if (context.url.href === referer) {
    await db.delete(CO2).where(eq(CO2.referer, referer));
  }
  if (!response.body) {
    const time = performance.now() - start;
    const hours = time / 1000 / 3600;
    const serverkWh = hours * awskW;
    const serverCO2 = serverkWh * awsCO2_per_kWh;

    await db
      .insert(CO2)
      .values({
        route: context.url.pathname,
        referer,
        client: 0,
        server: serverCO2,
      })
      .onConflictDoUpdate({
        target: CO2.route,
        set: {
          referer,
          client: 0,
          server: serverCO2,
        },
      });
    return response;
  }

  async function* render() {
    let clientBytes = 0;
    for await (const chunk of response.body as ReadableStream<ArrayBuffer>) {
      clientBytes += chunk.byteLength;
      yield chunk;
    }
    const time = performance.now() - start;
    const hours = time / 1000 / 3600;
    const serverkWh = hours * awskW;
    const serverCO2 = serverkWh * awsCO2_per_kWh;

    const clientkWh = (clientBytes / Math.pow(10, 12)) * userCO2_per_GB;
    const clientCO2 = clientkWh * awsCO2_per_kWh;

    await db
      .insert(CO2)
      .values({
        route: context.url.pathname,
        referer,
        client: clientCO2,
        server: serverCO2,
      })
      .onConflictDoUpdate({
        target: CO2.route,
        set: {
          referer,
          client: clientCO2,
          server: serverCO2,
        },
      });
  }

  // @ts-expect-error generator not assignable to ReadableStream
  return new Response(render(), { headers: response.headers });
});
