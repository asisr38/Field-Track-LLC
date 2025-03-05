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
              <div className="relative h-[500px] sm:h-[520px] rounded-2xl overflow-hidden">
                {/* Background Image */}
                <Image
                  src={service.image}
                  alt={service.title}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                />
                {/* Darker overlay for better text contrast */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/80 to-black/40" />

                {/* Content */}
                <div className="absolute inset-x-0 bottom-0 p-5 sm:p-6">
                  <div className="relative backdrop-blur-sm bg-black/60 rounded-xl p-5 sm:p-6 border border-white/10 transform transition-all duration-300 group-hover:translate-y-[-8px]">
                    {/* Service Icon */}
                    <div className="absolute -top-8 left-6">
                      <div className="relative">
                        <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-xl bg-black/80 backdrop-blur-xl flex items-center justify-center text-2xl sm:text-3xl border border-white/20 shadow-lg">
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
                    <div className="mt-6 sm:mt-8">
                      <h3 className="text-xl sm:text-2xl font-bold text-white mb-3">
                        {service.title}
                      </h3>
                      {/* Adjust line height and remove line clamp for better readability */}
                      <p className="text-sm sm:text-base text-white/90 mb-4 leading-relaxed min-h-[80px]">
                        {service.description}
                      </p>

                      {/* Stats */}
                      <div className="flex flex-wrap gap-2">
                        {service.stats.map((stat, i) => (
                          <span
                            key={i}
                            className="text-xs sm:text-sm bg-white/20 backdrop-blur-sm px-3 py-1.5 rounded-full text-white border border-white/10 hover:bg-white/30 transition-colors"
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
