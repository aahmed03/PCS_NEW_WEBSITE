// Footer.js
// ✅ Updates applied per request:
// 1) Dark-mode footer variant (Tailwind dark: classes)
// 2) Subtle divider animations (soft shimmer line + gentle hover accent)
// 3) Typography aligned 1:1 with Header:
//    - Headings use: text-sm font-bold tracking-wide uppercase
//    - Links use: text-sm font-medium (same feel as header nav)
//    - Same hover/active color behavior (text-primary, hover:bg-primary/5 where appropriate)

import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ExternalLink } from 'lucide-react';

export default function Footer() {
  const year = new Date().getFullYear();
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  const sectionTitleClass =
    'text-sm font-bold tracking-wide uppercase text-foreground dark:text-white mb-4';

  const linkBaseClass =
    'text-sm font-medium transition-colors rounded-md px-2 py-1 -mx-2 inline-flex items-center';

  const linkInactiveClass =
    'text-muted-foreground dark:text-white/70 hover:text-primary dark:hover:text-white hover:bg-primary/5 dark:hover:bg-white/10';

  const linkActiveClass =
    'text-primary dark:text-white bg-primary/10 dark:bg-white/10';

  const footerShell =
    'bg-white dark:bg-slate-950 border-t border-border/40 dark:border-white/10';

  return (
    <footer className={footerShell} data-testid="main-footer">
      {/* Subtle animated top divider */}
      <div className="relative">
        <div className="h-px w-full bg-border/60 dark:bg-white/10" />
        {/* shimmer overlay */}
        <div
          className="
            pointer-events-none absolute inset-x-0 -top-px h-px
            bg-gradient-to-r from-transparent via-primary/30 to-transparent
            dark:via-white/25
            animate-[footerShimmer_6s_linear_infinite]
            opacity-60
          "
        />
      </div>

      <div className="container mx-auto px-4 md:px-6 lg:px-8 max-w-7xl py-12 md:py-16">
        {/* Main footer links */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 md:gap-12">
          {/* Quick Links */}
          <div>
            <h3 className={sectionTitleClass}>Quick Links</h3>
            <ul className="space-y-2">
              {[
                { to: '/providers', label: 'Our Providers' },
                { to: '/services', label: 'Services' },
                { to: '/preventive-care', label: 'Preventive Care' },
                { to: '/locations', label: 'Locations' },
                { to: '/resources', label: 'Patient Resources' },
              ].map((item) => (
                <li key={item.to}>
                  <Link
                    to={item.to}
                    className={[
                      linkBaseClass,
                      isActive(item.to) ? linkActiveClass : linkInactiveClass,
                    ].join(' ')}
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* For Patients */}
          <div>
            <h3 className={sectionTitleClass}>For Patients</h3>
            <ul className="space-y-2">
              <li>
                <a
                  href="https://livewell.aah.org/Chart/Authentication/Login"
                  target="_blank"
                  rel="noopener noreferrer"
                  className={[
                    linkBaseClass,
                    linkInactiveClass,
                    'justify-start',
                  ].join(' ')}
                >
                  Patient Portal <ExternalLink className="w-3.5 h-3.5 ml-1 opacity-80" />
                </a>
              </li>

              {[
                { to: '/resources', label: 'Forms & Documents' },
                { to: '/patient-education', label: 'Patient Education' },
                { to: '/faq', label: 'FAQ' },
              ].map((item) => (
                <li key={item.to}>
                  <Link
                    to={item.to}
                    className={[
                      linkBaseClass,
                      isActive(item.to) ? linkActiveClass : linkInactiveClass,
                    ].join(' ')}
                  >
                    {item.label}
                  </Link>
                </li>
              ))}

              <li>
                <a
                  href="https://livewell.aah.org/chart/openscheduling/standalone?id=A405777&vt=5662,5655,5633,11259"
                  target="_blank"
                  rel="noopener noreferrer"
                  className={[
                    linkBaseClass,
                    linkInactiveClass,
                    'justify-start',
                  ].join(' ')}
                >
                  Book Appointment <ExternalLink className="w-3.5 h-3.5 ml-1 opacity-80" />
                </a>
              </li>
            </ul>
          </div>

          {/* About */}
          <div>
            <h3 className={sectionTitleClass}>About</h3>
            <ul className="space-y-2">
              {[
                { to: '/pcmh', label: 'PCMH Program' },
                { to: '/pcs-forms', label: 'PCS Forms' },
                { to: '/insurance', label: 'Insurance Information' },
                { to: '/contact', label: 'Contact Us' },
              ].map((item) => (
                <li key={item.to}>
                  <Link
                    to={item.to}
                    className={[
                      linkBaseClass,
                      isActive(item.to) ? linkActiveClass : linkInactiveClass,
                    ].join(' ')}
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom bar with subtle animated divider */}
        <div className="mt-12 pt-8 border-t border-border/40 dark:border-white/10 relative">
          {/* subtle pulse highlight line */}
          <div
            className="
              pointer-events-none absolute inset-x-0 -top-px h-px
              bg-gradient-to-r from-transparent via-primary/20 to-transparent
              dark:via-white/15
              animate-[footerGlow_5s_ease-in-out_infinite]
              opacity-70
            "
          />

          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm font-medium text-muted-foreground dark:text-white/70 text-center md:text-left">
              © {year} Primary Care Services, S.C. All rights reserved.
            </p>

            <div className="flex items-center gap-2 sm:gap-4">
              <Link
                to="/resources"
                className={[
                  linkBaseClass,
                  isActive('/resources') ? linkActiveClass : linkInactiveClass,
                ].join(' ')}
              >
                Privacy Practices
              </Link>
              <Link
                to="/resources"
                className={[
                  linkBaseClass,
                  isActive('/resources') ? linkActiveClass : linkInactiveClass,
                ].join(' ')}
              >
                HIPAA Notice
              </Link>
            </div>
          </div>

          <div className="mt-4 text-center">
            <p className="text-xs text-muted-foreground dark:text-white/60 leading-relaxed">
              <strong className="text-foreground dark:text-white/80">Medical Disclaimer:</strong>{' '}
              This website provides general information only. For medical emergencies, call 911.
              Always consult your physician for medical advice.
            </p>
          </div>
        </div>
      </div>

 
    </footer>
  );
}



