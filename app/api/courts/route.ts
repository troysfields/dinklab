import { NextResponse } from "next/server";
import {
  geocode,
  searchGooglePlaces,
  searchOverpass,
  type CourtSearchResult,
} from "@/lib/courts";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * GET /api/courts?lat=..&lng=..&radius=10        (near me — browser coords)
 * GET /api/courts?q=Sarasota%20FL&radius=10      (at location — geocoded)
 */
export async function GET(req: Request) {
  const url = new URL(req.url);
  const q = url.searchParams.get("q")?.trim();
  let lat = parseFloat(url.searchParams.get("lat") ?? "");
  let lng = parseFloat(url.searchParams.get("lng") ?? "");
  const radiusKm = Math.min(
    Math.max(parseFloat(url.searchParams.get("radius") ?? "15") || 15, 1),
    80,
  );

  let label = "your location";
  if (q) {
    const geo = await geocode(q).catch(() => null);
    if (!geo) {
      return NextResponse.json(
        { error: `Couldn't find "${q}" — try a city, zip, or address.` },
        { status: 404 },
      );
    }
    ({ lat, lng } = geo);
    label = geo.label;
  }

  if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
    return NextResponse.json(
      { error: "Provide a location to search (or allow location access)." },
      { status: 400 },
    );
  }
  if (Math.abs(lat) > 90 || Math.abs(lng) > 180) {
    return NextResponse.json({ error: "Invalid coordinates." }, { status: 400 });
  }

  try {
    let result: CourtSearchResult;
    if (process.env.GOOGLE_MAPS_API_KEY) {
      try {
        const courts = await searchGooglePlaces(lat, lng, radiusKm);
        result = { courts, center: { lat, lng, label }, provider: "google", radiusKm };
      } catch {
        const courts = await searchOverpass(lat, lng, radiusKm);
        result = { courts, center: { lat, lng, label }, provider: "overpass", radiusKm };
      }
    } else {
      const courts = await searchOverpass(lat, lng, radiusKm);
      result = { courts, center: { lat, lng, label }, provider: "overpass", radiusKm };
    }
    return NextResponse.json(result);
  } catch (err) {
    console.error("[courts] search failed:", err);
    return NextResponse.json(
      {
        error:
          "Court search is busy right now (the free map service rate-limits). Give it a few seconds and try again.",
      },
      { status: 503 },
    );
  }
}
