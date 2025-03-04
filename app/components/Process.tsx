"use client";

import { motion } from "framer-motion";
import { useInView } from "react-intersection-observer";
import {
  Ruler,
  TestTube2,
  ClipboardList,
  HeadphonesIcon,
  ArrowRight
} from "lucide-react";
import { cn } from "@/lib/utils";
import Image from "next/image";

const steps = [
  {
    title: "Data Collection",
    description:
      "We integrate with your existing farm management tools like John Deere Operations Center and Climate FieldView, combining field data with high-resolution aerial imagery and weather station data.",
    details: [
      "Integration with precision ag platforms",
      "High-resolution aerial imagery",
      "Weather station data integration",
      "Field sensor networks"
    ]
  },
  {
    title: "Trial Design",
    description:
      "Using scientific methodology, we design trials that answer your specific questions while accounting for field variability and operational constraints.",
    details: [
      "Randomized plot layouts",
      "Statistical power analysis",
      "Treatment planning",
      "Implementation protocols"
    ]
  },
  {
    title: "Data Analysis",
    description:
      "Advanced statistical analysis reveals meaningful insights from your trial data, helping you make confident decisions about your operation.",
    details: [
      "Statistical analysis",
      "Spatial correlation",
      "Economic evaluation",
      "Visual reporting"
    ]
  }
];

export default function Process() {
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1
  });

  return (
    <section id="process" className="py-20 bg-secondary/5">
      <div className="container mx-auto px-4">
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="max-w-6xl mx-auto"
        >
          <div className="text-center mb-16 space-y-4">
            <h2 className={cn("text-4xl md:text-5xl font-primary")}>
              Our <span className="text-primary">Process</span>
            </h2>
            <p className="text-body-lg text-muted-foreground font-secondary max-w-2xl mx-auto">
              We work with your existing farm management tools and trusted data
              sources to deliver research-grade insights for your operation
            </p>
          </div>

          <div className="relative">
            {/* Process Steps */}
            <div className="space-y-12 lg:space-y-24">
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
                      "grid lg:grid-cols-2 gap-8 items-center",
                      index % 2 === 1 && "lg:grid-flow-dense"
                    )}
                  >
                    {/* Content Side */}
                    <div
                      className={cn(
                        "p-8 bg-card/50 backdrop-blur-sm rounded-2xl border border-border/50 hover:border-primary/50 transition-all duration-300",
                        index % 2 === 1 && "lg:col-start-2"
                      )}
                    >
                      <div className="flex items-start gap-4">
                        {/* Icon */}
                        <div className="p-4 bg-primary/10 rounded-xl group-hover:bg-primary/20 transition-colors">
                          <Ruler className="w-8 h-8 text-primary" />
                        </div>
                        {/* Text Content */}
                        <div className="flex-1">
                          <h3 className="text-2xl md:text-3xl font-bold mb-3 font-primary group-hover:text-primary transition-colors">
                            {step.title}
                          </h3>
                          <p className="text-body text-muted-foreground mb-6">
                            {step.description}
                          </p>
                          {/* Details List */}
                          <ul className="space-y-3">
                            {step.details.map((detail, i) => (
                              <li
                                key={i}
                                className="flex items-center gap-2 text-body-sm"
                              >
                                <ArrowRight className="w-4 h-4 text-primary" />
                                <span className="text-muted-foreground">
                                  {detail}
                                </span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </div>

                    {/* Image Side */}
                    <div
                      className={cn(
                        "hidden lg:block relative h-full",
                        index % 2 === 1 && "lg:col-start-1"
                      )}
                    >
                      <motion.div
                        className="relative h-full"
                        whileHover={{ scale: 1.02 }}
                        transition={{ duration: 0.3 }}
                      >
                        {/* Image Container */}
                        <div className="relative h-[300px] rounded-2xl overflow-hidden">
                          <Image
                            src="/images/drone.jpg"
                            alt={step.title}
                            fill
                            className="object-cover transition-transform duration-500 group-hover:scale-105"
                          />
                          <div className="absolute inset-0 bg-gradient-to-tr from-primary/40 to-transparent" />

                          {/* Number Overlay */}
                          <div className="absolute inset-0 flex items-center justify-center">
                            <div className="w-20 h-20 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center shadow-lg border border-white/20">
                              <span className="text-3xl font-bold text-primary">
                                {(index + 1).toString().padStart(2, "0")}
                              </span>
                            </div>
                          </div>

                          {/* Step Info Overlay */}
                          <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/60 to-transparent">
                            <div className="flex items-center gap-3">
                              <span className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                                <Ruler className="w-6 h-6 text-white" />
                              </span>
                              <div>
                                <h4 className="text-white font-bold">
                                  {step.title}
                                </h4>
                                <p className="text-white/80 text-sm">
                                  {step.details[0]}
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
