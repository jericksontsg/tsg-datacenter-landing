import { NextResponse } from "next/server";

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

  const apiKey = process.env.SCADIANT_API_KEY;
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
      // Cache server-side for 30s so a viral page-share doesn't hammer
      // Scadiant. Each unique timeframe is cached independently.
      next: { revalidate: 30 },
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
