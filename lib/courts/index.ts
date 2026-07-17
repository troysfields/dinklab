/**
 * Court finder — provider-based, same philosophy as the feed:
 *   GooglePlacesProvider — richest data (ratings, photos) when
 *                          GOOGLE_MAPS_API_KEY is configured
 *   OverpassProvider     — OpenStreetMap community data, free, no key,
 *                          the always-available default
 * Geocoding for "at location" search uses Nominatim (OSM).
 */

export interface Court {
  id: string;
  name: string;
  lat: number;
  lng: number;
  distanceKm: number;
  /** Structured attributes for advanced filtering. */
  indoor: boolean | null;
  lit: boolean | null;
  courtCount: number | null;
  surface: string | null;
  access: "public" | "private" | "customers" | "unknown";
  address: string | null;
  /** Deep links out. */
  osmUrl?: string;
  directionsUrl: string;
  provider: "overpass" | "google";
  /** Google-only extras. */
  rating?: number;
  ratingCount?: number;
}

export interface CourtSearchResult {
  courts: Court[];
  center: { lat: number; lng: number; label: string };
  provider: "overpass" | "google";
  radiusKm: number;
}

export function haversineKm(
  aLat: number,
  aLng: number,
  bLat: number,
  bLng: number,
): number {
  const R = 6371;
  const dLat = ((bLat - aLat) * Math.PI) / 180;
  const dLng = ((bLng - aLng) * Math.PI) / 180;
  const s =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((aLat * Math.PI) / 180) *
      Math.cos((bLat * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(s));
}

const UA = { "User-Agent": "DinkLab/1.0 (pickleball court finder)" };

/** Nominatim geocoding — turns "Sarasota FL" into coordinates. */
export async function geocode(
  query: string,
): Promise<{ lat: number; lng: number; label: string } | null> {
  const url = new URL("https://nominatim.openstreetmap.org/search");
  url.search = new URLSearchParams({
    q: query,
    format: "json",
    limit: "1",
    addressdetails: "0",
  }).toString();
  const res = await fetch(url, {
    headers: UA,
    signal: AbortSignal.timeout(8000),
    next: { revalidate: 86400 }, // same place-name → same coords; cache a day
  });
  if (!res.ok) return null;
  const data = (await res.json()) as {
    lat: string;
    lon: string;
    display_name: string;
  }[];
  if (!data.length) return null;
  return {
    lat: parseFloat(data[0].lat),
    lng: parseFloat(data[0].lon),
    label: data[0].display_name.split(",").slice(0, 3).join(",").trim(),
  };
}

type OverpassElement = {
  type: "node" | "way" | "relation";
  id: number;
  lat?: number;
  lon?: number;
  center?: { lat: number; lon: number };
  tags?: Record<string, string>;
};

/** Public Overpass instances — rotated because each rate-limits per IP. */
const OVERPASS_ENDPOINTS = [
  "https://overpass-api.de/api/interpreter",
  "https://overpass.kumi.systems/api/interpreter",
  "https://overpass.osm.jp/api/interpreter",
];

/** OpenStreetMap Overpass — every mapped pickleball facility in radius. */
export async function searchOverpass(
  lat: number,
  lng: number,
  radiusKm: number,
): Promise<Court[]> {
  const r = Math.round(radiusKm * 1000);
  // sport=pickleball is the canonical tag; also catch multi-sport values
  const q = `
[out:json][timeout:12];
(
  nwr["sport"~"pickleball"](around:${r},${lat},${lng});
  nwr["leisure"="sports_centre"]["name"~"[Pp]ickle"](around:${r},${lat},${lng});
);
out center tags;`;

  let data: { elements: OverpassElement[] } | null = null;
  let lastErr: unknown = null;
  for (const endpoint of OVERPASS_ENDPOINTS) {
    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { ...UA, "Content-Type": "application/x-www-form-urlencoded" },
        body: `data=${encodeURIComponent(q)}`,
        signal: AbortSignal.timeout(14000),
      });
      if (!res.ok) throw new Error(`Overpass ${res.status}`);
      const text = await res.text();
      // Rate-limited instances return an XML/HTML error page with HTTP 200
      if (!text.trimStart().startsWith("{")) {
        throw new Error("Overpass rate-limited (non-JSON response)");
      }
      data = JSON.parse(text) as { elements: OverpassElement[] };
      break;
    } catch (err) {
      lastErr = err;
      // try the next mirror
    }
  }
  if (!data) throw lastErr ?? new Error("All Overpass mirrors failed");

  const courts = data.elements
    .map((el): Court | null => {
      const cLat = el.lat ?? el.center?.lat;
      const cLng = el.lon ?? el.center?.lon;
      if (cLat == null || cLng == null) return null;
      const t = el.tags ?? {};
      const indoor =
        t.indoor === "yes" || t.building != null
          ? true
          : t.indoor === "no" || t.leisure === "pitch"
            ? false
            : null;
      const address =
        [t["addr:housenumber"], t["addr:street"], t["addr:city"]]
          .filter(Boolean)
          .join(" ") || null;
      return {
        id: `${el.type}-${el.id}`,
        name:
          t.name ??
          (t.leisure === "pitch" ? "Pickleball court" : "Pickleball facility"),
        lat: cLat,
        lng: cLng,
        distanceKm: haversineKm(lat, lng, cLat, cLng),
        indoor,
        lit: t.lit === "yes" ? true : t.lit === "no" ? false : null,
        courtCount: t.courts ? parseInt(t.courts, 10) || null : null,
        surface: t.surface ?? null,
        access:
          t.access === "private"
            ? "private"
            : t.access === "customers"
              ? "customers"
              : t.access === "yes" || t.access === "public"
                ? "public"
                : "unknown",
        address,
        osmUrl: `https://www.openstreetmap.org/${el.type}/${el.id}`,
        directionsUrl: `https://www.google.com/maps/dir/?api=1&destination=${cLat},${cLng}`,
        provider: "overpass",
      };
    })
    .filter((c): c is Court => c !== null)
    .sort((a, b) => a.distanceKm - b.distanceKm);

  // De-dupe nodes that sit inside a mapped way (same facility twice)
  const deduped: Court[] = [];
  for (const c of courts) {
    const dup = deduped.find(
      (d) =>
        haversineKm(c.lat, c.lng, d.lat, d.lng) < 0.05 &&
        (d.name === c.name || d.name.startsWith("Pickleball")),
    );
    if (!dup) deduped.push(c);
  }
  return deduped;
}

/** Google Places (New) Text Search — used when GOOGLE_MAPS_API_KEY is set. */
export async function searchGooglePlaces(
  lat: number,
  lng: number,
  radiusKm: number,
): Promise<Court[]> {
  const key = process.env.GOOGLE_MAPS_API_KEY!;
  const res = await fetch(
    "https://places.googleapis.com/v1/places:searchText",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Goog-Api-Key": key,
        "X-Goog-FieldMask":
          "places.id,places.displayName,places.location,places.formattedAddress,places.rating,places.userRatingCount,places.googleMapsUri",
      },
      body: JSON.stringify({
        textQuery: "pickleball courts",
        locationBias: {
          circle: {
            center: { latitude: lat, longitude: lng },
            radius: Math.min(radiusKm * 1000, 50000),
          },
        },
        maxResultCount: 20,
      }),
      signal: AbortSignal.timeout(8000),
    },
  );
  if (!res.ok) throw new Error(`Google Places ${res.status}`);
  const data = (await res.json()) as {
    places?: {
      id: string;
      displayName?: { text: string };
      location: { latitude: number; longitude: number };
      formattedAddress?: string;
      rating?: number;
      userRatingCount?: number;
      googleMapsUri?: string;
    }[];
  };
  return (data.places ?? [])
    .map(
      (p): Court => ({
        id: p.id,
        name: p.displayName?.text ?? "Pickleball courts",
        lat: p.location.latitude,
        lng: p.location.longitude,
        distanceKm: haversineKm(lat, lng, p.location.latitude, p.location.longitude),
        indoor: null,
        lit: null,
        courtCount: null,
        surface: null,
        access: "unknown",
        address: p.formattedAddress ?? null,
        directionsUrl:
          p.googleMapsUri ??
          `https://www.google.com/maps/dir/?api=1&destination=${p.location.latitude},${p.location.longitude}`,
        provider: "google",
        rating: p.rating,
        ratingCount: p.userRatingCount,
      }),
    )
    .filter((c) => c.distanceKm <= radiusKm * 1.2)
    .sort((a, b) => a.distanceKm - b.distanceKm);
}
