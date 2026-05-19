import { getCloudflareContext } from "@opennextjs/cloudflare";

/**
 * Read an environment variable that works in both:
 *   - Local dev / non-Cloudflare runtimes → process.env
 *   - Cloudflare Workers runtime → bindings exposed via getCloudflareContext
 *
 * Background: secrets set via the Cloudflare dashboard are bound to the
 * Worker runtime, but the OpenNext adapter's bridge to process.env can
 * be unreliable for secret-type bindings. The Cloudflare-native API is
 * to read them via getCloudflareContext().env, which always works at
 * runtime inside a request handler. process.env is the fallback so
 * `next dev` and any non-Cloudflare deploys still work.
 */
export function getEnv(name: string): string | undefined {
  const fromProcess = process.env[name];
  if (fromProcess) return fromProcess;

  try {
    const { env } = getCloudflareContext();
    const value = (env as Record<string, unknown> | undefined)?.[name];
    return typeof value === "string" ? value : undefined;
  } catch {
    return undefined;
  }
}
