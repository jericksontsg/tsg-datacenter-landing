import { NextResponse } from "next/server";
import { getEnv } from "@/lib/env";

const SCADIANT_BASE = "https://tcore.scadiant.ai/api/public/v1";
const VALID_TIMEFRAMES = new Set(["1H", "24H", "7D", "30D"]);

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const timeframe = searchParams.get("timeframe") || "1H";
  const site = searchParams.get("site"); // optional

  if (!VALID_TIMEFRAMES.has(timeframe)) {
    return NextResponse.json(
      { error: "Invalid timeframe. Must be 1H, 24H, 7D, or 30D." },
      { status: 400 },
    );
  }

  const apiKey = getEnv("SCADIANT_API_KEY");
  if (!apiKey) {
    console.error("SCADIANT_API_KEY is not set");
    // TEMPORARY diagnostic — surface which bindings ARE visible to the
    // Worker so we can tell whether the secret is bound at all.
    // Remove this debug block once the env var pipeline is sorted.
    let cloudflareBindings: string[] = [];
    try {
      const cfModule = await import("@opennextjs/cloudflare");
      const { env } = cfModule.getCloudflareContext();
      cloudflareBindings = Object.keys(
        (env as Record<string, unknown> | undefined) ?? {},
      );
    } catch (e) {
      cloudflareBindings = [
        `(getCloudflareContext threw: ${(e as Error).message})`,
      ];
    }
    const processEnvKeys = Object.keys(process.env).filter(
      (k) =>
        !k.startsWith("npm_") &&
        !["PATH", "HOME", "PWD", "USER", "SHELL"].includes(k),
    );
    return NextResponse.json(
      {
        error: "Telemetry source not configured",
        debug: { cloudflareBindings, processEnvKeys },
      },
      { status: 503 },
    );
  }

  const url = new URL(`${SCADIANT_BASE}/production/`);
  url.searchParams.set("timeframe", timeframe);
  if (site) url.searchParams.set("site", site);

  try {
    const upstream = await fetch(url.toString(), {
      headers: {
        Authorization: `Bearer ${apiKey}`,
        Accept: "application/json",
      },
      // Cache server-side for 30s so a viral page-share doesn't hammer
      // Scadiant. Each unique timeframe is cached independently.
      next: { revalidate: 30 },
    });

    if (!upstream.ok) {
      const body = await upstream.text().catch(() => "");
      console.error("Scadiant upstream error:", upstream.status, body);
      // TEMP diagnostic: include upstream response body in our response
      // so we can see what Scadiant is complaining about.
      return NextResponse.json(
        {
          error: "Upstream telemetry error",
          status: upstream.status,
          upstreamBody: body,
        },
        { status: 502 },
      );
    }

    const data = await upstream.json();
    return NextResponse.json(data, {
      status: 200,
      // Let CDN edges hold this for the same 30s window.
      headers: { "Cache-Control": "public, s-maxage=30, stale-while-revalidate=60" },
    });
  } catch (err) {
    console.error("water-flows route error:", err);
    return NextResponse.json(
      { error: "Failed to fetch telemetry" },
      { status: 500 },
    );
  }
}
