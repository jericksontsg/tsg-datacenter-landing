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
    return NextResponse.json(
      { error: "Telemetry source not configured" },
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
      // Opt out of the Next.js Data Cache. Scadiant sends Cache-Control:
      // no-store, but Next.js ignores upstream cache headers and caches
      // by URL by default — we have to declare it per-call. Every render
      // now hits Scadiant fresh; the chart never serves stale buckets.
      cache: "no-store",
    });

    if (!upstream.ok) {
      const body = await upstream.text().catch(() => "");
      console.error("Scadiant upstream error:", upstream.status, body);
      return NextResponse.json(
        { error: "Upstream telemetry error", status: upstream.status },
        { status: 502 },
      );
    }

    const data = await upstream.json();
    return NextResponse.json(data, {
      status: 200,
      // Also disable any CDN-edge caching of OUR route's response — would
      // otherwise re-introduce the staleness one layer further out.
      headers: { "Cache-Control": "no-store" },
    });
  } catch (err) {
    console.error("water-flows route error:", err);
    return NextResponse.json(
      { error: "Failed to fetch telemetry" },
      { status: 500 },
    );
  }
}
