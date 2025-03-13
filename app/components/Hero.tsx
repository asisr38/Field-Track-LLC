"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useTheme } from "next-themes";
import { Waves } from "@/components/ui/waves-background";
import Image from "next/image";
import Link from "next/link";

export default function Hero() {
  const [mounted, setMounted] = useState(false);
  const { resolvedTheme } = useTheme();

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="relative min-h-screen flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0" />
      </div>
    );
  }

  return (
    <section className="relative min-h-[90vh] sm:min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-b from-background to-background/95">
      {/* Waves Background */}
      <div className="absolute inset-0 z-0">
        {/* Removing the background image and keeping only the waves */}
        <div className="absolute inset-0 bg-gradient-to-b from-background/90 to-background/95" />

        {/* Enhanced Interactive Waves Background */}
        <div className="absolute inset-0 z-10">
          <Waves
            lineColor={
              resolvedTheme === "dark"
                ? "rgba(218, 165, 32, 0.4)"
                : "rgba(184, 134, 11, 0.5)"
            }
            backgroundColor="transparent"
            waveSpeedX={0.01}
            waveSpeedY={0.005}
            waveAmpX={50}
            waveAmpY={25}
            friction={0.92}
            tension={0.01}
            maxCursorMove={150}
            xGap={10}
            yGap={30}
          />
        </div>
      </div>

      <div className="container mx-auto px-4 z-10 py-12 sm:py-20">
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center lg:text-left"
          >
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-4 sm:mb-6 text-primary merriweather-bold">
              Technology-driven Strategies for Land Management
            </h1>
            <p className="text-lg sm:text-xl md:text-2xl text-muted-foreground mb-6 sm:mb-8 max-w-2xl mx-auto lg:mx-0">
              Agronomic Research Consulting & Project Implementation
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <Link href="#contact" className="w-full sm:w-auto">
                <button className="w-full sm:w-auto bg-green-600 text-white font-medium py-3 px-6 sm:px-8 rounded-lg shadow-md border-2 border-green-600 hover:bg-green-700 hover:border-green-700 transition-colors">
                  Get Started
                </button>
              </Link>

              <Link href="#services" className="w-full sm:w-auto">
                <button className="w-full sm:w-auto bg-white text-green-600 font-medium py-3 px-6 sm:px-8 rounded-lg shadow-md border-2 border-green-600 hover:bg-gray-50 transition-colors">
                  Learn More
                </button>
              </Link>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="relative mt-8 lg:mt-0 block"
          >
            {/* Image Grid - Visible on all devices but with different layouts */}
            <div className="grid grid-cols-2 gap-2 sm:gap-4">
              <div className="space-y-2 sm:space-y-4">
                <div className="relative aspect-square rounded-lg sm:rounded-2xl overflow-hidden shadow-lg sm:shadow-2xl">
                  <Image
                    src="/simple-sense/drone-flight.jpg"
                    alt="Agricultural field visualization"
                    fill
                    sizes="(max-width: 640px) 45vw, (max-width: 768px) 40vw, (max-width: 1024px) 30vw, 25vw"
                    className="object-cover"
                    priority
                  />
                  <div className="absolute inset-0 bg-gradient-to-tr from-primary/20 to-transparent" />
                </div>
                <div className="relative aspect-square rounded-lg sm:rounded-2xl overflow-hidden shadow-lg sm:shadow-2xl">
                  <Image
                    src="/images/farmmobile.jpg"
                    alt="Field grid analysis"
                    fill
                    sizes="(max-width: 640px) 45vw, (max-width: 768px) 40vw, (max-width: 1024px) 30vw, 25vw"
                    className="object-cover"
                    priority
                  />

                  <div className="absolute inset-0 bg-gradient-to-tr from-primary/20 to-transparent" />
                </div>
              </div>
              <div className="space-y-2 sm:space-y-4 mt-4 sm:mt-8">
                <div className="relative aspect-square rounded-lg sm:rounded-2xl overflow-hidden shadow-lg sm:shadow-2xl">
                  <Image
                    src="/simple-sense/r3stage.png"
                    alt="Field topography"
                    fill
                    sizes="(max-width: 640px) 45vw, (max-width: 768px) 40vw, (max-width: 1024px) 30vw, 25vw"
                    className="object-cover"
                    priority
                  />
                  <div className="absolute inset-0 bg-gradient-to-tr from-primary/20 to-transparent" />
                </div>
                <div className="relative aspect-square rounded-lg sm:rounded-2xl overflow-hidden shadow-lg sm:shadow-2xl">
                  <Image
                    src="/images/satelliteview.webp"
                    alt="Agricultural technology"
                    fill
                    sizes="(max-width: 640px) 45vw, (max-width: 768px) 40vw, (max-width: 1024px) 30vw, 25vw"
                    className="object-cover"
                    priority
                  />
                  <div className="absolute inset-0 bg-gradient-to-tr from-primary/20 to-transparent" />
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
