import { CO2, db, eq } from "astro:db";
import { defineMiddleware } from "astro:middleware";

// Source: memory-intensive load for c5 processor
// https://medium.com/teads-engineering/estimating-aws-ec2-instances-power-consumption-c9745e347959
const awsTotalMachineWatts = 174;
// Fudge factor since we're not using the full machine
const awsUtilization = 0.1;
const awskW = (awsTotalMachineWatts * awsUtilization) / 1000;
// Source: cloud carbon footprint
// https://github.com/cloud-carbon-footprint/cloud-carbon-footprint/blob/e48c659f6dafc8b783e570053024f28b88aafc79/microsite/docs/Methodology.md#aws-2
const awsCO2_per_kWh = 0.000415755 * Math.pow(10, 6);

// Source: global averages per Sustainable Web Design model
// https://sustainablewebdesign.org/estimating-digital-emissions/#faq
const userOperationalkWh_per_GB =
  (421 * Math.pow(10, 9)) / (5.29 * Math.pow(10, 12));
const userEmbodiedCO2_per_GB =
  (430 * Math.pow(10, 9)) / (5.29 * Math.pow(10, 12));
const userCO2_per_GB = userOperationalkWh_per_GB + userEmbodiedCO2_per_GB;

export const co2 = defineMiddleware(async (context, next) => {
  if (context.url.pathname.endsWith("_actions/getCo2")) return next();

  const referer = context.request.headers.get("Referer");
  // If no referer, we don't have a key to track for co2 analytics
  if (!referer) return next();

  const start = performance.now();
  const response = await next();

  if (context.url.href === referer) {
    await db.delete(CO2).where(eq(CO2.referer, referer));
  }
  if (!response.body) {
    await db
      .insert(CO2)
      .values({
        route: context.url.pathname,
        referer,
        client: 0,
        server: getServerCO2(start),
      })
      .onConflictDoUpdate({
        target: CO2.route,
        set: {
          referer,
          client: 0,
          server: getServerCO2(start),
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
    await db
      .insert(CO2)
      .values({
        route: context.url.pathname,
        referer,
        client: getClientCO2(clientBytes),
        server: getServerCO2(start),
      })
      .onConflictDoUpdate({
        target: CO2.route,
        set: {
          referer,
          client: getClientCO2(clientBytes),
          server: getServerCO2(start),
        },
      });
  }

  // @ts-expect-error generator not assignable to ReadableStream
  return new Response(render(), { headers: response.headers });
});

function getServerCO2(start: number) {
  const time = performance.now() - start;
  const hours = time / 1000 / 3600;
  const serverkWh = hours * awskW;
  const serverCO2 = serverkWh * awsCO2_per_kWh;
  return serverCO2;
}

function getClientCO2(bytes: number) {
  const clientkWh = (bytes / Math.pow(10, 12)) * userCO2_per_GB;
  const clientCO2 = clientkWh * awsCO2_per_kWh;
  return clientCO2;
}
