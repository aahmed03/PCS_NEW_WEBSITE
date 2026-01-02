// Locations.js
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Helmet } from "react-helmet-async";
import { motion } from "framer-motion";
import { MapPin, Phone, Clock, Navigation, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { locationsApi } from "@/utils/api";

export default function Locations() {
  const heroImage = "/images/header/7.jpg";

  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);

  useEffect(() => {
    let mounted = true;

    const fetchLocations = async () => {
      try {
        setLoading(true);
        setLoadError(null);

        const response = await locationsApi.getAll();
        const data = Array.isArray(response?.data) ? response.data : [];

        if (!mounted) return;
        setLocations(data);
      } catch (error) {
        console.error("Failed to fetch locations:", error);
        if (!mounted) return;
        setLoadError(error);
        setLocations([]);
      } finally {
        if (!mounted) return;
        setLoading(false);
      }
    };

    fetchLocations();
    return () => {
      mounted = false;
    };
  }, []);

  const fadeInUp = {
    initial: { opacity: 0, y: 22 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.55 },
  };

  const DAYS_ORDER = useMemo(
    () => ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
    []
  );

  // ✅ Memoize helpers so useMemo dependencies are stable / lint-clean
  const buildAddressString = useCallback((location) => {
    const address = String(location?.address ?? "").trim();
    const city = String(location?.city ?? "").trim();
    const state = String(location?.state ?? "").trim();
    const zip = String(location?.zip_code ?? "").trim();
    const line2 = [city, state, zip].filter(Boolean).join(" ").trim();

    return [address, line2].filter(Boolean).join(", ");
  }, []);

  const normalizePhoneDigits = useCallback((phone) => String(phone || "").replace(/\D/g, ""), []);

  /**
   * ✅ FIX for "Invalid 'pb' parameter"
   * Many generated embed strings with `pb=!1m18!...` are brittle and often invalid.
   * We will:
   *  - Prefer coordinates if provided
   *  - Otherwise build a safe embed URL using q=<address>&output=embed (no API key)
   *  - Never pass through broken pb strings
   */
  const getSafeEmbedSrc = useCallback(
    (location) => {
      const lat = location?.latitude ?? location?.lat;
      const lng = location?.longitude ?? location?.lng;

      const hasLat =
        typeof lat === "number" || (typeof lat === "string" && lat.trim() !== "");
      const hasLng =
        typeof lng === "number" || (typeof lng === "string" && lng.trim() !== "");

      if (hasLat && hasLng) {
        return `https://www.google.com/maps?q=${encodeURIComponent(
          `${lat},${lng}`
        )}&output=embed`;
      }

      const addressQuery = buildAddressString(location);
      return `https://www.google.com/maps?q=${encodeURIComponent(addressQuery)}&output=embed`;
    },
    [buildAddressString]
  );

  const locationsView = useMemo(() => {
    const list = Array.isArray(locations) ? locations : [];
    return list.map((loc) => {
      const addressString = buildAddressString(loc);
      const phoneDigits = normalizePhoneDigits(loc?.phone);
      const safeEmbed = getSafeEmbedSrc(loc);

      const rawHours = loc?.hours && typeof loc.hours === "object" ? loc.hours : null;

      // Normalize hours into ordered rows
      const hoursRows = DAYS_ORDER.map((day) => {
        const val = rawHours?.[day];
        const text = val == null ? "Closed" : String(val).trim();
        return { day, hours: text.length ? text : "Closed" };
      });

      return {
        ...loc,
        _addressString: addressString,
        _phoneDigits: phoneDigits,
        _mapEmbedSrc: safeEmbed,
        _hoursRows: hoursRows,
      };
    });
  }, [locations, DAYS_ORDER, buildAddressString, normalizePhoneDigits, getSafeEmbedSrc]);

  const hasLocations = locationsView.length > 0;

  return (
    <>
      <Helmet>
        <title>Locations - Primary Care Services</title>
        <meta
          name="description"
          content="Primary Care Services locations in Lombard and Glendale Heights, IL. Find directions, hours, and contact information."
        />
      </Helmet>

      {/* Hero Section (PatientEducation-style) */}
      <section className="relative overflow-hidden" data-testid="locations-hero">
        <div
          className="relative w-full min-h-[320px] md:min-h-[420px] lg:min-h-[480px] flex items-center bg-slate-900"
          style={{
            backgroundImage: `url(${heroImage})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/55 to-black/25" />
          <div className="relative container mx-auto px-4 md:px-6 lg:px-8 max-w-7xl py-14 md:py-16 lg:py-20">
            <motion.div {...fadeInUp} className="max-w-3xl text-center mx-auto">
              <div className="inline-flex items-center gap-2 mb-4 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-md border border-white/20">
                <MapPin className="w-5 h-5 text-white" />
                <span className="text-sm font-semibold tracking-wide uppercase text-white">
                  Find Us
                </span>
              </div>

              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-white mb-4">
                Our Locations
              </h1>

              <p className="text-base sm:text-lg md:text-xl text-white/90 leading-relaxed max-w-2xl mx-auto">
                Two convenient locations in the Western Suburbs of Chicago—serving Lombard and Glendale Heights.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Locations List */}
      <section className="py-12 md:py-16 lg:py-20" data-testid="locations-list">
        <div className="container mx-auto px-4 md:px-6 lg:px-8 max-w-7xl">
          {loading ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">Loading locations...</p>
            </div>
          ) : loadError ? (
            <div className="text-center py-12">
              <div className="inline-flex items-center gap-2 text-red-600 font-semibold">
                <AlertTriangle className="w-5 h-5" />
                Unable to load locations
              </div>
              <p className="text-muted-foreground mt-2">
                Please refresh and try again. If the issue continues, call{" "}
                <a className="underline" href="tel:6304299000">
                  (630) 429-9000
                </a>
                .
              </p>
            </div>
          ) : !hasLocations ? (
            <div className="text-center py-12">
              <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-2">
                No locations found
              </h2>
              <p className="text-muted-foreground">
                The locations list is empty. Try seeding the database or check the{" "}
                <code>/api/locations</code> endpoint.
              </p>
            </div>
          ) : (
            <div className="space-y-10 md:space-y-12">
              {locationsView.map((location, index) => {
                const directionsUrl = `https://www.google.com/maps/search/${encodeURIComponent(
                  location._addressString
                )}`;

                return (
                  <motion.div
                    key={location.location_id ?? `${location.name}-${index}`}
                    {...fadeInUp}
                    transition={{ delay: Math.min(index * 0.08, 0.25) }}
                    className="bg-white rounded-2xl border border-border/60 shadow-[0_2px_10px_rgba(0,0,0,0.05)] overflow-hidden"
                    data-testid={`location-${index}`}
                  >
                    <div className="grid grid-cols-1 lg:grid-cols-2">
                      {/* Left: Info */}
                      <div className="p-6 sm:p-8 lg:p-10">
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <h2 className="text-2xl sm:text-3xl font-bold text-foreground">
                              {location.name}
                            </h2>
                            <p className="text-sm sm:text-base text-muted-foreground mt-1">
                              {location._addressString || "—"}
                            </p>
                          </div>

                          <div className="hidden sm:flex">
                            <Button asChild variant="outline" className="rounded-full">
                              <a href={directionsUrl} target="_blank" rel="noopener noreferrer">
                                <Navigation className="w-4 h-4 mr-2" />
                                Directions
                              </a>
                            </Button>
                          </div>
                        </div>

                        <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
                          {/* Address */}
                          <div className="rounded-xl border border-border/60 bg-slate-50 p-4">
                            <div className="flex items-start gap-3">
                              <div className="w-10 h-10 bg-gradient-to-br from-primary to-primary/80 rounded-lg flex items-center justify-center flex-shrink-0 shadow-sm">
                                <MapPin className="w-5 h-5 text-white" />
                              </div>
                              <div className="min-w-0">
                                <p className="text-sm font-semibold text-foreground">Address</p>
                                <p className="text-sm text-muted-foreground mt-1">
                                  {String(location.address ?? "").trim() || "—"}
                                </p>
                                <p className="text-sm text-muted-foreground">
                                  {String(location.city ?? "").trim()}
                                  {location.city ? "," : ""} {String(location.state ?? "").trim()}{" "}
                                  {String(location.zip_code ?? "").trim()}
                                </p>
                              </div>
                            </div>
                          </div>

                          {/* Contact */}
                          <div className="rounded-xl border border-border/60 bg-slate-50 p-4">
                            <div className="flex items-start gap-3">
                              <div className="w-10 h-10 bg-gradient-to-br from-primary to-primary/80 rounded-lg flex items-center justify-center flex-shrink-0 shadow-sm">
                                <Phone className="w-5 h-5 text-white" />
                              </div>
                              <div className="min-w-0">
                                <p className="text-sm font-semibold text-foreground">Contact</p>
                                <p className="text-sm text-muted-foreground mt-1">
                                  Phone:{" "}
                                  {location._phoneDigits ? (
                                    <a
                                      href={`tel:${location._phoneDigits}`}
                                      className="hover:text-primary underline-offset-2 hover:underline"
                                    >
                                      {location.phone}
                                    </a>
                                  ) : (
                                    <span>{location.phone || "—"}</span>
                                  )}
                                </p>
                                <p className="text-sm text-muted-foreground">
                                  Fax: {location.fax || "—"}
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Hours */}
                        <div className="mt-6 rounded-xl border border-border/60 bg-slate-50 p-4">
                          <div className="flex items-start gap-3">
                            <div className="w-10 h-10 bg-gradient-to-br from-primary to-primary/80 rounded-lg flex items-center justify-center flex-shrink-0 shadow-sm">
                              <Clock className="w-5 h-5 text-white" />
                            </div>
                            <div className="flex-1">
                              <p className="text-sm font-semibold text-foreground">Office Hours</p>

                              <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-2">
                                {location._hoursRows.map((row) => (
                                  <div key={row.day} className="flex justify-between gap-4 text-sm">
                                    <span className="text-muted-foreground font-medium">
                                      {row.day}
                                    </span>
                                    <span className="text-muted-foreground">{row.hours}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Buttons (mobile) */}
                        <div className="mt-6 sm:hidden">
                          <Button asChild className="w-full rounded-full">
                            <a href={directionsUrl} target="_blank" rel="noopener noreferrer">
                              <Navigation className="w-4 h-4 mr-2" />
                              Get Directions
                            </a>
                          </Button>
                        </div>
                      </div>

                      {/* Right: Map */}
                      <div className="relative min-h-[300px] sm:min-h-[360px] lg:min-h-[520px] bg-slate-100">
                        <iframe
                          src={location._mapEmbedSrc}
                          title={`Map of ${location.name}`}
                          className="absolute inset-0 w-full h-full"
                          style={{ border: 0 }}
                          loading="lazy"
                          referrerPolicy="no-referrer-when-downgrade"
                        />
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* Bottom Info Block */}
      <section className="py-14 md:py-18 bg-white" data-testid="locations-accessibility">
        <div className="container mx-auto px-4 md:px-6 lg:px-8 max-w-7xl">
          <motion.div
            {...fadeInUp}
            className="bg-gradient-to-br from-primary/5 to-secondary/5 rounded-2xl p-6 sm:p-8 md:p-10 border border-border/50"
          >
            <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-foreground mb-6 text-center">
              Accessibility & Parking
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm sm:text-base text-muted-foreground">
              <div className="bg-white/70 rounded-xl p-5 border border-border/40">
                <h3 className="font-semibold text-foreground mb-2">♿ Accessibility</h3>
                <p>
                  Both locations are designed to be accessible. If you need assistance, please call ahead and our staff will help.
                </p>
              </div>

              <div className="bg-white/70 rounded-xl p-5 border border-border/40">
                <h3 className="font-semibold text-foreground mb-2">🅿️ Parking</h3>
                <p>
                  Free on-site parking is available at both locations, including handicap-accessible spaces near entrances.
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    </>
  );
}


