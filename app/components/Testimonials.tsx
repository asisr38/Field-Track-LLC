"use client";

import { useState, useEffect } from "react";
import { TestimonialCard } from "./ui/testimonial-card";
import { motion } from "framer-motion";
import { useInView } from "react-intersection-observer";
import Image from "next/image";
import { Star } from "lucide-react";

const testimonials = [
  {
    content: "Basic Package's soil analysis has been instrumental in improving our crop yields. Their detailed reports and practical recommendations helped us optimize our fertilizer application, resulting in a 30% increase in corn yield.",
    author: "John Anderson",
    title: "Large-Scale Corn & Soybean Farmer",
    location: "Jonesboro, AR",
    rating: 5
  },
  {
    content: "The precision and attention to detail in their soil sampling process is unmatched. Dr. Smith's expertise in interpreting the results and providing actionable recommendations has made a significant difference in our cotton production.",
    author: "Michael Thompson",
    title: "Cotton Producer",
    location: "Mississippi County, AR",
    rating: 5
  },
  {
    content: "Working with Jake and the team has transformed our approach to soil management. Their in-season monitoring and tissue testing services have helped us maintain optimal nutrient levels throughout the growing season.",
    author: "Sarah Williams",
    title: "Family Farm Owner",
    location: "Craighead County, AR",
    rating: 5
  }
];

export default function Testimonials() {
  const [mounted, setMounted] = useState(false);
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1
  });

  useEffect(() => {
    setMounted(true);
  }, []);

  // Return null on first render to avoid hydration mismatch
  if (!mounted) {
    return (
      <section className="bg-background text-foreground py-12 sm:py-24 md:py-32">
        <div className="mx-auto flex max-w-container flex-col items-center gap-8">
          <div className="flex flex-col items-center gap-4 px-4">
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-6 merriweather-bold">
              What Our Clients Say
            </h2>
            <p className="text-md max-w-[600px] font-medium text-muted-foreground sm:text-xl">
              Hear from the businesses we've helped transform through innovative
              technology solutions
            </p>
          </div>
          <div className="relative w-full overflow-hidden min-h-[300px]" />
        </div>
      </section>
    );
  }

  return (
    <section className="py-20 bg-secondary/5">
      <div className="container mx-auto px-4">
        <motion.div
          ref={ref}
          className="max-w-2xl mx-auto text-center mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-4xl font-bold mb-4 font-poppins">
            Trusted by Local Farmers
          </h2>
          <p className="text-muted-foreground font-inter">
            Hear from farmers who have transformed their yields with our soil analysis services
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={testimonial.author}
              initial={{ opacity: 0, y: 20 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: index * 0.2 }}
              className="relative group"
            >
              <div className="h-full p-8 bg-card rounded-2xl border border-border/50 hover:border-primary/50 transition-all duration-300">
                {/* Rating */}
                <div className="flex gap-1 mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star
                      key={i}
                      className="w-5 h-5 fill-primary text-primary"
                    />
                  ))}
                </div>

                {/* Content */}
                <blockquote className="mb-6">
                  <p className="text-foreground/90 font-inter leading-relaxed">
                    "{testimonial.content}"
                  </p>
                </blockquote>

                {/* Author */}
                <div className="flex items-center gap-4">
                  <div className="flex-1">
                    <p className="font-semibold text-foreground">
                      {testimonial.author}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {testimonial.title}
                    </p>
                    <p className="text-sm text-primary">
                      {testimonial.location}
                    </p>
                  </div>
                </div>

                {/* Decorative Elements */}
                <div className="absolute top-0 right-0 -mt-2 -mr-2 w-24 h-24 bg-primary/5 rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="absolute bottom-0 left-0 -mb-2 -ml-2 w-24 h-24 bg-primary/5 rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
