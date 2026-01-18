// Home.js
// ✅ ADDITIONS:
// - Manual dots + arrows for slider
// - Pause on hover (and on keyboard focus within hero)
// - Keeps the "only one slide at a time" approach so links remain clickable
// ✅ LOGIN / 405 "Method Not Allowed" HARDENING:
// - Explicitly set type="button" on ALL <button> elements so they NEVER submit a parent <form>
//   (405 often comes from an accidental submit to /login or /api/login)

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Calendar,
  Phone,
  ArrowRight,
  Heart,
  Users,
  Shield,
  Clock,
  Award,
  MapPin,
  Stethoscope,
  Activity,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { providersApi, servicesApi, locationsApi } from '@/utils/api';

export default function Home() {
  const [providers, setProviders] = useState([]);
  const [services, setServices] = useState([]);
  const [locations, setLocations] = useState([]);

  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);

  // ✅ Hero slide index
  const [activeSlide, setActiveSlide] = useState(0);

  // ✅ FIX: pause on hover/focus for calmer clicking
  const [isPaused, setIsPaused] = useState(false);

  // ✅ optional: prevent rapid multi-click spam
  const lastNavAtRef = useRef(0);
  const NAV_THROTTLE_MS = 250;

  const heroSlides = useMemo(
    () => [
      {
        key: 'slide-1',
        image: '/images/header/center01.jpg',
        alt: 'Primary Care Services',
      },
      {
        key: 'slide-2',
        image: '/images/header/left01.jpg',
        alt: 'Preventive Care Programs',
      },
      {
        key: 'slide-3',
        image: '/images/header/right01.jpg',
        alt: 'Meet Our Providers',
      },
    ],
    []
  );

  const heroFallback =
    'data:image/svg+xml;charset=utf-8,' +
    encodeURIComponent(
      `<svg xmlns="http://www.w3.org/2000/svg" width="1600" height="900">
        <rect width="100%" height="100%" fill="#111827"/>
        <text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle"
              font-family="Arial" font-size="42" fill="#ffffff">
          Hero Image Missing
        </text>
      </svg>`
    );

  // ✅ preload/decode hero images
  useEffect(() => {
    let cancelled = false;

    const preloadAndDecode = async (src) => {
      await new Promise((resolve) => {
        const img = new Image();
        img.onload = async () => {
          if (img.decode) {
            try {
              await img.decode();
            } catch {
              // ignore decode failures
            }
          }
          resolve(true);
        };
        img.onerror = () => resolve(false);
        img.src = src;
      });
    };

    (async () => {
      for (const s of heroSlides) {
        if (cancelled) return;
        await preloadAndDecode(s.image);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [heroSlides]);

  // ✅ manual controls helpers
  const safeSetSlide = (nextIndex) => {
    const now = Date.now();
    if (now - lastNavAtRef.current < NAV_THROTTLE_MS) return;
    lastNavAtRef.current = now;

    const len = heroSlides.length;
    const normalized = ((nextIndex % len) + len) % len;
    setActiveSlide(normalized);
  };

  const goNext = () => safeSetSlide(activeSlide + 1);
  const goPrev = () => safeSetSlide(activeSlide - 1);
  const goTo = (index) => safeSetSlide(index);

  // ✅ auto-advance timer (pauses on hover/focus)
  useEffect(() => {
    if (isPaused) return;

    const interval = setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % heroSlides.length);
    }, 6000);

    return () => clearInterval(interval);
  }, [heroSlides.length, isPaused]);

  // ✅ optional: keyboard nav when hero is hovered/focused (Left/Right)
  useEffect(() => {
    const onKeyDown = (e) => {
      if (!isPaused) return; // only when user is "interacting" (paused)
      if (e.key === 'ArrowLeft') goPrev();
      if (e.key === 'ArrowRight') goNext();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isPaused, activeSlide]);

  // Data fetching
  useEffect(() => {
    let isMounted = true;

    const fetchData = async () => {
      try {
        setLoading(true);
        setLoadError(null);

        const [providersRes, servicesRes, locationsRes] = await Promise.all([
          providersApi.getAll(),
          servicesApi.getAll(),
          locationsApi.getAll(),
        ]);

        const providersData = Array.isArray(providersRes?.data) ? providersRes.data : [];
        const servicesData = Array.isArray(servicesRes?.data) ? servicesRes.data : [];
        const locationsData = Array.isArray(locationsRes?.data) ? locationsRes.data : [];

        if (!isMounted) return;

        setProviders(providersData.slice(0, 3));
        setServices(servicesData.slice(0, 6));
        setLocations(locationsData);
      } catch (error) {
        if (!isMounted) return;
        console.error('Failed to fetch data:', error);
        setLoadError(error);
      } finally {
        if (!isMounted) return;
        setLoading(false);
      }
    };

    fetchData();
    return () => {
      isMounted = false;
    };
  }, []);

  const fadeInUp = {
    initial: { opacity: 0, y: 30 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6 },
  };

  const providerPhotoFallback = 'https://via.placeholder.com/800x600?text=Provider+Photo';

  const slideVariants = {
    initial: { opacity: 0 },
    animate: { opacity: 1, transition: { duration: 0.8, ease: 'easeInOut' } },
    exit: { opacity: 0, transition: { duration: 0.6, ease: 'easeInOut' } },
  };

  return (
    <>
      <Helmet>
        <title>Primary Care Services - Your Health, Our Priority | Lombard & Glendale Heights, IL</title>
        <meta
          name="description"
          content="Comprehensive primary care services in Lombard and Glendale Heights, IL. NCQA-recognized practice offering preventive care, annual wellness visits, and same-day appointments."
        />
      </Helmet>

      {/* =========================
          HERO (dots/arrows + pause on hover)
          ========================= */}
      <section className="relative overflow-hidden" data-testid="hero-section">
        <div
          className="relative w-full h-[460px] sm:h-[520px] md:h-[620px] lg:h-[720px] overflow-hidden bg-slate-900"
          style={{
            backgroundImage: `url(${heroSlides[0].image})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
          onFocusCapture={() => setIsPaused(true)}
          onBlurCapture={(e) => {
            if (!e.currentTarget.contains(e.relatedTarget)) setIsPaused(false);
          }}
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={heroSlides[activeSlide].key}
              className="absolute inset-0"
              variants={slideVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              style={{ pointerEvents: 'auto' }}
            >
              <img
                src={heroSlides[activeSlide].image}
                alt={heroSlides[activeSlide].alt}
                className="w-full h-full object-cover"
                loading="eager"
                fetchPriority="high"
                decoding="sync"
                onError={(e) => (e.currentTarget.src = heroFallback)}
              />

              <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/50 to-transparent flex items-center">
                <div className="container mx-auto px-4 sm:px-6 md:px-10 lg:px-12 max-w-7xl">
                  {activeSlide === 0 && (
                    <div className="mx-auto text-center max-w-3xl">
                      <div className="inline-block mb-4 px-4 py-2 bg-primary/20 backdrop-blur-sm rounded-md border border-white/30">
                        <span className="text-xs sm:text-sm font-medium text-white tracking-wide uppercase">
                          NCQA Recognized Practice
                        </span>
                      </div>

                      <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold text-white mb-3 sm:mb-4 md:mb-6 leading-tight">
                        Comprehensive Primary Care
                      </h1>

                      <p className="text-base sm:text-lg md:text-xl lg:text-2xl text-white/95 mb-6 md:mb-8 leading-relaxed">
                        Your first choice for quality healthcare
                      </p>

                      <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
                        <Link
                          to="/services"
                          className="inline-flex items-center justify-center px-6 sm:px-8 py-3 sm:py-4 bg-primary text-white font-semibold text-base sm:text-lg rounded-md hover:bg-primary/90 transition-all shadow-lg hover:shadow-xl"
                        >
                          Our Services <ArrowRight className="w-5 h-5 ml-2" />
                        </Link>

                        <a
                          href="tel:6304299000"
                          className="inline-flex items-center justify-center px-6 sm:px-8 py-3 sm:py-4 bg-white/10 backdrop-blur-sm text-white font-semibold text-base sm:text-lg rounded-md border-2 border-white hover:bg-white/20 transition-all"
                        >
                          <Phone className="w-5 h-5 mr-2" />
                          (630) 429-9000
                        </a>
                      </div>
                    </div>
                  )}

                  {activeSlide === 1 && (
                    <div className="max-w-xl md:max-w-2xl">
                      <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-3 md:mb-6 leading-tight">
                        Preventive Care Programs
                      </h1>
                      <p className="text-base sm:text-lg md:text-xl lg:text-2xl text-white/95 mb-6 md:mb-8 leading-relaxed">
                        Annual wellness visits, screenings, and immunizations
                      </p>

                      <Link
                        to="/preventive-care"
                        className="inline-flex items-center px-6 sm:px-8 py-3 sm:py-4 bg-primary text-white font-semibold text-base sm:text-lg rounded-md hover:bg-primary/90 transition-all shadow-lg hover:shadow-xl"
                      >
                        Learn More <ArrowRight className="w-5 h-5 ml-2" />
                      </Link>
                    </div>
                  )}

                  {activeSlide === 2 && (
                    <div className="max-w-xl md:max-w-2xl">
                      <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-3 md:mb-6 leading-tight">
                        Meet Our Providers
                      </h1>
                      <p className="text-base sm:text-lg md:text-xl lg:text-2xl text-white/95 mb-6 md:mb-8 leading-relaxed">
                        Experienced, board-certified clinicians dedicated to your health
                      </p>

                      <Link
                        to="/providers"
                        className="inline-flex items-center px-6 sm:px-8 py-3 sm:py-4 bg-primary text-white font-semibold text-base sm:text-lg rounded-md hover:bg-primary/90 transition-all shadow-lg hover:shadow-xl"
                      >
                        Our Providers <ArrowRight className="w-5 h-5 ml-2" />
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          </AnimatePresence>

          {/* ✅ Arrows */}
          <div className="absolute inset-y-0 left-0 right-0 flex items-center justify-between px-3 sm:px-4 md:px-6 z-20 pointer-events-none">
            <button
              type="button" // ✅ IMPORTANT: never submit a form
              onClick={() => {
                setIsPaused(true);
                goPrev();
              }}
              className="pointer-events-auto inline-flex items-center justify-center w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-black/30 hover:bg-black/45 border border-white/30 backdrop-blur-sm text-white transition"
              aria-label="Previous slide"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>

            <button
              type="button" // ✅ IMPORTANT: never submit a form
              onClick={() => {
                setIsPaused(true);
                goNext();
              }}
              className="pointer-events-auto inline-flex items-center justify-center w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-black/30 hover:bg-black/45 border border-white/30 backdrop-blur-sm text-white transition"
              aria-label="Next slide"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>

          {/* ✅ Dots */}
          <div className="absolute bottom-5 sm:bottom-6 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2">
            {heroSlides.map((_, idx) => {
              const isActive = idx === activeSlide;
              return (
                <button
                  key={`dot-${idx}`}
                  type="button" // ✅ IMPORTANT: never submit a form
                  onClick={() => {
                    setIsPaused(true);
                    goTo(idx);
                  }}
                  aria-label={`Go to slide ${idx + 1}`}
                  aria-current={isActive ? 'true' : 'false'}
                  className={[
                    'h-2.5 rounded-full transition-all border border-white/40 bg-white/40 hover:bg-white/70',
                    isActive ? 'w-8 bg-white/90' : 'w-2.5',
                  ].join(' ')}
                />
              );
            })}
          </div>

          {/* Stats Badge */}
          <motion.div
            className="absolute bottom-6 right-6 bg-white p-5 rounded-xl shadow-2xl border border-border z-20 hidden md:block"
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ delay: 0.8, duration: 0.5, ease: 'easeOut' }}
          >
            <div className="flex items-center space-x-3">
              <motion.div
                className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center"
                initial={{ rotate: -10 }}
                animate={{ rotate: 0 }}
                transition={{ delay: 1, duration: 0.4 }}
              >
                <Award className="w-6 h-6 text-primary" />
              </motion.div>
              <div>
                <motion.p
                  className="text-3xl font-bold text-foreground"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 1.1, duration: 0.4 }}
                >
                  20+
                </motion.p>
                <p className="text-sm text-muted-foreground font-medium">Years of Care</p>
              </div>
            </div>
          </motion.div>

          {isPaused && (
            <div className="absolute top-4 right-4 z-20 hidden sm:inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/30 border border-white/25 text-white/90 text-xs backdrop-blur-sm">
              <span className="inline-block w-2 h-2 rounded-full bg-white/80" />
              Paused
            </div>
          )}
        </div>
      </section>

      {/* Optional UX states */}
      {loading && (
        <section className="py-8">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl text-center">
            <p className="text-muted-foreground">Loading home page content…</p>
          </div>
        </section>
      )}

      {loadError && (
        <section className="py-8">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl text-center">
            <p className="text-red-600 font-medium">Some content couldn’t be loaded. Please refresh.</p>
          </div>
        </section>
      )}

      {/* Why Choose Us */}
      <section className="py-14 sm:py-16 md:py-24 lg:py-32" data-testid="why-choose-us-section">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
          <motion.div {...fadeInUp} className="text-center mb-10 sm:mb-12 md:mb-16">
            <span className="text-sm font-bold tracking-wide uppercase text-primary">Why Choose Us</span>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight text-foreground mt-2">
              Excellence in Primary Care
            </h2>
            <p className="text-base leading-relaxed text-muted-foreground mt-4 max-w-2xl mx-auto">
              We believe that you, as the patient, are at the core of your healthcare experience. Our commitment is to
              deliver the utmost respect and expertise you deserve.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6 md:gap-8">
            {[
              {
                icon: Heart,
                title: 'Patient-Centered Medical Home',
                description:
                  'NCQA-recognized practice focused on long-term health and wellness through coordinated, comprehensive care.',
              },
              {
                icon: Users,
                title: 'Board-Certified Providers',
                description: 'Experienced providers dedicated to delivering personalized care in a relaxed environment.',
              },
              {
                icon: Clock,
                title: 'Same-Day Appointments',
                description: 'Convenient access to care when you need it most. We prioritize timely appointments.',
              },
              {
                icon: Shield,
                title: 'Preventive Care Focus',
                description: 'Early detection and intervention through wellness programs and regular screenings.',
              },
              {
                icon: MapPin,
                title: 'Two Convenient Locations',
                description: 'Serving Lombard and Glendale Heights with accessible, modern facilities and ample parking.',
              },
              {
                icon: Activity,
                title: '24/7 Patient Portal Access',
                description: 'View appointments, medications, lab results, and message your care team anytime.',
              },
            ].map((feature, index) => (
              <motion.div
                key={index}
                {...fadeInUp}
                transition={{ delay: index * 0.06 }}
                className="bg-white p-6 sm:p-8 rounded-2xl border border-border/50 shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:shadow-[0_8px_24px_rgba(0,0,0,0.08)] hover:-translate-y-1 transition-all duration-300"
                data-testid={`feature-card-${index}`}
              >
                <div className="w-14 h-14 bg-gradient-to-br from-primary to-primary/80 rounded-xl flex items-center justify-center mb-4 shadow-md">
                  <feature.icon className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-lg sm:text-xl font-semibold text-foreground mb-2">{feature.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Services Preview */}
      <section className="py-14 sm:py-16 md:py-24 lg:py-32 bg-white" data-testid="services-section">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
          <motion.div {...fadeInUp} className="text-center mb-10 sm:mb-12 md:mb-16">
            <span className="text-sm font-bold tracking-wide uppercase text-primary">Services We Offer</span>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight text-foreground mt-2">
              Comprehensive Care for Your Health Needs
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6 md:gap-8">
            {services.map((service, index) => (
              <motion.div
                key={service.service_id ?? `${service.title}-${index}`}
                {...fadeInUp}
                transition={{ delay: index * 0.06 }}
                className="bg-gradient-to-b from-white to-slate-50 p-6 rounded-2xl border border-border/50 shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:shadow-[0_8px_24px_rgba(0,0,0,0.08)] hover:-translate-y-1 transition-all duration-300"
                data-testid={`service-card-${index}`}
              >
                <div className="w-14 h-14 bg-gradient-to-br from-primary to-primary/80 rounded-xl flex items-center justify-center mb-4 shadow-md">
                  <Stethoscope className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">{service.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed line-clamp-3">{service.description}</p>
              </motion.div>
            ))}
          </div>

          <div className="text-center mt-10 sm:mt-12">
            <Button asChild variant="outline" className="border-2 border-primary text-primary hover:bg-primary/5 rounded-full font-medium">
              <Link to="/services">
                View All Services <ArrowRight className="w-4 h-4 ml-2" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Providers Spotlight */}
      <section className="py-14 sm:py-16 md:py-24 lg:py-32" data-testid="providers-section">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
          <motion.div {...fadeInUp} className="text-center mb-10 sm:mb-12 md:mb-16">
            <span className="text-sm font-bold tracking-wide uppercase text-primary">Meet Our Team</span>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight text-foreground mt-2">
              Experienced, Caring Providers
            </h2>
            <p className="text-base leading-relaxed text-muted-foreground mt-4 max-w-2xl mx-auto">
              Our providers are committed to delivering exceptional care with compassion and expertise.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6 md:gap-8">
            {providers.map((provider, index) => (
              <motion.div
                key={provider.provider_id ?? `${provider.name}-${index}`}
                {...fadeInUp}
                transition={{ delay: index * 0.06 }}
                className="bg-white overflow-hidden rounded-2xl border border-border/50 shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:shadow-[0_8px_24px_rgba(0,0,0,0.08)] group transition-all duration-300"
              >
                <img
                  src={provider.photo_url || providerPhotoFallback}
                  alt={provider.name}
                  className="w-full h-56 sm:h-64 object-cover group-hover:scale-105 transition-transform duration-300"
                  onError={(e) => {
                    e.currentTarget.src = providerPhotoFallback;
                  }}
                />
                <div className="p-6">
                  <h3 className="text-lg sm:text-xl font-semibold text-foreground mb-1">{provider.name}</h3>
                  <p className="text-sm text-primary font-medium mb-2">{provider.credentials}</p>
                  <p className="text-sm text-muted-foreground mb-4">{provider.specialty}</p>
                  <Button asChild variant="ghost" className="text-primary hover:text-primary/80 hover:bg-primary/5 p-0 h-auto font-medium">
                    <Link to={`/providers/${provider.provider_id}`}>
                      View Profile <ArrowRight className="w-4 h-4 ml-1" />
                    </Link>
                  </Button>
                </div>
              </motion.div>
            ))}
          </div>

          <div className="text-center mt-10 sm:mt-12">
            <Button asChild variant="outline" className="border-2 border-primary text-primary hover:bg-primary/5 rounded-full font-medium">
              <Link to="/providers">
                View All Providers <ArrowRight className="w-4 h-4 ml-2" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Locations Preview */}
      <section className="py-14 sm:py-16 md:py-24 lg:py-32 bg-white" data-testid="locations-section">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
          <motion.div {...fadeInUp} className="text-center mb-10 sm:mb-12 md:mb-16">
            <span className="text-sm font-bold tracking-wide uppercase text-primary">Our Locations</span>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight text-foreground mt-2">
              Convenient Care Close to Home
            </h2>
          </motion.div>

          {(() => {
            const DAYS = [
              ['Mon', 'Monday'],
              ['Tue', 'Tuesday'],
              ['Wed', 'Wednesday'],
              ['Thu', 'Thursday'],
              ['Fri', 'Friday'],
              ['Sat', 'Saturday'],
              ['Sun', 'Sunday'],
            ];

            const getHoursValue = (hoursObj, dayKey) => {
              const value = hoursObj?.[dayKey];
              if (value === undefined || value === null) return 'Closed';
              const text = String(value).trim();
              return text.length ? text : 'Closed';
            };

            return (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
                {locations.map((location, index) => (
                  <motion.div
                    key={location.location_id ?? `${location.name}-${index}`}
                    {...fadeInUp}
                    transition={{ delay: index * 0.06 }}
                    className="bg-gradient-to-b from-white to-slate-50 p-6 sm:p-8 rounded-2xl border border-border/50 shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:shadow-[0_8px_24px_rgba(0,0,0,0.08)] transition-all duration-300"
                  >
                    <h3 className="text-xl sm:text-2xl font-semibold text-foreground mb-4">{location.name}</h3>

                    <div className="space-y-3 mb-6">
                      <div className="flex items-start space-x-3">
                        <MapPin className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                        <div className="text-sm text-muted-foreground">
                          <p>{location.address}</p>
                          <p>
                            {location.city}, {location.state} {location.zip_code}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center space-x-3">
                        <Phone className="w-5 h-5 text-primary flex-shrink-0" />
                        <a
                          href={`tel:${String(location.phone || '').replace(/\D/g, '')}`}
                          className="text-sm text-muted-foreground hover:text-primary"
                        >
                          {location.phone}
                        </a>
                      </div>

                      <div className="flex items-start space-x-3">
                        <Clock className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                        <div className="text-sm text-muted-foreground space-y-0.5">
                          {DAYS.map(([shortLabel, dayKey]) => (
                            <p key={`${location.location_id ?? index}-${dayKey}`}>
                              {shortLabel}: {getHoursValue(location.hours, dayKey)}
                            </p>
                          ))}
                        </div>
                      </div>
                    </div>

                    <Button asChild variant="outline" className="w-full border-primary text-primary hover:bg-primary/5 rounded-full">
                      <Link to="/locations">
                        Get Directions <ArrowRight className="w-4 h-4 ml-2" />
                      </Link>
                    </Button>
                  </motion.div>
                ))}
              </div>
            );
          })()}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-14 sm:py-16 md:py-24 bg-gradient-to-br from-primary to-primary/80">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl text-center">
          <motion.div {...fadeInUp}>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight text-white mb-4">
              Ready to Experience Quality Care?
            </h2>
            <p className="text-base sm:text-lg text-white/90 mb-8 max-w-2xl mx-auto">
              Schedule your appointment today and discover why families trust Primary Care Services for their healthcare needs.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
              <Button asChild size="lg" className="bg-white text-primary hover:bg-white/90 h-12 px-6 sm:px-8 rounded-full font-medium shadow-md hover:shadow-lg transition-all">
                <a
                  href="https://livewell.aah.org/chart/openscheduling/standalone?id=A405777&vt=5662,5655,5633,11259"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Calendar className="w-5 h-5 mr-2" />
                  Book Appointment Online
                </a>
              </Button>

              <Button asChild size="lg" variant="outline" className="border-2 border-white text-white hover:bg-white/10 h-12 px-6 sm:px-8 rounded-full font-medium transition-all">
                <Link to="/contact">
                  Contact Us <ArrowRight className="w-5 h-5 ml-2" />
                </Link>
              </Button>
            </div>
          </motion.div>
        </div>
      </section>
    </>
  );
}






