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
  "Soybean",
  "Cotton",
  "Rice",
  "Wheat",
  "Mixed Crops",
  "Peanuts",
  "Grain Sorghum",
  "Other"
];

const serviceTypes = [
  "SimpleSense - Aerial Imagery",
  "On-Farm Research",
  "Field Services"
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

    try {
      // Actually send data to the API endpoint
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          message: `
Field Size: ${formData.acres || "Not specified"}
Crop Types: ${formData.cropTypes || "Not specified"}
Service Type: ${formData.serviceType || "Not specified"}
Preferred Contact: ${formData.preferredContact}

Message:
${formData.message}
          `
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to send message");
      }

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
      console.error("Error sending contact form:", error);
      setIsSubmitting(false);
      // You could add error handling here if you want to show an error message
    }
  };

  return (
    <section
      id="contact"
      className="py-12 sm:py-16 md:py-20 bg-gradient-to-b from-background to-muted/30"
    >
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:14px_24px]" />

      <div className="container px-4 md:px-6">
        <div className="flex flex-col items-center text-center mb-8 sm:mb-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-primary">
              Get in <span className="text-primary">Touch</span>
            </h2>
            <p className="text-sm sm:text-base md:text-lg text-muted-foreground max-w-2xl mx-auto px-2">
              Tell us about your fields and objectives. We'll create a
              personalized precision agriculture plan that maximizes your yields
              and profitability.
            </p>
          </motion.div>
        </div>

        <div className="grid lg:grid-cols-[1fr_1fr] gap-8 lg:gap-12 items-start">
          {/* Contact Form */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="bg-card shadow-lg rounded-xl sm:rounded-2xl border border-border/40 backdrop-blur-sm p-4 sm:p-6 md:p-8 order-2 lg:order-1"
          >
            <h3 className="text-lg sm:text-xl font-bold mb-4 sm:mb-6">
              Request a Consultation
            </h3>

            <div className="relative">
              {isSubmitted ? (
                <div className="bg-primary/10 border border-primary/20 rounded-lg p-4 sm:p-6 text-center">
                  <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary/20 text-primary mb-4">
                    <Check className="w-6 h-6" />
                  </div>
                  <h4 className="text-lg sm:text-xl font-bold mb-2">
                    Thank You!
                  </h4>
                  <p className="text-sm sm:text-base text-muted-foreground">
                    Your message has been sent successfully. We'll get back to
                    you shortly to discuss your agricultural needs.
                  </p>
                </div>
              ) : (
                <form
                  onSubmit={handleSubmit}
                  className="space-y-4 sm:space-y-5"
                >
                  <div className="grid sm:grid-cols-2 gap-4 sm:gap-6">
                    <div className="space-y-2">
                      <label
                        htmlFor="name"
                        className="block text-sm font-medium text-foreground"
                      >
                        Your Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        className={`w-full px-3 py-2 text-sm sm:text-base bg-background border rounded-md focus:outline-none focus:ring-2 focus:ring-primary ${
                          errors.name
                            ? "border-red-500 focus:ring-red-500"
                            : "border-input"
                        }`}
                      />
                      {errors.name && (
                        <p className="text-xs text-red-500 mt-1">
                          {errors.name}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <label
                        htmlFor="email"
                        className="block text-sm font-medium text-foreground"
                      >
                        Email Address <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="email"
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        className={`w-full px-3 py-2 text-sm sm:text-base bg-background border rounded-md focus:outline-none focus:ring-2 focus:ring-primary ${
                          errors.email
                            ? "border-red-500 focus:ring-red-500"
                            : "border-input"
                        }`}
                      />
                      {errors.email && (
                        <p className="text-xs text-red-500 mt-1">
                          {errors.email}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-4 sm:gap-6">
                    <div className="space-y-2">
                      <label
                        htmlFor="phone"
                        className="block text-sm font-medium text-foreground"
                      >
                        Phone Number
                      </label>
                      <input
                        type="tel"
                        id="phone"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        className={`w-full px-3 py-2 text-sm sm:text-base bg-background border rounded-md focus:outline-none focus:ring-2 focus:ring-primary ${
                          errors.phone
                            ? "border-red-500 focus:ring-red-500"
                            : "border-input"
                        }`}
                      />
                      {errors.phone && (
                        <p className="text-xs text-red-500 mt-1">
                          {errors.phone}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <label
                        htmlFor="preferredContact"
                        className="block text-sm font-medium text-foreground"
                      >
                        Preferred Contact Method
                      </label>
                      <select
                        id="preferredContact"
                        name="preferredContact"
                        value={formData.preferredContact}
                        onChange={handleChange}
                        className="w-full px-3 py-2 text-sm sm:text-base bg-background border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                      >
                        <option value="email">Email</option>
                        <option value="phone">Phone</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-4 sm:gap-6">
                    <div className="space-y-2">
                      <label
                        htmlFor="acres"
                        className="block text-sm font-medium text-foreground"
                      >
                        Field Size
                      </label>
                      <select
                        id="acres"
                        name="acres"
                        value={formData.acres}
                        onChange={handleChange}
                        className="w-full px-3 py-2 text-sm sm:text-base bg-background border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                      >
                        <option value="">Select field size</option>
                        {fieldSizes.map(size => (
                          <option key={size} value={size}>
                            {size}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-2">
                      <label
                        htmlFor="cropTypes"
                        className="block text-sm font-medium text-foreground"
                      >
                        Primary Crop Type
                      </label>
                      <select
                        id="cropTypes"
                        name="cropTypes"
                        value={formData.cropTypes}
                        onChange={handleChange}
                        className="w-full px-3 py-2 text-sm sm:text-base bg-background border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                      >
                        <option value="">Select crop type</option>
                        {cropTypes.map(crop => (
                          <option key={crop} value={crop}>
                            {crop}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label
                      htmlFor="serviceType"
                      className="block text-sm font-medium text-foreground"
                    >
                      Service of Interest
                    </label>
                    <select
                      id="serviceType"
                      name="serviceType"
                      value={formData.serviceType}
                      onChange={handleChange}
                      className="w-full px-3 py-2 text-sm sm:text-base bg-background border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                    >
                      <option value="">Select service</option>
                      {serviceTypes.map(service => (
                        <option key={service} value={service}>
                          {service}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label
                      htmlFor="message"
                      className="block text-sm font-medium text-foreground"
                    >
                      Message <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      id="message"
                      name="message"
                      rows={4}
                      value={formData.message}
                      onChange={handleChange}
                      className={`w-full px-3 py-2 text-sm sm:text-base bg-background border rounded-md focus:outline-none focus:ring-2 focus:ring-primary ${
                        errors.message
                          ? "border-red-500 focus:ring-red-500"
                          : "border-input"
                      }`}
                    ></textarea>
                    {errors.message && (
                      <p className="text-xs text-red-500 mt-1">
                        {errors.message}
                      </p>
                    )}
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-primary text-primary-foreground font-medium py-2.5 px-4 rounded-md hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 transition-colors disabled:opacity-70 text-sm sm:text-base"
                  >
                    {isSubmitting ? (
                      <span className="flex items-center justify-center">
                        <svg
                          className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
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
                        Sending...
                      </span>
                    ) : (
                      "Submit Request"
                    )}
                  </button>
                </form>
              )}
            </div>
          </motion.div>

          {/* Contact Information */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="order-1 lg:order-2"
          >
            {/* Expert Section with Image Background */}
            <div className="relative rounded-2xl overflow-hidden shadow-lg border border-border/50">
              {/* Background Image with Overlay */}
              <div className="absolute inset-0">
                <Image
                  src="/images/farm3.jpg"
                  alt="Agricultural field background"
                  fill
                  sizes="100vw"
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
