import React from 'react';
import { Link } from 'react-router-dom';
import { Phone, Mail, MapPin, ExternalLink } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-white border-t border-border/40" data-testid="main-footer">
      <div className="container mx-auto px-4 md:px-6 lg:px-8 max-w-7xl py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 md:gap-12">
          {/* About */}
          <div>
            <h3 className="text-lg font-bold text-foreground mb-4">Primary Care Services</h3>
            <p className="text-sm text-muted-foreground leading-relaxed mb-4">
              Providing compassionate, patient-centered care to families in the Western Suburbs of Chicago.
            </p>
            <div className="flex items-center space-x-2 text-primary">
              <Phone className="w-4 h-4" />
              <a href="tel:6304299000" className="text-sm font-medium hover:underline">
                (630) 429-9000
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-bold text-foreground mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li><Link to="/providers" className="text-sm text-muted-foreground hover:text-primary transition-colors">Our Providers</Link></li>
              <li><Link to="/services" className="text-sm text-muted-foreground hover:text-primary transition-colors">Services</Link></li>
              <li><Link to="/preventive-care" className="text-sm text-muted-foreground hover:text-primary transition-colors">Preventive Care</Link></li>
              <li><Link to="/locations" className="text-sm text-muted-foreground hover:text-primary transition-colors">Locations</Link></li>
              <li><Link to="/resources" className="text-sm text-muted-foreground hover:text-primary transition-colors">Patient Resources</Link></li>
            </ul>
          </div>

          {/* Patient Resources */}
          <div>
            <h3 className="text-lg font-bold text-foreground mb-4">For Patients</h3>
            <ul className="space-y-2">
              <li>
                <a 
                  href="https://livewell.aah.org/Chart/Authentication/Login" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-sm text-muted-foreground hover:text-primary transition-colors inline-flex items-center"
                >
                  Patient Portal <ExternalLink className="w-3 h-3 ml-1" />
                </a>
              </li>
              <li><Link to="/resources" className="text-sm text-muted-foreground hover:text-primary transition-colors">Forms & Documents</Link></li>
              <li><Link to="/patient-education" className="text-sm text-muted-foreground hover:text-primary transition-colors">Patient Education</Link></li>
              <li><Link to="/faq" className="text-sm text-muted-foreground hover:text-primary transition-colors">FAQ</Link></li>
              <li>
                <a 
                  href="https://livewell.aah.org/chart/openscheduling/standalone?id=A405777&vt=5662,5655,5633,11259" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-sm text-muted-foreground hover:text-primary transition-colors inline-flex items-center"
                >
                  Book Appointment <ExternalLink className="w-3 h-3 ml-1" />
                </a>
              </li>
            </ul>
          </div>

          {/* PCMH & Insurance */}
          <div>
            <h3 className="text-lg font-bold text-foreground mb-4">About Us</h3>
            <ul className="space-y-2">
              <li><Link to="/pcmh" className="text-sm text-muted-foreground hover:text-primary transition-colors">PCMH Program</Link></li>
              <li><Link to="/pcs-forms" className="text-sm text-muted-foreground hover:text-primary transition-colors">PCS Forms</Link></li>
              <li><Link to="/insurance" className="text-sm text-muted-foreground hover:text-primary transition-colors">Insurance Information</Link></li>
              <li><Link to="/contact" className="text-sm text-muted-foreground hover:text-primary transition-colors">Contact Us</Link></li>
            </ul>
          </div>

          {/* Locations */}
          <div>
            <h3 className="text-lg font-bold text-foreground mb-4">Locations</h3>
            <div className="space-y-4">
              <div>
                <h4 className="text-sm font-medium text-foreground mb-1">Lombard Office</h4>
                <p className="text-sm text-muted-foreground">2500 S. Highland Ave., Suite 230<br />Lombard, IL 60148</p>
              </div>
              <div>
                <h4 className="text-sm font-medium text-foreground mb-1">Glendale Heights Office</h4>
                <p className="text-sm text-muted-foreground">701 N. Winthrop Ave.<br />Glendale Heights, IL 60139</p>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-border/40">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <p className="text-sm text-muted-foreground">
              © {new Date().getFullYear()} Primary Care Services, S.C. All rights reserved.
            </p>
            <div className="flex items-center space-x-6">
              <Link to="/resources" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                Privacy Practices
              </Link>
              <Link to="/resources" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                HIPAA Notice
              </Link>
            </div>
          </div>
          <div className="mt-4 text-center">
            <p className="text-xs text-muted-foreground">
              <strong>Medical Disclaimer:</strong> This website provides general information only. For medical emergencies, call 911.
              Always consult your physician for medical advice.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
