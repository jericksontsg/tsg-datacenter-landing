import { defineCloudflareConfig } from "@opennextjs/cloudflare";

// Minimal OpenNext config for Cloudflare Workers. Add KV/R2/D1
// bindings here later if we need ISR caching, image optimization
// storage, etc. For now the defaults (in-memory cache, no incremental
// regen) are fine for a marketing site.
export default defineCloudflareConfig({});
