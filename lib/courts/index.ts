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

/**
 * Geocoding — turns "Sarasota FL" / "90210" / an address into coordinates.
 * Photon (OSM-based, fuzzy, abbreviation-tolerant) primary; Nominatim
 * fallback. Nominatim alone maps "Sarasota FL" to a bus stop — ask me how
 * I know.
 */
export async function geocode(
  query: string,
): Promise<{ lat: number; lng: number; label: string } | null> {
  try {
    const purl = new URL("https://photon.komoot.io/api/");
    purl.search = new URLSearchParams({ q: query, limit: "5" }).toString();
    const pres = await fetch(purl, {
      headers: UA,
      signal: AbortSignal.timeout(6000),
      next: { revalidate: 86400 },
    });
    if (pres.ok) {
      const pdata = (await pres.json()) as {
        features: {
          geometry: { coordinates: [number, number] };
          properties: {
            name?: string;
            type?: string;
            state?: string;
            country?: string;
            postcode?: string;
          };
        }[];
      };
      // Prefer settlements over counties/houses when both match
      const ranked = [...pdata.features].sort((a, b) => {
        const score = (f: (typeof pdata.features)[number]) =>
          ["city", "town", "village", "district"].includes(
            f.properties.type ?? "",
          )
            ? 0
            : f.properties.type === "county" || f.properties.type === "state"
              ? 1
              : 2;
        return score(a) - score(b);
      });
      const best = ranked[0];
      if (best) {
        const p = best.properties;
        return {
          lat: best.geometry.coordinates[1],
          lng: best.geometry.coordinates[0],
          label: [p.name ?? p.postcode, p.state ?? p.country]
            .filter(Boolean)
            .join(", "),
        };
      }
    }
  } catch {
    // fall through to Nominatim
  }

  const url = new URL("https://nominatim.openstreetmap.org/search");
  url.search = new URLSearchParams({
    q: query,
    format: "json",
    limit: "5",
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
    class?: string;
  }[];
  if (!data.length) return null;
  // Prefer actual places/boundaries over airports, buildings, etc. —
  // "Sarasota FL" should mean the city, not the aerodrome.
  const best =
    data.find((d) => d.class === "place" || d.class === "boundary") ?? data[0];
  return {
    lat: parseFloat(best.lat),
    lng: parseFloat(best.lon),
    label: best.display_name.split(",").slice(0, 2).join(",").trim(),
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

/**
 * Public Overpass instances — rotated because each rate-limits per IP.
 * Order chosen from measured behavior on Vercel egress IPs (July 2026):
 * maps.mail.ru is fast and lenient; overpass-api.de is authoritative backup.
 * (kumi.systems hangs and osm.jp has an expired cert — deliberately excluded.)
 */
const OVERPASS_ENDPOINTS = [
  "https://maps.mail.ru/osm/tools/overpass/api/interpreter",
  "https://overpass-api.de/api/interpreter",
];

/** OpenStreetMap Overpass — every mapped pickleball facility in radius. */
export async function searchOverpass(
  lat: number,
  lng: number,
  radiusKm: number,
): Promise<Court[]> {
  const r = Math.round(radiusKm * 1000);
  // sport=pickleball is the canonical tag; also catch multi-sport values
  // Single cheap clause — the canonical sport=pickleball tag (also matches
  // multi-sport values). Cost matters: shared-IP quotas reject heavy queries.
  const q = `
[out:json][timeout:10];
nwr["sport"~"pickleball"](around:${r},${lat},${lng});
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

  // Cluster: parks map each pitch separately, so N unnamed courts within
  // ~150m are one facility — collapse them and surface the count.
  const deduped: Court[] = [];
  for (const c of courts) {
    const near = deduped.find(
      (d) =>
        haversineKm(c.lat, c.lng, d.lat, d.lng) < 0.15 &&
        (d.name === c.name ||
          d.name.startsWith("Pickleball") ||
          c.name.startsWith("Pickleball")),
    );
    if (near) {
      near.courtCount = (near.courtCount ?? 1) + (c.courtCount ?? 1);
      // A named facility wins over "Pickleball court"
      if (near.name.startsWith("Pickleball") && !c.name.startsWith("Pickleball"))
        near.name = c.name;
      near.lit = near.lit ?? c.lit;
      near.surface = near.surface ?? c.surface;
      near.address = near.address ?? c.address;
    } else {
      deduped.push({ ...c });
    }
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
