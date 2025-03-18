"use client";

import { motion } from "framer-motion";
import { ServiceGrid, type ServiceItem } from "@/components/ui/service-grid";
import { Plane, Microscope, TestTube } from "lucide-react";

const services: ServiceItem[] = [
  {
    title: "SimpleSense",
    description:
      "A research-grade aerial imagery pipeline optimized for plot trials. Leveraging calibrated reflectance data and machine learning, we deliver precise canopy metrics, plant height measurements, and temporal analysis with rigorous QA/QC. Our publication-quality reports include advanced derivatives like canopy cover, plant consistency, and supervised classification.",
    icon: <Plane className="w-5 h-5 sm:w-6 sm:h-6" />,
    image: "/hero/topright.png",
    tags: [
      "Calibrated Reflectance",
      "Machine Learning Analysis",
      "Plot-Level Precision"
    ],
    meta: "Remote Sensing Pipeline for Plot Research",
    cta: "Explore More",
    link: "/services/simple-sense"
  },
  {
    title: "On-Farm Research",
    description:
      "Comprehensive field trial services with advanced spatial analytics. From experimental design to harvest data collection, we help validate agricultural practices using Surgo soil data integration and detailed performance analysis.",
    icon: <Microscope className="w-5 h-5 sm:w-6 sm:h-6" />,
    image: "/onfarm/onfarmmain.png",
    tags: [
      "Spatial Trial Design",
      "Variable Rate Testing",
      "Soil-Specific Analysis"
    ],
    meta: "Research & Analytics",
    cta: "Discover More",
    link: "/services/onfarm-research"
  },
  {
    title: "Field Services - Field Sampling",
    description:
      "Professional field sampling services that give you the full picture of your land's health. From soil conditions to crop status, we collect the data that drives better decisions with scientific rigor.",
    icon: <TestTube className="w-5 h-5 sm:w-6 sm:h-6" />,
    image: "/images/soilsampling.webp",
    tags: ["Soil Analysis", "Crop Health Assessment", "Resource Mapping"],
    meta: "Professional Services",
    cta: "Learn More",
    link: "/services/field-sampling"
  }
];

export default function Services() {
  return (
    <section
      id="services"
      className="py-12 sm:py-16 md:py-20 bg-gradient-to-b from-background to-muted/30"
    >
      <div className="container mx-auto px-4">
        <div className="text-center mb-8 sm:mb-12 md:mb-16 space-y-3 sm:space-y-4">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-primary">
            Our <span className="text-primary">Core Services</span>
          </h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-base sm:text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto px-2"
          >
            Field Track LLC specializes in three key areas: advanced aerial
            imagery analysis through SimpleSense, comprehensive on-farm research
            with spatial analytics, and professional field sampling services.
            Each service is designed to deliver research-grade precision and
            actionable insights for your agricultural operations.
          </motion.p>
        </div>

        <ServiceGrid items={services} />
      </div>
    </section>
  );
}
