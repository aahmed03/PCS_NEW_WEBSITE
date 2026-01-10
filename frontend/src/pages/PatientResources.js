// PatientResources.js
import React, { useEffect, useMemo, useState } from "react";
import { Helmet } from "react-helmet-async";
import { motion } from "framer-motion";
import * as Accordion from "@radix-ui/react-accordion";
import {
  FileText,
  Download,
  HelpCircle,
  Search,
  ExternalLink,
  Shield,
  Calendar,
  Phone,
  ClipboardList,
  Lock,
  HeartPulse,
  Pill,
  Stethoscope,
  AlertTriangle,
  CheckCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { resourcesApi } from "@/utils/api";

export default function PatientResources() {
  const heroImage = "/images/header/8.jpg";

  const fadeInUp = {
    initial: { opacity: 0, y: 22 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.55 },
  };

  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");

  useEffect(() => {
    const fetchResources = async () => {
      try {
        const response = await resourcesApi.getAll();
        setResources(Array.isArray(response?.data) ? response.data : []);
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error("Failed to fetch resources:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchResources();
  }, []);

  // Group by category (from API) + normalize
  const groupedResources = useMemo(() => {
    const acc = {};
    for (const r of resources || []) {
      const key = (r?.category || "other").toString().toLowerCase();
      if (!acc[key]) acc[key] = [];
      acc[key].push(r);
    }
    return acc;
  }, [resources]);

  const categoryMeta = useMemo(
    () => ({
      forms: {
        title: "Forms & Documents",
        icon: ClipboardList,
        blurb:
          "Common paperwork and documents that help make check-in and care coordination smoother.",
      },
      privacy: {
        title: "Privacy & Compliance",
        icon: Lock,
        blurb:
          "Information on how we protect your health information and what your rights are.",
      },
      wellness: {
        title: "Wellness & Preventive Care",
        icon: HeartPulse,
        blurb:
          "Helpful checklists and evidence-based resources to support prevention and long-term health.",
      },
      insurance: {
        title: "Insurance & Billing",
        icon: Shield,
        blurb:
          "Coverage, billing, and practical tips to help you understand your benefits and costs.",
      },
      other: {
        title: "Other Resources",
        icon: FileText,
        blurb: "Additional materials and documents shared by our practice.",
      },
    }),
    []
  );

  const normalizedQuery = query.trim().toLowerCase();

  const orderedCategories = useMemo(() => {
    const keys = Object.keys(groupedResources || {});
    const order = ["forms", "privacy", "wellness", "insurance", "other"];
    const sorted = [
      ...order.filter((k) => keys.includes(k)),
      ...keys.filter((k) => !order.includes(k)).sort(),
    ];
    return sorted;
  }, [groupedResources]);

  const filteredGrouped = useMemo(() => {
    if (!normalizedQuery) return { grouped: groupedResources, categories: orderedCategories };

    const next = {};
    const nextCats = [];

    for (const cat of orderedCategories) {
      const list = groupedResources?.[cat] || [];
      const filtered = list.filter((r) => {
        const haystack = [
          r?.title,
          r?.description,
          r?.category,
          r?.file_url,
          r?.url,
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();
        return haystack.includes(normalizedQuery);
      });

      // Also allow searching by category title
      const meta = categoryMeta?.[cat] || { title: cat };
      const categoryMatches = meta.title.toLowerCase().includes(normalizedQuery);

      if (filtered.length > 0 || categoryMatches) {
        next[cat] = categoryMatches ? list : filtered;
        nextCats.push(cat);
      }
    }

    return { grouped: next, categories: nextCats };
  }, [normalizedQuery, groupedResources, orderedCategories, categoryMeta]);

  const totalCount = useMemo(() => {
    return orderedCategories.reduce((sum, cat) => sum + (groupedResources?.[cat]?.length || 0), 0);
  }, [orderedCategories, groupedResources]);

  const filteredCount = useMemo(() => {
    return filteredGrouped.categories.reduce(
      (sum, cat) => sum + (filteredGrouped.grouped?.[cat]?.length || 0),
      0
    );
  }, [filteredGrouped]);

  // Trusted external resources (modern + reputable)
  const trustedResources = useMemo(
    () => [
      {
        id: "portal",
        icon: Stethoscope,
        title: "Patient Portal & Visit Preparation",
        blurb:
          "Use your portal (when available) to review results, request refills, and send non-urgent messages. Prepare questions and bring an updated medication list to every visit.",
        keyTopics: [
          "Bring photo ID + insurance card",
          "Bring medications/supplements list (or bottles)",
          "Share allergies and pharmacy preference",
          "Bring prior records if new patient",
        ],
        resources: [
          { label: "MedlinePlus: How to Prepare for a Doctor Visit", url: "https://medlineplus.gov/ency/patientinstructions/000455.htm" },
          { label: "AHRQ: Questions to Ask Your Doctor", url: "https://www.ahrq.gov/patients-consumers/patient-involvement/ask-your-doctor/index.html" },
        ],
      },
      {
        id: "meds",
        icon: Pill,
        title: "Medications & Prescription Refills",
        blurb:
          "We recommend requesting refills before you run out. Some medications require follow-up visits or lab monitoring.",
        keyTopics: [
          "Allow 24-48 hours for routine refills",
          "Controlled substances may require a visit",
          "Use one pharmacy when possible",
          "Report side effects or new allergies promptly",
        ],
        resources: [
          { label: "FDA: Understanding Prescription Drugs", url: "https://www.fda.gov/drugs/resources-you-drugs/understanding-prescription-drug-labels" },
          { label: "MedlinePlus: Drugs, Supplements & Herbal Information", url: "https://medlineplus.gov/druginformation.html" },
        ],
      },
      {
        id: "vaccines",
        icon: Shield,
        title: "Vaccines & Immunization Schedules",
        blurb:
          "Vaccines prevent serious illness and complications. Recommendations vary by age and medical history.",
        keyTopics: [
          "Annual flu vaccine",
          "COVID-19 (as recommended)",
          "Shingles and pneumococcal vaccines (age/risk-based)",
          "Tdap/Td boosters",
        ],
        resources: [
          { label: "CDC: Immunization Schedules", url: "https://www.cdc.gov/vaccines/schedules/" },
          { label: "CDC: Adult Immunization Schedule", url: "https://www.cdc.gov/vaccines/schedules/hcp/imz/adult.html" },
        ],
      },
      {
        id: "insurance",
        icon: ClipboardList,
        title: "Insurance & Billing Basics",
        blurb:
          "Coverage varies by plan. Understanding copays, deductibles, and in-network rules can prevent surprises.",
        keyTopics: [
          "Verify in-network coverage",
          "Know your copay/deductible",
          "Ask your insurer about covered preventive services",
          "Keep EOBs (Explanation of Benefits) for records",
        ],
        resources: [
          { label: "Healthcare.gov: How to Understand Your Health Coverage", url: "https://www.healthcare.gov/choose-a-plan/your-total-costs/" },
          { label: "CMS: No Surprises Act (overview)", url: "https://www.cms.gov/nosurprises" },
        ],
      },
      {
        id: "records",
        icon: Lock,
        title: "Medical Records & Privacy",
        blurb:
          "You have rights regarding your health information. We can help you request records and understand privacy protections.",
        keyTopics: [
          "How to request copies of records",
          "Your rights under HIPAA",
          "Sharing information with other providers",
          "How we protect your data",
        ],
        resources: [
          { label: "HHS: HIPAA for Individuals", url: "https://www.hhs.gov/hipaa/for-individuals/index.html" },
          { label: "HHS: How to Get Your Medical Records", url: "https://www.hhs.gov/hipaa/for-individuals/medical-records/index.html" },
        ],
      },
    ],
    []
  );

  // FAQs (kept + tightened slightly)
  const faqs = useMemo(
    () => [
      {
        question: "What should I bring to my first appointment?",
        answer:
          "Bring a valid photo ID, your insurance card, an up-to-date medication and supplement list (or bottles), and any relevant records from prior providers. Arriving 15 minutes early to complete paperwork is recommended.",
      },
      {
        question: "Do you accept my insurance?",
        answer:
          "We accept many major insurance plans. Please call (630) 429-9000 to verify your specific plan and benefits. We also recommend confirming coverage details with your insurance provider.",
      },
      {
        question: "How do I request prescription refills?",
        answer:
          "Request refills through the patient portal (if available), by calling our office, or by having your pharmacy contact us. Please allow 24–48 hours for routine refill processing.",
      },
      {
        question: "What is your cancellation policy?",
        answer:
          "We require 24-hour notice for appointment cancellations. Late cancellations or no-shows may result in a fee, depending on your visit type and circumstances.",
      },
      {
        question: "Do you offer same-day appointments?",
        answer:
          "We try to accommodate same-day appointments for urgent needs when available. Please call as early in the day as possible to check openings.",
      },
      {
        question: "How can I access my medical records?",
        answer:
          "You may be able to access portions of your record through a patient portal (if available). For complete copies, submit a written request to our office. Fees may apply for extensive requests, consistent with applicable rules.",
      },
    ],
    []
  );

  return (
    <>
      <Helmet>
        <title>Patient Resources - Primary Care Services</title>
        <meta
          name="description"
          content="Patient forms, insurance and billing information, trusted health resources, and FAQs to help you prepare for visits and manage care."
        />
      </Helmet>

      {/* Hero (PreventiveCare-style) */}
      <section className="relative overflow-hidden" data-testid="resources-hero">
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
                <FileText className="w-5 h-5 text-white" />
                <span className="text-sm font-semibold tracking-wide uppercase text-white">
                  Helpful Forms & Trusted Links
                </span>
              </div>

              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-white mb-4">
                Patient Resources
              </h1>

              <p className="text-base sm:text-lg md:text-xl text-white/90 leading-relaxed max-w-2xl mx-auto">
                Download forms, review insurance guidance, and explore trusted health resources to make your visits
                smoother and your care easier to manage.
              </p>

              <div className="mt-7 flex flex-col sm:flex-row gap-3 justify-center">
                <Button
                  asChild
                  size="lg"
                  className="bg-white text-primary hover:bg-white/90 h-12 px-8 rounded-full font-medium shadow-md"
                >
                  <a href="#downloads">Browse Downloads</a>
                </Button>

                <Button
                  asChild
                  variant="outline"
                  size="lg"
                  className="border-2 border-white text-white hover:bg-white/10 h-12 px-8 rounded-full font-medium"
                >
                  <a
                    href="https://livewell.aah.org/chart/openscheduling/standalone?id=A405777&vt=5662,5655,5633,11259"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Calendar className="w-5 h-5 mr-2" />
                    Schedule Appointment
                  </a>
                </Button>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Search / Filter (PreventiveCare-style) */}
      <section className="py-10 md:py-12" data-testid="resources-search">
        <div className="container mx-auto px-4 md:px-6 lg:px-8 max-w-7xl">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
            <div className="max-w-2xl">
              <h2 className="text-2xl md:text-3xl font-bold text-foreground">Find a resource</h2>
              <p className="text-sm md:text-base text-muted-foreground mt-1">
                Search keywords like “forms”, “privacy”, “billing”, “vaccines”, “refill”, “records”.
              </p>
            </div>

            <div className="w-full md:w-[420px]">
              <label className="sr-only" htmlFor="resources-search-input">
                Search resources
              </label>
              <div className="relative">
                <Search className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  id="resources-search-input"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search downloads & topics..."
                  className="w-full h-11 pl-9 pr-3 rounded-xl border border-border bg-white text-sm md:text-base outline-none focus:ring-2 focus:ring-primary/30"
                />
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                Showing{" "}
                <span className="font-medium text-foreground">
                  {loading ? "…" : filteredCount}
                </span>{" "}
                of <span className="font-medium text-foreground">{loading ? "…" : totalCount}</span> downloads
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Downloadable Resources (Accordion layout like PreventiveCare) */}
      <section id="downloads" className="pb-16 md:pb-24" data-testid="resources-list">
        <div className="container mx-auto px-4 md:px-6 lg:px-8 max-w-7xl">
          {loading ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">Loading resources...</p>
            </div>
          ) : (
            <>
              <Accordion.Root type="multiple" className="space-y-4" defaultValue={filteredGrouped.categories.slice(0, 1)}>
                {filteredGrouped.categories.map((categoryKey, idx) => {
                  const meta = categoryMeta[categoryKey] || {
                    title: categoryKey,
                    icon: FileText,
                    blurb: "Resources and documents.",
                  };
                  const Icon = meta.icon;
                  const categoryResources = filteredGrouped.grouped?.[categoryKey] || [];

                  return (
                    <motion.div
                      key={categoryKey}
                      {...fadeInUp}
                      transition={{ delay: Math.min(idx * 0.05, 0.25) }}
                      className="bg-white rounded-2xl border border-border/60 shadow-[0_2px_10px_rgba(0,0,0,0.05)] overflow-hidden"
                    >
                      <Accordion.Item value={categoryKey} className="outline-none">
                        <Accordion.Header>
                          <Accordion.Trigger className="w-full text-left">
                            <div className="flex items-center gap-4 p-5 md:p-6 hover:bg-slate-50 transition-colors">
                              <div className="w-12 h-12 md:w-14 md:h-14 bg-gradient-to-br from-primary to-primary/80 rounded-xl flex items-center justify-center flex-shrink-0 shadow-md">
                                <Icon className="w-6 h-6 md:w-7 md:h-7 text-white" />
                              </div>

                              <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between gap-4">
                                  <h3 className="text-lg md:text-xl font-bold text-foreground truncate">
                                    {meta.title}
                                  </h3>
                                  <span className="text-sm text-muted-foreground hidden sm:inline">
                                    Expand
                                  </span>
                                </div>
                                <p className="text-sm md:text-base text-muted-foreground mt-1 line-clamp-2">
                                  {meta.blurb}
                                </p>
                              </div>
                            </div>
                          </Accordion.Trigger>
                        </Accordion.Header>

                        <Accordion.Content className="px-5 md:px-6 pb-6">
                          {categoryResources.length === 0 ? (
                            <div className="pt-2">
                              <p className="text-sm text-muted-foreground">
                                No downloads found in this category.
                              </p>
                            </div>
                          ) : (
                            <div className="pt-2 grid grid-cols-1 md:grid-cols-2 gap-6">
                              {categoryResources.map((resource, rIdx) => {
                                const url = resource?.file_url || resource?.url || "#";
                                const title = resource?.title || "Resource";
                                const description =
                                  resource?.description ||
                                  "Download this document for details.";

                                return (
                                  <div
                                    key={resource?.resource_id || `${categoryKey}-${rIdx}`}
                                    className="bg-slate-50 rounded-2xl border border-border/60 p-5 md:p-6"
                                    data-testid={`resource-${categoryKey}-${rIdx}`}
                                  >
                                    <div className="flex items-start gap-4">
                                      <div className="w-12 h-12 bg-white rounded-xl border border-border/60 flex items-center justify-center flex-shrink-0 shadow-sm">
                                        <FileText className="w-6 h-6 text-primary" />
                                      </div>

                                      <div className="flex-1 min-w-0">
                                        <h4 className="text-base md:text-lg font-bold text-foreground">
                                          {title}
                                        </h4>
                                        <p className="text-sm text-muted-foreground mt-1">
                                          {description}
                                        </p>

                                        <div className="mt-4 flex flex-col sm:flex-row gap-3">
                                          <Button
                                            asChild
                                            variant="outline"
                                            size="sm"
                                            className="border-primary text-primary hover:bg-primary/5 rounded-full"
                                          >
                                            <a
                                              href={url}
                                              target={url.startsWith("http") ? "_blank" : undefined}
                                              rel={url.startsWith("http") ? "noopener noreferrer" : undefined}
                                            >
                                              <Download className="w-4 h-4 mr-2" />
                                              Download
                                            </a>
                                          </Button>

                                          {/* Optional: if you store PDFs locally, keep this subtle hint */}
                                          <span className="text-xs text-muted-foreground self-center">
                                            PDF / Document
                                          </span>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          )}
                        </Accordion.Content>
                      </Accordion.Item>
                    </motion.div>
                  );
                })}
              </Accordion.Root>

              {filteredGrouped.categories.length === 0 && (
                <div className="text-center py-10">
                  <p className="text-foreground font-semibold">No matches found</p>
                  <p className="text-muted-foreground mt-1">
                    Try “forms”, “privacy”, “billing”, “records”, “vaccines”, or “refill”.
                  </p>
                </div>
              )}
            </>
          )}
        </div>
      </section>

      {/* Trusted resources (PreventiveCare-style accordion) */}
      <section className="pb-16 md:pb-24" data-testid="trusted-resources">
        <div className="container mx-auto px-4 md:px-6 lg:px-8 max-w-7xl">
          <div className="max-w-2xl mb-6">
            <h2 className="text-2xl md:text-3xl font-bold text-foreground">Trusted health resources</h2>
            <p className="text-sm md:text-base text-muted-foreground mt-1">
              Evidence-based sources for education and planning between visits.
            </p>
          </div>

          <Accordion.Root type="multiple" className="space-y-4" defaultValue={["portal"]}>
            {trustedResources.map((s, idx) => {
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
                              <h3 className="text-lg md:text-xl font-bold text-foreground truncate">{s.title}</h3>
                              <span className="text-sm text-muted-foreground hidden sm:inline">Expand</span>
                            </div>
                            <p className="text-sm md:text-base text-muted-foreground mt-1 line-clamp-2">{s.blurb}</p>
                          </div>
                        </div>
                      </Accordion.Trigger>
                    </Accordion.Header>

                    <Accordion.Content className="px-5 md:px-6 pb-6">
                      <div className="pt-2 grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <div className="bg-slate-50 rounded-xl border border-border/50 p-4 md:p-5">
                          <p className="text-sm font-semibold text-foreground mb-3">Key topics</p>
                          <ul className="space-y-2">
                            {(s.keyTopics || []).map((t) => (
                              <li key={t} className="flex items-start gap-2 text-sm text-muted-foreground">
                                <CheckCircle className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                                <span>{t}</span>
                              </li>
                            ))}
                          </ul>
                        </div>

                        <div className="bg-slate-50 rounded-xl border border-border/50 p-4 md:p-5">
                          <p className="text-sm font-semibold text-foreground mb-3">Trusted links</p>
                          <ul className="space-y-2">
                            {(s.resources || []).map((r) => (
                              <li key={r.url} className="text-sm">
                                <a
                                  href={r.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center gap-2 text-primary hover:underline break-words"
                                >
                                  <ExternalLink className="w-4 h-4" />
                                  {r.label}
                                </a>
                              </li>
                            ))}
                          </ul>

                          <div className="mt-4 rounded-xl border border-border/60 bg-white p-4">
                            <p className="text-sm font-semibold text-foreground">Tip</p>
                            <p className="text-sm text-muted-foreground mt-1">
                              If you're unsure which link applies to you, bring questions to your next visit—your care team can guide you.
                            </p>
                          </div>
                        </div>
                      </div>
                    </Accordion.Content>
                  </Accordion.Item>
                </motion.div>
              );
            })}
          </Accordion.Root>
        </div>
      </section>

      {/* FAQs */}
      <section className="py-16 md:py-24 bg-white" data-testid="faqs-section">
        <div className="container mx-auto px-4 md:px-6 lg:px-8 max-w-7xl">
          <motion.div {...fadeInUp} className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">Frequently Asked Questions</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Quick answers to common questions about visits, insurance, refills, and records.
            </p>
          </motion.div>

          <div className="max-w-3xl mx-auto space-y-6">
            {faqs.map((faq, index) => (
              <motion.div
                key={faq.question}
                {...fadeInUp}
                transition={{ delay: Math.min(index * 0.05, 0.25) }}
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

      {/* CTA (Insurance/Billing help) */}
      <section className="py-16 md:py-24" data-testid="resources-cta">
        <div className="container mx-auto px-4 md:px-6 lg:px-8 max-w-7xl">
          <motion.div {...fadeInUp} className="bg-gradient-to-br from-primary to-primary/80 rounded-3xl p-8 md:p-12 text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Need help with insurance or billing?</h2>
            <p className="text-lg text-white/90 mb-8 max-w-2xl mx-auto">
              We can help with insurance verification, billing questions, and next steps.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                asChild
                size="lg"
                className="bg-white text-primary hover:bg-white/90 h-12 px-8 rounded-full font-medium shadow-md"
              >
                <a href="tel:6304299000">
                  <Phone className="w-5 h-5 mr-2" />
                  Call (630) 429-9000
                </a>
              </Button>

              <Button
                asChild
                variant="outline"
                size="lg"
                className="border-2 border-white text-white hover:bg-white/10 h-12 px-8 rounded-full font-medium"
              >
                <a href="/contact">
                  <Calendar className="w-5 h-5 mr-2" />
                  Request a Call Back
                </a>
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Emergency Disclaimer */}
      <section className="py-12 bg-red-50" data-testid="resources-emergency">
        <div className="container mx-auto px-4 md:px-6 lg:px-8 max-w-7xl">
          <motion.div {...fadeInUp} className="text-center">
            <div className="inline-flex items-center gap-2 mb-3 px-4 py-2 bg-red-100 rounded-md border border-red-200">
              <AlertTriangle className="w-5 h-5 text-red-700" />
              <span className="text-sm font-semibold text-red-700">Medical Emergency</span>
            </div>
            <p className="text-base font-medium text-red-700">
              For urgent medical issues or emergencies, call <strong>911</strong> or go to the nearest emergency room.
              This page is for informational purposes only and does not replace professional medical advice.
            </p>
          </motion.div>
        </div>
      </section>
    </>
  );
}

