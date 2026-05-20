/**
 * Simple typed wrapper around process.env. Both Vercel and Node.js
 * runtimes populate process.env from configured environment variables,
 * so no special handling is needed.
 */
export function getEnv(name: string): string | undefined {
  return process.env[name];
}
