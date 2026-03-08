// Contact.js — UPDATED WITH RECAPTCHA + UI ENHANCEMENTS + COMMENTS
// -------------------------------------------------------------------

import React, { useMemo, useState, useEffect } from "react";
import { Helmet } from "react-helmet-async";
import { motion } from "framer-motion";
import {
  Phone,
  Mail,
  MapPin,
  Clock,
  Send,
  ExternalLink,
  CheckCircle2,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { contactApi } from "@/utils/api";
import { toast } from "sonner";
import { Link } from "react-router-dom";
import { loadReCaptcha } from "@/utils/recaptcha";


// ------------------------------------------------------------
// ENVIRONMENT VARIABLES
// Supports BOTH Vite and CRA builds
// ------------------------------------------------------------

// const SITE_KEY =
//   import.meta.env?.VITE_RECAPTCHA_SITE_KEY ||
//   process?.env?.REACT_APP_RECAPTCHA_SITE_KEY ||
//   "";

// VITE environment variable
const SITE_KEY = import.meta.env.VITE_RECAPTCHA_SITE_KEY || "";

export default function Contact() {

  const heroImage = "/images/header/center2.jpg";

  // ------------------------------------------------------------
  // Form State
  // ------------------------------------------------------------

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
    website: "", // honeypot
  });

  const [loading, setLoading] = useState(false);
  const [captcha, setCaptcha] = useState(null);
  const [sent, setSent] = useState(false);


  // ------------------------------------------------------------
  // Load reCAPTCHA
  // ------------------------------------------------------------

  useEffect(() => {

    if (!SITE_KEY) {
      console.warn("reCAPTCHA site key missing");
      return;
    }

    loadReCaptcha(SITE_KEY)
      .then((grecaptcha) => {

        if (!grecaptcha) return;

        grecaptcha.ready(() => {
          setCaptcha(grecaptcha);
        });

      })
      .catch((err) => {
        console.warn("reCAPTCHA load failed:", err);
      });

  }, []);


  // ------------------------------------------------------------
  // Animations
  // ------------------------------------------------------------

  const fadeInUp = {
    initial: { opacity: 0, y: 22 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.5 },
  };

  const recipientEmail = "info@my-primarycare.com";


  // ------------------------------------------------------------
  // Build mailto fallback
  // ------------------------------------------------------------

  const mailtoHref = useMemo(() => {

    const subject = formData.subject?.trim() || "Website Contact Form";

    const body = [
      `Name: ${formData.name}`,
      `Email: ${formData.email}`,
      `Phone: ${formData.phone}`,
      "",
      formData.message,
    ].join("\n");

    const params = new URLSearchParams({ subject, body });

    return `mailto:${recipientEmail}?${params.toString()}`;

  }, [formData]);


  // ------------------------------------------------------------
  // Utilities
  // ------------------------------------------------------------

  const isValidEmail = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);

  const phoneDigits = (v) => v.replace(/\D/g, "");

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });


  // ------------------------------------------------------------
  // Submit Form
  // ------------------------------------------------------------

  const handleSubmit = async (e) => {

    e.preventDefault();

    if (formData.website.trim()) {
      toast.success("Message sent!");
      setSent(true);
      return;
    }

    if (
      !formData.name.trim() ||
      !formData.email.trim() ||
      !formData.phone.trim() ||
      !formData.subject.trim() ||
      !formData.message.trim()
    ) {
      toast.error("Please fill out all required fields.");
      return;
    }

    if (!isValidEmail(formData.email)) {
      toast.error("Please enter a valid email address.");
      return;
    }

    if (phoneDigits(formData.phone).length < 10) {
      toast.error("Please enter a valid phone number.");
      return;
    }


    // ------------------------------------------------------------
    // Execute reCAPTCHA
    // ------------------------------------------------------------

    let token = "";

    if (captcha && SITE_KEY) {

      try {

        token = await captcha.execute(SITE_KEY, {
          action: "submit",
        });

      } catch (err) {

        console.warn("reCAPTCHA execution failed:", err);

      }

    } else {

      console.warn("Captcha not ready yet — continuing without token");

    }

    setLoading(true);

    try {

      await contactApi.submit({
        ...formData,
        phone: phoneDigits(formData.phone),
        recaptcha_token: token,
      });

      toast.success("Message sent!");
      setSent(true);

      setFormData({
        name: "",
        email: "",
        phone: "",
        subject: "",
        message: "",
        website: "",
      });

    } catch (err) {

      console.error("Contact form failed:", err);

      toast.error("Form failed — opening your email app instead.");

      window.location.href = mailtoHref;

    } finally {

      setLoading(false);

    }

  };


  // ------------------------------------------------------------
  // UI
  // ------------------------------------------------------------

  return (
    <>
      <Helmet>
        <title>Contact Us - Primary Care Services</title>
      </Helmet>

      {/* HERO */}
      <section className="relative overflow-hidden">
        <div
          className="relative w-full min-h-[360px] flex items-center bg-slate-900"
          style={{
            backgroundImage: `url(${heroImage})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        >
          <div className="absolute inset-0 bg-black/60" />

          <div className="relative container mx-auto px-6 max-w-7xl py-20">
            <motion.div {...fadeInUp} className="text-center">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4">
                Contact Us
              </h1>
              <p className="text-white/90 max-w-2xl mx-auto text-lg">
                We're here to help. Reach out with questions, appointments, or
                general inquiries.
              </p>
            </motion.div>
          </div>
        </div>
      </section>


      {/* Confirmation */}
      {sent && (
        <section className="bg-green-50 border-y border-green-200 py-6">
          <div className="container mx-auto px-6 max-w-4xl text-center">
            <div className="inline-flex items-center gap-2 bg-green-100 px-4 py-2 rounded-full text-green-800 font-medium">
              <CheckCircle2 className="w-5 h-5" />
              Message sent! We'll respond within 24-48 hours.
            </div>
          </div>
        </section>
      )}


      {/* Contact Section */}
      <section className="py-16">
        <div className="container mx-auto px-6 max-w-7xl grid grid-cols-1 lg:grid-cols-3 gap-10">

          {/* LEFT SIDEBAR */}

          <motion.div {...fadeInUp} className="space-y-8">

            <div className="p-6 bg-white rounded-2xl border shadow-sm">
              <Phone className="w-7 h-7 text-primary mb-3" />
              <h3 className="font-bold text-lg mb-1">Phone</h3>
              <a href="tel:6304299000" className="text-muted-foreground hover:text-primary">
                (630) 429-9000
              </a>
            </div>

            <div className="p-6 bg-white rounded-2xl border shadow-sm">
              <Mail className="w-7 h-7 text-primary mb-3" />
              <h3 className="font-bold text-lg mb-1">Email</h3>
              <a
                href={`mailto:${recipientEmail}`}
                className="text-muted-foreground hover:text-primary break-all"
              >
                {recipientEmail}
              </a>
            </div>

            <div className="p-6 bg-white rounded-2xl border shadow-sm">
              <MapPin className="w-7 h-7 text-primary mb-3" />
              <h3 className="font-bold text-lg mb-3">Locations</h3>

              <p className="font-semibold">Lombard Office</p>
              <p className="text-muted-foreground text-sm mb-3">
                2500 S. Highland Ave., Suite 230<br />
                Lombard, IL 60148
              </p>

              <p className="font-semibold">Glendale Heights Office</p>
              <p className="text-muted-foreground text-sm">
                701 N. Winthrop Ave.<br />
                Glendale Heights, IL 60139
              </p>

              <Button asChild variant="outline" className="mt-5 w-full rounded-full">
                <Link to="/locations">
                  View on Map <ExternalLink className="w-4 h-4 ml-2" />
                </Link>
              </Button>
            </div>

            <div className="p-6 bg-white rounded-2xl border shadow-sm">
              <Clock className="w-7 h-7 text-primary mb-3" />
              <h3 className="font-bold text-lg mb-2">Hours</h3>
              <p className="text-sm text-muted-foreground">
                Mon-Fri: 9:00 AM - 5:00 PM <br />
                Sat: 9:00 AM - 1:00 PM <br />
                Sun: Closed
              </p>
            </div>

          </motion.div>


          {/* FORM */}

          <motion.div {...fadeInUp} transition={{ delay: 0.08 }} className="lg:col-span-2">
            <div className="bg-white rounded-2xl border shadow-sm p-8">

              <h2 className="text-3xl font-bold mb-3">Send Us a Message</h2>

              <p className="text-muted-foreground mb-6">
                This form is for non-urgent inquiries only. We typically
                respond within 24-48 hours.
              </p>

              <form onSubmit={handleSubmit} className="space-y-6">

                <input
                  type="text"
                  name="website"
                  className="hidden"
                  value={formData.website}
                  onChange={handleChange}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name *</Label>
                    <Input
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="John Doe"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">Email *</Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="you@example.com"
                      required
                    />
                  </div>

                </div>


                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone *</Label>
                    <Input
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder="(630) 555-0123"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="subject">Subject *</Label>
                    <Input
                      id="subject"
                      name="subject"
                      value={formData.subject}
                      onChange={handleChange}
                      placeholder="General Inquiry"
                      required
                    />
                  </div>

                </div>


                <div className="space-y-2">

                  <Label htmlFor="message">Message *</Label>

                  <Textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    rows={7}
                    placeholder="How can we help you?"
                    required
                  />

                </div>


                <div className="flex flex-col sm:flex-row gap-4">

                  <Button
                    type="submit"
                    disabled={loading}
                    className="w-full sm:w-auto rounded-full h-12 px-8 bg-primary text-white"
                  >
                    {loading ? "Sending..." : "Send Message"}
                    {!loading && <Send className="w-4 h-4 ml-2" />}
                  </Button>

                  <Button
                    asChild
                    variant="outline"
                    className="w-full sm:w-auto rounded-full h-12 px-8"
                  >
                    <a href={mailtoHref}>
                      Use Email Instead <ExternalLink className="w-4 h-4 ml-2" />
                    </a>
                  </Button>

                </div>

                <p className="text-xs text-muted-foreground pt-2">
                  By submitting this form, you agree that your message may be
                  delivered to our office email ({recipientEmail}). Do not use
                  this form for emergencies.
                </p>

              </form>

            </div>
          </motion.div>

        </div>
      </section>
    </>
  );
}


