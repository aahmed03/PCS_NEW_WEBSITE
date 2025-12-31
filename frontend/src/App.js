import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import '@/App.css';

import Layout from '@/components/Layout';
import Home from '@/pages/Home';
import Providers from '@/pages/Providers';
import ProviderDetail from '@/pages/ProviderDetail';
import Services from '@/pages/Services';
import PreventiveCare from '@/pages/PreventiveCare';
import Locations from '@/pages/Locations';
import PatientPortal from '@/pages/PatientPortal';
import Login from '@/pages/Login';
import Register from '@/pages/Register';
import Contact from '@/pages/Contact';
import PatientResources from '@/pages/PatientResources';
import PatientEducation from '@/pages/PatientEducation';
import PCMH from '@/pages/PCMH';
import PCSForms from '@/pages/PCSForms';
import Insurance from '@/pages/Insurance';
import FAQ from '@/pages/FAQ';
import { AuthProvider } from '@/contexts/AuthContext';
import { Toaster } from 'sonner';

/**
 * Simple Error Boundary so a runtime error in any page doesn't blank the UI silently.
 * (You can move this into its own file later if you want.)
 */
class AppErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    // eslint-disable-next-line no-console
    console.error('[AppErrorBoundary] Uncaught error:', error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center px-6 py-16">
          <div className="max-w-xl w-full bg-white border border-border/50 rounded-2xl p-8 shadow-sm">
            <h1 className="text-2xl font-bold text-foreground mb-3">Something went wrong</h1>
            <p className="text-muted-foreground mb-6">
              Please refresh the page. If the issue continues, contact support.
            </p>

            {process.env.NODE_ENV !== 'production' && this.state.error && (
              <pre className="text-xs bg-slate-50 border border-border/50 rounded-lg p-4 overflow-auto">
                {String(this.state.error?.stack || this.state.error)}
              </pre>
            )}

            <button
              type="button"
              onClick={() => window.location.reload()}
              className="mt-6 inline-flex items-center justify-center bg-primary text-white h-11 px-6 rounded-full font-medium"
            >
              Reload
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

function App() {
  // If you ever deploy under a subpath in Azure (e.g. https://site.com/pcs),
  // set REACT_APP_BASENAME=/pcs in Azure App Settings and it will work.
  const basename = process.env.REACT_APP_BASENAME || '/';

  return (
    <HelmetProvider>
      <AuthProvider>
        <AppErrorBoundary>
          <BrowserRouter basename={basename}>
            <Toaster position="top-center" richColors />
            <Routes>
              <Route path="/" element={<Layout />}>
                <Route index element={<Home />} />
                <Route path="providers" element={<Providers />} />
                <Route path="providers/:providerId" element={<ProviderDetail />} />
                <Route path="services" element={<Services />} />
                <Route path="preventive-care" element={<PreventiveCare />} />
                <Route path="locations" element={<Locations />} />
                <Route path="patient-portal" element={<PatientPortal />} />
                <Route path="login" element={<Login />} />
                <Route path="register" element={<Register />} />
                <Route path="contact" element={<Contact />} />
                <Route path="resources" element={<PatientResources />} />
                <Route path="patient-education" element={<PatientEducation />} />
                <Route path="pcmh" element={<PCMH />} />
                <Route path="pcs-forms" element={<PCSForms />} />
                <Route path="insurance" element={<Insurance />} />
                <Route path="faq" element={<FAQ />} />
              </Route>
            </Routes>
          </BrowserRouter>
        </AppErrorBoundary>
      </AuthProvider>
    </HelmetProvider>
  );
}

export default App;

