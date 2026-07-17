"use client";

import dynamic from "next/dynamic";
import { useCallback, useMemo, useRef, useState } from "react";
import type { Court, CourtSearchResult } from "@/lib/courts";

const CourtsMap = dynamic(() => import("@/components/CourtsMap"), {
  ssr: false,
  loading: () => (
    <div className="animate-pulse-soft h-[380px] w-full rounded-card border border-line bg-court-900 sm:h-[460px]" />
  ),
});

type SearchState =
  | { status: "idle" }
  | { status: "locating" }
  | { status: "searching" }
  | { status: "error"; message: string }
  | { status: "ready"; result: CourtSearchResult };

type EnvFilter = "all" | "outdoor" | "indoor";

const RADII = [5, 10, 15, 25, 50] as const;

export default function CourtsPage() {
  const [state, setState] = useState<SearchState>({ status: "idle" });
  const [query, setQuery] = useState("");
  const [radius, setRadius] = useState<number>(15);
  const [envFilter, setEnvFilter] = useState<EnvFilter>("all");
  const [litOnly, setLitOnly] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const lastSearch = useRef<{ q?: string; lat?: number; lng?: number } | null>(null);

  const runSearch = useCallback(
    async (params: { q?: string; lat?: number; lng?: number }, r: number) => {
      lastSearch.current = params;
      setState({ status: "searching" });
      setSelectedId(null);
      const sp = new URLSearchParams();
      if (params.q) sp.set("q", params.q);
      if (params.lat != null) sp.set("lat", String(params.lat));
      if (params.lng != null) sp.set("lng", String(params.lng));
      sp.set("radius", String(r));
      try {
        const res = await fetch(`/api/courts?${sp}`);
        const body = await res.json();
        if (!res.ok) throw new Error(body?.error ?? "Search failed.");
        setState({ status: "ready", result: body as CourtSearchResult });
      } catch (err) {
        setState({
          status: "error",
          message:
            err instanceof Error ? err.message : "Search failed. Try again.",
        });
      }
    },
    [],
  );

  const searchNearMe = useCallback(() => {
    if (!navigator.geolocation) {
      setState({
        status: "error",
        message:
          "Your browser doesn't support location — type a city or zip instead.",
      });
      return;
    }
    setState({ status: "locating" });
    navigator.geolocation.getCurrentPosition(
      (pos) =>
        runSearch({ lat: pos.coords.latitude, lng: pos.coords.longitude }, radius),
      () =>
        setState({
          status: "error",
          message:
            "Location access was denied — type a city, zip, or address instead.",
        }),
      { timeout: 12000, maximumAge: 120000 },
    );
  }, [radius, runSearch]);

  const changeRadius = useCallback(
    (r: number) => {
      setRadius(r);
      if (lastSearch.current) runSearch(lastSearch.current, r);
    },
    [runSearch],
  );

  const filtered = useMemo(() => {
    if (state.status !== "ready") return [];
    return state.result.courts.filter((c) => {
      if (envFilter === "outdoor" && c.indoor === true) return false;
      if (envFilter === "indoor" && c.indoor === false) return false;
      if (litOnly && c.lit !== true) return false;
      return true;
    });
  }, [state, envFilter, litOnly]);

  const selectFromMap = useCallback((id: string) => {
    setSelectedId(id);
    document
      .getElementById(`court-${id}`)
      ?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }, []);

  return (
    <div className="space-y-8">
      <section className="animate-rise">
        <h1 className="font-display text-3xl font-bold tracking-tight sm:text-4xl">
          Find a <span className="text-optic">court.</span>
        </h1>
        <p className="mt-2 max-w-xl text-chalk-dim">
          Live search of the world's mapped pickleball courts — near you or
          anywhere you're headed.
        </p>
      </section>

      {/* Search controls */}
      <section className="animate-rise rounded-card border border-line bg-court-900 p-5">
        <form
          className="flex flex-col gap-3 sm:flex-row"
          onSubmit={(e) => {
            e.preventDefault();
            if (query.trim()) runSearch({ q: query.trim() }, radius);
          }}
        >
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="City, zip, or address — e.g. “Sarasota FL”"
            aria-label="Search location"
            className="flex-1 rounded-full border border-court-600 bg-court-950 px-5 py-2.5 text-sm outline-none transition-colors placeholder:text-chalk-faint focus:border-optic"
          />
          <div className="flex gap-2">
            <button
              type="submit"
              disabled={!query.trim() || state.status === "searching"}
              className="flex-1 rounded-full bg-optic px-5 py-2.5 text-sm font-semibold text-court-950 transition-all hover:scale-[1.03] active:scale-95 disabled:opacity-40 disabled:hover:scale-100 sm:flex-none"
            >
              Search
            </button>
            <button
              type="button"
              onClick={searchNearMe}
              disabled={state.status === "locating" || state.status === "searching"}
              className="flex-1 rounded-full border border-court-600 px-5 py-2.5 text-sm font-medium transition-colors hover:border-optic hover:text-optic disabled:opacity-40 sm:flex-none"
            >
              {state.status === "locating" ? "Locating…" : "📍 Near me"}
            </button>
          </div>
        </form>

        <div className="mt-4 flex flex-wrap items-center gap-x-6 gap-y-3 text-sm">
          <label className="flex items-center gap-2 text-chalk-dim">
            Radius
            <select
              value={radius}
              onChange={(e) => changeRadius(Number(e.target.value))}
              className="rounded-full border border-court-600 bg-court-950 px-3 py-1 text-sm outline-none focus:border-optic"
            >
              {RADII.map((r) => (
                <option key={r} value={r}>
                  {r} km
                </option>
              ))}
            </select>
          </label>
          <div className="flex items-center gap-1.5" role="group" aria-label="Environment filter">
            {(["all", "outdoor", "indoor"] as const).map((f) => (
              <button
                key={f}
                type="button"
                onClick={() => setEnvFilter(f)}
                aria-pressed={envFilter === f}
                className={`rounded-full px-3 py-1 text-sm capitalize transition-colors ${
                  envFilter === f
                    ? "bg-chalk text-court-950 font-medium"
                    : "text-chalk-dim hover:text-chalk"
                }`}
              >
                {f}
              </button>
            ))}
          </div>
          <label className="flex cursor-pointer items-center gap-2 text-chalk-dim">
            <input
              type="checkbox"
              checked={litOnly}
              onChange={(e) => setLitOnly(e.target.checked)}
              className="h-4 w-4 accent-[#d7f549]"
            />
            Lit for night play
          </label>
        </div>
      </section>

      {/* Results */}
      {state.status === "idle" && (
        <div className="rounded-card border border-line bg-court-900 p-10 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-court-800 text-2xl">
            🗺️
          </div>
          <p className="font-display text-lg font-semibold">
            Where are you playing?
          </p>
          <p className="mx-auto mt-2 max-w-sm text-sm text-chalk-dim">
            Hit “Near me” or search any city — results come from OpenStreetMap's
            live community data.
          </p>
        </div>
      )}

      {(state.status === "searching" || state.status === "locating") && (
        <div className="space-y-4">
          <div className="animate-pulse-soft h-[380px] rounded-card border border-line bg-court-900 sm:h-[460px]" />
          <div className="animate-pulse-soft h-24 rounded-card border border-line bg-court-900" />
        </div>
      )}

      {state.status === "error" && (
        <div className="rounded-card border border-danger/30 bg-danger/5 p-6 text-center">
          <p className="text-sm text-danger">{state.message}</p>
        </div>
      )}

      {state.status === "ready" && (
        <div className="space-y-5">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <h2 className="font-display text-lg font-semibold">
              {filtered.length} court{filtered.length === 1 ? "" : "s"}{" "}
              <span className="font-normal text-chalk-dim">
                within {state.result.radiusKm} km of {state.result.center.label}
              </span>
            </h2>
            {filtered.length !== state.result.courts.length && (
              <span className="text-xs text-chalk-faint">
                {state.result.courts.length - filtered.length} hidden by filters
              </span>
            )}
          </div>

          <CourtsMap
            center={state.result.center}
            courts={filtered}
            selectedId={selectedId}
            onSelect={selectFromMap}
          />

          {filtered.length === 0 ? (
            <div className="rounded-card border border-line bg-court-900 p-8 text-center">
              <p className="font-display font-semibold">
                No mapped courts match
              </p>
              <p className="mx-auto mt-2 max-w-md text-sm text-chalk-dim">
                Try a wider radius or fewer filters. Community map data can lag
                reality —{" "}
                <a
                  className="text-optic underline underline-offset-2"
                  href={`https://www.google.com/maps/search/pickleball+courts/@${state.result.center.lat},${state.result.center.lng},12z`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  double-check on Google Maps ↗
                </a>
              </p>
            </div>
          ) : (
            <ul ref={listRef} className="stagger space-y-3">
              {filtered.map((c) => (
                <li
                  key={c.id}
                  id={`court-${c.id}`}
                  onClick={() => setSelectedId(c.id)}
                  className={`cursor-pointer rounded-card border bg-court-900 p-4 transition-all duration-200 sm:p-5 ${
                    selectedId === c.id
                      ? "border-optic/60 shadow-[0_0_20px_rgba(215,245,73,0.12)]"
                      : "border-line hover:border-court-600"
                  }`}
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="min-w-0">
                      <h3 className="font-display font-semibold">{c.name}</h3>
                      <p className="mt-0.5 text-sm text-chalk-dim">
                        {c.distanceKm < 1
                          ? `${Math.round(c.distanceKm * 1000)} m`
                          : `${c.distanceKm.toFixed(1)} km`}{" "}
                        away
                        {c.address && ` · ${c.address}`}
                      </p>
                      <div className="mt-2 flex flex-wrap gap-1.5 text-xs">
                        {c.indoor === true && <Chip>Indoor</Chip>}
                        {c.indoor === false && <Chip>Outdoor</Chip>}
                        {c.lit === true && <Chip>💡 Lit</Chip>}
                        {c.courtCount && <Chip>{c.courtCount} courts</Chip>}
                        {c.surface && <Chip>{c.surface}</Chip>}
                        {c.access === "private" && <Chip warn>Private</Chip>}
                        {c.access === "customers" && (
                          <Chip warn>Members/customers</Chip>
                        )}
                        {c.rating != null && (
                          <Chip>
                            ★ {c.rating.toFixed(1)} ({c.ratingCount})
                          </Chip>
                        )}
                      </div>
                    </div>
                    <div className="flex shrink-0 gap-2">
                      <a
                        href={c.directionsUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="rounded-full bg-optic px-4 py-1.5 text-sm font-semibold text-court-950 transition-transform hover:scale-105"
                      >
                        Directions
                      </a>
                      {c.osmUrl && (
                        <a
                          href={c.osmUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="rounded-full border border-court-600 px-4 py-1.5 text-sm text-chalk-dim transition-colors hover:border-optic hover:text-optic"
                        >
                          Details
                        </a>
                      )}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}

          <p className="text-xs text-chalk-faint">
            {state.result.provider === "google"
              ? "Results via Google Places."
              : "Results from OpenStreetMap community data (Overpass API) — coverage varies by area. Add a GOOGLE_MAPS_API_KEY to upgrade to Google Places search."}
          </p>
        </div>
      )}
    </div>
  );
}

function Chip({
  children,
  warn = false,
}: {
  children: React.ReactNode;
  warn?: boolean;
}) {
  return (
    <span
      className={`rounded-full px-2 py-0.5 font-medium ${
        warn
          ? "bg-danger/10 text-danger"
          : "bg-court-700 text-chalk-dim"
      }`}
    >
      {children}
    </span>
  );
}
