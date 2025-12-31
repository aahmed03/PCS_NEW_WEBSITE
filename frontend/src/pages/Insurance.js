import React from 'react';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { CreditCard, Phone, FileText, CheckCircle, AlertCircle } from 'lucide-react';

export default function Insurance() {
  const fadeInUp = {
    initial: { opacity: 0, y: 30 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6 }
  };

  const acceptedPlans = [
    'Blue Cross Blue Shield of Illinois',
    'Aetna',
    'UnitedHealthcare / UHC',
    'Cigna',
    'Humana',
    'Medicare',
    'Medicaid / State of Illinois',
    'Tricare',
    'Railroad Medicare',
    'CountyCare',
    'Meridian Health Plan',
    'Molina Healthcare'
  ];

  return (
    <>
      <Helmet>
        <title>Insurance Information - Primary Care Services</title>
        <meta name="description" content="Information about accepted insurance plans, billing procedures, and payment options at Primary Care Services." />
      </Helmet>

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-background via-slate-50 to-teal-50 py-16 md:py-24">
        <div className="container mx-auto px-4 md:px-6 lg:px-8 max-w-7xl">
          <motion.div {...fadeInUp} className="text-center max-w-3xl mx-auto">
            <div className="inline-flex items-center space-x-2 mb-4 px-4 py-2 bg-primary/10 rounded-md border border-primary/20">
              <CreditCard className="w-5 h-5 text-primary" />
              <span className="text-sm font-medium text-primary tracking-wide uppercase">Billing & Insurance</span>
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight leading-tight text-foreground mt-2 mb-6">
              Insurance Information
            </h1>
            <p className="text-lg md:text-xl leading-relaxed text-muted-foreground">
              We accept most major insurance plans and are committed to making healthcare affordable and accessible.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Accepted Plans */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4 md:px-6 lg:px-8 max-w-7xl">
          <motion.div {...fadeInUp} className="max-w-4xl mx-auto mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6">Accepted Insurance Plans</h2>
            <p className="text-lg text-muted-foreground leading-relaxed mb-8">
              We participate with most major insurance carriers. Below is a list of commonly accepted plans. This list is not exhaustive, so please call our office to verify that we accept your specific plan.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-w-5xl mx-auto">
            {acceptedPlans.map((plan, index) => (
              <motion.div
                key={index}
                {...fadeInUp}
                transition={{ delay: index * 0.05 }}
                className="bg-white p-4 rounded-lg border border-border/50 shadow-[0_2px_8px_rgba(0,0,0,0.04)] flex items-center space-x-3"
              >
                <CheckCircle className="w-5 h-5 text-primary flex-shrink-0" />
                <span className="text-base text-foreground font-medium">{plan}</span>
              </motion.div>
            ))}
          </div>

          <motion.div {...fadeInUp} className="mt-12 bg-blue-50 border border-blue-200 rounded-xl p-6 max-w-4xl mx-auto">
            <div className="flex items-start space-x-3">
              <AlertCircle className="w-6 h-6 text-blue-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-base text-blue-900 font-medium mb-2">
                  Don't see your insurance listed?
                </p>
                <p className="text-sm text-blue-800">
                  Please call our billing department at (630) 429-9000 to verify coverage. Insurance plans and networks change frequently.
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Important Information */}
      <section className="py-16 md:py-24 bg-white">
        <div className="container mx-auto px-4 md:px-6 lg:px-8 max-w-7xl">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-6xl mx-auto">
            <motion.div {...fadeInUp} className="bg-gradient-to-b from-white to-slate-50 p-8 rounded-xl border border-border/50 shadow-[0_2px_8px_rgba(0,0,0,0.08)]">
              <div className="w-14 h-14 bg-gradient-to-br from-primary to-primary/80 rounded-xl flex items-center justify-center mb-4 shadow-md">
                <FileText className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-foreground mb-4">What to Bring</h3>
              <ul className="space-y-3">
                {[
                  'Current insurance card (bring to every visit)',
                  'Photo identification',
                  'List of current medications',
                  'Referral form if required by your plan',
                  'Copayment (due at time of service)'
                ].map((item, idx) => (
                  <li key={idx} className="flex items-start space-x-2">
                    <CheckCircle className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                    <span className="text-base text-muted-foreground">{item}</span>
                  </li>
                ))}
              </ul>
            </motion.div>

            <motion.div {...fadeInUp} transition={{ delay: 0.1 }} className="bg-gradient-to-b from-white to-slate-50 p-8 rounded-xl border border-border/50 shadow-[0_2px_8px_rgba(0,0,0,0.08)]">
              <div className="w-14 h-14 bg-gradient-to-br from-primary to-primary/80 rounded-xl flex items-center justify-center mb-4 shadow-md">
                <CreditCard className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-foreground mb-4">Payment Options</h3>
              <ul className="space-y-3">
                {[
                  'Cash or check',
                  'Credit cards (Visa, MasterCard, Discover, AmEx)',
                  'Debit cards',
                  'Payment plans available for qualifying patients',
                  'FSA and HSA cards accepted'
                ].map((item, idx) => (
                  <li key={idx} className="flex items-start space-x-2">
                    <CheckCircle className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                    <span className="text-base text-muted-foreground">{item}</span>
                  </li>
                ))}
              </ul>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Billing Information */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4 md:px-6 lg:px-8 max-w-7xl">
          <motion.div {...fadeInUp} className="max-w-4xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-8">Billing Information</h2>
            <div className="space-y-6">
              <div className="bg-white p-6 rounded-xl border border-border/50">
                <h3 className="text-xl font-bold text-foreground mb-3">Insurance Verification</h3>
                <p className="text-base text-muted-foreground leading-relaxed">
                  We verify insurance benefits prior to your appointment. However, it is ultimately the patient's responsibility to understand their coverage, including copayments, coinsurance, and deductibles.
                </p>
              </div>

              <div className="bg-white p-6 rounded-xl border border-border/50">
                <h3 className="text-xl font-bold text-foreground mb-3">Copayments & Deductibles</h3>
                <p className="text-base text-muted-foreground leading-relaxed">
                  Copayments are due at the time of service. If you have a deductible, you will be responsible for the full cost of services until your deductible is met. We will file claims with your insurance company on your behalf.
                </p>
              </div>

              <div className="bg-white p-6 rounded-xl border border-border/50">
                <h3 className="text-xl font-bold text-foreground mb-3">Billing Questions</h3>
                <p className="text-base text-muted-foreground leading-relaxed">
                  If you have questions about your bill or insurance coverage, please contact our billing department at (630) 429-9000. Our staff is available Monday through Friday, 8:00 AM to 5:00 PM.
                </p>
              </div>

              <div className="bg-white p-6 rounded-xl border border-border/50">
                <h3 className="text-xl font-bold text-foreground mb-3">Self-Pay Patients</h3>
                <p className="text-base text-muted-foreground leading-relaxed">
                  We welcome patients without insurance. Payment is expected at the time of service. Please speak with our billing department about self-pay rates and payment plan options.
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 md:py-24 bg-white">
        <div className="container mx-auto px-4 md:px-6 lg:px-8 max-w-7xl">
          <motion.div {...fadeInUp} className="bg-gradient-to-br from-primary to-primary/80 rounded-3xl p-8 md:p-12 text-center">
            <h2 className="text-3xl md:text-4xl font-semibold text-white mb-4">
              Questions About Insurance?
            </h2>
            <p className="text-lg text-white/90 mb-8 max-w-2xl mx-auto">
              Our billing team is here to help you understand your coverage and answer any questions.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="tel:6304299000"
                className="inline-flex items-center justify-center bg-white text-primary hover:bg-white/90 h-12 px-8 rounded-full font-medium shadow-md hover:shadow-lg transition-all"
              >
                <Phone className="w-5 h-5 mr-2" />
                Call Billing: (630) 429-9000
              </a>
            </div>
          </motion.div>
        </div>
      </section>
    </>
  );
}
