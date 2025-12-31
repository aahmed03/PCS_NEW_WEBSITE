// PatientPortal.js
import React from "react";
import { Helmet } from "react-helmet-async";
import { motion } from "framer-motion";
import {
  ExternalLink,
  Calendar,
  FileText,
  MessageSquare,
  Activity,
  Lock,
  ShieldCheck,
  Smartphone,
} from "lucide-react";
import { Button } from "@/components/ui/button";

export default function PatientPortal() {
  const heroImage = "/images/header/Back01.jpg"; // ✅ Put this in: frontend/public/images/header/center2.jpg

  const fadeInUp = {
    initial: { opacity: 0, y: 22 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.55 },
  };

  const portalUrl = "https://livewell.aah.org/Chart/Authentication/Login";

  const features = [
    {
      icon: Calendar,
      title: "View & Schedule Appointments",
      description:
        "See upcoming visits, request appointments, and receive reminders—anytime.",
    },
    {
      icon: Activity,
      title: "Lab & Test Results",
      description:
        "Access results securely as soon as they are available (timing may vary).",
    },
    {
      icon: FileText,
      title: "Medical Records & Visit Summaries",
      description:
        "Review visit notes, after-visit instructions, and key parts of your record.",
    },
    {
      icon: MessageSquare,
      title: "Message Your Care Team",
      description:
        "Send secure messages for non-urgent questions and follow-ups.",
    },
    {
      icon: FileText,
      title: "Medications & Refills",
      description:
        "Review your medications and request refills when eligible.",
    },
    {
      icon: Smartphone,
      title: "Mobile-Friendly Access",
      description:
        "Use MyChart on your phone or tablet for quick access on the go.",
    },
  ];

  return (
    <>
      <Helmet>
        <title>Patient Portal - Primary Care Services</title>
        <meta
          name="description"
          content="Access your health information 24/7 through our secure patient portal powered by EPIC MyChart."
        />
      </Helmet>

      {/* Hero Section (PatientEducation-style) */}
      <section className="relative overflow-hidden" data-testid="patient-portal-hero">
        <div
          className="relative w-full min-h-[320px] md:min-h-[420px] lg:min-h-[480px] flex items-center bg-slate-900"
          style={{
            backgroundImage: `url(${heroImage})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/55 to-black/25" />

          <div className="relative container mx-auto px-4 md:px-6 lg:px-8 max-w-7xl py-14 md:py-16 lg:py-20">
            <motion.div {...fadeInUp} className="max-w-3xl text-center mx-auto">
              <div className="inline-flex items-center gap-2 mb-4 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-md border border-white/20">
                <ShieldCheck className="w-5 h-5 text-white" />
                <span className="text-sm font-semibold tracking-wide uppercase text-white">
                  24/7 Secure Access
                </span>
              </div>

              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-white mb-4">
                Patient Portal
              </h1>

              <p className="text-base sm:text-lg md:text-xl text-white/90 leading-relaxed max-w-2xl mx-auto">
                Access your health information anytime through our secure EPIC MyChart patient portal.
              </p>

              <div className="mt-7 flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
                <Button
                  asChild
                  size="lg"
                  className="bg-primary text-primary-foreground hover:bg-primary/90 h-12 sm:h-14 px-7 sm:px-10 rounded-full font-medium shadow-md hover:shadow-lg transition-all"
                  data-testid="patient-portal-primary-cta"
                >
                  <a href={portalUrl} target="_blank" rel="noopener noreferrer">
                    Go to Patient Portal
                    <ExternalLink className="w-5 h-5 ml-2" />
                  </a>
                </Button>

                <Button
                  asChild
                  size="lg"
                  variant="outline"
                  className="h-12 sm:h-14 px-7 sm:px-10 rounded-full font-medium border-2 border-white/70 text-white hover:bg-white/10"
                  data-testid="patient-portal-call-cta"
                >
                  <a href="tel:6304299000">
                    Need Help? Call (630) 429-9000
                  </a>
                </Button>
              </div>

              <p className="mt-4 text-xs sm:text-sm text-white/80">
                For emergencies, call 911. Portal messaging is for non-urgent issues only.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-12 md:py-16 lg:py-20" data-testid="patient-portal-features">
        <div className="container mx-auto px-4 md:px-6 lg:px-8 max-w-7xl">
          <motion.div {...fadeInUp} className="text-center mb-10 md:mb-12">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground mb-3">
              Portal Features
            </h2>
            <p className="text-sm sm:text-base md:text-lg text-muted-foreground max-w-2xl mx-auto">
              Everything you need to manage your healthcare in one secure, convenient location.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6 lg:gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                {...fadeInUp}
                transition={{ delay: Math.min(index * 0.08, 0.25) }}
                className="bg-white p-6 sm:p-7 rounded-2xl border border-border/60 shadow-[0_2px_10px_rgba(0,0,0,0.06)] hover:shadow-[0_14px_40px_rgba(0,0,0,0.10)] hover:-translate-y-1 transition-all duration-300"
                data-testid={`patient-portal-feature-${index}`}
              >
                <div className="w-14 h-14 bg-gradient-to-br from-primary to-primary/80 rounded-xl flex items-center justify-center mb-4 shadow-md">
                  <feature.icon className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-lg sm:text-xl font-bold text-foreground mb-2">
                  {feature.title}
                </h3>
                <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>

          <div className="mt-10 md:mt-12 text-center">
            <Button
              asChild
              size="lg"
              className="bg-primary text-primary-foreground hover:bg-primary/90 h-12 px-8 rounded-full font-medium shadow-md hover:shadow-lg"
              data-testid="patient-portal-secondary-cta"
            >
              <a href={portalUrl} target="_blank" rel="noopener noreferrer">
                Login to MyChart
                <ExternalLink className="w-5 h-5 ml-2" />
              </a>
            </Button>
          </div>
        </div>
      </section>

      {/* How to Access */}
      <section className="py-12 md:py-16 lg:py-20 bg-white" data-testid="patient-portal-howto">
        <div className="container mx-auto px-4 md:px-6 lg:px-8 max-w-7xl">
          <motion.div {...fadeInUp} className="max-w-4xl mx-auto">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground mb-8 text-center">
              How to Access the Patient Portal
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* New Users */}
              <div className="bg-gradient-to-br from-primary/5 to-secondary/5 rounded-2xl p-6 sm:p-7 border border-border/50">
                <h3 className="text-lg sm:text-xl font-bold text-foreground mb-3">
                  New Users
                </h3>
                <p className="text-sm sm:text-base text-muted-foreground leading-relaxed mb-4">
                  If you are a current patient and haven’t enrolled yet, please contact our office for activation
                  instructions.
                </p>
                <div className="flex flex-col gap-3">
                  <Button asChild className="rounded-full bg-primary text-primary-foreground hover:bg-primary/90">
                    <a href="tel:6304299000">Call (630) 429-9000</a>
                  </Button>
                  <p className="text-xs sm:text-sm text-muted-foreground">
                    We’ll provide an activation code and steps to create your account.
                  </p>
                </div>
              </div>

              {/* Returning Users */}
              <div className="bg-gradient-to-br from-primary/5 to-secondary/5 rounded-2xl p-6 sm:p-7 border border-border/50">
                <h3 className="text-lg sm:text-xl font-bold text-foreground mb-3">
                  Returning Users
                </h3>
                <p className="text-sm sm:text-base text-muted-foreground leading-relaxed mb-4">
                  Click below to sign in to your EPIC MyChart account.
                </p>
                <Button
                  asChild
                  className="rounded-full bg-primary text-primary-foreground hover:bg-primary/90"
                >
                  <a href={portalUrl} target="_blank" rel="noopener noreferrer">
                    Login to Portal
                    <ExternalLink className="w-4 h-4 ml-2" />
                  </a>
                </Button>

                <div className="mt-4 text-xs sm:text-sm text-muted-foreground">
                  Tip: Save the login page as a bookmark on your browser or home screen.
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Security Notice */}
      <section className="py-12 md:py-16 lg:py-20" data-testid="patient-portal-security">
        <div className="container mx-auto px-4 md:px-6 lg:px-8 max-w-7xl">
          <motion.div
            {...fadeInUp}
            className="bg-white rounded-2xl border border-border/60 shadow-[0_2px_10px_rgba(0,0,0,0.06)] p-6 sm:p-8 md:p-10"
          >
            <div className="flex flex-col sm:flex-row items-start gap-4 sm:gap-6">
              <div className="w-14 h-14 sm:w-16 sm:h-16 bg-gradient-to-br from-primary to-primary/80 rounded-xl flex items-center justify-center flex-shrink-0 shadow-md">
                <Lock className="w-7 h-7 sm:w-8 sm:h-8 text-white" />
              </div>

              <div className="flex-1">
                <h3 className="text-xl sm:text-2xl font-bold text-foreground mb-3">
                  Your Privacy & Security
                </h3>
                <p className="text-sm sm:text-base text-muted-foreground leading-relaxed mb-3">
                  The patient portal uses industry-standard security measures to help protect your personal health
                  information. Access is protected by your unique username and password.
                </p>
                <ul className="text-sm sm:text-base text-muted-foreground space-y-2">
                  <li className="flex items-start gap-2">
                    <span className="mt-2 w-1.5 h-1.5 rounded-full bg-primary flex-shrink-0" />
                    Never share your login credentials.
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="mt-2 w-1.5 h-1.5 rounded-full bg-primary flex-shrink-0" />
                    Use a strong password and update it regularly.
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="mt-2 w-1.5 h-1.5 rounded-full bg-primary flex-shrink-0" />
                    If you suspect unauthorized access, contact our office immediately.
                  </li>
                </ul>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="py-12 md:py-16 bg-white" data-testid="patient-portal-bottom-cta">
        <div className="container mx-auto px-4 md:px-6 lg:px-8 max-w-7xl">
          <motion.div
            {...fadeInUp}
            className="bg-gradient-to-br from-primary to-primary/80 rounded-3xl p-7 sm:p-9 md:p-12 text-center"
          >
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-3">
              Ready to Login?
            </h2>
            <p className="text-sm sm:text-base md:text-lg text-white/90 mb-7 max-w-2xl mx-auto">
              Access your records, appointments, and secure messages through MyChart.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
              <a
                href={portalUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center bg-white text-primary hover:bg-white/90 h-12 px-8 rounded-full font-medium shadow-md hover:shadow-lg transition-all"
              >
                Go to Patient Portal
                <ExternalLink className="w-5 h-5 ml-2" />
              </a>
              <a
                href="tel:6304299000"
                className="inline-flex items-center justify-center border-2 border-white text-white hover:bg-white/10 h-12 px-8 rounded-full font-medium transition-all"
              >
                Call (630) 429-9000
              </a>
            </div>
          </motion.div>
        </div>
      </section>
    </>
  );
}
