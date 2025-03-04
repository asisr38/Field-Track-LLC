"use client";

import { motion } from "framer-motion";
import { useInView } from "react-intersection-observer";

export default function WhyChooseUs() {
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1
  });

  return (
    <section className="py-20 bg-background">
      <div className="container mx-auto px-4">
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="max-w-6xl mx-auto"
        >
          <h2 className="text-4xl font-bold text-center mb-12 font-poppins bg-gradient-to-r from-primary/80 to-primary bg-clip-text text-transparent">
            Why Choose Us?
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Unbiased Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="group relative"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-transparent rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <div className="relative p-6 rounded-xl border border-border/50 group-hover:border-primary/30 transition-colors duration-300 h-full">
                <div className="w-12 h-12 mb-4 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors duration-300">
                  <span className="text-2xl">⚖️</span>
                </div>
                <h3 className="text-xl font-bold mb-2 group-hover:text-primary transition-colors duration-300">Unbiased</h3>
                <p className="text-muted-foreground">Our recommendations are not influenced by any entity selling fertilizer. We provide transparency in pricing for products between competing retailers.</p>
              </div>
            </motion.div>

            {/* Expertise Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="group relative"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-transparent rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <div className="relative p-6 rounded-xl border border-border/50 group-hover:border-primary/30 transition-colors duration-300 h-full">
                <div className="w-12 h-12 mb-4 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors duration-300">
                  <span className="text-2xl">🎓</span>
                </div>
                <h3 className="text-xl font-bold mb-2 group-hover:text-primary transition-colors duration-300">Expertise</h3>
                <p className="text-muted-foreground">Years of experience in soil science, agronomy, and remote sensing.</p>
              </div>
            </motion.div>

            {/* Advanced Technology Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="group relative"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-transparent rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <div className="relative p-6 rounded-xl border border-border/50 group-hover:border-primary/30 transition-colors duration-300 h-full">
                <div className="w-12 h-12 mb-4 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors duration-300">
                  <span className="text-2xl">🔬</span>
                </div>
                <h3 className="text-xl font-bold mb-2 group-hover:text-primary transition-colors duration-300">Advanced Technology</h3>
                <p className="text-muted-foreground">Cutting-edge tools and techniques for accurate analysis.</p>
              </div>
            </motion.div>

            {/* Farmer-Focused Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="group relative"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-transparent rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <div className="relative p-6 rounded-xl border border-border/50 group-hover:border-primary/30 transition-colors duration-300 h-full">
                <div className="w-12 h-12 mb-4 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors duration-300">
                  <span className="text-2xl">🌾</span>
                </div>
                <h3 className="text-xl font-bold mb-2 group-hover:text-primary transition-colors duration-300">Farmer-Focused</h3>
                <p className="text-muted-foreground">We understand the challenges you face and are here to help.</p>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  );
} 