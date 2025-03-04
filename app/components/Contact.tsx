"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { useInView } from "react-intersection-observer";
import { Check, AlertCircle } from "lucide-react";
import { useTheme } from "next-themes";
import Image from "next/image";

const fieldSizes = [
  "Under 500 acres",
  "500-1,000 acres",
  "1,000-2,500 acres",
  "2,500-5,000 acres",
  "Over 5,000 acres"
];

const cropTypes = [
  "Corn",
  "Soybeans",
  "Cotton",
  "Rice",
  "Wheat",
  "Mixed Crops",
  "Other"
];

const serviceTypes = [
  "Grower Data Support",
  "Researcher support",
  "Aerial Image processing"
];

const globalConnections = [
  {
    start: { lat: 35.8423, lng: -90.7043 }, // Jonesboro, AR (Base)
    end: { lat: 41.8781, lng: -93.0977 } // Iowa (Corn Belt)
  },

  {
    start: { lat: 35.8423, lng: -90.7043 }, // Jonesboro, AR (Base)
    end: { lat: 51.5074, lng: -0.1278 } // UK (Agricultural Research)
  },
  {
    start: { lat: 35.8423, lng: -90.7043 }, // Jonesboro, AR (Base)
    end: { lat: 35.6762, lng: 139.6503 } // Japan (Agricultural Tech)
  },
  {
    start: { lat: 35.8423, lng: -90.7043 }, // Jonesboro, AR (Base)
    end: { lat: 39.9042, lng: 116.4074 } // China (Agricultural Innovation)
  },
  {
    start: { lat: 35.8423, lng: -90.7043 }, // Jonesboro, AR (Base)
    end: { lat: 52.52, lng: 13.405 } // Germany (Agricultural Science)
  }
];

interface FormData {
  name: string;
  email: string;
  phone: string;
  acres: string;
  cropTypes: string;
  serviceType: string;
  message: string;
  preferredContact: string;
}

interface FormErrors {
  name?: string;
  email?: string;
  phone?: string;
  message?: string;
}

export default function Contact() {
  const { theme } = useTheme();
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1
  });

  const [formData, setFormData] = useState<FormData>({
    name: "",
    email: "",
    phone: "",
    acres: "",
    cropTypes: "",
    serviceType: "",
    message: "",
    preferredContact: "email"
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));

    // Clear errors when user types
    if (errors[name as keyof FormErrors]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name as keyof FormErrors];
        return newErrors;
      });
    }
  };

  const validateForm = () => {
    const newErrors: FormErrors = {};

    // Required fields
    if (!formData.name.trim()) {
      newErrors.name = "Name is required";
    }

    // Email validation
    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }

    // Phone validation (optional unless preferred contact is phone)
    if (
      formData.preferredContact === "phone" &&
      (!formData.phone.trim() ||
        !/^\d{10}$/.test(formData.phone.replace(/\D/g, "")))
    ) {
      newErrors.phone = "Please enter a valid 10-digit phone number";
    }

    // Message validation
    if (!formData.message.trim()) {
      newErrors.message = "Please provide some details about your request";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsSubmitting(true);

    // Simulate API call
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      setIsSubmitted(true);
      setFormData({
        name: "",
        email: "",
        phone: "",
        acres: "",
        cropTypes: "",
        serviceType: "",
        message: "",
        preferredContact: "email"
      });
      setIsSubmitting(false);
    } catch (error) {
      setIsSubmitting(false);
      // Handle error (could add error state here)
    }
  };

  return (
    <section
      id="contact"
      className="py-20 bg-gradient-to-b from-background to-muted/30"
    >
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:14px_24px]" />

      <div className="container px-4 md:px-6">
        <div className="flex flex-col items-center text-center mb-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">
              Get in <span className="text-primary">Touch</span>
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Tell us about your fields and objectives. We'll create a
              personalized precision agriculture plan that maximizes your yields
              and profitability.
            </p>
          </motion.div>
        </div>

        <div className="grid lg:grid-cols-[1.2fr_0.8fr] gap-12 items-start">
          {/* Contact Form */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="bg-card shadow-lg rounded-2xl border border-border/40 backdrop-blur-sm p-6 sm:p-8"
          >
            <h3 className="text-xl font-bold mb-6">Request a Consultation</h3>

            <div className="relative">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label
                      htmlFor="name"
                      className="block text-sm font-medium text-foreground"
                    >
                      Name
                      <span className="text-red-500 ml-1">*</span>
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        className={`w-full px-4 py-3 rounded-lg bg-background/80 border ${
                          errors.name
                            ? "border-red-500 ring-1 ring-red-500"
                            : "border-border/50 focus:ring-2 focus:ring-primary/50"
                        } focus:outline-none transition-all duration-200`}
                        placeholder="Your name"
                      />
                      {errors.name && (
                        <div className="absolute right-3 top-1/2 -translate-y-1/2 text-red-500">
                          <AlertCircle className="w-5 h-5" />
                        </div>
                      )}
                    </div>
                    {errors.name && (
                      <p className="mt-1 text-sm text-red-500 flex items-center gap-1">
                        {errors.name}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <label
                      htmlFor="email"
                      className="block text-sm font-medium text-foreground"
                    >
                      Email
                      <span className="text-red-500 ml-1">*</span>
                    </label>
                    <div className="relative">
                      <input
                        type="email"
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        className={`w-full px-4 py-3 rounded-lg bg-background/80 border ${
                          errors.email
                            ? "border-red-500 ring-1 ring-red-500"
                            : "border-border/50 focus:ring-2 focus:ring-primary/50"
                        } focus:outline-none transition-all duration-200`}
                        placeholder="Your email address"
                      />
                      {errors.email && (
                        <div className="absolute right-3 top-1/2 -translate-y-1/2 text-red-500">
                          <AlertCircle className="w-5 h-5" />
                        </div>
                      )}
                    </div>
                    {errors.email && (
                      <p className="mt-1 text-sm text-red-500 flex items-center gap-1">
                        {errors.email}
                      </p>
                    )}
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label
                      htmlFor="phone"
                      className="block text-sm font-medium text-foreground"
                    >
                      Phone Number
                      {formData.preferredContact === "phone" && (
                        <span className="text-red-500 ml-1">*</span>
                      )}
                    </label>
                    <div className="relative">
                      <input
                        type="tel"
                        id="phone"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        className={`w-full px-4 py-3 rounded-lg bg-background/80 border ${
                          errors.phone
                            ? "border-red-500 ring-1 ring-red-500"
                            : "border-border/50 focus:ring-2 focus:ring-primary/50"
                        } focus:outline-none transition-all duration-200`}
                        placeholder="(123) 456-7890"
                      />
                      {errors.phone && (
                        <div className="absolute right-3 top-1/2 -translate-y-1/2 text-red-500">
                          <AlertCircle className="w-5 h-5" />
                        </div>
                      )}
                    </div>
                    {errors.phone && (
                      <p className="mt-1 text-sm text-red-500 flex items-center gap-1">
                        {errors.phone}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <label
                      htmlFor="acres"
                      className="block text-sm font-medium text-foreground"
                    >
                      Field Size (Acres)
                    </label>
                    <input
                      type="text"
                      id="acres"
                      name="acres"
                      value={formData.acres}
                      onChange={handleChange}
                      className="w-full px-4 py-3 rounded-lg bg-background/80 border border-border/50 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all duration-200"
                      placeholder="Approximate acreage"
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label
                      htmlFor="cropTypes"
                      className="block text-sm font-medium text-foreground"
                    >
                      Primary Crops
                    </label>
                    <select
                      id="cropTypes"
                      name="cropTypes"
                      value={formData.cropTypes}
                      onChange={handleChange}
                      className="w-full px-4 py-3 rounded-lg bg-background/80 border border-border/50 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all duration-200"
                    >
                      <option value="">Select primary crops</option>
                      {cropTypes.map(crop => (
                        <option key={crop} value={crop}>
                          {crop}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label
                      htmlFor="serviceType"
                      className="block text-sm font-medium text-foreground"
                    >
                      Service Needed
                    </label>
                    <select
                      id="serviceType"
                      name="serviceType"
                      value={formData.serviceType}
                      onChange={handleChange}
                      className="w-full px-4 py-3 rounded-lg bg-background/80 border border-border/50 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all duration-200"
                    >
                      <option value="">Select service type</option>
                      {serviceTypes.map(service => (
                        <option key={service} value={service}>
                          {service}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="space-y-2">
                  <label
                    htmlFor="message"
                    className="block text-sm font-medium text-foreground"
                  >
                    Additional Information
                    <span className="text-red-500 ml-1">*</span>
                  </label>
                  <div className="relative">
                    <textarea
                      id="message"
                      name="message"
                      value={formData.message}
                      onChange={handleChange}
                      rows={4}
                      className={`w-full px-4 py-3 rounded-lg bg-background/80 border ${
                        errors.message
                          ? "border-red-500 ring-1 ring-red-500"
                          : "border-border/50 focus:ring-2 focus:ring-primary/50"
                      } focus:outline-none transition-all duration-200`}
                      placeholder="Tell us about your specific needs..."
                    />
                    {errors.message && (
                      <div className="absolute right-3 top-6 text-red-500">
                        <AlertCircle className="w-5 h-5" />
                      </div>
                    )}
                  </div>
                  {errors.message && (
                    <p className="mt-1 text-sm text-red-500 flex items-center gap-1">
                      {errors.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Preferred Contact Method
                  </label>
                  <div className="flex gap-6">
                    <label className="flex items-center gap-2 cursor-pointer group">
                      <div className="relative flex items-center justify-center">
                        <input
                          type="radio"
                          name="preferredContact"
                          value="email"
                          checked={formData.preferredContact === "email"}
                          onChange={handleChange}
                          className="sr-only"
                        />
                        <div className="w-5 h-5 border-2 rounded-full border-muted-foreground/50 group-hover:border-primary transition-colors"></div>
                        {formData.preferredContact === "email" && (
                          <div className="absolute w-3 h-3 rounded-full bg-primary"></div>
                        )}
                      </div>
                      <span className="text-sm">Email</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer group">
                      <div className="relative flex items-center justify-center">
                        <input
                          type="radio"
                          name="preferredContact"
                          value="phone"
                          checked={formData.preferredContact === "phone"}
                          onChange={handleChange}
                          className="sr-only"
                        />
                        <div className="w-5 h-5 border-2 rounded-full border-muted-foreground/50 group-hover:border-primary transition-colors"></div>
                        {formData.preferredContact === "phone" && (
                          <div className="absolute w-3 h-3 rounded-full bg-primary"></div>
                        )}
                      </div>
                      <span className="text-sm">Phone</span>
                    </label>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={`w-full px-8 py-4 bg-primary text-primary-foreground rounded-lg font-medium transition-all duration-300 
                  ${
                    isSubmitting
                      ? "opacity-50 cursor-not-allowed"
                      : "hover:bg-primary/90 hover:shadow-md active:translate-y-0.5"
                  }`}
                >
                  {isSubmitting ? (
                    <div className="flex items-center justify-center gap-2">
                      <svg
                        className="animate-spin h-5 w-5 text-white"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                      <span>Sending...</span>
                    </div>
                  ) : (
                    "Submit Request"
                  )}
                </button>
              </form>

              {isSubmitted && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-6 p-6 bg-green-500/10 border border-green-500/30 rounded-lg flex items-center gap-3 text-green-600"
                >
                  <div className="bg-green-100 rounded-full p-1">
                    <Check className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="font-medium">
                      Thank you for your submission!
                    </p>
                    <p className="text-sm text-green-600/80">
                      We'll be in touch with you soon.
                    </p>
                  </div>
                </motion.div>
              )}
            </div>
          </motion.div>

          {/* Contact Information */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="space-y-8"
          >
            {/* Expert Section with Image Background */}
            <div className="relative rounded-2xl overflow-hidden shadow-lg border border-border/50">
              {/* Background Image with Overlay */}
              <div className="absolute inset-0">
                <Image
                  src="/images/farm3.jpg"
                  alt="Agricultural field background"
                  fill
                  className="object-cover object-center blur-[3px]"
                  priority
                />
                <div className="absolute inset-0 bg-gradient-to-b from-primary/85 to-primary/75 backdrop-blur-md"></div>
              </div>

              <div className="relative p-6 sm:p-8 z-10">
                <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
                  {/* Expert Profile Image */}
                  <div className="relative w-24 h-24 sm:w-32 sm:h-32 rounded-full overflow-hidden border-4 border-white shadow-lg">
                    <Image
                      src="/images/rmsmith.png"
                      alt="Dr. Richard Smith"
                      fill
                      className="object-cover"
                      onError={e => {
                        const target = e.target as HTMLImageElement;
                        target.src =
                          "https://ui-avatars.com/api/?name=Richard+Smith&background=0D8ABC&color=fff&size=128";
                      }}
                    />
                  </div>

                  {/* Expert Info */}
                  <div className="text-center sm:text-left flex-1">
                    <h4 className="text-xl font-bold text-white mb-1">
                      Richard M. Smith, CCA, Ph.D.
                    </h4>
                    <p className="text-base font-medium text-white/90 mb-4">
                      Agronomist & Data Scientist
                    </p>

                    <div className="space-y-3">
                      <a
                        href="mailto:Richard.Smith@FieldTrackLLC.com"
                        className="inline-flex items-center gap-2 bg-white text-primary hover:bg-white/90 font-medium px-4 py-2 rounded-md transition-colors"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="18"
                          height="18"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <rect width="20" height="16" x="2" y="4" rx="2" />
                          <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                        </svg>
                        Richard.Smith@FieldTrackLLC.com
                      </a>

                      <p className="text-sm text-white/90 mt-2 max-w-md">
                        With over 10 years of experience in agricultural
                        research and data science, Dr. Smith leads our team in
                        delivering precision agriculture solutions.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
