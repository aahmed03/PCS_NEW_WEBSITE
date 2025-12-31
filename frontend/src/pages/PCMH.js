import React from 'react';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { Award, Users, Clock, Heart, Shield, CheckCircle } from 'lucide-react';

export default function PCMH() {
  const fadeInUp = {
    initial: { opacity: 0, y: 30 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6 }
  };

  return (
    <>
      <Helmet>
        <title>Patient-Centered Medical Home (PCMH) - Primary Care Services</title>
        <meta name="description" content="Learn about our NCQA-recognized Patient-Centered Medical Home (PCMH) program providing coordinated, comprehensive primary care." />
      </Helmet>

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-background via-slate-50 to-teal-50 py-16 md:py-24">
        <div className="container mx-auto px-4 md:px-6 lg:px-8 max-w-7xl">
          <motion.div {...fadeInUp} className="text-center max-w-3xl mx-auto">
            <div className="inline-flex items-center space-x-2 mb-4 px-4 py-2 bg-primary/10 rounded-md border border-primary/20">
              <Award className="w-5 h-5 text-primary" />
              <span className="text-sm font-medium text-primary tracking-wide uppercase">NCQA Recognized</span>
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight leading-tight text-foreground mt-2 mb-6">
              Patient-Centered Medical Home
            </h1>
            <p className="text-lg md:text-xl leading-relaxed text-muted-foreground">
              We are proud to be recognized as a Patient-Centered Medical Home (PCMH) by the National Committee for Quality Assurance (NCQA).
            </p>
          </motion.div>
        </div>
      </section>

      {/* What is PCMH */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4 md:px-6 lg:px-8 max-w-7xl">
          <motion.div {...fadeInUp} className="max-w-4xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6">What is a Patient-Centered Medical Home?</h2>
            <p className="text-lg text-muted-foreground leading-relaxed mb-4">
              A Patient-Centered Medical Home (PCMH) is a healthcare setting that facilitates partnerships between individual patients and their personal healthcare providers. The PCMH model is a way of organizing primary care that emphasizes care coordination and communication to transform primary care into what patients want it to be.
            </p>
            <p className="text-lg text-muted-foreground leading-relaxed">
              As your medical home, we provide a team-based approach to healthcare that puts you, the patient, at the center of everything we do. Our goal is to provide you with the best possible care through improved access, coordination, and quality.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: Users,
                title: 'Team-Based Care',
                description: 'Your personal physician leads a care team dedicated to providing comprehensive, coordinated care tailored to your needs.'
              },
              {
                icon: Clock,
                title: 'Enhanced Access',
                description: 'Same-day appointments, extended hours, 24/7 patient portal access, and electronic communication with your care team.'
              },
              {
                icon: Heart,
                title: 'Whole-Person Care',
                description: 'We address all of your healthcare needs including physical health, mental health, and preventive care.'
              },
              {
                icon: Shield,
                title: 'Quality & Safety',
                description: 'Evidence-based care with continuous quality improvement and focus on patient safety at every level.'
              },
              {
                icon: CheckCircle,
                title: 'Care Coordination',
                description: 'We coordinate your care with specialists, hospitals, and other healthcare providers to ensure seamless transitions.'
              },
              {
                icon: Award,
                title: 'NCQA Recognition',
                description: 'Our practice meets the highest standards set by the National Committee for Quality Assurance for patient-centered care.'
              }
            ].map((feature, index) => (
              <motion.div
                key={index}
                {...fadeInUp}
                transition={{ delay: index * 0.1 }}
                className="bg-white p-8 rounded-xl border border-border/50 shadow-[0_2px_8px_rgba(0,0,0,0.08)] hover:shadow-[0_12px_32px_rgba(0,0,0,0.12)] transition-all duration-300"
              >
                <div className="w-14 h-14 bg-gradient-to-br from-primary to-primary/80 rounded-xl flex items-center justify-center mb-4 shadow-md">
                  <feature.icon className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-xl font-bold text-foreground mb-3">{feature.title}</h3>
                <p className="text-base text-muted-foreground leading-relaxed">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-16 md:py-24 bg-white">
        <div className="container mx-auto px-4 md:px-6 lg:px-8 max-w-7xl">
          <motion.div {...fadeInUp} className="max-w-4xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-8">Benefits of Our Medical Home</h2>
            <div className="space-y-6">
              {[
                'Better health outcomes through coordinated, comprehensive care',
                'Reduced emergency room visits and hospitalizations',
                'Improved patient satisfaction and experience',
                'Enhanced communication between you and your care team',
                'More efficient use of healthcare resources',
                'Focus on prevention and wellness, not just illness treatment',
                'Seamless transitions between care settings',
                'Use of health information technology to improve care quality'
              ].map((benefit, index) => (
                <motion.div
                  key={index}
                  {...fadeInUp}
                  transition={{ delay: index * 0.05 }}
                  className="flex items-start space-x-3"
                >
                  <CheckCircle className="w-6 h-6 text-primary flex-shrink-0 mt-0.5" />
                  <p className="text-lg text-muted-foreground">{benefit}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4 md:px-6 lg:px-8 max-w-7xl">
          <motion.div {...fadeInUp} className="bg-gradient-to-br from-primary to-primary/80 rounded-3xl p-8 md:p-12 text-center">
            <h2 className="text-3xl md:text-4xl font-semibold text-white mb-4">
              Experience Patient-Centered Care
            </h2>
            <p className="text-lg text-white/90 mb-8 max-w-2xl mx-auto">
              Join our medical home and experience the difference of coordinated, comprehensive, patient-centered care.
            </p>
            <a
              href="https://livewell.aah.org/chart/openscheduling/standalone?id=A405777&vt=5662,5655,5633,11259"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center bg-white text-primary hover:bg-white/90 h-12 px-8 rounded-full font-medium shadow-md hover:shadow-lg transition-all"
            >
              Become a Patient
            </a>
          </motion.div>
        </div>
      </section>
    </>
  );
}
