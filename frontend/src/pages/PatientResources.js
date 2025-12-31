import React, { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { FileText, Download, HelpCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { resourcesApi } from '@/utils/api';

export default function PatientResources() {
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchResources = async () => {
      try {
        const response = await resourcesApi.getAll();
        setResources(response.data);
      } catch (error) {
        console.error('Failed to fetch resources:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchResources();
  }, []);

  const fadeInUp = {
    initial: { opacity: 0, y: 30 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6 }
  };

  const groupedResources = resources.reduce((acc, resource) => {
    if (!acc[resource.category]) {
      acc[resource.category] = [];
    }
    acc[resource.category].push(resource);
    return acc;
  }, {});

  const categoryTitles = {
    forms: 'Forms & Documents',
    privacy: 'Privacy & Compliance',
    wellness: 'Wellness Resources',
    insurance: 'Insurance Information'
  };

  const faqs = [
    {
      question: 'What should I bring to my first appointment?',
      answer: 'Please bring a valid photo ID, your insurance card, a list of current medications, and any relevant medical records from previous providers. Arriving 15 minutes early to complete paperwork is recommended.'
    },
    {
      question: 'Do you accept my insurance?',
      answer: 'We accept most major insurance plans. Please call our office at (630) 429-9000 to verify your specific plan is accepted. We recommend contacting your insurance provider to confirm coverage details.'
    },
    {
      question: 'How do I request prescription refills?',
      answer: 'Prescription refills can be requested through the patient portal, by calling our office, or by having your pharmacy contact us directly. Please allow 24-48 hours for refill requests to be processed.'
    },
    {
      question: 'What is your cancellation policy?',
      answer: 'We require 24-hour notice for appointment cancellations. This allows us to offer the time slot to other patients who need care. Late cancellations or no-shows may result in a fee.'
    },
    {
      question: 'Do you offer same-day appointments?',
      answer: 'Yes, we strive to accommodate same-day appointments for urgent needs. Please call our office as early in the day as possible to check availability.'
    },
    {
      question: 'How can I access my medical records?',
      answer: 'Medical records can be accessed through the patient portal. For copies of your complete medical records, please submit a written request to our office. There may be a fee for extensive record copies.'
    }
  ];

  return (
    <>
      <Helmet>
        <title>Patient Resources - Primary Care Services</title>
        <meta name="description" content="Download patient forms, review insurance information, and find answers to frequently asked questions." />
      </Helmet>

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-background via-slate-50 to-teal-50 py-16 md:py-24" data-testid="resources-hero">
        <div className="container mx-auto px-4 md:px-6 lg:px-8 max-w-7xl">
          <motion.div {...fadeInUp} className="text-center max-w-3xl mx-auto">
            <span className="text-sm font-bold tracking-wide uppercase text-primary">Helpful Resources</span>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight leading-tight text-foreground mt-2 mb-6">
              Patient Resources
            </h1>
            <p className="text-lg md:text-xl leading-relaxed text-muted-foreground">
              Access important forms, documents, and information to make your visit smoother.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Downloadable Resources */}
      <section className="py-16 md:py-24" data-testid="resources-list">
        <div className="container mx-auto px-4 md:px-6 lg:px-8 max-w-7xl">
          {loading ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">Loading resources...</p>
            </div>
          ) : (
            <div className="space-y-12">
              {Object.entries(groupedResources).map(([category, categoryResources], catIndex) => (
                <motion.div key={category} {...fadeInUp} transition={{ delay: catIndex * 0.1 }}>
                  <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-6">
                    {categoryTitles[category] || category}
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {categoryResources.map((resource, index) => (
                      <div
                        key={resource.resource_id}
                        className="bg-white p-6 rounded-2xl border border-border/50 shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:shadow-[0_8px_24px_rgba(0,0,0,0.08)] transition-all duration-300"
                        data-testid={`resource-${index}`}
                      >
                        <div className="flex items-start space-x-4">
                          <div className="w-14 h-14 bg-gradient-to-br from-primary to-primary/80 rounded-xl flex items-center justify-center flex-shrink-0 shadow-md">
                            <FileText className="w-7 h-7 text-white" />
                          </div>
                          <div className="flex-1">
                            <h3 className="text-lg font-bold text-foreground mb-2">{resource.title}</h3>
                            <p className="text-sm text-muted-foreground mb-4">{resource.description}</p>
                            <Button
                              variant="outline"
                              size="sm"
                              className="border-primary text-primary hover:bg-primary/5 rounded-full"
                            >
                              <Download className="w-4 h-4 mr-2" />
                              Download PDF
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* FAQs */}
      <section className="py-16 md:py-24 bg-white" data-testid="faqs-section">
        <div className="container mx-auto px-4 md:px-6 lg:px-8 max-w-7xl">
          <motion.div {...fadeInUp} className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">Frequently Asked Questions</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Find answers to common questions about our practice and services.
            </p>
          </motion.div>

          <div className="max-w-3xl mx-auto space-y-6">
            {faqs.map((faq, index) => (
              <motion.div
                key={index}
                {...fadeInUp}
                transition={{ delay: index * 0.05 }}
                className="bg-gradient-to-br from-white to-slate-50 p-6 rounded-2xl border border-border/50 shadow-[0_2px_8px_rgba(0,0,0,0.04)]"
                data-testid={`faq-${index}`}
              >
                <div className="flex items-start space-x-3">
                  <HelpCircle className="w-6 h-6 text-primary mt-1 flex-shrink-0" />
                  <div>
                    <h3 className="text-lg font-bold text-foreground mb-2">{faq.question}</h3>
                    <p className="text-base text-muted-foreground leading-relaxed">{faq.answer}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Insurance Info */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4 md:px-6 lg:px-8 max-w-7xl">
          <motion.div {...fadeInUp} className="bg-gradient-to-br from-primary to-primary/80 rounded-3xl p-8 md:p-12">
            <div className="text-center text-white">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Insurance Questions?</h2>
              <p className="text-lg text-white/90 mb-8 max-w-2xl mx-auto">
                Our billing department is here to help with insurance verification, claims, and billing questions.
              </p>
              <Button
                asChild
                size="lg"
                className="bg-white text-primary hover:bg-white/90 h-12 px-8 rounded-full font-medium shadow-md"
              >
                <a href="tel:6304299000">
                  Call Billing: (630) 429-9000
                </a>
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Emergency Disclaimer */}
      <section className="py-12 bg-red-50">
        <div className="container mx-auto px-4 md:px-6 lg:px-8 max-w-7xl">
          <motion.div {...fadeInUp} className="text-center">
            <p className="text-base font-medium text-red-700">
              <strong>Medical Emergency:</strong> For urgent medical issues or emergencies, call 911 or visit the nearest emergency room.
              This website is for informational purposes only and does not replace professional medical advice.
            </p>
          </motion.div>
        </div>
      </section>
    </>
  );
}
