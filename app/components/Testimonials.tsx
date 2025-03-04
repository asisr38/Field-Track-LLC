"use client";

import { useState, useEffect } from "react";
import { TestimonialCard } from "./ui/testimonial-card";
import { motion } from "framer-motion";
import { useInView } from "react-intersection-observer";
import Image from "next/image";
import { Star } from "lucide-react";

const testimonials = [
  {
    content:
      "Field Track's research trial design and implementation has been invaluable for our operation. The data integration with our John Deere equipment made the whole process seamless, and the insights helped us make better decisions about our variable rate applications.",
    author: "Mark Richardson",
    title: "Row Crop Producer",
    location: "Northeast Arkansas",
    rating: 5
  },
  {
    content:
      "Having someone who understands both the research methodology and practical farming operations is rare. The field trial data was presented in a way that made it easy to understand and apply to our decision-making process.",
    author: "David Wilson",
    title: "Precision Ag Manager",
    location: "Southeast Missouri",
    rating: 5
  },
  {
    content:
      "The level of personal attention and expertise in setting up our research plots was exceptional. The integration with our Climate FieldView data made it easy to track and measure results throughout the season.",
    author: "James Cooper",
    title: "Farm Operations Manager",
    location: "Eastern Arkansas",
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
              Client Success Stories
            </h2>
            <p className="text-md max-w-[600px] font-medium text-muted-foreground sm:text-xl">
              Real results from research trials and field studies
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
            Research That Drives Results
          </h2>
          <p className="text-muted-foreground font-inter">
            See how our field trials and data analysis help farms make better
            decisions
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
