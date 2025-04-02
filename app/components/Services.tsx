"use client";

import { motion } from "framer-motion";
import { ServiceGrid, type ServiceItem } from "@/components/ui/service-grid";
import { Microscope, TestTube, LandPlot } from "lucide-react";

const services: ServiceItem[] = [
  {
    title: "SimpleSense",
    description:
      "Our research-grade aerial imagery pipeline integrates traditional image processing with machine learning to deliver plot-level canopy metrics. Leveraging calibrated reflectance data, we produce publication-ready reports including derivatives such as vegetation indices, canopy cover, uniformity assessments, and supervised classifications.",
    icon: <LandPlot className="w-5 h-5 sm:w-6 sm:h-6" />,
    image: "/simple-sense/simplesense.png",
    tags: [
      "Calibrated Reflectance",
      "Machine Learning Analysis",
      "Plot-Level SimpleSense"
    ],
    meta: "Remote Sensing Pipeline for Plot Research",
    cta: "Explore More",
    link: "/services/simple-sense"
  },
  {
    title: "On-Farm Research",
    description:
      "We collaborate with growers to conduct real-world agronomic research trials, utilizing on-farm equipment technology to collect data. Our efforts provide actionable insights that inform practical agronomic decisions.",
    icon: <Microscope className="w-5 h-5 sm:w-6 sm:h-6" />,
    image: "/onfarm/onfarmmain.png",
    tags: ["Product Efficacy", "Rate Testing", "Validate Practices"],
    meta: "Research & Analytics",
    cta: "Discover More",
    link: "/services/onfarm-research"
  },
  {
    title: "Field Services",
    description:
      "Field sampling services that deliver comprehensive insights into land health. From soil conditions to crop performance, we collect data to support informed and effective agricultural decisions.",
    icon: <TestTube className="w-5 h-5 sm:w-6 sm:h-6" />,
    image: "/field-sampling/sample.png",
    tags: ["Soil Analysis", "Resource Mapping"],
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
            className="text-base sm:text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto px-4 sm:px-6"
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
