"use client";

import { motion } from "framer-motion";
import { useInView } from "react-intersection-observer";
import {
  Ruler,
  TestTube2,
  ClipboardList,
  HeadphonesIcon,
  ArrowRight,
  Database,
  Lightbulb,
  BarChart2,
  FileText
} from "lucide-react";
import { cn } from "@/lib/utils";
import Image from "next/image";
import Link from "next/link";

const steps = [
  {
    title: "Strategy and Implementation",
    description:
      "Our team works with you to develop and implement customized field trial strategies that address your specific agronomic questions and operational goals.",
    details: [
      "Customized trial design",
      "Variable rate application maps",
      "Field-specific implementation plans"
    ],
    icon: Lightbulb,
    image: "/images/implementation.jpg",
    alt: "Field implementation of agricultural strategy with equipment in operation"
  },
  {
    title: "Data Collection",
    description:
      "We integrate with your existing farm management tools to collect comprehensive field data, including high-resolution aerial imagery and historical performance metrics.",
    details: [
      "Integration with John Deere Operations Center and Climate FieldView",
      "High-resolution drone imagery collection",
      "Historical yield data analysis"
    ],
    icon: Database,
    image: "/images/spatialImage2.jpeg",
    alt: "Spatial field data visualization showing variable crop conditions across multiple fields"
  },

  {
    title: "Data Analysis",
    description:
      "We apply advanced statistical methods to analyze trial data, identifying significant patterns and extracting actionable insights for your operation.",
    details: [
      "Multi-variate analysis",
      "Yield performance mapping",
      "Economic return calculations"
    ],
    icon: BarChart2,
    image: "/images/sateliteFarm.jpg",
    alt: "Satellite imagery of agricultural fields with data overlay showing performance metrics"
  },
  {
    title: "Customized Reporting",
    description:
      "Our detailed reports translate complex data into clear, actionable recommendations tailored to your specific operation and goals.",
    details: [
      "Visual data presentations",
      "ROI analysis",
      "Seasonal performance tracking"
    ],
    icon: FileText,
    image: "/images/report.jpg",
    alt: "Customized agricultural report with charts, graphs and field performance metrics"
  }
];

export default function Process() {
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1
  });

  return (
    <section
      id="process"
      className="py-20 bg-gradient-to-b from-background to-muted/30"
    >
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-4xl md:text-5xl font-primary mb-6"
          >
            Research <span className="text-primary">Process</span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
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
              initial={{ opacity: 0, y: 20 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: index * 0.2 }}
              className="relative group"
            >
              <div
                className={cn(
                  "grid lg:grid-cols-2 gap-8 items-stretch min-h-[400px]",
                  index % 2 === 1 && "lg:grid-flow-dense"
                )}
              >
                {/* Content Side */}
                <div
                  className={cn(
                    "p-8 bg-card/50 backdrop-blur-sm rounded-2xl border border-border/50 hover:border-primary/50 transition-all duration-300 h-full flex flex-col justify-center",
                    index % 2 === 1 && "lg:col-start-2"
                  )}
                >
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                      <step.icon className="w-6 h-6" />
                    </div>
                    <h3 className="text-2xl font-bold">{step.title}</h3>
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
                    "relative overflow-hidden rounded-2xl shadow-xl h-full",
                    index % 2 === 1 && "lg:col-start-1"
                  )}
                >
                  <Image
                    src={step.image}
                    alt={step.alt}
                    width={800}
                    height={600}
                    className="object-cover w-full h-full transition-transform duration-500 group-hover:scale-105"
                    style={{ height: "100%", minHeight: "350px" }}
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
                          />
                          <div>
                            <p className="font-semibold">
                              Performance Tracking
                            </p>
                            <p className="text-sm opacity-80">
                              Continuous monitoring of trial results
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
