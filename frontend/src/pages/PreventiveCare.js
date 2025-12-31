// PreventiveCare.js
import React, { useMemo, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import * as Accordion from '@radix-ui/react-accordion';
import {
  Heart,
  Calendar,
  CheckCircle,
  Download,
  Shield,
  Activity,
  Users,
  Search,
  ExternalLink,
} from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function PreventiveCare() {
  const heroImage = '/images/header/3.jpg';

  const fadeInUp = {
    initial: { opacity: 0, y: 22 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.55 },
  };

  const [query, setQuery] = useState('');

  // Evidence-based preventive care sections + resource links
  const sections = useMemo(
    () => [
      {
        id: 'wellness-visit',
        icon: Calendar,
        title: 'Annual Wellness Visit',
        blurb:
          'A preventive visit focused on screening, risk assessment, and a personalized prevention plan—not just treating symptoms.',
        keyTopics: [
          'Complete health assessment',
          'Vital signs & risk review',
          'Care plan development',
          'Recommended screenings & vaccines',
        ],
        resources: [
          { label: 'MedlinePlus: Health Screening (overview)', url: 'https://medlineplus.gov/healthscreening.html' },
          { label: 'USPSTF: A & B Recommended Preventive Services', url: 'https://www.uspreventiveservicestaskforce.org/uspstf/recommendation-topics/uspstf-a-and-b-recommendations' },
        ],
      },
      {
        id: 'complete-health-assessment',
        icon: Activity,
        title: 'Complete Health Assessment',
        blurb:
          'We review your history, medications, family history, and lifestyle to identify risks early and set measurable health goals.',
        keyTopics: [
          'Family history & risk factors',
          'Medication and supplement review',
          'BMI/weight and activity patterns',
          'Sleep and stress assessment',
        ],
        resources: [
          { label: 'MedlinePlus: Health Screening (what to expect)', url: 'https://medlineplus.gov/healthscreening.html' },
          { label: 'CDC: Physical Activity Basics', url: 'https://www.cdc.gov/physicalactivity/basics/index.htm' },
        ],
      },
      {
        id: 'preventive-screenings',
        icon: Heart,
        title: 'Preventive Screenings',
        blurb:
          'Screenings help find conditions early when they’re most treatable. Recommendations vary by age, sex, and risk.',
        keyTopics: [
          'Blood pressure & cardiovascular risk',
          'Diabetes screening (A1c/glucose)',
          'Cholesterol/lipids',
          'Cancer screenings (age/risk-based)',
          'Bone health (osteoporosis risk)',
        ],
        resources: [
          { label: 'USPSTF: A & B Recommended Preventive Services', url: 'https://www.uspreventiveservicestaskforce.org/uspstf/recommendation-topics/uspstf-a-and-b-recommendations' },
          { label: 'American Cancer Society: Early Detection Guidelines', url: 'https://www.cancer.org/cancer/screening/american-cancer-society-guidelines-for-the-early-detection-of-cancer.html' },
          { label: 'CDC: Colorectal Cancer Screening', url: 'https://www.cdc.gov/cancer/colorectal/basic_info/screening/index.htm' },
        ],
      },
      {
        id: 'blood-pressure',
        icon: Heart,
        title: 'Blood Pressure & Heart Health',
        blurb:
          'Controlling blood pressure reduces the risk of heart attack, stroke, kidney disease, and more.',
        keyTopics: [
          'Home blood pressure monitoring',
          'Dietary sodium and DASH-style eating',
          'Exercise and weight management',
          'When to seek urgent care (warning signs)',
        ],
        resources: [
          { label: 'American Heart Association: High Blood Pressure', url: 'https://www.heart.org/en/health-topics/high-blood-pressure' },
          { label: 'MedlinePlus: High Blood Pressure', url: 'https://medlineplus.gov/highbloodpressure.html' },
        ],
      },
      {
        id: 'diabetes-prevention',
        icon: Activity,
        title: 'Diabetes Screening & Prevention',
        blurb:
          'We screen at-risk patients and help prevent progression through evidence-based lifestyle changes.',
        keyTopics: [
          'A1c / glucose screening',
          'Prediabetes counseling',
          'Weight and activity goals',
          'Nutrition planning',
        ],
        resources: [
          { label: 'CDC: Diabetes Prevention (overview)', url: 'https://www.cdc.gov/diabetes/prevention/index.html' },
          { label: 'CDC: National Diabetes Prevention Program', url: 'https://www.cdc.gov/diabetes/prevention/programs/index.html' },
        ],
      },
      {
        id: 'lifestyle-counseling',
        icon: Users,
        title: 'Lifestyle Counseling',
        blurb:
          'Small changes add up—nutrition, movement, sleep, stress, and tobacco/alcohol risk reduction.',
        keyTopics: [
          'Healthy eating & meal planning',
          'Physical activity recommendations',
          'Sleep and stress management',
          'Smoking/vaping cessation support',
        ],
        resources: [
          { label: 'Dietary Guidelines for Americans', url: 'https://www.dietaryguidelines.gov/' },
          { label: 'CDC: Physical Activity Basics', url: 'https://www.cdc.gov/physicalactivity/basics/index.htm' },
          { label: 'CDC: Quit Smoking', url: 'https://www.cdc.gov/tobacco/quit_smoking/index.htm' },
        ],
      },
      {
        id: 'immunizations',
        icon: Shield,
        title: 'Immunization Review',
        blurb:
          'Vaccines prevent serious illness and complications. We verify what you need based on age and medical history.',
        keyTopics: [
          'Annual flu vaccine',
          'COVID-19 (as recommended)',
          'Pneumococcal vaccines (risk/age-based)',
          'Shingles (zoster) vaccine',
          'Tdap/Td boosters',
          'Hepatitis vaccines (risk-based)',
        ],
        resources: [
          { label: 'CDC: Immunization Schedules (Adults/Children)', url: 'https://www.cdc.gov/vaccines/hcp/imz-schedules/index.html' },
          { label: 'CDC: Adult Immunization Schedule (by age)', url: 'https://www.cdc.gov/vaccines/schedules/hcp/imz/adult.html' },
        ],
      },
      {
        id: 'wellness-checklist',
        icon: Download,
        title: 'Wellness Checklist & Planning',
        blurb:
          'Use a checklist to prepare for visits and track goals (blood pressure, weight, labs, screenings).',
        keyTopics: [
          'Bring medication list and questions',
          'Know your family history',
          'Track home readings (BP/glucose if applicable)',
          'Schedule recommended screenings',
        ],
        resources: [
          // This assumes your app serves this file from frontend/public/downloads/
          { label: 'Download: Wellness Checklist (local)', url: '/downloads/wellness-checklist.pdf' },
          { label: 'USPSTF: A & B Recommended Preventive Services', url: 'https://www.uspreventiveservicestaskforce.org/uspstf/recommendation-topics/uspstf-a-and-b-recommendations' },
        ],
      },
    ],
    []
  );

  const normalizedQuery = query.trim().toLowerCase();

  const filteredSections = useMemo(() => {
    if (!normalizedQuery) return sections;

    return sections.filter((s) => {
      const haystack = [
        s.title,
        s.blurb,
        ...(s.keyTopics || []),
        ...(s.resources || []).map((r) => r.label),
      ]
        .join(' ')
        .toLowerCase();

      return haystack.includes(normalizedQuery);
    });
  }, [normalizedQuery, sections]);

  return (
    <>
      <Helmet>
        <title>Preventive Care - Primary Care Services</title>
        <meta
          name="description"
          content="Preventive care services including annual wellness visits, evidence-based screenings, immunizations, lifestyle counseling, and personalized prevention planning."
        />
      </Helmet>

      {/* Hero Section (PatientEducation-style) */}
      <section className="relative overflow-hidden" data-testid="preventive-care-hero">
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
            <motion.div {...fadeInUp} className="max-w-3xl text-center mx-auto">
              <div className="inline-flex items-center gap-2 mb-4 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-md border border-white/20">
                <Shield className="w-5 h-5 text-white" />
                <span className="text-sm font-semibold tracking-wide uppercase text-white">
                  Prevention Is Key
                </span>
              </div>

              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-white mb-4">
                Preventive Care
              </h1>

              <p className="text-base sm:text-lg md:text-xl text-white/90 leading-relaxed max-w-2xl mx-auto">
                Evidence-based screenings, vaccines, and personalized prevention plans to help you stay healthy—today and long-term.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Search / Filter */}
      <section className="py-10 md:py-12" data-testid="preventive-care-search">
        <div className="container mx-auto px-4 md:px-6 lg:px-8 max-w-7xl">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
            <div className="max-w-2xl">
              <h2 className="text-2xl md:text-3xl font-bold text-foreground">Find a topic</h2>
              <p className="text-sm md:text-base text-muted-foreground mt-1">
                Search keywords like “diabetes”, “blood pressure”, “vaccines”, “screening”, “cholesterol”.
              </p>
            </div>

            <div className="w-full md:w-[420px]">
              <label className="sr-only" htmlFor="preventive-search">
                Search preventive care topics
              </label>
              <div className="relative">
                <Search className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  id="preventive-search"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search topics..."
                  className="w-full h-11 pl-9 pr-3 rounded-xl border border-border bg-white text-sm md:text-base outline-none focus:ring-2 focus:ring-primary/30"
                />
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                Showing <span className="font-medium text-foreground">{filteredSections.length}</span> of{' '}
                <span className="font-medium text-foreground">{sections.length}</span> topics
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Accordion Topics */}
      <section className="pb-16 md:pb-24" data-testid="preventive-care-topics">
        <div className="container mx-auto px-4 md:px-6 lg:px-8 max-w-7xl">
          <Accordion.Root
            type="multiple"
            className="space-y-4"
            defaultValue={['wellness-visit']}
          >
            {filteredSections.map((s, idx) => {
              const Icon = s.icon;
              return (
                <motion.div
                  key={s.id}
                  {...fadeInUp}
                  transition={{ delay: Math.min(idx * 0.05, 0.25) }}
                  className="bg-white rounded-2xl border border-border/60 shadow-[0_2px_10px_rgba(0,0,0,0.05)] overflow-hidden"
                >
                  <Accordion.Item value={s.id} className="outline-none">
                    <Accordion.Header>
                      <Accordion.Trigger className="w-full text-left">
                        <div className="flex items-center gap-4 p-5 md:p-6 hover:bg-slate-50 transition-colors">
                          <div className="w-12 h-12 md:w-14 md:h-14 bg-gradient-to-br from-primary to-primary/80 rounded-xl flex items-center justify-center flex-shrink-0 shadow-md">
                            <Icon className="w-6 h-6 md:w-7 md:h-7 text-white" />
                          </div>

                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-4">
                              <h3 className="text-lg md:text-xl font-bold text-foreground truncate">
                                {s.title}
                              </h3>
                              <span className="text-sm text-muted-foreground hidden sm:inline">
                                Expand
                              </span>
                            </div>
                            <p className="text-sm md:text-base text-muted-foreground mt-1 line-clamp-2">
                              {s.blurb}
                            </p>
                          </div>
                        </div>
                      </Accordion.Trigger>
                    </Accordion.Header>

                    <Accordion.Content className="px-5 md:px-6 pb-6">
                      <div className="pt-2 grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Key topics */}
                        <div className="bg-slate-50 rounded-xl border border-border/50 p-4 md:p-5">
                          <p className="text-sm font-semibold text-foreground mb-3">
                            Key topics
                          </p>
                          <ul className="space-y-2">
                            {(s.keyTopics || []).map((t) => (
                              <li key={t} className="flex items-start gap-2 text-sm text-muted-foreground">
                                <CheckCircle className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                                <span>{t}</span>
                              </li>
                            ))}
                          </ul>
                        </div>

                        {/* Resources */}
                        <div className="bg-slate-50 rounded-xl border border-border/50 p-4 md:p-5">
                          <p className="text-sm font-semibold text-foreground mb-3">
                            Trusted resources
                          </p>
                          <ul className="space-y-2">
                            {(s.resources || []).map((r) => (
                              <li key={r.url} className="text-sm">
                                <a
                                  href={r.url}
                                  target={r.url.startsWith('http') ? '_blank' : undefined}
                                  rel={r.url.startsWith('http') ? 'noopener noreferrer' : undefined}
                                  className="inline-flex items-center gap-2 text-primary hover:underline break-words"
                                >
                                  <ExternalLink className="w-4 h-4" />
                                  {r.label}
                                </a>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </Accordion.Content>
                  </Accordion.Item>
                </motion.div>
              );
            })}
          </Accordion.Root>

          {filteredSections.length === 0 && (
            <div className="text-center py-10">
              <p className="text-foreground font-semibold">No matches found</p>
              <p className="text-muted-foreground mt-1">
                Try “screening”, “vaccines”, “blood pressure”, “diabetes”, or “cholesterol”.
              </p>
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 md:py-24 bg-white" data-testid="preventive-care-cta">
        <div className="container mx-auto px-4 md:px-6 lg:px-8 max-w-7xl">
          <motion.div
            {...fadeInUp}
            className="bg-gradient-to-br from-primary to-primary/80 rounded-3xl p-8 md:p-12 text-center"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Ready to Schedule Your Wellness Visit?
            </h2>
            <p className="text-lg text-white/90 mb-8 max-w-2xl mx-auto">
              Same-day appointments may be available. Book online or call to schedule.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                asChild
                size="lg"
                className="bg-white text-primary hover:bg-white/90 h-12 px-8 rounded-full font-medium shadow-md"
              >
                <a
                  href="https://livewell.aah.org/chart/openscheduling/standalone?id=A405777&vt=5662,5655,5633,11259"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Calendar className="w-5 h-5 mr-2" />
                  Schedule Wellness Visit
                </a>
              </Button>

              <Button
                asChild
                variant="outline"
                size="lg"
                className="border-2 border-white text-white hover:bg-white/10 h-12 px-8 rounded-full font-medium"
              >
                <a href="/downloads/wellness-checklist.pdf">
                  <Download className="w-5 h-5 mr-2" />
                  Download Checklist
                </a>
              </Button>
            </div>

            <div className="mt-6">
              <a href="tel:6304299000" className="text-white/90 hover:text-white underline">
                Or call (630) 429-9000
              </a>
            </div>
          </motion.div>
        </div>
      </section>
    </>
  );
}

