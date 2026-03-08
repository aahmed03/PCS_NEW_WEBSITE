// ProviderDetail.js
// FIXES:
// 1. Correctly read providers list from API response (response.data.items)
// 2. Keep fallback if /providers/:id endpoint fails
// 3. Defensive rendering
// 4. Improved debugging

import React, { useEffect, useMemo, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { MapPin, Languages, ArrowLeft, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { providersApi } from '@/utils/api';

export default function ProviderDetail() {

  const { providerId } = useParams();
  const navigate = useNavigate();

  const [provider, setProvider] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');

  const providerPhotoFallback =
    'https://via.placeholder.com/900x900?text=Provider+Photo';

  useEffect(() => {

    let isMounted = true;

    const fetchProvider = async () => {

      setLoading(true);
      setLoadError('');

      try {

        // Attempt direct endpoint
        const response = await providersApi.getById(providerId);
        const data = response?.data;

        if (!isMounted) return;

        if (Array.isArray(data)) {
          setProvider(data[0] || null);
        } else {
          setProvider(data || null);
        }

        setLoading(false);
        return;

      } catch (err) {

        const status = err?.response?.status;
        console.warn('getById failed, falling back to list lookup. status=', status);

      }

      try {

        // Fallback: load list then match provider
        const listResp = await providersApi.getAll();

        // FIX: read from data.items
        const list = Array.isArray(listResp?.data?.items)
          ? listResp.data.items
          : [];

        const match = list.find((p) => {

          const pid = String(
            p?.provider_id ??
            p?.id ??
            p?.providerId ??
            ''
          );

          return pid === String(providerId);

        });

        if (!isMounted) return;

        setProvider(match || null);

        if (!match) {
          setLoadError(
            `No provider matched id "${providerId}". (Make sure provider_id in seed matches the route id.)`
          );
        }

      } catch (err2) {

        console.error('Failed to fetch provider list:', err2);

        if (!isMounted) return;

        setProvider(null);
        setLoadError('Unable to load providers from the API.');

      } finally {

        if (!isMounted) return;

        setLoading(false);

      }

    };

    fetchProvider();

    return () => {
      isMounted = false;
    };

  }, [providerId]);


  const fadeInUp = {
    initial: { opacity: 0, y: 22 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.55 },
  };


  const languages = useMemo(
    () => (Array.isArray(provider?.languages) ? provider.languages : []),
    [provider]
  );


  const locations = useMemo(
    () => (Array.isArray(provider?.locations) ? provider.locations : []),
    [provider]
  );


  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">
          Loading provider details...
        </p>
      </div>
    );
  }


  if (!provider) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center max-w-xl px-6">
          <p className="text-muted-foreground mb-2">
            Provider not found
          </p>

          {loadError && (
            <p className="text-sm text-muted-foreground mb-4">
              {loadError}
            </p>
          )}

          <Button onClick={() => navigate('/providers')}>
            Back to Providers
          </Button>
        </div>
      </div>
    );
  }


  const metaDescriptionParts = [
    provider?.name,
    provider?.credentials,
    provider?.specialty,
    provider?.bio,
  ].filter(Boolean);


  return (
    <>
      <Helmet>
        <title>
          {provider?.name} - Primary Care Services
        </title>

        <meta
          name="description"
          content={metaDescriptionParts.join(' - ').slice(0, 300)}
        />
      </Helmet>


      <section
        className="py-16 md:py-24"
        data-testid="provider-detail"
      >
        <div className="container mx-auto px-4 md:px-6 lg:px-8 max-w-7xl">

          <motion.button
            {...fadeInUp}
            onClick={() => navigate('/providers')}
            className="flex items-center space-x-2 text-primary hover:text-primary/80 mb-8 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm font-medium">
              Back to Providers
            </span>
          </motion.button>


          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 md:gap-12">

            {/* Left Column */}
            <motion.div {...fadeInUp} className="lg:col-span-1">

              <div className="bg-white rounded-2xl border border-border/50 shadow overflow-hidden sticky top-24">

                <img
                  src={provider?.photo_url || providerPhotoFallback}
                  alt={provider?.name || 'Provider'}
                  className="w-full h-96 object-cover"
                  onError={(e) => {
                    e.currentTarget.src = providerPhotoFallback;
                  }}
                />

                <div className="p-6 space-y-4">

                  {provider?.accepting_patients && (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                      <p className="text-sm font-medium text-green-700">
                        Currently Accepting New Patients
                      </p>
                    </div>
                  )}

                  <div className="space-y-3">

                    <div className="flex items-start space-x-3">
                      <Languages className="w-5 h-5 text-muted-foreground mt-0.5" />
                      <div>
                        <p className="text-xs font-medium text-muted-foreground mb-1">
                          Languages
                        </p>
                        <p className="text-sm text-foreground">
                          {languages.length ? languages.join(', ') : '—'}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start space-x-3">
                      <MapPin className="w-5 h-5 text-muted-foreground mt-0.5" />
                      <div>
                        <p className="text-xs font-medium text-muted-foreground mb-1">
                          Locations
                        </p>
                        <p className="text-sm text-foreground">
                          {locations.length ? locations.join(', ') : '—'}
                        </p>
                      </div>
                    </div>

                  </div>

                  <Button
                    asChild
                    className="w-full bg-primary text-primary-foreground hover:bg-primary/90 rounded-full"
                  >
                    <a
                      href="https://livewell.aah.org/chart/openscheduling/standalone?id=A405777&vt=5662,5655,5633,11259"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Calendar className="w-4 h-4 mr-2" />
                      Book Appointment
                    </a>
                  </Button>

                </div>

              </div>

            </motion.div>


            {/* Right Column */}
            <motion.div
              {...fadeInUp}
              transition={{ delay: 0.1 }}
              className="lg:col-span-2"
            >

              <div className="mb-6">

                <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-2">
                  {provider?.name}
                </h1>

                <p className="text-xl text-primary font-medium mb-1">
                  {provider?.credentials}
                </p>

                <p className="text-lg text-muted-foreground">
                  {provider?.specialty}
                </p>

              </div>


              <div className="bg-white rounded-2xl border border-border/50 shadow p-8">

                <h2 className="text-2xl font-bold text-foreground mb-4">
                  About
                </h2>

                <p className="text-base text-muted-foreground leading-relaxed whitespace-pre-line">
                  {provider?.bio || '—'}
                </p>

              </div>

            </motion.div>

          </div>

        </div>
      </section>
    </>
  );
}

