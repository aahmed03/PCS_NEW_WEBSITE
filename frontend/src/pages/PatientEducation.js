// PatientEducation.js
// ✅ Updates in this version:
// 1) Added Search/Filter at the top (filters topics + resource labels)
// 2) Added Accordion expand/collapse per topic (mobile-friendly; reduces scrolling)
// 3) Kept Providers-style hero w/ static background image (/images/header/center2.jpg)
// 4) Responsive grid + accessible controls

import React, { useMemo, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Book,
  Heart,
  Activity,
  Apple,
  Brain,
  Droplet,
  Wind,
  Pill,
  ExternalLink,
  Search,
  ChevronDown,
  X,
} from 'lucide-react';

export default function PatientEducation() {
  const fadeInUp = {
    initial: { opacity: 0, y: 24 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.55 },
  };

  const heroImage = '/images/header/center3.jpg'; // must exist under frontend/public/images/header/center3.jpg

  // ✅ FIX: Reputable resources (unchanged), now used by search/filter + accordion.
  const educationTopics = useMemo(
    () => [
      {
        icon: Heart,
        title: 'Heart Health',
        description:
          'Understand cardiovascular health, recognize warning signs, and reduce risk through lifestyle habits and appropriate screening.',
        resources: [
          { label: 'Blood Pressure Management (AHA)', url: 'https://www.heart.org/en/health-topics/high-blood-pressure' },
          { label: 'High Blood Pressure Basics (NHLBI)', url: 'https://www.nhlbi.nih.gov/health/high-blood-pressure' },
          { label: 'High Cholesterol (CDC)', url: 'https://www.cdc.gov/cholesterol/index.htm' },
          { label: 'Heart Attack Warning Signs (AHA)', url: 'https://www.heart.org/en/health-topics/heart-attack/warning-signs-of-a-heart-attack' },
          { label: 'Benefits of Physical Activity (CDC)', url: 'https://www.cdc.gov/physical-activity-basics/benefits/index.html' },
        ],
      },
      {
        icon: Activity,
        title: 'Diabetes Management',
        description:
          'Learn about prevention, blood sugar monitoring, medication basics, nutrition choices, and activity habits that support healthy glucose control.',
        resources: [
          { label: 'Blood Sugar Monitoring (NIDDK)', url: 'https://www.niddk.nih.gov/health-information/diabetes/overview/managing-diabetes/monitoring-blood-glucose' },
          { label: 'Diabetes: Healthy Eating (NIDDK)', url: 'https://www.niddk.nih.gov/health-information/diabetes/overview/diet-eating-physical-activity' },
          { label: 'Insulin Basics (ADA)', url: 'https://diabetes.org/healthy-living/medication-treatments/insulin-other-injectables/insulin-basics' },
          { label: 'Diabetes Basics (CDC)', url: 'https://www.cdc.gov/diabetes/basics/index.html' },
        ],
      },
      {
        icon: Apple,
        title: 'Nutrition & Diet',
        description:
          'Evidence-based nutrition guidance for healthy weight, chronic disease prevention, and sustainable meal planning.',
        resources: [
          { label: 'MyPlate – Healthy Eating Tips (USDA)', url: 'https://www.myplate.gov/tip-sheet/healthy-eating-tips' },
          { label: 'Dietary Guidelines for Americans', url: 'https://www.dietaryguidelines.gov/' },
          { label: 'Healthy Weight (CDC)', url: 'https://www.cdc.gov/healthy-weight-growth/index.html' },
          { label: 'Meal Planning Basics (MyPlate)', url: 'https://www.myplate.gov/myplate-plan' },
        ],
      },
      {
        icon: Brain,
        title: 'Mental Health',
        description:
          'Support mental well-being with practical coping strategies, sleep hygiene, and trusted guidance on anxiety and depression.',
        resources: [
          { label: 'Depression (NIMH)', url: 'https://www.nimh.nih.gov/health/topics/depression' },
          { label: 'Anxiety Disorders (NIMH)', url: 'https://www.nimh.nih.gov/health/topics/anxiety-disorders' },
          { label: 'Sleep & Sleep Disorders (NHLBI)', url: 'https://www.nhlbi.nih.gov/health/sleep' },
          { label: 'Mindfulness & Meditation (NCCIH/NIH)', url: 'https://www.nccih.nih.gov/health/meditation-and-mindfulness-effectiveness-and-safety' },
          { label: 'Find Treatment / Crisis Help (SAMHSA)', url: 'https://www.samhsa.gov/find-help' },
        ],
      },
      {
        icon: Droplet,
        title: 'Chronic Disease Prevention',
        description:
          'Prevention strategies and screening guidance to reduce risk and catch disease early when treatment is most effective.',
        resources: [
          { label: 'Cancer Prevention (NCI)', url: 'https://www.cancer.gov/about-cancer/causes-prevention/prevention' },
          { label: 'Osteoporosis Prevention (Bone Health & Osteoporosis Foundation)', url: 'https://www.bonehealthandosteoporosis.org/preventing-fractures/general-facts/what-women-need-to-know/' },
          { label: 'Chronic Kidney Disease (NIDDK)', url: 'https://www.niddk.nih.gov/health-information/kidney-disease/chronic-kidney-disease-ckd' },
          { label: 'Recommended Screenings (USPSTF)', url: 'https://www.uspreventiveservicestaskforce.org/uspstf/recommendation-topics/uspstf-a-and-b-recommendations' },
        ],
      },
      {
        icon: Wind,
        title: 'Respiratory Health',
        description:
          'Guidance for asthma/COPD, breathing techniques, and inhaler use—plus when to seek help for shortness of breath.',
        resources: [
          { label: 'Asthma (NHLBI)', url: 'https://www.nhlbi.nih.gov/health/asthma' },
          { label: 'COPD (American Lung Association)', url: 'https://www.lung.org/lung-health-diseases/lung-disease-lookup/copd' },
          { label: 'Breathing Exercises (American Lung Association)', url: 'https://www.lung.org/lung-health-diseases/wellness/breathing-exercises' },
          { label: 'Inhaler Basics (MedlinePlus)', url: 'https://medlineplus.gov/inhalers.html' },
        ],
      },
      {
        icon: Pill,
        title: 'Medication Safety',
        description:
          'Learn how to take medicines safely, avoid harmful interactions, and improve adherence with simple routines.',
        resources: [
          { label: 'Medication Safety Tips (FDA)', url: 'https://www.fda.gov/drugs/special-features/medication-safety' },
          { label: 'How to Take Medicines Safely (MedlinePlus)', url: 'https://medlineplus.gov/ency/patientinstructions/000534.htm' },
          { label: 'Drug Information & Interactions (MedlinePlus)', url: 'https://medlineplus.gov/druginformation.html' },
          { label: 'Grapefruit & Drug Interactions (FDA)', url: 'https://www.fda.gov/consumers/consumer-updates/grapefruit-juice-and-some-drugs-dont-mix' },
        ],
      },
      {
        icon: Activity,
        title: 'Exercise & Fitness',
        description:
          'Safe, effective movement guidelines for all levels—strength, balance, flexibility, and injury prevention.',
        resources: [
          { label: 'Benefits of Physical Activity (CDC)', url: 'https://www.cdc.gov/physical-activity-basics/benefits/index.html' },
          { label: 'Physical Activity Recommendations (MedlinePlus)', url: 'https://medlineplus.gov/ency/article/001941.htm' },
          { label: 'Prevent Falls & Improve Balance (NIH/NIA)', url: 'https://www.nia.nih.gov/health/prevent-falls-and-fractures' },
          { label: 'Strength Training Basics (MedlinePlus)', url: 'https://medlineplus.gov/strengthtraining.html' },
        ],
      },
    ],
    []
  );

  // ✅ NEW: Search/Filter state
  const [query, setQuery] = useState('');

  // ✅ NEW: Accordion open state (store a Set for O(1) membership)
  const [openSet, setOpenSet] = useState(() => new Set()); // empty = collapsed

  const normalizedQuery = query.trim().toLowerCase();

  // ✅ NEW: Filter topics based on title/description/resource labels
  const filteredTopics = useMemo(() => {
    if (!normalizedQuery) return educationTopics;

    return educationTopics
      .map((t) => {
        const matchesTopic =
          t.title.toLowerCase().includes(normalizedQuery) ||
          t.description.toLowerCase().includes(normalizedQuery);

        const matchingResources = t.resources.filter((r) =>
          r.label.toLowerCase().includes(normalizedQuery)
        );

        // If topic matches, keep all resources; otherwise keep only matching resources
        if (matchesTopic) return t;
        if (matchingResources.length) return { ...t, resources: matchingResources };

        return null;
      })
      .filter(Boolean);
  }, [educationTopics, normalizedQuery]);

  // ✅ NEW: Helper to toggle accordion open/close
  const toggleOpen = (title) => {
    setOpenSet((prev) => {
      const next = new Set(prev);
      if (next.has(title)) next.delete(title);
      else next.add(title);
      return next;
    });
  };

  // ✅ NEW: Expand all / collapse all (based on current filtered list)
  const expandAll = () => {
    setOpenSet(() => new Set(filteredTopics.map((t) => t.title)));
  };
  const collapseAll = () => {
    setOpenSet(() => new Set());
  };

  const shownCount = filteredTopics.length;

  return (
    <>
      <Helmet>
        <title>Patient Education - Primary Care Services</title>
        <meta
          name="description"
          content="Patient education resources on heart health, diabetes management, nutrition, mental health, chronic disease prevention, respiratory health, medication safety, and exercise."
        />
      </Helmet>

 {/* Hero Section (Providers-style) */}
<section className="relative overflow-hidden" data-testid="education-hero">
  <div
    className="relative w-full min-h-[320px] md:min-h-[420px] lg:min-h-[480px] flex items-center justify-center bg-slate-900"
    style={{
      backgroundImage: `url(${heroImage})`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
    }}
  >
    <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/55 to-black/25" />

    <div className="relative container mx-auto px-4 md:px-6 lg:px-8 max-w-7xl py-14 md:py-16 lg:py-20 text-center">
      <motion.div {...fadeInUp} className="max-w-3xl mx-auto text-center">
        <div className="inline-flex items-center justify-center gap-2 mb-4 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-md border border-white/20 mx-auto">
          <Book className="w-5 h-5 text-white" />
          <span className="text-sm font-semibold tracking-wide uppercase text-white">
            Educational Resources
          </span>
        </div>

        <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-white mb-4">
          Patient Education
        </h1>

        <p className="text-base sm:text-lg md:text-xl text-white/90 leading-relaxed max-w-2xl mx-auto">
          Reliable, evidence-based resources to help you make informed choices about prevention, wellness, and chronic condition management.
        </p>
      </motion.div>
    </div>
  </div>
</section>


      {/* Search/Filter + Controls */}
      <section className="py-10 sm:py-12 md:py-14" data-testid="education-search">
        <div className="container mx-auto px-4 md:px-6 lg:px-8 max-w-7xl">
          <motion.div {...fadeInUp} className="text-center mb-6 md:mb-8">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground">
              Browse Topics
            </h2>
            <p className="text-sm sm:text-base md:text-lg text-muted-foreground mt-3 max-w-3xl mx-auto">
              Search for a condition or keyword (e.g., “diabetes”, “blood pressure”) to quickly find relevant resources.
            </p>
          </motion.div>

          {/* ✅ NEW: Responsive search bar */}
          <div className="max-w-3xl mx-auto">
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 items-stretch">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search topics or resources… (e.g., diabetes, blood pressure)"
                  className="w-full h-11 sm:h-12 rounded-xl border border-border bg-white pl-10 pr-10 text-sm sm:text-base outline-none focus:ring-2 focus:ring-primary/30"
                  aria-label="Search patient education topics"
                />
                {query.trim() ? (
                  <button
                    type="button"
                    onClick={() => setQuery('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-md hover:bg-muted"
                    aria-label="Clear search"
                  >
                    <X className="w-4 h-4 text-muted-foreground" />
                  </button>
                ) : null}
              </div>

              <div className="flex gap-2 justify-center sm:justify-end">
                <button
                  type="button"
                  onClick={expandAll}
                  className="h-11 sm:h-12 px-4 rounded-xl border border-border bg-white text-sm font-medium hover:bg-muted transition"
                >
                  Expand all
                </button>
                <button
                  type="button"
                  onClick={collapseAll}
                  className="h-11 sm:h-12 px-4 rounded-xl border border-border bg-white text-sm font-medium hover:bg-muted transition"
                >
                  Collapse all
                </button>
              </div>
            </div>

            <div className="mt-3 text-sm text-muted-foreground text-center">
              Showing <span className="font-semibold text-foreground">{shownCount}</span>{' '}
              {shownCount === 1 ? 'topic' : 'topics'}
              {normalizedQuery ? (
                <>
                  {' '}
                  for <span className="font-semibold text-foreground">“{query.trim()}”</span>
                </>
              ) : null}
            </div>
          </div>
        </div>
      </section>

      {/* Topics Accordion */}
      <section className="pb-12 sm:pb-14 md:pb-20" data-testid="education-topics">
        <div className="container mx-auto px-4 md:px-6 lg:px-8 max-w-7xl">
          {shownCount === 0 ? (
            <div className="text-center py-10">
              <p className="text-foreground font-semibold text-lg">No matches found.</p>
              <p className="text-muted-foreground mt-2">
                Try a different keyword like “cholesterol”, “asthma”, or “sleep”.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5 md:gap-7">
              {filteredTopics.map((topic, index) => {
                const isOpen = openSet.has(topic.title);
                const Icon = topic.icon;

                return (
                  <motion.article
                    key={topic.title}
                    {...fadeInUp}
                    transition={{ delay: index * 0.06 }}
                    className="bg-white rounded-2xl border border-border/50 shadow-[0_2px_10px_rgba(0,0,0,0.06)] hover:shadow-[0_16px_40px_rgba(0,0,0,0.10)] transition-all duration-300 overflow-hidden"
                    data-testid={`education-topic-${index}`}
                  >
                    {/* Header / Toggle */}
                    <button
                      type="button"
                      onClick={() => toggleOpen(topic.title)}
                      className="w-full text-left p-6 sm:p-7 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
                      aria-expanded={isOpen}
                      aria-controls={`panel-${topic.title.replace(/\s+/g, '-').toLowerCase()}`}
                    >
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br from-primary to-primary/80 rounded-xl flex items-center justify-center flex-shrink-0 shadow-md">
                          <Icon className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
                        </div>

                        <div className="min-w-0 flex-1">
                          <div className="flex items-start justify-between gap-3">
                            <h3 className="text-xl sm:text-2xl font-bold text-foreground leading-snug">
                              {topic.title}
                            </h3>

                            <span
                              className="mt-1 inline-flex items-center gap-2 text-sm font-medium text-muted-foreground"
                              aria-hidden="true"
                            >
                              <span className="hidden sm:inline">{isOpen ? 'Collapse' : 'Expand'}</span>
                              <ChevronDown
                                className={`w-5 h-5 transition-transform ${isOpen ? 'rotate-180' : 'rotate-0'}`}
                              />
                            </span>
                          </div>

                          <p className="text-sm sm:text-base text-muted-foreground mt-2 leading-relaxed">
                            {topic.description}
                          </p>

                          {/* Small hint for mobile */}
                          <p className="text-xs text-muted-foreground mt-3 sm:hidden">
                            Tap to {isOpen ? 'collapse' : 'expand'} resources
                          </p>
                        </div>
                      </div>
                    </button>

                    {/* Panel */}
                    <AnimatePresence initial={false}>
                      {isOpen ? (
                        <motion.div
                          id={`panel-${topic.title.replace(/\s+/g, '-').toLowerCase()}`}
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.25, ease: 'easeInOut' }}
                          className="px-6 sm:px-7 pb-6 sm:pb-7"
                        >
                          <div className="pt-2 border-t border-border/40">
                            <p className="text-sm font-semibold text-foreground mb-3 mt-4">
                              Recommended resources
                            </p>

                            <ul className="space-y-2">
                              {topic.resources.map((r) => (
                                <li key={r.url}>
                                  <a
                                    href={r.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="group inline-flex items-start gap-2 text-sm sm:text-[15px] text-primary hover:text-primary/80 underline-offset-4 hover:underline"
                                  >
                                    <ExternalLink className="w-4 h-4 mt-0.5 opacity-80 group-hover:opacity-100" />
                                    <span className="leading-snug">{r.label}</span>
                                  </a>
                                </li>
                              ))}
                            </ul>
                          </div>
                        </motion.div>
                      ) : null}
                    </AnimatePresence>

                    {/* subtle footer divider */}
                    <div className="h-1 w-full bg-gradient-to-r from-primary/40 via-primary/15 to-transparent" />
                  </motion.article>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-12 sm:py-14 md:py-20 bg-white">
        <div className="container mx-auto px-4 md:px-6 lg:px-8 max-w-7xl">
          <motion.div
            {...fadeInUp}
            className="bg-gradient-to-br from-primary to-primary/80 rounded-3xl p-7 sm:p-10 md:p-12 text-center"
          >
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-semibold text-white mb-3">
              Questions About Your Health?
            </h2>
            <p className="text-sm sm:text-base md:text-lg text-white/90 mb-7 max-w-2xl mx-auto">
              These resources are for education and don’t replace medical advice. If symptoms are severe or urgent, call 911.
              For personalized guidance, schedule a visit with our team.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
              <a
                href="https://livewell.aah.org/chart/openscheduling/standalone?id=A405777&vt=5662,5655,5633,11259"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center bg-white text-primary hover:bg-white/90 h-11 sm:h-12 px-7 sm:px-8 rounded-full font-medium shadow-md hover:shadow-lg transition-all"
              >
                Schedule a Visit
              </a>

              <a
                href="tel:6304299000"
                className="inline-flex items-center justify-center border-2 border-white text-white hover:bg-white/10 h-11 sm:h-12 px-7 sm:px-8 rounded-full font-medium transition-all"
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

