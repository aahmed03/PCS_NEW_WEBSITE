// Contact.js
import React, { useMemo, useState } from "react";
import { Helmet } from "react-helmet-async";
import { motion } from "framer-motion";
import { Phone, Mail, MapPin, Clock, Send, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { contactApi } from "@/utils/api";
import { toast } from "sonner";
import { Link } from "react-router-dom";

export default function Contact() {
  // ✅ PatientEducation-style hero image (place file in /public/images/header/center2.jpg)
  const heroImage = "/images/header/center2.jpg";

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
    // ✅ simple anti-spam honeypot (should remain empty)
    website: "",
  });

  const [loading, setLoading] = useState(false);

  const fadeInUp = {
    initial: { opacity: 0, y: 22 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.55 },
  };

  const recipientEmail = "info@my-primarycare.com";

  const mailtoHref = useMemo(() => {
    const subject = formData.subject?.trim() ? formData.subject.trim() : "Website Contact Form";
    const lines = [
      `Name: ${formData.name || "-"}`,
      `Email: ${formData.email || "-"}`,
      `Phone: ${formData.phone || "-"}`,
      "",
      (formData.message || "").trim(),
    ].join("\n");

    const params = new URLSearchParams({
      subject,
      body: lines,
    });

    return `mailto:${recipientEmail}?${params.toString()}`;
  }, [formData.subject, formData.name, formData.email, formData.phone, formData.message]);

  const isValidEmail = (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value || "").trim());
  const normalizePhoneDigits = (value) => String(value || "").replace(/\D/g, "");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((s) => ({ ...s, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // ✅ honeypot: if filled, silently “succeed” (likely bot)
    if (formData.website?.trim()) {
      toast.success("Message sent! We'll respond within 24–48 hours.");
      setFormData({ name: "", email: "", phone: "", subject: "", message: "", website: "" });
      return;
    }

    // ✅ basic client validation
    if (!formData.name.trim() || !formData.email.trim() || !formData.phone.trim() || !formData.subject.trim() || !formData.message.trim()) {
      toast.error("Please complete all required fields.");
      return;
    }
    if (!isValidEmail(formData.email)) {
      toast.error("Please enter a valid email address.");
      return;
    }

    const phoneDigits = normalizePhoneDigits(formData.phone);
    if (phoneDigits.length < 10) {
      toast.error("Please enter a valid phone number.");
      return;
    }

    setLoading(true);

    try {
      /**
       * ✅ IMPORTANT FIX FOR DELIVERY:
       * The frontend cannot send an email by itself. It must call your backend, and the backend must send the email to:
       *   info@my-primarycare.com
       *
       * We include the recipient in the payload (many backends accept this), and we also include `source`.
       * If your backend ignores `to`, it should be hard-coded server-side to always deliver to info@my-primarycare.com.
       */
      const payload = {
        name: formData.name.trim(),
        email: formData.email.trim(),
        phone: phoneDigits,
        subject: formData.subject.trim(),
        message: formData.message.trim(),
        to: recipientEmail, // ✅ ensures destination is explicit
        source: "website_contact_form",
      };

      await contactApi.submit(payload);

      toast.success("Message sent! We'll respond within 24–48 hours.");
      setFormData({ name: "", email: "", phone: "", subject: "", message: "", website: "" });
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error("Contact form submit failed:", error);

      // ✅ Fallback: open user's email client prefilled so message still reaches info@
      toast.error("We couldn't send via the form. Your email app will open as a fallback.");
      window.location.href = mailtoHref;
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Helmet>
        <title>Contact Us - Primary Care Services</title>
        <meta
          name="description"
          content="Contact Primary Care Services in Lombard and Glendale Heights, IL. Call (630) 429-9000 or send us a message."
        />
      </Helmet>

      {/* ✅ Hero Section (PatientEducation-style) */}
      <section className="relative overflow-hidden" data-testid="contact-hero">
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
                <Mail className="w-5 h-5 text-white" />
                <span className="text-sm font-semibold tracking-wide uppercase text-white">
                  Get In Touch
                </span>
              </div>

              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-white mb-4">
                Contact Us
              </h1>

              <p className="text-base sm:text-lg md:text-xl text-white/90 leading-relaxed max-w-2xl mx-auto">
                Have questions? We’re here to help. Reach out by phone, email, or send a message below.
              </p>

              <div className="mt-7 flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
                <Button
                  asChild
                  size="lg"
                  className="bg-primary text-primary-foreground hover:bg-primary/90 h-12 sm:h-14 px-7 sm:px-10 rounded-full font-medium shadow-md hover:shadow-lg transition-all"
                >
                  <a href="tel:6304299000">
                    <Phone className="w-5 h-5 mr-2" />
                    Call (630) 429-9000
                  </a>
                </Button>

                <Button
                  asChild
                  size="lg"
                  variant="outline"
                  className="h-12 sm:h-14 px-7 sm:px-10 rounded-full font-medium border-2 border-white/70 text-white hover:bg-white/10"
                >
                  <a href={`mailto:${recipientEmail}`}>
                    <Mail className="w-5 h-5 mr-2" />
                    Email Us
                  </a>
                </Button>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Contact Content */}
      <section className="py-12 md:py-16 lg:py-20" data-testid="contact-content">
        <div className="container mx-auto px-4 md:px-6 lg:px-8 max-w-7xl">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 md:gap-10">
            {/* Left: Contact Info */}
            <motion.aside {...fadeInUp} className="lg:col-span-1 space-y-6">
              <div className="bg-white p-6 rounded-2xl border border-border/60 shadow-[0_2px_10px_rgba(0,0,0,0.06)]">
                <div className="w-14 h-14 bg-gradient-to-br from-primary to-primary/80 rounded-xl flex items-center justify-center mb-4 shadow-md">
                  <Phone className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-lg font-bold text-foreground mb-1">Phone</h3>
                <a
                  href="tel:6304299000"
                  className="text-base text-muted-foreground hover:text-primary transition-colors"
                >
                  (630) 429-9000
                </a>
              </div>

              <div className="bg-white p-6 rounded-2xl border border-border/60 shadow-[0_2px_10px_rgba(0,0,0,0.06)]">
                <div className="w-14 h-14 bg-gradient-to-br from-primary to-primary/80 rounded-xl flex items-center justify-center mb-4 shadow-md">
                  <Mail className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-lg font-bold text-foreground mb-1">Email</h3>
                <a
                  href={`mailto:${recipientEmail}`}
                  className="text-base text-muted-foreground hover:text-primary transition-colors break-all"
                >
                  {recipientEmail}
                </a>
              </div>

              <div className="bg-white p-6 rounded-2xl border border-border/60 shadow-[0_2px_10px_rgba(0,0,0,0.06)]">
                <div className="w-14 h-14 bg-gradient-to-br from-primary to-primary/80 rounded-xl flex items-center justify-center mb-4 shadow-md">
                  <MapPin className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-lg font-bold text-foreground mb-3">Locations</h3>

                <div className="space-y-4 text-sm text-muted-foreground">
                  <div>
                    <p className="font-semibold text-foreground">Lombard Office</p>
                    <p>2500 S. Highland Ave., Suite 230</p>
                    <p>Lombard, IL 60148</p>
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">Glendale Heights Office</p>
                    <p>701 N. Winthrop Ave.</p>
                    <p>Glendale Heights, IL 60139</p>
                  </div>
                </div>

                <div className="mt-5">
                  <Button asChild variant="outline" className="w-full rounded-full">
                    <Link to="/locations">
                      View on Map <ExternalLink className="w-4 h-4 ml-2" />
                    </Link>
                  </Button>
                </div>
              </div>

              <div className="bg-white p-6 rounded-2xl border border-border/60 shadow-[0_2px_10px_rgba(0,0,0,0.06)]">
                <div className="w-14 h-14 bg-gradient-to-br from-primary to-primary/80 rounded-xl flex items-center justify-center mb-4 shadow-md">
                  <Clock className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-lg font-bold text-foreground mb-2">Hours</h3>
                <div className="space-y-1 text-sm text-muted-foreground">
                  <p>Monday – Friday: 9:00 AM – 5:00 PM</p>
                  <p>Saturday: 9:00 AM – 1:00 PM</p>
                  <p>Sunday: Closed</p>
                </div>
              </div>

              <div className="bg-red-50 border border-red-200 rounded-2xl p-5">
                <p className="text-sm font-semibold text-red-700 mb-1">Medical Emergency?</p>
                <p className="text-sm text-red-700/90">
                  For urgent medical issues, call 911 or visit the nearest emergency room.
                </p>
              </div>
            </motion.aside>

            {/* Right: Contact Form */}
            <motion.div {...fadeInUp} transition={{ delay: 0.08 }} className="lg:col-span-2">
              <div className="bg-white p-6 sm:p-8 rounded-2xl border border-border/60 shadow-[0_2px_10px_rgba(0,0,0,0.06)]">
                <div className="mb-6">
                  <h2 className="text-2xl sm:text-3xl font-bold text-foreground">Send Us a Message</h2>
                  <p className="text-sm sm:text-base text-muted-foreground mt-2">
                    This form is for non-urgent inquiries only. We typically respond within 24–48 hours.
                  </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6" data-testid="contact-form">
                  {/* honeypot */}
                  <input
                    type="text"
                    name="website"
                    value={formData.website}
                    onChange={handleChange}
                    autoComplete="off"
                    tabIndex={-1}
                    className="hidden"
                    aria-hidden="true"
                  />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div className="space-y-2">
                      <Label htmlFor="name">Full Name *</Label>
                      <Input
                        id="name"
                        name="name"
                        type="text"
                        placeholder="John Doe"
                        value={formData.name}
                        onChange={handleChange}
                        required
                        data-testid="name-input"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="email">Email *</Label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        placeholder="you@example.com"
                        value={formData.email}
                        onChange={handleChange}
                        required
                        data-testid="email-input"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone *</Label>
                      <Input
                        id="phone"
                        name="phone"
                        type="tel"
                        inputMode="tel"
                        placeholder="(630) 555-0123"
                        value={formData.phone}
                        onChange={handleChange}
                        required
                        data-testid="phone-input"
                      />
                      <p className="text-xs text-muted-foreground">
                        Please don’t include sensitive health information.
                      </p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="subject">Subject *</Label>
                      <Input
                        id="subject"
                        name="subject"
                        type="text"
                        placeholder="General Inquiry"
                        value={formData.subject}
                        onChange={handleChange}
                        required
                        data-testid="subject-input"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="message">Message *</Label>
                    <Textarea
                      id="message"
                      name="message"
                      placeholder="How can we help you?"
                      value={formData.message}
                      onChange={handleChange}
                      rows={7}
                      required
                      data-testid="message-input"
                    />
                  </div>

                  <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 items-start sm:items-center">
                    <Button
                      type="submit"
                      disabled={loading}
                      className="w-full sm:w-auto bg-primary text-primary-foreground hover:bg-primary/90 rounded-full h-12 px-8 font-medium"
                      data-testid="submit-btn"
                    >
                      {loading ? "Sending..." : "Send Message"}
                      {!loading && <Send className="w-4 h-4 ml-2" />}
                    </Button>

                    <Button asChild variant="outline" className="w-full sm:w-auto rounded-full h-12 px-8">
                      <a href={mailtoHref}>
                        Use Email Instead <ExternalLink className="w-4 h-4 ml-2" />
                      </a>
                    </Button>
                  </div>

                  <div className="pt-3">
                    <p className="text-xs text-muted-foreground">
                      By submitting, you agree this message may be delivered to our office email ({recipientEmail}). Do
                      not use this form for emergencies.
                    </p>
                  </div>
                </form>
              </div>
            </motion.div>
          </div>
        </div>
      </section>
    </>
  );
}

