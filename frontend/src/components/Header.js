import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Menu, X, Phone, Calendar, LogIn, LogOut, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import Search from '@/components/Search';

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully');
    navigate('/');
  };

  const navLinks = [
    { path: '/', label: 'Home' },
    { path: '/providers', label: 'Providers' },
    { path: '/services', label: 'Services' },
    { path: '/preventive-care', label: 'Preventive Care' },
    { path: '/locations', label: 'Locations' },
    { path: '/patient-portal', label: 'Patient Portal' },
  ];

  return (
    <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-border/40 shadow-sm" data-testid="main-header">
      <div className="container mx-auto px-4 md:px-6 lg:px-8 max-w-7xl">
        <div className="flex items-center justify-between h-16 md:h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-3" data-testid="logo-link">
            <img 
              src="https://my-primarycare.com/images/support/Logo.jpg" 
              alt="Primary Care Services Logo" 
              className="h-12 md:h-14 w-auto"
            />

          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-1">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                data-testid={`nav-link-${link.label.toLowerCase().replace(' ', '-')}`}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isActive(link.path)
                    ? 'bg-primary/10 text-primary'
                    : 'text-foreground hover:bg-primary/5 hover:text-primary'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Desktop CTA Buttons */}
          <div className="hidden lg:flex items-center space-x-3">
            <Search />
            <Button
              asChild
              className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-full font-medium"
              data-testid="book-appointment-btn"
            >
              <a href="https://livewell.aah.org/chart/openscheduling/standalone?id=A405777&vt=5662,5655,5633,11259" target="_blank" rel="noopener noreferrer">
                <Calendar className="w-4 h-4 mr-2" />
                Book Appointment
              </a>
            </Button>
            {user ? (
              <div className="flex items-center space-x-2">
                <span className="text-sm text-muted-foreground" data-testid="user-name">Hi, {user.full_name}</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleLogout}
                  className="rounded-full"
                  data-testid="logout-btn"
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
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 rounded-lg hover:bg-primary/5 transition-colors"
            data-testid="mobile-menu-toggle"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="lg:hidden py-4 border-t border-border/40" data-testid="mobile-menu">
            <nav className="flex flex-col space-y-2">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isActive(link.path)
                      ? 'bg-primary/10 text-primary'
                      : 'text-foreground hover:bg-primary/5'
                  }`}
                >
                  {link.label}
                </Link>
              ))}
              <div className="pt-4 border-t border-border/40 space-y-2">
                <Button
                  asChild
                  className="w-full bg-primary text-primary-foreground hover:bg-primary/90 rounded-full"
                >
                  <a href="https://livewell.aah.org/chart/openscheduling/standalone?id=A405777&vt=5662,5655,5633,11259" target="_blank" rel="noopener noreferrer">
                    <Calendar className="w-4 h-4 mr-2" />
                    Book Appointment
                  </a>
                </Button>
                {user ? (
                  <>
                    <div className="px-4 py-2 text-sm text-muted-foreground">Hi, {user.full_name}</div>
                    <Button
                      variant="outline"
                      className="w-full rounded-full"
                      onClick={() => {
                        handleLogout();
                        setMobileMenuOpen(false);
                      }}
                    >
                      <LogOut className="w-4 h-4 mr-2" />
                      Logout
                    </Button>
                  </>
                ) : (
                  <Button
                    asChild
                    variant="outline"
                    className="w-full rounded-full border-primary text-primary"
                  >
                    <Link to="/login" onClick={() => setMobileMenuOpen(false)}>
                      <LogIn className="w-4 h-4 mr-2" />
                      Login
                    </Link>
                  </Button>
                )}
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}
