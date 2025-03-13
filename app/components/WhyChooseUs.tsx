"use client";

import { motion } from "framer-motion";
import { useInView } from "react-intersection-observer";

export default function WhyChooseUs() {
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1
  });

  return (
    <section id="why-choose-us" className="py-20 bg-background">
      <div className="container mx-auto px-4">
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="max-w-6xl mx-auto"
        >
          <div className="text-center mb-16 space-y-4">
            <h2 className="text-4xl md:text-5xl font-primary">
              Why Choose <span className="text-primary">Field Track</span>?
            </h2>
            <p className="text-body-lg text-muted-foreground font-secondary max-w-2xl mx-auto">
              We combine agricultural expertise with cutting-edge technology to
              deliver actionable insights for your farm
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Research Focus Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="group relative"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-transparent rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <div className="relative p-6 rounded-xl border border-border/50 group-hover:border-primary/30 transition-colors duration-300 h-full">
                <div className="w-12 h-12 mb-4 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors duration-300">
                  <span className="text-2xl">🔬</span>
                </div>
                <h3 className="text-xl font-bold mb-2 group-hover:text-primary transition-colors duration-300">
                  Research Focus
                </h3>
                <p className="text-muted-foreground">
                  Specialized in both small plot research and large-scale field
                  trials, delivering reliable results you can trust.
                </p>
              </div>
            </motion.div>

            {/* Data Integration Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="group relative"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-transparent rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <div className="relative p-6 rounded-xl border border-border/50 group-hover:border-primary/30 transition-colors duration-300 h-full">
                <div className="w-12 h-12 mb-4 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors duration-300">
                  <span className="text-2xl">🔄</span>
                </div>
                <h3 className="text-xl font-bold mb-2 group-hover:text-primary transition-colors duration-300">
                  Easy Integration
                </h3>
                <p className="text-muted-foreground">
                  Works with your existing tools - John Deere Operations Center,
                  Climate FieldView, and more.
                </p>
              </div>
            </motion.div>

            {/* Experience Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="group relative"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-transparent rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <div className="relative p-6 rounded-xl border border-border/50 group-hover:border-primary/30 transition-colors duration-300 h-full">
                <div className="w-12 h-12 mb-4 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors duration-300">
                  <span className="text-2xl">📊</span>
                </div>
                <h3 className="text-xl font-bold mb-2 group-hover:text-primary transition-colors duration-300">
                  Clear Results
                </h3>
                <p className="text-muted-foreground">
                  Get straightforward analysis and practical recommendations
                  based on your actual field data.
                </p>
              </div>
            </motion.div>

            {/* Personal Service Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="group relative"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-transparent rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <div className="relative p-6 rounded-xl border border-border/50 group-hover:border-primary/30 transition-colors duration-300 h-full">
                <div className="w-12 h-12 mb-4 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors duration-300">
                  <span className="text-2xl">👨‍🌾</span>
                </div>
                <h3 className="text-xl font-bold mb-2 group-hover:text-primary transition-colors duration-300">
                  Direct Support
                </h3>
                <p className="text-muted-foreground">
                  Work directly with me throughout your trials - no middlemen,
                  no corporate overhead.
                </p>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
