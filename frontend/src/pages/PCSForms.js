import React, { useMemo } from 'react';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { FileText, Download, CheckCircle } from 'lucide-react';

// ✅ Move static data OUTSIDE component so it doesn't change every render
const FORMS = [
  {
    title: 'New Patient Registration Form',
    description:
      'Complete this form if you are a new patient to our practice. Please bring it with you to your first appointment.',
    category: 'registration',
    fileName: 'New-Patient-Registration-Form.pdf',
  },
  {
    title: 'Medical History Form',
    description:
      'Detailed medical history questionnaire to help us understand your health background and current conditions.',
    category: 'registration',
    fileName: 'Medical-History-Form.pdf',
  },
  {
    title: 'HIPAA Authorization Form',
    description:
      'Authorization for release of protected health information to designated individuals or organizations.',
    category: 'privacy',
    fileName: 'HIPAA-Authorization-Form.pdf',
  },
  {
    title: 'Notice of Privacy Practices',
    description:
      'Important information about how we may use and disclose your medical information.',
    category: 'privacy',
    fileName: 'Notice-of-Privacy-Practices.pdf',
  },
  {
    title: 'Consent for Treatment',
    description:
      'General consent form for medical treatment, examinations, and procedures.',
    category: 'consent',
    fileName: 'Consent-for-Treatment.pdf',
  },
  {
    title: 'Medication List Form',
    description:
      'Template to record all current medications, including dosages and frequency. Bring this to every appointment.',
    category: 'medical',
    fileName: 'Medication-List-Form.pdf',
  },
  {
    title: 'Referral Request Form',
    description:
      'Use this form to request a referral to a specialist or for specific medical services.',
    category: 'medical',
    fileName: 'Referral-Request-Form.pdf',
  },
  {
    title: 'Insurance Information Sheet',
    description:
      'Form to provide your insurance information and authorize insurance billing.',
    category: 'billing',
    fileName: 'Insurance-Information-Sheet.pdf',
  },
  {
    title: 'Financial Responsibility Agreement',
    description:
      'Agreement regarding payment responsibilities and billing policies.',
    category: 'billing',
    fileName: 'Financial-Responsibility-Agreement.pdf',
  },
  {
    title: 'Request for Medical Records',
    description:
      'Form to request copies of your medical records for personal use or transfer to another provider.',
    category: 'records',
    fileName: 'Request-for-Medical-Records.pdf',
  },
  {
    title: 'Advance Directive Form',
    description:
      'Document your healthcare wishes and designate a healthcare proxy.',
    category: 'planning',
    fileName: 'Advance-Directive-Form.pdf',
  },
  {
    title: 'Patient Portal Registration',
    description:
      'Sign up for 24/7 access to your medical records, lab results, and secure messaging.',
    category: 'access',
    fileName: 'Patient-Portal-Registration.pdf',
  },
];

const CATEGORY_TITLES = {
  registration: 'New Patient Registration',
  privacy: 'Privacy & Authorization',
  consent: 'Treatment Consent',
  medical: 'Medical Information',
  billing: 'Billing & Insurance',
  records: 'Medical Records',
  planning: 'Healthcare Planning',
  access: 'Patient Portal',
};

export default function PCSForms() {
  const fadeInUp = {
    initial: { opacity: 0, y: 24 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.55 },
  };

  // Providers / PatientEducation style hero image (static)
  const heroImage = '/images/header/center2.jpg';

  /**
   * ✅ IMPORTANT (fixes broken downloads):
   * Anything inside /public is served from the site root.
   * So /public/forms/MyFile.pdf becomes available at:
   *    https://yourdomain.com/forms/MyFile.pdf
   *    http://localhost:3000/forms/MyFile.pdf
   *
   * Put your PDFs in: /public/forms/
   * Then set fileName to match exactly (case-sensitive on Linux hosting).
   */
  const groupedForms = useMemo(() => {
    const groups = FORMS.reduce((acc, form) => {
      const key = form.category || 'other';
      if (!acc[key]) acc[key] = [];
      acc[key].push(form);
      return acc;
    }, {});

    // Keep categories in the order of CATEGORY_TITLES first, then any extras
    const orderedKeys = [
      ...Object.keys(CATEGORY_TITLES),
      ...Object.keys(groups).filter(
        (k) => !Object.prototype.hasOwnProperty.call(CATEGORY_TITLES, k)
      ),
    ].filter((k) => groups[k]?.length);

    return orderedKeys.map((k) => [k, groups[k]]);
  }, []); // ✅ stable (FORMS + CATEGORY_TITLES are module-level constants)

  const getFileHref = (fileName) => `/forms/${encodeURIComponent(fileName)}`;

  return (
    <>
      <Helmet>
        <title>PCS Forms - Primary Care Services</title>
        <meta
          name="description"
          content="Download patient forms for registration, consent, medical records, and more. Complete forms before your visit for faster check-in."
        />
      </Helmet>

      {/* Hero Section (PatientEducation-style) */}
      <section className="relative overflow-hidden" data-testid="forms-hero">
        <div
          className="relative w-full min-h-[320px] md:min-h-[420px] lg:min-h-[480px] flex items-center bg-slate-900"
          style={{
            backgroundImage: `url(${heroImage})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/55 to-black/25" />

          <div className="relative container mx-auto px-4 md:px-6 lg:px-8 max-w-7xl py-14 md:py-16 lg:py-20">
            <motion.div {...fadeInUp} className="max-w-3xl mx-auto text-center">
              <div className="inline-flex items-center gap-2 mb-4 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-md border border-white/20">
                <FileText className="w-5 h-5 text-white" />
                <span className="text-sm font-semibold tracking-wide uppercase text-white">
                  Patient Forms
                </span>
              </div>

              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-white mb-4">
                PCS Forms & Documents
              </h1>

              <p className="text-base sm:text-lg md:text-xl text-white/90 leading-relaxed max-w-2xl mx-auto">
                Download and complete these forms before your visit to speed up check-in and help our team provide the best care.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Forms Section */}
      <section className="py-14 md:py-20 lg:py-24" data-testid="forms-list">
        <div className="container mx-auto px-4 md:px-6 lg:px-8 max-w-7xl">
          <div className="space-y-12 md:space-y-14">
            {groupedForms.map(([category, categoryForms], catIndex) => (
              <motion.div
                key={category}
                {...fadeInUp}
                transition={{ delay: catIndex * 0.06 }}
              >
                <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-foreground mb-5 md:mb-6 pb-3 md:pb-4 border-b border-border/40">
                  {CATEGORY_TITLES[category] || 'Forms'}
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6">
                  {categoryForms.map((form, index) => (
                    <div
                      key={`${category}-${index}`}
                      className="bg-white p-5 sm:p-6 rounded-2xl border border-border/50 shadow-[0_2px_8px_rgba(0,0,0,0.06)] hover:shadow-[0_12px_32px_rgba(0,0,0,0.10)] hover:-translate-y-0.5 transition-all duration-300"
                      data-testid={`form-card-${category}-${index}`}
                    >
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-primary to-primary/80 rounded-xl flex items-center justify-center flex-shrink-0 shadow-md">
                          <FileText className="w-6 h-6 text-white" />
                        </div>

                        <div className="min-w-0 flex-1">
                          <h3 className="text-base sm:text-lg font-bold text-foreground mb-2">
                            {form.title}
                          </h3>
                          <p className="text-sm text-muted-foreground mb-4 leading-relaxed">
                            {form.description}
                          </p>

                          {/* ✅ FIX: real link to /public/forms/... */}
                          <a
                            href={getFileHref(form.fileName)}
                            download
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center text-sm font-semibold text-primary hover:text-primary/80 transition-colors"
                            data-testid={`download-${category}-${index}`}
                          >
                            <Download className="w-4 h-4 mr-2" />
                            Download PDF
                          </a>

                          <p className="mt-2 text-xs text-muted-foreground">
                            File: <span className="font-mono">{form.fileName}</span>
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>

          {/* Quick help note */}
          <div className="mt-10 md:mt-12 rounded-2xl border border-border/50 bg-white p-5 sm:p-6 text-sm text-muted-foreground">
            <p className="font-medium text-foreground mb-1">Downloads not working?</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>
                Confirm the PDF exists in <span className="font-mono">/public/forms/</span>.
              </li>
              <li>
                Make sure the filename matches exactly (including capitalization), e.g.{' '}
                <span className="font-mono">New-Patient-Registration-Form.pdf</span>.
              </li>
              <li>
                Test directly in the browser: <span className="font-mono">/forms/YourFile.pdf</span>
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* Instructions Section */}
      <section className="py-14 md:py-20 lg:py-24 bg-white" data-testid="forms-instructions">
        <div className="container mx-auto px-4 md:px-6 lg:px-8 max-w-7xl">
          <motion.div {...fadeInUp} className="max-w-4xl mx-auto">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground mb-7 md:mb-8">
              Form Instructions
            </h2>

            <div className="space-y-5 md:space-y-6">
              {[
                'Download and print the forms you need (or complete electronically if the PDF supports it).',
                'Fill out all required fields clearly in black or blue ink.',
                'Bring completed forms with you to your appointment.',
                'If you have questions about any form, please call our office at (630) 429-9000.',
                'New patients should arrive 15 minutes early to complete any remaining paperwork.',
                'Keep copies of important forms for your personal records.',
              ].map((instruction, index) => (
                <div key={index} className="flex items-start gap-3">
                  <CheckCircle className="w-6 h-6 text-primary flex-shrink-0 mt-0.5" />
                  <p className="text-base sm:text-lg text-muted-foreground leading-relaxed">
                    {instruction}
                  </p>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-14 md:py-20 lg:py-24" data-testid="forms-cta">
        <div className="container mx-auto px-4 md:px-6 lg:px-8 max-w-7xl">
          <motion.div
            {...fadeInUp}
            className="bg-gradient-to-br from-primary to-primary/80 rounded-3xl p-7 sm:p-8 md:p-12 text-center"
          >
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-semibold text-white mb-3 md:mb-4">
              Need Help with Forms?
            </h2>
            <p className="text-base sm:text-lg text-white/90 mb-7 md:mb-8 max-w-2xl mx-auto">
              Our staff is here to assist you. Call us if you have questions about completing any forms.
            </p>

            <a
              href="tel:6304299000"
              className="inline-flex items-center justify-center bg-white text-primary hover:bg-white/90 h-12 px-8 rounded-full font-medium shadow-md hover:shadow-lg transition-all"
            >
              Call (630) 429-9000
            </a>
          </motion.div>
        </div>
      </section>
    </>
  );
}


