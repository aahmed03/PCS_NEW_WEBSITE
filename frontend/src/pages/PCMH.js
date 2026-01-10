import React from "react";
import { Helmet } from "react-helmet-async";
import { motion } from "framer-motion";
import {
  Award,
  Users,
  Clock,
  HeartPulse,
  ShieldCheck,
  CheckCircle2,
  Stethoscope,
  MessagesSquare,
  MapPin,
  ClipboardList,
  ExternalLink,
  Sparkles,
  HelpCircle,
} from "lucide-react";

export default function PCMH() {
  const fadeInUp = {
    initial: { opacity: 0, y: 18 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true, amount: 0.25 },
    transition: { duration: 0.55, ease: "easeOut" },
  };

  const container = "container mx-auto px-4 md:px-6 lg:px-8 max-w-7xl";

  const stats = [
    { label: "Team-based care", value: "Care Team", icon: Users },
    { label: "Care coordination", value: "Connected", icon: ClipboardList },
    { label: "Access & communication", value: "More Ways", icon: MessagesSquare },
    { label: "Quality & safety focus", value: "Continuous", icon: ShieldCheck },
  ];

  const pillars = [
    {
      icon: Stethoscope,
      title: "Comprehensive primary care",
      description:
        "Your primary care team helps with prevention, chronic conditions, acute concerns, and referrals—so your care is complete and connected.",
    },
    {
      icon: HeartPulse,
      title: "Patient-centered partnership",
      description:
        "We partner with you on goals and decisions, respecting preferences, culture, and what matters most to you.",
    },
    {
      icon: ClipboardList,
      title: "Coordinated care",
      description:
        "We help coordinate specialists, imaging, labs, hospitals, and follow-ups—so transitions are smoother and information is shared.",
    },
    {
      icon: Clock,
      title: "Accessible and responsive",
      description:
        "Same-day options when available, after-visit guidance, and easier ways to reach your care team (portal/messages/phone).",
    },
    {
      icon: ShieldCheck,
      title: "Quality and safety",
      description:
        "We use evidence-based care, track outcomes, and continuously improve—so you receive safer, higher-quality care.",
    },
    {
      icon: Award,
      title: "Recognition & standards",
      description:
        "PCMH recognition (such as NCQA) reflects strong systems for access, coordination, and quality improvement.",
    },
  ];

  const howItWorks = [
    {
      step: "01",
      title: "Pick your primary care team",
      description:
        "You’ll have a personal clinician supported by a care team (nursing, care coordination, front office) working together.",
      icon: Users,
    },
    {
      step: "02",
      title: "Create a care plan",
      description:
        "We align on your goals—prevention, chronic condition control, lifestyle, and medication support—then track progress over time.",
      icon: ClipboardList,
    },
    {
      step: "03",
      title: "Coordinate everything else",
      description:
        "If you need a specialist, test, or hospital care, we help connect the dots and guide next steps and follow-up.",
      icon: ShieldCheck,
    },
    {
      step: "04",
      title: "Stay connected between visits",
      description:
        "You can reach us with questions, refills, results, and guidance—so you’re not managing care alone.",
      icon: MessagesSquare,
    },
  ];

  const benefits = [
    "Better organized care with fewer gaps and duplications",
    "Clearer follow-up after referrals, tests, or hospital visits",
    "A stronger focus on prevention and long-term wellness",
    "Improved communication and shared decision-making",
    "Continuous quality improvement and safer care processes",
  ];

  const faqs = [
    {
      q: "Is a PCMH a physical building?",
      a: "Not necessarily. “Medical home” describes how primary care is organized—team-based, coordinated, accessible, and focused on quality and safety.",
    },
    {
      q: "Do I still see specialists?",
      a: "Yes. PCMH does not replace specialists. It improves coordination so specialty care, tests, and results flow back to your primary care team.",
    },
    {
      q: "Does PCMH change my insurance or costs?",
      a: "PCMH is a care model. Coverage and costs depend on your plan. If you have questions, our team can help you understand visit types and scheduling.",
    },
    {
      q: "How does a PCMH improve care?",
      a: "It emphasizes comprehensive care, coordinated referrals, improved access, and continuous quality improvement—so care is more connected and patient-centered.",
    },
  ];

  const resources = [
    {
      title: "AHRQ: Defining the PCMH (key features/attributes)",
      href: "https://pcmh.ahrq.gov/page/defining-pcmh",
      note: "Overview of core PCMH elements (comprehensive, patient-centered, coordinated, accessible, quality & safety).",
    },
    {
      title: "AAFP/AAP/ACP/AOA: Joint Principles of the PCMH (2007)",
      href: "https://www.aafp.org/dam/AAFP/documents/practice_management/pcmh/initiatives/PCMHJoint.pdf",
      note: "Foundational principles used across healthcare to describe PCMH characteristics.",
    },
    {
      title: "NCQA: PCMH Recognition program",
      href: "https://www.ncqa.org/programs/health-care-providers-practices/patient-centered-medical-home-pcmh/",
      note: "Details on NCQA's recognition program and what it measures.",
    },
    {
      title: "Patient-Centered Primary Care Collaborative (PCPCC)",
      href: "https://www.pcpcc.org/",
      note: "Multi-stakeholder organization advancing high-quality primary care and medical home adoption.",
    },
  ];

  return (
    <>
      <Helmet>
        <title>Patient-Centered Medical Home (PCMH) - Primary Care Services</title>
        <meta
          name="description"
          content="Learn about our Patient-Centered Medical Home (PCMH) approach to coordinated, comprehensive, patient-centered primary care."
        />
      </Helmet>

      {/* HERO */}
      <section className="relative overflow-hidden bg-gradient-to-br from-background via-slate-50 to-teal-50">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-24 -right-24 h-72 w-72 rounded-full bg-primary/10 blur-3xl" />
          <div className="absolute -bottom-24 -left-24 h-72 w-72 rounded-full bg-teal-400/10 blur-3xl" />
        </div>

        <div className={`${container} py-16 md:py-24`}>
          <motion.div {...fadeInUp} className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-primary/20 bg-primary/10">
              <Sparkles className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium text-primary">
                Patient-Centered Medical Home (PCMH)
              </span>
              <span className="mx-1 text-primary/40">•</span>
              <span className="text-sm text-primary/80">Coordinated primary care</span>
            </div>

            <h1 className="mt-5 text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-foreground">
              Care that’s organized around you.
            </h1>

            <p className="mt-5 text-lg md:text-xl leading-relaxed text-muted-foreground">
              A PCMH is a primary care model that emphasizes comprehensive care, a
              patient-centered partnership, coordination across the healthcare system,
              better access, and continuous quality improvement.
            </p>

            <div className="mt-8 flex flex-col sm:flex-row gap-3">
              <a
                href="https://livewell.aah.org/chart/openscheduling/standalone?id=A405777&vt=5662,5655,5633,11259"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center h-12 px-7 rounded-full bg-primary text-primary-foreground hover:opacity-95 transition shadow-md"
              >
                Become a Patient
              </a>

              <a
                href="#pcmh-learn-more"
                className="inline-flex items-center justify-center h-12 px-7 rounded-full bg-white/70 backdrop-blur border border-border hover:bg-white transition"
              >
                Learn how PCMH works
              </a>
            </div>
          </motion.div>

          {/* STATS */}
          <motion.div
            {...fadeInUp}
            transition={{ ...fadeInUp.transition, delay: 0.1 }}
            className="mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
          >
            {stats.map((s, idx) => (
              <div
                key={idx}
                className="rounded-2xl border border-border/60 bg-white/70 backdrop-blur p-5 shadow-[0_2px_10px_rgba(0,0,0,0.06)]"
              >
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
                    <s.icon className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <div className="text-base font-semibold text-foreground">{s.value}</div>
                    <div className="text-sm text-muted-foreground">{s.label}</div>
                  </div>
                </div>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* WHAT IS PCMH */}
      <section id="pcmh-learn-more" className="py-16 md:py-24">
        <div className={container}>
          <motion.div {...fadeInUp} className="max-w-3xl">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground">
              What is a Patient-Centered Medical Home?
            </h2>
            <p className="mt-5 text-lg text-muted-foreground leading-relaxed">
              A PCMH is an approach to primary care that strengthens the relationship between
              patients and their personal clinician, supported by a coordinated care team.
              The goal is to make care more connected, easier to access, and consistently high-quality.
            </p>
            <div className="mt-6 inline-flex items-start gap-3 rounded-2xl border border-border/60 bg-slate-50 p-5">
              <Award className="h-5 w-5 text-primary mt-0.5" />
              <p className="text-sm text-muted-foreground leading-relaxed">
                Many practices demonstrate PCMH capabilities through voluntary recognition programs
                (for example, NCQA PCMH) that assess access, coordination, and quality processes.
              </p>
            </div>
          </motion.div>

          <div className="mt-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {pillars.map((p, index) => (
              <motion.div
                key={index}
                {...fadeInUp}
                transition={{ ...fadeInUp.transition, delay: index * 0.05 }}
                className="group rounded-2xl border border-border/60 bg-white p-6 shadow-[0_2px_10px_rgba(0,0,0,0.06)] hover:shadow-[0_12px_30px_rgba(0,0,0,0.10)] transition"
              >
                <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center shadow-sm">
                  <p.icon className="h-6 w-6 text-white" />
                </div>
                <h3 className="mt-4 text-xl font-semibold text-foreground">{p.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                  {p.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="py-16 md:py-24 bg-white">
        <div className={container}>
          <motion.div {...fadeInUp} className="max-w-3xl">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground">
              How PCMH works in practice
            </h2>
            <p className="mt-4 text-lg text-muted-foreground leading-relaxed">
              We organize care around a long-term relationship, clear care plans, and proactive
              coordination—so your care feels simpler and more connected.
            </p>
          </motion.div>

          <div className="mt-10 grid grid-cols-1 md:grid-cols-2 gap-6">
            {howItWorks.map((item, index) => (
              <motion.div
                key={index}
                {...fadeInUp}
                transition={{ ...fadeInUp.transition, delay: index * 0.06 }}
                className="rounded-2xl border border-border/60 bg-slate-50 p-6"
              >
                <div className="flex items-start gap-4">
                  <div className="shrink-0">
                    <div className="text-xs font-semibold text-primary/80 tracking-widest">
                      STEP {item.step}
                    </div>
                    <div className="mt-2 h-11 w-11 rounded-2xl bg-primary/10 flex items-center justify-center">
                      <item.icon className="h-5 w-5 text-primary" />
                    </div>
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-foreground">{item.title}</h3>
                    <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                      {item.description}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* QUICK NOTE / LOCATIONS */}
          <motion.div {...fadeInUp} className="mt-10 rounded-2xl border border-border/60 bg-white p-6">
            <div className="flex items-start gap-3">
              <MapPin className="h-5 w-5 text-primary mt-0.5" />
              <div>
                <h3 className="text-base font-semibold text-foreground">
                  One team—across visits, locations, and referrals
                </h3>
                <p className="mt-1 text-sm text-muted-foreground leading-relaxed">
                  Wherever you receive care, our goal is continuity: accurate records, clear next steps,
                  and consistent follow-up.
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* BENEFITS */}
      <section className="py-16 md:py-24">
        <div className={container}>
          <motion.div {...fadeInUp} className="max-w-3xl">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground">
              Benefits of a medical home
            </h2>
            <p className="mt-4 text-lg text-muted-foreground leading-relaxed">
              Patients often experience fewer gaps in care, more consistent follow-up, and a stronger
              focus on prevention and long-term health.
            </p>
          </motion.div>

          <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-4">
            {benefits.map((b, i) => (
              <motion.div
                key={i}
                {...fadeInUp}
                transition={{ ...fadeInUp.transition, delay: i * 0.04 }}
                className="flex items-start gap-3 rounded-2xl border border-border/60 bg-white p-5"
              >
                <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                <p className="text-sm md:text-base text-muted-foreground leading-relaxed">{b}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-16 md:py-24 bg-white">
        <div className={container}>
          <motion.div {...fadeInUp} className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-border bg-slate-50">
              <HelpCircle className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium text-foreground">FAQ</span>
            </div>
            <h2 className="mt-4 text-3xl md:text-4xl font-bold text-foreground">
              Common questions
            </h2>
          </motion.div>

          <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-6">
            {faqs.map((f, i) => (
              <motion.div
                key={i}
                {...fadeInUp}
                transition={{ ...fadeInUp.transition, delay: i * 0.05 }}
                className="rounded-2xl border border-border/60 bg-white p-6 shadow-[0_2px_10px_rgba(0,0,0,0.06)]"
              >
                <h3 className="text-lg font-semibold text-foreground">{f.q}</h3>
                <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{f.a}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* TRUSTED RESOURCES */}
      <section className="py-16 md:py-24">
        <div className={container}>
          <motion.div {...fadeInUp} className="max-w-3xl">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground">
              Trusted resources
            </h2>
            <p className="mt-4 text-lg text-muted-foreground leading-relaxed">
              Want to read more about PCMH from national organizations? These are reputable, up-to-date references.
            </p>
          </motion.div>

          <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
            {resources.map((r, i) => (
              <motion.a
                key={i}
                {...fadeInUp}
                transition={{ ...fadeInUp.transition, delay: i * 0.05 }}
                href={r.href}
                target="_blank"
                rel="noopener noreferrer"
                className="group rounded-2xl border border-border/60 bg-white p-6 hover:shadow-[0_12px_30px_rgba(0,0,0,0.10)] transition"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="text-lg font-semibold text-foreground group-hover:text-primary transition">
                      {r.title}
                    </h3>
                    <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{r.note}</p>
                  </div>
                  <ExternalLink className="h-5 w-5 text-muted-foreground group-hover:text-primary transition shrink-0 mt-1" />
                </div>
              </motion.a>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 md:py-24">
        <div className={container}>
          <motion.div
            {...fadeInUp}
            className="relative overflow-hidden rounded-3xl border border-primary/20 bg-gradient-to-br from-primary to-primary/80 p-8 md:p-12 text-center"
          >
            <div className="absolute inset-0 pointer-events-none">
              <div className="absolute -top-24 -right-24 h-72 w-72 rounded-full bg-white/10 blur-3xl" />
              <div className="absolute -bottom-24 -left-24 h-72 w-72 rounded-full bg-white/10 blur-3xl" />
            </div>

            <div className="relative">
              <h2 className="text-3xl md:text-4xl font-semibold text-white">
                Experience patient-centered care
              </h2>
              <p className="mt-4 text-lg text-white/90 max-w-2xl mx-auto">
                Join our medical home and experience coordinated, comprehensive care designed to
                support your health—before, during, and between visits.
              </p>

              <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
                <a
                  href="https://livewell.aah.org/chart/openscheduling/standalone?id=A405777&vt=5662,5655,5633,11259"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center bg-white text-primary hover:bg-white/90 h-12 px-8 rounded-full font-medium shadow-md hover:shadow-lg transition-all"
                >
                  Become a Patient
                </a>
                <a
                  href="/contact"
                  className="inline-flex items-center justify-center bg-transparent text-white border border-white/30 hover:border-white/60 h-12 px-8 rounded-full font-medium transition-all"
                >
                  Contact Us
                </a>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    </>
  );
}
