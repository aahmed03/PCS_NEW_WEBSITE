import React, { useEffect, useState } from 'react';
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

  useEffect(() => {
    const fetchProvider = async () => {
      try {
        const response = await providersApi.getById(providerId);
        setProvider(response.data);
      } catch (error) {
        console.error('Failed to fetch provider:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchProvider();
  }, [providerId]);

  const fadeInUp = {
    initial: { opacity: 0, y: 30 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6 }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Loading provider details...</p>
      </div>
    );
  }

  if (!provider) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground mb-4">Provider not found</p>
          <Button onClick={() => navigate('/providers')}>Back to Providers</Button>
        </div>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>{provider.name} - Primary Care Services</title>
        <meta name="description" content={`${provider.name}, ${provider.credentials} - ${provider.specialty}. ${provider.bio}`} />
      </Helmet>

      <section className="py-16 md:py-24" data-testid="provider-detail">
        <div className="container mx-auto px-4 md:px-6 lg:px-8 max-w-7xl">
          <motion.button
            {...fadeInUp}
            onClick={() => navigate('/providers')}
            className="flex items-center space-x-2 text-primary hover:text-primary/80 mb-8 transition-colors"
            data-testid="back-button"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm font-medium">Back to Providers</span>
          </motion.button>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 md:gap-12">
            {/* Provider Photo and Quick Info */}
            <motion.div {...fadeInUp} className="lg:col-span-1">
              <div className="bg-white rounded-2xl border border-border/50 shadow-[0_2px_8px_rgba(0,0,0,0.04)] overflow-hidden sticky top-24">
                <img 
                  src={provider.photo_url} 
                  alt={provider.name}
                  className="w-full h-96 object-cover"
                />
                <div className="p-6 space-y-4">
                  {provider.accepting_patients && (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                      <p className="text-sm font-medium text-green-700">Currently Accepting New Patients</p>
                    </div>
                  )}
                  
                  <div className="space-y-3">
                    <div className="flex items-start space-x-3">
                      <Languages className="w-5 h-5 text-muted-foreground mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-xs font-medium text-muted-foreground mb-1">Languages</p>
                        <p className="text-sm text-foreground">{provider.languages.join(', ')}</p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3">
                      <MapPin className="w-5 h-5 text-muted-foreground mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-xs font-medium text-muted-foreground mb-1">Locations</p>
                        <p className="text-sm text-foreground">{provider.locations.join(', ')}</p>
                      </div>
                    </div>
                  </div>

                  <Button 
                    asChild 
                    className="w-full bg-primary text-primary-foreground hover:bg-primary/90 rounded-full"
                    data-testid="book-appointment-btn"
                  >
                    <a href="https://livewell.aah.org/chart/openscheduling/standalone?id=A405777&vt=5662,5655,5633,11259" target="_blank" rel="noopener noreferrer">
                      <Calendar className="w-4 h-4 mr-2" />
                      Book Appointment
                    </a>
                  </Button>
                </div>
              </div>
            </motion.div>

            {/* Provider Details */}
            <motion.div {...fadeInUp} transition={{ delay: 0.1 }} className="lg:col-span-2">
              <div className="mb-6">
                <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-2">{provider.name}</h1>
                <p className="text-xl text-primary font-medium mb-1">{provider.credentials}</p>
                <p className="text-lg text-muted-foreground">{provider.specialty}</p>
              </div>

              <div className="bg-white rounded-2xl border border-border/50 shadow-[0_2px_8px_rgba(0,0,0,0.04)] p-8">
                <h2 className="text-2xl font-bold text-foreground mb-4">About</h2>
                <p className="text-base text-muted-foreground leading-relaxed whitespace-pre-line">
                  {provider.bio}
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>
    </>
  );
}
