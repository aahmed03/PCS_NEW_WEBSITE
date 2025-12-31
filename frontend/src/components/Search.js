import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search as SearchIcon, X } from 'lucide-react';
import { providersApi, servicesApi, locationsApi } from '@/utils/api';

export default function Search() {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState({ providers: [], services: [], locations: [] });
  const [loading, setLoading] = useState(false);
  const searchRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const searchContent = async () => {
      if (query.length < 2) {
        setResults({ providers: [], services: [], locations: [] });
        return;
      }

      setLoading(true);
      try {
        const [providersRes, servicesRes, locationsRes] = await Promise.all([
          providersApi.getAll(),
          servicesApi.getAll(),
          locationsApi.getAll(),
        ]);

        const searchTerm = query.toLowerCase();

        const filteredProviders = providersRes.data.filter(p => 
          p.name.toLowerCase().includes(searchTerm) || 
          p.specialty.toLowerCase().includes(searchTerm)
        ).slice(0, 3);

        const filteredServices = servicesRes.data.filter(s => 
          s.title.toLowerCase().includes(searchTerm) || 
          s.description.toLowerCase().includes(searchTerm)
        ).slice(0, 3);

        const filteredLocations = locationsRes.data.filter(l => 
          l.name.toLowerCase().includes(searchTerm) || 
          l.city.toLowerCase().includes(searchTerm)
        ).slice(0, 2);

        setResults({
          providers: filteredProviders,
          services: filteredServices,
          locations: filteredLocations,
        });
      } catch (error) {
        console.error('Search error:', error);
      } finally {
        setLoading(false);
      }
    };

    const debounce = setTimeout(searchContent, 300);
    return () => clearTimeout(debounce);
  }, [query]);

  const handleResultClick = (type, id) => {
    setIsOpen(false);
    setQuery('');
    if (type === 'provider') navigate(`/providers/${id}`);
    if (type === 'service') navigate('/services');
    if (type === 'location') navigate('/locations');
  };

  const totalResults = results.providers.length + results.services.length + results.locations.length;

  return (
    <div ref={searchRef} className="relative">
      {/* Search Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 px-3 py-2 rounded-lg hover:bg-primary/5 transition-colors"
        data-testid="search-button"
      >
        <SearchIcon className="w-5 h-5 text-muted-foreground" />
        <span className="hidden md:inline text-sm text-muted-foreground">Search</span>
      </button>

      {/* Search Modal */}
      {isOpen && (
        <div className="absolute top-full right-0 mt-2 w-[90vw] md:w-[500px] bg-white rounded-xl shadow-2xl border border-border z-50">
          {/* Search Input */}
          <div className="p-4 border-b border-border">
            <div className="relative">
              <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search providers, services, locations..."
                className="w-full pl-10 pr-10 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                autoFocus
                data-testid="search-input"
              />
              {query && (
                <button
                  onClick={() => setQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          {/* Search Results */}
          <div className="max-h-[400px] overflow-y-auto">
            {loading && (
              <div className="p-8 text-center text-muted-foreground">
                Searching...
              </div>
            )}

            {!loading && query.length >= 2 && totalResults === 0 && (
              <div className="p-8 text-center text-muted-foreground">
                No results found for "{query}"
              </div>
            )}

            {!loading && query.length < 2 && (
              <div className="p-8 text-center text-muted-foreground text-sm">
                Type at least 2 characters to search
              </div>
            )}

            {!loading && totalResults > 0 && (
              <div className="p-4 space-y-4">
                {/* Providers Results */}
                {results.providers.length > 0 && (
                  <div>
                    <h4 className="text-xs font-semibold text-muted-foreground uppercase mb-2">Providers</h4>
                    <div className="space-y-2">
                      {results.providers.map((provider) => (
                        <button
                          key={provider.provider_id}
                          onClick={() => handleResultClick('provider', provider.provider_id)}
                          className="w-full text-left p-3 rounded-lg hover:bg-primary/5 transition-colors"
                          data-testid={`search-result-provider-${provider.provider_id}`}
                        >
                          <p className="font-medium text-foreground">{provider.name}</p>
                          <p className="text-sm text-muted-foreground">{provider.specialty}</p>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Services Results */}
                {results.services.length > 0 && (
                  <div>
                    <h4 className="text-xs font-semibold text-muted-foreground uppercase mb-2">Services</h4>
                    <div className="space-y-2">
                      {results.services.map((service) => (
                        <button
                          key={service.service_id}
                          onClick={() => handleResultClick('service', service.service_id)}
                          className="w-full text-left p-3 rounded-lg hover:bg-primary/5 transition-colors"
                          data-testid={`search-result-service-${service.service_id}`}
                        >
                          <p className="font-medium text-foreground">{service.title}</p>
                          <p className="text-sm text-muted-foreground line-clamp-1">{service.description}</p>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Locations Results */}
                {results.locations.length > 0 && (
                  <div>
                    <h4 className="text-xs font-semibold text-muted-foreground uppercase mb-2">Locations</h4>
                    <div className="space-y-2">
                      {results.locations.map((location) => (
                        <button
                          key={location.location_id}
                          onClick={() => handleResultClick('location', location.location_id)}
                          className="w-full text-left p-3 rounded-lg hover:bg-primary/5 transition-colors"
                          data-testid={`search-result-location-${location.location_id}`}
                        >
                          <p className="font-medium text-foreground">{location.name}</p>
                          <p className="text-sm text-muted-foreground">{location.city}, {location.state}</p>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
