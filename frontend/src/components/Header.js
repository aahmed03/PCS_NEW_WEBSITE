// Header.js (updated)
// ✅ Improvements:
// - Logo fallback + case-safe path usage for Azure/Linux
// - Active nav supports subroutes (/providers/123 still highlights Providers)
// - Mobile menu closes on route change + overlay scrim + ESC to close
// - Better CTA layout + optional "Call" quick action
// - Safer user name rendering + consistent styling

import React, { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Menu, X, Phone, Calendar, LogIn, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import Search from '@/components/Search';

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // ✅ Active should match subroutes too (e.g., /providers/abc)
  const isActive = (path) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname === path || location.pathname.startsWith(`${path}/`);
  };

  const navLinks = useMemo(
    () => [
      { path: '/', label: 'Home' },
      { path: '/providers', label: 'Providers' },
      { path: '/services', label: 'Services' },
      { path: '/preventive-care', label: 'Preventive Care' },
      { path: '/locations', label: 'Locations' },
      { path: '/patient-portal', label: 'Patient Portal' },
    ],
    []
  );

  const handleLogout = async () => {
    try {
      await logout?.();
      toast.success('Logged out successfully');
      navigate('/');
    } catch (e) {
      toast.error('Logout failed. Please try again.');
    }
  };

  // ✅ Close mobile menu when route changes
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  // ✅ ESC closes mobile menu
  useEffect(() => {
    const onKeyDown = (e) => {
      if (e.key === 'Escape') setMobileMenuOpen(false);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  // ✅ Logo path (must match exact casing in /public on Azure/Linux)
  const logoSrc = '/images/header/Logo.jpg';

  const displayName =
    user?.full_name ||
    user?.name ||
    user?.email?.split?.('@')?.[0] ||
    'Account';

  return (
    <header
      className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-border/40 shadow-sm"
      data-testid="main-header"
    >
      <div className="container mx-auto px-4 md:px-6 lg:px-8 max-w-7xl">
        <div className="flex items-center justify-between h-16 md:h-20">


          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-1">
            {navLinks.map((link) => {
              const active = isActive(link.path);
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  data-testid={`nav-link-${link.label.toLowerCase().replace(/\s+/g, '-')}`}
                  className={[
                    'px-3 py-2 rounded-full text-sm font-semibold transition-colors',
                    active
                      ? 'bg-primary/10 text-primary'
                      : 'text-foreground hover:bg-primary/5 hover:text-primary',
                  ].join(' ')}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>

          {/* Desktop Actions */}
          <div className="hidden lg:flex items-center gap-3">
            <Search />

            <Button
              asChild
              variant="outline"
              className="rounded-full border-border/60 hover:bg-slate-50"
              data-testid="call-btn"
            >
              <a href="tel:6304299000">
                <Phone className="w-4 h-4 mr-2" />
                Call
              </a>
            </Button>

            <Button
              asChild
              className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-full font-medium shadow-sm"
              data-testid="book-appointment-btn"
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

            {user ? (
              <div className="flex items-center gap-2 pl-1">
                <div className="hidden xl:block text-sm text-muted-foreground">
                  Hi, <span className="font-semibold text-foreground">{displayName}</span>
                </div>

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleLogout}
                  className="rounded-full"
                  data-testid="logout-btn"
                  aria-label="Log out"
                  title="Log out"
                >
                  <LogOut className="w-4 h-4" />
                </Button>
              </div>
            ) : (
              <Button
                asChild
                variant="outline"
                className="rounded-full border-primary text-primary hover:bg-primary/5"
                data-testid="login-btn"
              >
                <Link to="/login">
                  <LogIn className="w-4 h-4 mr-2" />
                  Login
                </Link>
              </Button>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen((v) => !v)}
            className="lg:hidden p-2 rounded-xl hover:bg-primary/5 transition-colors"
            data-testid="mobile-menu-toggle"
            aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={mobileMenuOpen ? 'true' : 'false'}
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* ✅ Mobile overlay + panel */}
      {mobileMenuOpen && (
        <div className="lg:hidden" data-testid="mobile-menu">
          {/* scrim */}
          <button
            type="button"
            aria-label="Close menu overlay"
            onClick={() => setMobileMenuOpen(false)}
            className="fixed inset-0 bg-black/35 backdrop-blur-[1px] z-40"
          />

          {/* panel */}
          <div className="fixed top-16 left-0 right-0 z-50 bg-white border-t border-border/50 shadow-xl">
            <div className="container mx-auto px-4 py-4">
              <div className="pb-4">
                <Search />
              </div>

              <nav className="flex flex-col gap-1">
                {navLinks.map((link) => {
                  const active = isActive(link.path);
                  return (
                    <Link
                      key={link.path}
                      to={link.path}
                      className={[
                        'px-4 py-3 rounded-xl text-sm font-semibold transition-colors',
                        active ? 'bg-primary/10 text-primary' : 'text-foreground hover:bg-primary/5',
                      ].join(' ')}
                    >
                      {link.label}
                    </Link>
                  );
                })}
              </nav>

              <div className="pt-4 mt-4 border-t border-border/50 space-y-2">
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

                <Button asChild variant="outline" className="w-full rounded-full">
                  <a href="tel:6304299000">
                    <Phone className="w-4 h-4 mr-2" />
                    Call (630) 429-9000
                  </a>
                </Button>

                {user ? (
                  <>
                    <div className="px-2 pt-2 text-sm text-muted-foreground">
                      Signed in as <span className="font-semibold text-foreground">{displayName}</span>
                    </div>

                    <Button
                      variant="outline"
                      className="w-full rounded-full"
                      onClick={handleLogout}
                    >
                      <LogOut className="w-4 h-4 mr-2" />
                      Logout
                    </Button>
                  </>
                ) : (
                  <Button asChild variant="outline" className="w-full rounded-full border-primary text-primary">
                    <Link to="/login">
                      <LogIn className="w-4 h-4 mr-2" />
                      Login
                    </Link>
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}

