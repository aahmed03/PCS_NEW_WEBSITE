import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { motion, AnimatePresence } from 'framer-motion';
import { HelpCircle, ChevronDown, ChevronUp } from 'lucide-react';

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState(null);

  const fadeInUp = {
    initial: { opacity: 0, y: 30 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6 }
  };

  const faqs = [
    {
      category: 'Appointments',
      questions: [
        {
          q: 'How do I schedule an appointment?',
          a: 'You can schedule an appointment by calling our office at (630) 429-9000 or booking online through our patient portal at https://livewell.aah.org. We offer same-day appointments for urgent needs.'
        },
        {
          q: 'What should I bring to my first appointment?',
          a: 'Please bring a valid photo ID, your insurance card, a list of current medications, any relevant medical records from previous providers, and your copayment. New patients should arrive 15 minutes early to complete paperwork.'
        },
        {
          q: 'Do you offer same-day appointments?',
          a: 'Yes! We strive to accommodate same-day appointments for urgent medical needs. Please call our office as early in the day as possible to check availability.'
        },
        {
          q: 'What is your cancellation policy?',
          a: 'We require 24-hour notice for appointment cancellations. This allows us to offer the time slot to other patients who need care. Late cancellations or no-shows may result in a fee.'
        }
      ]
    },
    {
      category: 'Insurance & Billing',
      questions: [
        {
          q: 'What insurance plans do you accept?',
          a: 'We accept most major insurance plans including Blue Cross Blue Shield, Aetna, UnitedHealthcare, Cigna, Humana, Medicare, and Medicaid. Please call our office to verify your specific plan is accepted.'
        },
        {
          q: 'When is payment due?',
          a: 'Copayments are due at the time of service. If you have a deductible, you may be responsible for payment until your deductible is met. We accept cash, checks, and all major credit cards.'
        },
        {
          q: 'Do you offer payment plans?',
          a: 'Yes, we offer payment plans for qualifying patients. Please speak with our billing department to discuss your options and set up a payment arrangement.'
        },
        {
          q: 'How do I request an itemized bill?',
          a: 'You can request an itemized bill by calling our billing department at (630) 429-9000 or sending a secure message through the patient portal.'
        }
      ]
    },
    {
      category: 'Patient Portal',
      questions: [
        {
          q: 'How do I access the patient portal?',
          a: 'Visit https://livewell.aah.org and click "Login". If you haven\'t registered yet, contact our office at (630) 429-9000 for an activation code.'
        },
        {
          q: 'What can I do in the patient portal?',
          a: 'Through the patient portal, you can view appointments, review lab results, request prescription refills, send secure messages to your care team, update personal information, and access your medical history 24/7.'
        },
        {
          q: 'I forgot my patient portal password. What should I do?',
          a: 'Click "Forgot Password" on the login page to reset your password. If you continue to have issues, please call our office and we can help you regain access.'
        }
      ]
    },
    {
      category: 'Prescriptions & Refills',
      questions: [
        {
          q: 'How do I request a prescription refill?',
          a: 'You can request refills through the patient portal, by calling our office, or by having your pharmacy contact us directly. Please allow 24-48 hours for refill requests to be processed.'
        },
        {
          q: 'Can I get a prescription without an office visit?',
          a: 'Routine medication refills for established patients can often be handled without an office visit. However, controlled substances and certain medications require an in-person evaluation.'
        },
        {
          q: 'What if I need a medication urgently?',
          a: 'For urgent medication needs, please call our office. We can often provide emergency refills to get you through until your next appointment or until your refill can be processed.'
        }
      ]
    },
    {
      category: 'Medical Records',
      questions: [
        {
          q: 'How do I request copies of my medical records?',
          a: 'You can access most of your medical records through the patient portal. For complete records or records to transfer to another provider, please submit a written request to our office. There may be a fee for extensive record copies.'
        },
        {
          q: 'How long does it take to receive medical records?',
          a: 'Standard requests are processed within 30 days as required by law. Rush requests may be available for an additional fee. Records can be picked up, mailed, or sent electronically to another healthcare provider.'
        },
        {
          q: 'Can family members access my medical records?',
          a: 'With your written authorization, we can release your medical records to family members or other designated individuals. You can complete a HIPAA authorization form at our office or download it from our website.'
        }
      ]
    },
    {
      category: 'General Questions',
      questions: [
        {
          q: 'What are your office hours?',
          a: 'We are open Monday through Thursday from 8:00 AM to 5:00 PM, and Friday from 8:00 AM to 4:00 PM. We are closed on weekends and major holidays.'
        },
        {
          q: 'Do you accept new patients?',
          a: 'Yes, we are currently accepting new patients! Call (630) 429-9000 to schedule your first appointment. We look forward to partnering with you in your healthcare.'
        },
        {
          q: 'What should I do in a medical emergency?',
          a: 'For medical emergencies, call 911 or go to the nearest emergency room. Our office cannot handle medical emergencies after hours. For urgent but non-emergency issues, you may call our office during business hours.'
        },
        {
          q: 'Do you offer telehealth visits?',
          a: 'Yes, we offer telehealth appointments for appropriate medical concerns. Ask our scheduling team if your appointment can be conducted via video visit when you call to schedule.'
        },
        {
          q: 'Are your locations wheelchair accessible?',
          a: 'Yes, both our Lombard and Glendale Heights locations are fully wheelchair accessible with elevators, handicap-accessible parking, and accessible exam rooms.'
        }
      ]
    }
  ];

  const toggleQuestion = (categoryIndex, questionIndex) => {
    const index = `${categoryIndex}-${questionIndex}`;
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <>
      <Helmet>
        <title>Frequently Asked Questions (FAQ) - Primary Care Services</title>
        <meta name="description" content="Find answers to common questions about appointments, insurance, patient portal, prescriptions, medical records, and more." />
      </Helmet>

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-background via-slate-50 to-teal-50 py-16 md:py-24">
        <div className="container mx-auto px-4 md:px-6 lg:px-8 max-w-7xl">
          <motion.div {...fadeInUp} className="text-center max-w-3xl mx-auto">
            <div className="inline-flex items-center space-x-2 mb-4 px-4 py-2 bg-primary/10 rounded-md border border-primary/20">
              <HelpCircle className="w-5 h-5 text-primary" />
              <span className="text-sm font-medium text-primary tracking-wide uppercase">Help Center</span>
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight leading-tight text-foreground mt-2 mb-6">
              Frequently Asked Questions
            </h1>
            <p className="text-lg md:text-xl leading-relaxed text-muted-foreground">
              Find answers to common questions about our services, appointments, billing, and more.
            </p>
          </motion.div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4 md:px-6 lg:px-8 max-w-4xl">
          <div className="space-y-12">
            {faqs.map((category, catIndex) => (
              <motion.div
                key={catIndex}
                {...fadeInUp}
                transition={{ delay: catIndex * 0.1 }}
              >
                <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-6 pb-4 border-b border-border">
                  {category.category}
                </h2>
                <div className="space-y-4">
                  {category.questions.map((faq, qIndex) => {
                    const index = `${catIndex}-${qIndex}`;
                    const isOpen = openIndex === index;
                    
                    return (
                      <div
                        key={qIndex}
                        className="bg-white rounded-xl border border-border/50 shadow-[0_2px_8px_rgba(0,0,0,0.04)] overflow-hidden"
                      >
                        <button
                          onClick={() => toggleQuestion(catIndex, qIndex)}
                          className="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-slate-50 transition-colors"
                          data-testid={`faq-question-${index}`}
                        >
                          <span className="text-lg font-semibold text-foreground pr-4">
                            {faq.q}
                          </span>
                          {isOpen ? (
                            <ChevronUp className="w-5 h-5 text-primary flex-shrink-0" />
                          ) : (
                            <ChevronDown className="w-5 h-5 text-muted-foreground flex-shrink-0" />
                          )}
                        </button>
                        
                        <AnimatePresence>
                          {isOpen && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: 'auto', opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={{ duration: 0.3 }}
                            >
                              <div className="px-6 pb-4 pt-2 border-t border-border/40">
                                <p className="text-base text-muted-foreground leading-relaxed">
                                  {faq.a}
                                </p>
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    );
                  })}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 md:py-24 bg-white">
        <div className="container mx-auto px-4 md:px-6 lg:px-8 max-w-7xl">
          <motion.div {...fadeInUp} className="bg-gradient-to-br from-primary to-primary/80 rounded-3xl p-8 md:p-12 text-center">
            <h2 className="text-3xl md:text-4xl font-semibold text-white mb-4">
              Still Have Questions?
            </h2>
            <p className="text-lg text-white/90 mb-8 max-w-2xl mx-auto">
              Can't find the answer you're looking for? Our friendly staff is here to help.
            </p>
            <a
              href="tel:6304299000"
              className="inline-flex items-center justify-center bg-white text-primary hover:bg-white/90 h-12 px-8 rounded-full font-medium shadow-md hover:shadow-lg transition-all"
            >
              Call Us: (630) 429-9000
            </a>
          </motion.div>
        </div>
      </section>
    </>
  );
}
