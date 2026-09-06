// Providers.js
// Page: /providers
//
// FIXES INCLUDED:
//
// 1️⃣ FIXED runtime error
//    heroBg was referenced but not defined.
//
// 2️⃣ FIXED build error
//    import must be at the top level.
//
// 3️⃣ API response parsing fixed
//    Backend returns: { count, items }
//
// 4️⃣ Safe provider id detection
//
// 5️⃣ Defensive rendering improvements
//
// 6️⃣ Safe async handling using isMounted flag

import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { motion } from "framer-motion";
import { ArrowRight, MapPin, Languages } from "lucide-react";
import { Button } from "@/components/ui/button";
import { providersApi } from "@/utils/api";

/* ✅ FIX: import must be at top level */
import heroImage from "../assets/hero/right2.jpg";

export default function Providers() {

  const [providers, setProviders] = useState([]);
  const [loading, setLoading] = useState(true);

  const providerPhotoFallback =
    "https://via.placeholder.com/900x900?text=Provider+Photo";

  /* fallback hero image if main image fails */
  const heroFallback =
    "data:image/svg+xml;charset=utf-8," +
    encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" width="1600" height="600">
<rect width="100%" height="100%" fill="#111827"/>
<text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle"
font-family="Arial" font-size="40" fill="#ffffff">
Providers
</text>
</svg>`);

  useEffect(() => {

    let isMounted = true;

    const fetchProviders = async () => {
      try {

        const response = await providersApi.getAll();

        let data = [];

        if (Array.isArray(response?.data)) {
          data = response.data;
        } else if (Array.isArray(response?.data?.items)) {
          data = response.data.items;
        }

        if (!isMounted) return;

        setProviders(data);

      } catch (error) {

        console.error("Failed to fetch providers:", error);

        if (!isMounted) return;

        setProviders([]);

      } finally {

        if (!isMounted) return;

        setLoading(false);

      }
    };

    fetchProviders();

    return () => {
      isMounted = false;
    };

  }, []);

  const fadeInUp = {
    initial: { opacity: 0, y: 24 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.55 },
  };

  return (
    <>
      <Helmet>
        <title>Our Providers - Primary Care Services</title>

        <meta
          name="description"
          content="Meet our board-certified primary care providers serving Lombard and Glendale Heights, IL. Experienced clinicians accepting new patients."
        />
      </Helmet>

      {/* Hero Section */}
      <section
        className="relative overflow-hidden"
        data-testid="providers-hero"
        style={{
          /* ✅ FIX: heroBg replaced with heroImage */
          backgroundImage: `url(${heroImage || heroFallback})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/55 to-black/25" />

        <div className="relative container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl py-12 sm:py-16 md:py-20 lg:py-24">

          <motion.div {...fadeInUp} className="text-center max-w-3xl mx-auto">

            <span className="text-xs sm:text-sm font-bold tracking-wide uppercase text-white/90">
              Our Medical Team
            </span>

            <h1 className="mt-2 mb-4 sm:mb-6 text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight leading-tight text-white">
              Meet Our Providers
            </h1>

            <p className="text-base sm:text-lg md:text-xl leading-relaxed text-white/90">
              Our board-certified clinicians bring years of experience and a
              commitment to compassionate, patient-centered care.
            </p>

          </motion.div>

        </div>
      </section>

      {/* Providers Grid */}
      <section
        className="py-10 sm:py-14 md:py-20 lg:py-24"
        data-testid="providers-list"
      >
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">

          {loading ? (

            <div className="text-center py-10">
              <p className="text-muted-foreground">Loading providers...</p>
            </div>

          ) : providers.length === 0 ? (

            <div className="text-center py-10">
              <p className="text-muted-foreground">
                No providers found. Please confirm the API is running and seed
                data is loaded.
              </p>
            </div>

          ) : (

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-7 lg:gap-8">

              {providers.map((provider, index) => {

                const languages = Array.isArray(provider?.languages)
                  ? provider.languages
                  : [];

                const locations = Array.isArray(provider?.locations)
                  ? provider.locations
                  : [];

                const providerId =
                  provider?.provider_id ??
                  provider?.id ??
                  provider?.providerId ??
                  null;

                const canNavigate = Boolean(providerId);

                return (

                  <motion.div
                    key={providerId ?? `${provider?.name ?? "provider"}-${index}`}
                    {...fadeInUp}
                    transition={{ delay: Math.min(index * 0.06, 0.3) }}
                    className="
                      bg-white overflow-hidden rounded-2xl border border-border/50
                      shadow-[0_2px_8px_rgba(0,0,0,0.04)]
                      hover:shadow-[0_8px_24px_rgba(0,0,0,0.08)]
                      group transition-all duration-300
                    "
                  >

                    {/* Provider Image */}
                    <div className="relative overflow-hidden">

                      <img
                        src={provider?.photo_url || providerPhotoFallback}
                        alt={provider?.name || "Provider"}
                        className="
                          w-full object-cover
                          h-56 sm:h-64 md:h-72 lg:h-80
                          group-hover:scale-105 transition-transform duration-300
                        "
                        onError={(e) => {
                          e.currentTarget.src = providerPhotoFallback;
                        }}
                        loading="lazy"
                      />

                      {provider?.accepting_patients && (
                        <div className="absolute top-3 right-3 sm:top-4 sm:right-4 bg-green-600 text-white px-3 py-1 rounded-full text-xs font-semibold shadow-sm">
                          Accepting Patients
                        </div>
                      )}

                    </div>

                    {/* Provider Info */}
                    <div className="p-5 sm:p-6">

                      <h3 className="text-xl sm:text-2xl font-semibold text-foreground mb-1">
                        {provider?.name}
                      </h3>

                      <p className="text-sm text-primary font-medium mb-2">
                        {provider?.credentials}
                      </p>

                      <p className="text-sm sm:text-base text-muted-foreground font-medium mb-4">
                        {provider?.specialty}
                      </p>

                      <div className="space-y-2 mb-6">

                        <div className="flex items-start gap-2">
                          <Languages className="w-4 h-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                          <p className="text-sm text-muted-foreground">
                            {languages.length ? languages.join(", ") : "—"}
                          </p>
                        </div>

                        <div className="flex items-start gap-2">
                          <MapPin className="w-4 h-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                          <p className="text-sm text-muted-foreground">
                            {locations.length ? locations.join(", ") : "—"}
                          </p>
                        </div>

                      </div>

                      {canNavigate ? (

                        <Button
                          asChild
                          className="w-full bg-primary text-primary-foreground hover:bg-primary/90 rounded-full"
                        >
                          <Link to={`/providers/${encodeURIComponent(providerId)}`}>
                            View Full Profile
                            <ArrowRight className="w-4 h-4 ml-2" />
                          </Link>
                        </Button>

                      ) : (

                        <Button
                          disabled
                          className="w-full rounded-full"
                          title="Provider record missing id"
                        >
                          View Full Profile
                          <ArrowRight className="w-4 h-4 ml-2" />
                        </Button>

                      )}

                    </div>

                  </motion.div>
                );

              })}

            </div>

          )}

        </div>
      </section>
    </>
  );
}

