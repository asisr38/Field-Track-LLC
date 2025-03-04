"use client";

import { motion } from "framer-motion";
import { useInView } from "react-intersection-observer";
import { cn } from "@/lib/utils";
import Image from "next/image";

export default function About() {
  return (
    <section
      id="about"
      className="py-20 bg-background/50 relative overflow-hidden"
    >
      {/* Background Gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-background/0 via-background/50 to-background/0" />

      <div className="container mx-auto px-4 relative">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Image Section */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="relative"
          >
            {/* Main Image */}
            <div className="relative aspect-[4/3] rounded-2xl overflow-hidden">
              <Image
                src="/images/rmsmith.png"
                alt="Agricultural field"
                fill
                sizes="(max-width: 768px) 100vw, 50vw"
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-tr from-primary/20 to-transparent" />
            </div>

            {/* Floating Images
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="absolute -bottom-12 -left-12 w-48 h-48 rounded-2xl overflow-hidden shadow-xl"
            >
              <Image
                src="/images/myjd.jpg"
                alt="Field grid analysis"
                fill
                sizes="(max-width: 768px) 192px, 192px"
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-tr from-primary/20 to-transparent" />
            </motion.div>
        */}
          </motion.div>
          {/* Content Section */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="space-y-8"
          >
            <div>
              <h2 className="text-4xl font-primary mb-6">
                Research-Driven Field Trial Solutions
              </h2>
              <p className="text-xl text-muted-foreground font-secondary mb-8">
                Specializing in on-farm research and field trials, I help
                agricultural businesses make data-driven decisions through
                precise field mapping and detailed analysis.
              </p>
            </div>

            {/* Key Points with Images */}
            <div className="grid gap-6">
              {[
                {
                  title: "Field Research Expertise",
                  description:
                    "Experienced in designing and implementing both small plot research and large-scale field trials.",
                  image: "/images/farmGrid.png"
                },
                {
                  title: "Data Integration",
                  description:
                    "Seamlessly work with John Deere, Climate FieldView, and other precision ag platforms you already use.",
                  image: "/images/topography.png"
                },
                {
                  title: "Practical Results",
                  description:
                    "Convert complex field data into clear, actionable insights for your operation.",
                  image: "/images/farm3.jpg"
                }
              ].map((point, index) => (
                <motion.div
                  key={point.title}
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="flex gap-4 p-4 rounded-xl hover:bg-card/50 transition-colors group"
                >
                  <div className="relative w-24 h-24 rounded-xl overflow-hidden shrink-0">
                    <Image
                      src={point.image}
                      alt={point.title}
                      fill
                      sizes="96px"
                      className="object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-tr from-primary/20 to-transparent" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg mb-2 font-primary">
                      {point.title}
                    </h3>
                    <p className="text-muted-foreground font-secondary">
                      {point.description}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Stats Section with Background Image */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="mt-20 relative rounded-2xl overflow-hidden"
        >
          <div className="absolute inset-0">
            <Image
              src="/images/cornfield.jpg"
              alt="Farm landscape"
              fill
              sizes="100vw"
              className="object-cover brightness-50"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-black/80 to-black/70 backdrop-blur-[1px]" />
          </div>

          <div className="relative grid grid-cols-2 md:grid-cols-3 gap-8 p-12">
            {[
              { value: "100+", label: "Research Trials Completed" },
              { value: "15K+", label: "Acres of Trial Data" },
              { value: "3", label: "States Covered" }
            ].map(stat => (
              <div key={stat.label} className="text-center">
                <h4 className="text-5xl font-bold text-primary drop-shadow-sm mb-2">
                  {stat.value}
                </h4>
                <p className="text-white font-medium">{stat.label}</p>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
