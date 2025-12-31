// Services.js
import React, { useEffect, useMemo, useState } from "react";
import { Helmet } from "react-helmet-async";
import { motion } from "framer-motion";
import {
  Stethoscope,
  Heart,
  Activity,
  Shield,
  HeartPulse,
  Wind,
  Syringe,
  CheckCircle,
  Phone,
  ArrowRight,
} from "lucide-react";
import { servicesApi } from "@/utils/api";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const iconMap = {
  Stethoscope,
  Heart,
  Activity,
  Shield,
  HeartPulse,
  Wind,
  Syringe,
  CheckCircle,
};

export default function Services() {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);

  // ✅ Providers/PatientEducation-style static hero image (place file in /public/images/header/center2.jpg)
  const heroImage = "/images/header/center2.jpg";

  useEffect(() => {
    let isMounted = true;

    const fetchServices = async () => {
      try {
        setLoading(true);
        setLoadError(null);

        const response = await servicesApi.getAll();
        const data = Array.isArray(response?.data) ? response.data : [];

        if (!isMounted) return;
        setServices(data);
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error("Failed to fetch services:", error);
        if (!isMounted) return;
        setLoadError(error);
        setServices([]);
      } finally {
        if (!isMounted) return;
        setLoading(false);
      }
    };

    fetchServices();
    return () => {
      isMounted = false;
    };
  }, []);

  const fadeInUp = {
    initial: { opacity: 0, y: 22 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.55 },
  };

  // Normalize backend fields to prevent UI breaks
  const normalizedServices = useMemo(() => {
    const input = Array.isArray(services) ? services : [];
    return input.map((s, idx) => {
      const category =
        typeof s?.category === "string" && s.category.trim()
          ? s.category.trim()
          : "General";

      const title = s?.title ?? s?.name ?? s?.service_name ?? "Service";
      const description = s?.description ?? s?.details ?? s?.summary ?? "";

      const icon =
        typeof s?.icon === "string" && s.icon.trim()
          ? s.icon.trim()
          : "Stethoscope";

      const id = s?.service_id ?? s?.id ?? s?._id ?? `${category}-${idx}`;

      return {
        ...s,
        __id: String(id),
        __category: String(category),
        __title: String(title),
        __description: String(description),
        __icon: icon,
      };
    });
  }, [services]);

  // Group services and keep category order stable (General first, then A-Z)
  const groupedServices = useMemo(() => {
    const groups = normalizedServices.reduce((acc, service) => {
      const cat = service.__category;
      if (!acc[cat]) acc[cat] = [];
      acc[cat].push(service);
      return acc;
    }, {});

    return Object.entries(groups).sort(([a], [b]) => {
      if (a === "General") return -1;
      if (b === "General") return 1;
      return a.localeCompare(b);
    });
  }, [normalizedServices]);

  const hasServices = groupedServices.length > 0;

  return (
    <>
      <Helmet>
        <title>Services - Primary Care Services</title>
        <meta
          name="description"
          content="Comprehensive primary care services including internal medicine, diabetes screening, heart disease management, asthma care, and preventive medicine."
        />
      </Helmet>

      {/* Hero Section (PatientEducation-style) */}
      <section className="relative overflow-hidden" data-testid="services-hero">
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
                <Stethoscope className="w-5 h-5 text-white" />
                <span className="text-sm font-semibold tracking-wide uppercase text-white">
                  Our Services
                </span>
              </div>

              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-white mb-4">
                Comprehensive Care for Your Health
              </h1>

              <p className="text-base sm:text-lg md:text-xl text-white/90 leading-relaxed max-w-2xl mx-auto">
                From preventive care to chronic disease management, we offer a full range of primary care services to
                keep you and your family healthy.
              </p>

              <div className="mt-7 flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
                <Button
                  asChild
                  size="lg"
                  className="bg-primary text-primary-foreground hover:bg-primary/90 h-12 sm:h-14 px-7 sm:px-10 rounded-full font-medium shadow-md hover:shadow-lg transition-all"
                >
                  <a
                    href="https://livewell.aah.org/chart/openscheduling/standalone?id=A405777&vt=5662,5655,5633,11259"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Book Appointment <ArrowRight className="w-5 h-5 ml-2" />
                  </a>
                </Button>

                <Button
                  asChild
                  size="lg"
                  variant="outline"
                  className="h-12 sm:h-14 px-7 sm:px-10 rounded-full font-medium border-2 border-white/70 text-white hover:bg-white/10"
                >
                  <a href="tel:6304299000">
                    <Phone className="w-5 h-5 mr-2" />
                    (630) 429-9000
                  </a>
                </Button>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Services */}
      <section className="py-12 md:py-16 lg:py-20" data-testid="services-list">
        <div className="container mx-auto px-4 md:px-6 lg:px-8 max-w-7xl">
          {/* Heading row */}
          <motion.div {...fadeInUp} className="text-center mb-10 md:mb-12">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground mb-3">
              Explore Our Services
            </h2>
            <p className="text-sm sm:text-base md:text-lg text-muted-foreground max-w-2xl mx-auto">
              Browse services by category. If you don’t see what you’re looking for, contact us—we’re happy to help.
            </p>
            <div className="mt-5 flex flex-col sm:flex-row gap-3 justify-center">
              <Button asChild variant="outline" className="rounded-full">
                <Link to="/contact">
                  Contact Us <ArrowRight className="w-4 h-4 ml-2" />
                </Link>
              </Button>
              <Button asChild variant="outline" className="rounded-full">
                <Link to="/preventivecare">
                  Preventive Care <ArrowRight className="w-4 h-4 ml-2" />
                </Link>
              </Button>
            </div>
          </motion.div>

          {/* States */}
          {loading ? (
            <div className="text-center py-10">
              <p className="text-muted-foreground">Loading services...</p>
            </div>
          ) : loadError ? (
            <div className="text-center py-10">
              <p className="text-red-600 font-medium mb-2">Unable to load services.</p>
              <p className="text-muted-foreground">
                Please try again. If the issue continues, call us at{" "}
                <a className="underline" href="tel:6304299000">
                  (630) 429-9000
                </a>
                .
              </p>
            </div>
          ) : !hasServices ? (
            <div className="text-center py-10">
              <h3 className="text-xl sm:text-2xl md:text-3xl font-bold text-foreground mb-3">
                No services found
              </h3>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                The services catalog is currently empty. Try seeding the database or verify the{" "}
                <span className="font-mono">/api/services</span> endpoint is returning data.
              </p>
            </div>
          ) : (
            <div className="space-y-14 md:space-y-16">
              {groupedServices.map(([category, categoryServices], catIndex) => (
                <section key={category} aria-label={`${category} services`}>
                  <motion.div
                    {...fadeInUp}
                    transition={{ delay: Math.min(catIndex * 0.06, 0.3) }}
                    className="flex items-end justify-between gap-4 mb-6 md:mb-8"
                  >
                    <div className="w-full">
                      <h3 className="text-xl sm:text-2xl md:text-3xl font-bold text-foreground">
                        {category} Care
                      </h3>
                      <div className="mt-3 h-px w-full bg-border/50" />
                    </div>
                  </motion.div>

                  {/* Responsive grid: 1 mobile, 2 tablet, 3 desktop */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6 lg:gap-8">
                    {categoryServices.map((service, index) => {
                      const IconComponent = iconMap[service.__icon] || Stethoscope;

                      return (
                        <motion.div
                          key={service.__id}
                          {...fadeInUp}
                          transition={{
                            delay: Math.min(catIndex * 0.06 + index * 0.03, 0.35),
                          }}
                          className="bg-white p-6 md:p-7 rounded-2xl border border-border/60 shadow-[0_2px_10px_rgba(0,0,0,0.06)] hover:shadow-[0_14px_40px_rgba(0,0,0,0.10)] hover:-translate-y-1 transition-all duration-300"
                          data-testid={`service-card-${category}-${index}`}
                        >
                          <div className="flex items-start gap-4">
                            <div className="w-14 h-14 md:w-16 md:h-16 bg-gradient-to-br from-primary to-primary/80 rounded-xl flex items-center justify-center flex-shrink-0 shadow-md">
                              <IconComponent className="w-7 h-7 md:w-8 md:h-8 text-white" />
                            </div>

                            <div className="min-w-0">
                              <h4 className="text-lg md:text-xl font-semibold text-foreground mb-2">
                                {service.__title}
                              </h4>
                              <p className="text-sm md:text-base text-muted-foreground leading-relaxed">
                                {service.__description?.trim()
                                  ? service.__description
                                  : "Description coming soon."}
                              </p>
                            </div>
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                </section>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-12 md:py-16 bg-white" data-testid="services-cta">
        <div className="container mx-auto px-4 md:px-6 lg:px-8 max-w-7xl">
          <motion.div
            {...fadeInUp}
            className="bg-gradient-to-br from-primary to-primary/80 rounded-3xl p-7 sm:p-9 md:p-12 text-center"
          >
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-3">
              Not Sure Where to Start?
            </h2>
            <p className="text-sm sm:text-base md:text-lg text-white/90 mb-7 max-w-2xl mx-auto">
              Call us and we’ll help you choose the right visit type and next steps.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
              <a
                href="https://livewell.aah.org/chart/openscheduling/standalone?id=A405777&vt=5662,5655,5633,11259"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center bg-white text-primary hover:bg-white/90 h-12 px-8 rounded-full font-medium shadow-md hover:shadow-lg transition-all"
              >
                Book Appointment <ArrowRight className="w-5 h-5 ml-2" />
              </a>

              <a
                href="tel:6304299000"
                className="inline-flex items-center justify-center border-2 border-white text-white hover:bg-white/10 h-12 px-8 rounded-full font-medium transition-all"
              >
                <Phone className="w-5 h-5 mr-2" />
                Call (630) 429-9000
              </a>
            </div>
          </motion.div>
        </div>
      </section>
    </>
  );
}



