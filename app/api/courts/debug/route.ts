import { NextResponse } from "next/server";
import { geocode, searchOverpass } from "@/lib/courts";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Temporary diagnostics: what does each Overpass mirror say from prod? */
export async function GET() {
  const q = `[out:json][timeout:8];(node["sport"="pickleball"](around:5000,27.3364,-82.5307););out 1;`;
  const endpoints = [
    "https://overpass-api.de/api/interpreter",
    "https://overpass.kumi.systems/api/interpreter",
    "https://maps.mail.ru/osm/tools/overpass/api/interpreter",
    "https://nominatim.openstreetmap.org/search?q=Sarasota&format=json&limit=1",
  ];
  const results = await Promise.all(
    endpoints.map(async (url) => {
      const started = Date.now();
      try {
        const isNominatim = url.includes("nominatim");
        const res = await fetch(url, {
          method: isNominatim ? "GET" : "POST",
          headers: {
            "User-Agent": "DinkLab/1.0 (pickleball court finder)",
            ...(isNominatim
              ? {}
              : { "Content-Type": "application/x-www-form-urlencoded" }),
          },
          ...(isNominatim ? {} : { body: `data=${encodeURIComponent(q)}` }),
          signal: AbortSignal.timeout(10000),
          cache: "no-store",
        });
        const text = await res.text();
        return {
          url,
          status: res.status,
          ms: Date.now() - started,
          head: text.slice(0, 80),
        };
      } catch (err) {
        return {
          url,
          status: 0,
          ms: Date.now() - started,
          head: err instanceof Error ? `${err.name}: ${err.message} ${String((err as NodeJS.ErrnoException).cause ?? "")}` : "unknown",
        };
      }
    }),
  );
  // Run the real pipeline and surface the raw error
  let pipeline: unknown;
  try {
    const geo = await geocode("Sarasota FL");
    if (!geo) {
      pipeline = "geocode returned null";
    } else {
      const courts = await searchOverpass(geo.lat, geo.lng, 15);
      pipeline = { ok: true, geo: geo.label, courts: courts.length };
    }
  } catch (err) {
    pipeline =
      err instanceof Error
        ? `${err.name}: ${err.message} | cause: ${String((err as NodeJS.ErrnoException).cause ?? "none")}`
        : String(err);
  }
  return NextResponse.json({ results, pipeline });
}
