"use client";

import { motion } from "framer-motion";
import { useInView } from "react-intersection-observer";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

export default function WhyResearchMatters() {
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1
  });

  return (
    <section id="why-research-matters" className="py-20 bg-muted/30">
      <div className="container mx-auto px-4">
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="max-w-3xl mx-auto text-center"
        >
          <h2 className="text-3xl md:text-4xl font-primary mb-6">
            Why On-Farm Research <span className="text-primary">Matters</span>
          </h2>
          <p className="text-lg text-muted-foreground mb-8">
            Every field is unique, with its own soil characteristics, moisture
            patterns, and yield potential. Generic recommendations often fall
            short because they don't account for your specific conditions.
            On-farm research trials allow you to make data-driven decisions
            based on results from your own fields, helping you optimize inputs,
            maximize returns, and build long-term sustainability.
          </p>
          <Link href="#contact">
            <button className="inline-flex items-center gap-2 bg-primary hover:bg-primary/90 text-white font-medium py-3 px-8 rounded-lg shadow-md transition-colors duration-300">
              Learn More About Our Trials
              <ArrowRight className="w-4 h-4" />
            </button>
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
