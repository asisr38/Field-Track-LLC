"use client";

import { motion } from "framer-motion";
import Image from "next/image";

const services = [
  {
    title: "Spatial Data Support",
    description:
      "Advanced geospatial analysis and mapping services to help farmers visualize field variability, identify management zones, and make data-driven decisions.",
    icon: "📍",
    image: "/images/farm1.jpg",
    stats: ["Precision Mapping", "Variable Rate Applications", "Zone Management"]
  },
  {
    title: "Aerial Imagery",
    description:
      "High-resolution drone and satellite imagery providing real-time insights into crop health, stress patterns, and field performance throughout the growing season.",
    icon: "🛰️",
    image: "/images/farm4.jpg",
    stats: ["NDVI Analysis", "Thermal Mapping", "Growth Monitoring"]
  },
  {
    title: "On-Farm Research",
    description:
      "Custom-designed field trials that evaluate products, practices, and management decisions under your specific field conditions to maximize ROI.",
    icon: "🔬",
    image: "/images/farm5.jpg",
    stats: ["Strip Trials", "Replicated Studies", "Statistical Analysis"]
  },
  {
    title: "Small Plot Research",
    description:
      "Controlled experimental designs that test multiple treatments and variables in a scientific setting to validate product efficacy and performance.",
    icon: "🧪",
    image: "/images/farm6.jpg",
    stats: ["Randomized Trials", "Multi-Variable Testing", "Controlled Conditions"]
  },
  {
    title: "Field Sampling",
    description:
      "Professional soil, tissue, and water sampling services using GPS-guided technology to ensure accurate representation of field conditions and nutrient status.",
    icon: "🗺️",
    image: "/images/farm7.jpg",
    stats: ["GPS Precision", "Zone-Based Sampling", "Depth Consistency"]
  },
  {
    title: "Analysis and Reporting",
    description:
      "Comprehensive data interpretation and custom reports that transform complex field data into actionable recommendations tailored to your operation goals.",
    icon: "📊",
    image: "/images/farm1.jpg",
    stats: ["Custom Insights", "Economic Analysis", "Management Recommendations"]
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
              <h2 className="text-4xl merriweather-bold">
                Our <span className="text-primary">Services</span>
              </h2>
              <p className="text-lg text-muted-foreground merriweather-regular max-w-2xl mx-auto">
                Comprehensive agricultural solutions powered by cutting-edge
                technology and expert analysis
              </p>
            </div>
          </div>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
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
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent" />

                {/* Futuristic Overlay Elements */}
                <div className="absolute inset-0">
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{
                      duration: 1.5,
                      repeat: Infinity,
                      repeatType: "reverse"
                    }}
                    className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary/50 to-transparent"
                  />
                  <div className="absolute top-4 right-4 flex items-center gap-2">
                    <motion.div
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ duration: 2, repeat: Infinity }}
                      className="w-2 h-2 rounded-full bg-primary"
                    />
                  </div>
                </div>

                {/* Content */}
                <div className="absolute inset-x-0 bottom-0 p-6">
                  <div className="relative backdrop-blur-sm bg-black/40 rounded-xl p-6 border border-white/10 transform transition-all duration-300 group-hover:translate-y-[-8px]">
                    {/* Service Icon */}
                    <div className="absolute -top-8 left-6">
                      <div className="relative">
                        <div className="w-16 h-16 rounded-xl bg-black/60 backdrop-blur-xl flex items-center justify-center text-3xl border border-white/20 shadow-lg">
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
                    <div className="mt-8">
                      <h3 className="text-2xl font-bold text-white mb-3">
                        {service.title}
                      </h3>
                      <p className="text-white/90 text-sm mb-4 line-clamp-3">
                        {service.description}
                      </p>

                      {/* Stats */}
                      <div className="flex flex-wrap gap-2">
                        {service.stats.map((stat, i) => (
                          <span
                            key={i}
                            className="text-xs bg-white/10 backdrop-blur-sm px-3 py-1 rounded-full text-white/90 border border-white/10 hover:bg-white/20 transition-colors"
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
