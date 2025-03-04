"use client";

import { motion } from "framer-motion";
import Image from "next/image";

const services = [
  {
    title: "Digital Land Monitoring",
    description:
      "Advanced satellite and IoT-based monitoring systems providing real-time insights into land conditions, usage patterns, and resource allocation.",
    icon: "📍",
    image: "/images/farm1.jpg",
    stats: ["Satellite Analytics", "IoT Sensor Network", "Real-time Monitoring"]
  },
  {
    title: "Precision Management",
    description:
      "AI-powered precision management solutions that optimize resource utilization, reduce waste, and enhance land productivity through data-driven decisions.",
    icon: "🛰️",
    image: "/images/farm4.jpg",
    stats: ["AI Analytics", "Resource Optimization", "Performance Tracking"]
  },
  {
    title: "Strategic Planning",
    description:
      "Comprehensive land management strategies developed using advanced analytics and machine learning to maximize ROI while ensuring sustainability.",
    icon: "🔬",
    image: "/images/farm5.jpg",
    stats: [
      "Predictive Analytics",
      "ROI Optimization",
      "Sustainability Metrics"
    ]
  },
  {
    title: "Environmental Assessment",
    description:
      "Advanced environmental monitoring and assessment using cutting-edge technology to ensure sustainable land use and regulatory compliance.",
    icon: "🧪",
    image: "/images/farm6.jpg",
    stats: [
      "Environmental Monitoring",
      "Compliance Tracking",
      "Impact Assessment"
    ]
  },
  {
    title: "Resource Management",
    description:
      "Smart resource allocation and management systems powered by AI to optimize water usage, energy consumption, and other critical resources.",
    icon: "🗺️",
    image: "/images/farm7.jpg",
    stats: ["Smart Allocation", "Usage Analytics", "Efficiency Metrics"]
  },
  {
    title: "Performance Analytics",
    description:
      "Comprehensive performance tracking and analysis using advanced data analytics to provide actionable insights and continuous improvement recommendations.",
    icon: "📊",
    image: "/images/farm1.jpg",
    stats: ["Performance Metrics", "Trend Analysis", "Improvement Strategies"]
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
                      <h3 className="text-2xl md:text-3xl font-bold text-white mb-3">
                        {service.title}
                      </h3>
                      <p className="text-body text-white/90 mb-4 line-clamp-3">
                        {service.description}
                      </p>

                      {/* Stats */}
                      <div className="flex flex-wrap gap-2">
                        {service.stats.map((stat, i) => (
                          <span
                            key={i}
                            className="text-body-sm bg-white/10 backdrop-blur-sm px-3 py-1 rounded-full text-white/90 border border-white/10 hover:bg-white/20 transition-colors"
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
