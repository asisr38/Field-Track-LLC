"use client";

import { motion } from "framer-motion";
import Image from "next/image";

const services = [
  {
    title: "Spatial Data Support",
    description:
      "We help you make sense of your field data by integrating information from multiple sources - whether it's your equipment sensors, satellite imagery, or weather stations. Compatible with your existing farm management software.",
    icon: "📍",
    image: "/images/farm1.jpg",
    stats: [
      "Multi-source Integration",
      "Equipment Compatibility",
      "Custom Analysis"
    ]
  },
  {
    title: "Aerial Imagery",
    description:
      "From collection to processing, we handle your aerial imagery needs with our SimpleSense pipeline. Get accurate, timely insights about your fields with our proven assessment methods.",
    icon: "🛩️",
    image: "/images/farm4.jpg",
    stats: [
      "Collection Pipeline",
      "SimpleSense Processing",
      "Accuracy Assessment"
    ]
  },
  {
    title: "On-Farm Research",
    description:
      "Comprehensive field trial services designed to test and validate agricultural practices. From plot design to data collection, we ensure reliable research outcomes.",
    icon: "🌾",
    image: "/images/farm5.jpg",
    stats: ["Trial Design", "Data Analysis", "Performance Mapping"]
  },
  {
    title: "Small Plot Research",
    description:
      "Get precise insights with our small plot research capabilities. Our in-house software is customizable to your specific needs, delivering detailed analysis you can trust.",
    icon: "🔬",
    image: "/images/farm6.jpg",
    stats: ["Custom Software", "Detailed Analysis", "Research Support"]
  },
  {
    title: "Field Sampling",
    description:
      "Professional field sampling services that give you the full picture of your land's health. From soil conditions to crop status, we collect the data that drives better decisions.",
    icon: "🧪",
    image: "/images/farm7.jpg",
    stats: ["Soil Analysis", "Crop Health", "Resource Mapping"]
  },
  {
    title: "Analysis & Reporting",
    description:
      "Transform raw data into actionable insights. Our comprehensive reports help you optimize resources, improve yields, and make confident decisions about your operation.",
    icon: "📊",
    image: "/images/farm1.jpg",
    stats: ["Yield Analysis", "Resource Optimization", "Decision Support"]
  }
];

export default function Services() {
  return (
    <section
      id="services"
      className="py-20 bg-background relative overflow-hidden"
    >
      {/* Futuristic Background Elements */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:14px_24px]" />
        <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-primary/5" />
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 2, repeat: Infinity, repeatType: "reverse" }}
          className="absolute inset-0 bg-[radial-gradient(circle_500px_at_50%_200px,#3b82f620,transparent)]"
        />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <div className="flex flex-col items-center justify-center">
            <div className="text-center mb-16 space-y-4">
              <h2 className="text-4xl md:text-5xl font-primary">
                Our <span className="text-primary">Services</span>
              </h2>
              <p className="text-body-lg text-muted-foreground font-secondary max-w-2xl mx-auto">
                From field sampling to detailed analytics, we bring
                research-grade precision to your agricultural operations. Our
                expertise helps you turn farm data into practical, profitable
                decisions.
              </p>
            </div>
          </div>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((service, index) => (
            <motion.div
              key={service.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="group relative bg-card rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300"
            >
              <div className="relative h-[400px] rounded-2xl overflow-hidden">
                {/* Background Image */}
                <Image
                  src={service.image}
                  alt={service.title}
                  fill
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                  priority={index < 3}
                />
                {/* Adjusted overlay for better text contrast */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/80 to-black/50" />

                {/* Content */}
                <div className="absolute inset-x-0 bottom-0 p-4">
                  <div className="relative backdrop-blur-none bg-black/70 rounded-xl p-4 border border-white/10 transform transition-all duration-300 group-hover:translate-y-[-8px]">
                    {/* Service Icon */}
                    <div className="absolute -top-8 left-4">
                      <div className="relative">
                        <div className="w-14 h-14 rounded-xl bg-black/90 backdrop-blur-none flex items-center justify-center text-2xl border border-white/20 shadow-lg">
                          {service.icon}
                        </div>
                        <motion.div
                          animate={{ scale: [1, 1.2, 1] }}
                          transition={{ duration: 2, repeat: Infinity }}
                          className="absolute -inset-1 bg-primary/20 rounded-xl -z-10 blur-sm"
                        />
                      </div>
                    </div>

                    {/* Service Content */}
                    <div className="mt-6">
                      <h3 className="text-lg font-bold text-white mb-2">
                        {service.title}
                      </h3>
                      {/* Improved text clarity for mobile */}
                      <p className="text-[15px] text-white leading-relaxed mb-3 font-medium">
                        {service.description}
                      </p>

                      {/* Stats */}
                      <div className="flex flex-wrap gap-1.5">
                        {service.stats.map((stat, i) => (
                          <span
                            key={i}
                            className="text-[13px] bg-white/20 backdrop-blur-none px-2.5 py-1 rounded-full text-white font-medium border border-white/10 hover:bg-white/30 transition-colors"
                          >
                            {stat}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Hover Effect Line */}
                    <motion.div
                      initial={{ scaleX: 0 }}
                      animate={{ scaleX: 1 }}
                      transition={{ duration: 0.5 }}
                      className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-primary/50 via-primary to-primary/50"
                    />
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
