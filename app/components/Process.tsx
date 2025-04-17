"use client";

import { motion } from "framer-motion";
import { useInView } from "react-intersection-observer";
import { Database, Lightbulb, BarChart2, FileText } from "lucide-react";
import { cn } from "@/lib/utils";
import Image from "next/image";
import { useState, useEffect } from "react";

const steps = [
  {
    title: "Plan and Set-Up",
    description:
      "Field- and product-specific strategies are designed to align with modern farm equipment and UAV technology, enabling effective application and data collection to meet your research goals.",
    details: [
      "Trial procurement and placement",
      "Prescriptions and guidance layers",
      "Sampling strategies for trial"
    ],
    icon: Lightbulb,
    image: "/process/plan.webp",
    alt: "Field implementation of agricultural strategy with equipment in operation"
  },
  {
    title: "Data Collection",
    description:
      "Spatially collected farm data is integrated with field samples, aerial imagery, and weather patterns, providing relevant insights for informed decision-making.",
    details: [
      "Integration with farm management software",
      "Precise and repeatable field sampling and imagery metrics",
      "Spatial decision-support layers and weather tracking"
    ],
    icon: Database,
    image: "/process/datacollect.webp",
    alt: "Spatial field data visualization showing variable crop conditions"
  },
  {
    title: "Data Analysis",
    description:
      "Our customizable, science-driven software processes multi-layered field data to evaluate treatment responses to specific products or application rates, providing tailored, insightful solutions for agricultural decision-making.",
    details: [
      "Multi-variate statistical analysis of soil and yield patterns",
      "Input efficiency and ROI calculations by management zone",
      "Year-over-year performance tracking and trend identification"
    ],
    icon: BarChart2,
    image: "/process/implementation.webp",
    alt: "Spatial data analysis of agricultural fields"
  },
  {
    title: "Customized Reporting",
    description:
      "Clear reports transform complex data into practical insight and recommendations, empowering confident decisions.",
    details: [],
    icon: FileText,
    image: "/process/onfield.jpg",
    alt: "Farmer reviewing customized agricultural report in the field"
  }
];

export default function Process() {
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1
  });

  // Add client-side only state
  const [isMounted, setIsMounted] = useState(false);

  // Only run animations after component is mounted on client
  useEffect(() => {
    setIsMounted(true);
  }, []);

  return (
    <section
      id="process"
      className="py-20 bg-gradient-to-b from-background to-muted/30"
    >
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <motion.h2
            initial={isMounted ? { opacity: 0, y: 20 } : { opacity: 1, y: 0 }}
            whileInView={
              isMounted ? { opacity: 1, y: 0 } : { opacity: 1, y: 0 }
            }
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-4xl md:text-5xl font-primary mb-6"
          >
            Research <span className="text-primary">Process</span>
          </motion.h2>
          <motion.p
            initial={isMounted ? { opacity: 0, y: 20 } : { opacity: 1, y: 0 }}
            whileInView={
              isMounted ? { opacity: 1, y: 0 } : { opacity: 1, y: 0 }
            }
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-xl text-muted-foreground max-w-3xl mx-auto"
          >
            A systematic approach to field trials that delivers reliable results
            and actionable insights
          </motion.p>
        </div>

        <div ref={ref} className="space-y-12 lg:space-y-24">
          {steps.map((step, index) => (
            <motion.div
              key={step.title}
              initial={isMounted ? { opacity: 0, y: 20 } : { opacity: 1, y: 0 }}
              animate={
                isMounted && inView
                  ? { opacity: 1, y: 0 }
                  : { opacity: 1, y: 0 }
              }
              transition={{ duration: 0.5, delay: index * 0.2 }}
              className="relative group"
            >
              <div
                className={cn(
                  "grid lg:grid-cols-2 gap-8 items-stretch min-h-0 lg:min-h-[500px]",
                  index % 2 === 1 && "lg:grid-flow-dense"
                )}
              >
                {/* Content Side */}
                <div
                  className={cn(
                    "p-6 sm:p-8 bg-card/50 backdrop-blur-sm rounded-2xl border border-border/50 hover:border-primary/50 transition-all duration-300 h-full flex flex-col justify-center",
                    index % 2 === 1 && "lg:col-start-2"
                  )}
                >
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary flex-shrink-0">
                      <step.icon className="w-5 h-5 sm:w-6 sm:h-6" />
                    </div>
                    <h3 className="text-xl sm:text-2xl font-bold">
                      {step.title}
                    </h3>
                  </div>
                  <p className="text-muted-foreground mb-6">
                    {step.description}
                  </p>
                  <ul className="space-y-2">
                    {step.details.map((detail, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center mt-0.5 flex-shrink-0">
                          <div className="w-2 h-2 rounded-full bg-primary"></div>
                        </div>
                        <span>{detail}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Image Side */}
                <div
                  className={cn(
                    "relative overflow-hidden rounded-2xl shadow-xl h-[300px] sm:h-[400px] lg:h-full",
                    index % 2 === 1 && "lg:col-start-1"
                  )}
                >
                  <Image
                    src={step.image}
                    alt={step.alt}
                    width={800}
                    height={600}
                    className="object-cover w-full h-full transition-transform duration-500 group-hover:scale-105"
                    style={{
                      objectFit: "cover",
                      width: "100%",
                      height: "100%"
                    }}
                    priority={index === 0}
                    unoptimized
                  />
                  {index === 3 && (
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end">
                      <div className="p-6">
                        <div className="flex items-center gap-2 text-white">
                          <Image
                            src="/images/report.jpg"
                            alt="Performance chart showing yield improvements"
                            width={120}
                            height={80}
                            className="rounded-md shadow-lg"
                            unoptimized
                          />
                          <div>
                            <p className="font-semibold">
                              Performance Tracking
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Step connector */}
              {index < steps.length - 1 && (
                <div className="hidden lg:block absolute left-1/2 -translate-x-1/2 h-16 w-px bg-gradient-to-b from-primary/30 to-primary/10 my-4"></div>
              )}
            </motion.div>
          ))}
        </div>

        {/* Call to Action
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mt-20"
        >
          <Link href="#contact">
            <button className="inline-flex items-center gap-2 bg-green-600 text-white font-medium py-3 px-8 rounded-lg shadow-md border-2 border-green-600 hover:bg-green-700 hover:border-green-700">
              Start Your Research Trial
              <ArrowRight className="w-4 h-4" />
            </button>
          </Link>
        </motion.div> */}
      </div>
    </section>
  );
}
