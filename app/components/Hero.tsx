"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useTheme } from "next-themes";
import { FlickeringGrid } from "@/components/ui/flickering-grid";
import { Waves } from "@/components/ui/waves-background";
import {
  ArrowRight,
  Leaf,
  Droplet,
  Sprout,
  TestTubes,
  LineChart,
  Microscope,
  PlaneTakeoff
} from "lucide-react";
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
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-b from-background to-background/95">
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

      <div className="container mx-auto px-4 z-10 py-20">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center lg:text-left"
          >
            <h1 className="text-4xl md:text-6xl font-bold mb-6 text-primary merriweather-bold">
              Technology-driven Strategies for Land Management
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-2xl">
              Agronomic Research Consulting & Project Implementation
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <Link href="#contact">
                <button className="bg-green-600 text-white font-medium py-3 px-8 rounded-lg shadow-md border-2 border-green-600 hover:bg-green-700 hover:border-green-700">
                  Get Started
                </button>
              </Link>

              <Link href="#services">
                <button className="bg-white text-green-600 font-medium py-3 px-8 rounded-lg shadow-md border-2 border-green-600 hover:bg-gray-50">
                  Learn More
                </button>
              </Link>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="relative hidden lg:block"
          >
            {/* Image Grid */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-4">
                <div className="relative aspect-square rounded-2xl overflow-hidden shadow-2xl">
                  <Image
                    src="/images/farm2.jpg"
                    alt="Agricultural field visualization"
                    fill
                    sizes="(max-width: 768px) 100vw, 50vw"
                    className="object-cover"
                    priority
                  />
                  <div className="absolute inset-0 bg-gradient-to-tr from-primary/20 to-transparent" />
                </div>
                <div className="relative aspect-square rounded-2xl overflow-hidden shadow-2xl">
                  <Image
                    src="/images/farmGrid.png"
                    alt="Field grid analysis"
                    fill
                    sizes="(max-width: 768px) 100vw, 50vw"
                    className="object-cover"
                    priority
                  />

                  <div className="absolute inset-0 bg-gradient-to-tr from-primary/20 to-transparent" />
                </div>
              </div>
              <div className="space-y-4 mt-8">
                <div className="relative aspect-square rounded-2xl overflow-hidden shadow-2xl">
                  <Image
                    src="/images/topography.png"
                    alt="Field topography"
                    fill
                    sizes="(max-width: 768px) 100vw, 50vw"
                    className="object-cover"
                    priority
                  />
                  <div className="absolute inset-0 bg-gradient-to-tr from-primary/20 to-transparent" />
                </div>
                <div className="relative aspect-square rounded-2xl overflow-hidden shadow-2xl">
                  <Image
                    src="/images/farm3.jpg"
                    alt="Agricultural technology"
                    fill
                    sizes="(max-width: 768px) 100vw, 50vw"
                    className="object-cover"
                    priority
                  />
                  <div className="absolute inset-0 bg-gradient-to-tr from-primary/20 to-transparent" />
                </div>
              </div>
            </div>

            {/* Floating Stats Card */}
            {/* <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="absolute -right-8 top-1/2 transform -translate-y-1/2 bg-card/90 backdrop-blur-sm p-6 rounded-xl shadow-lg border border-border/50"
            >
              <h3 className="text-xl font-bold mb-4 text-foreground">Why Choose Us</h3>
              <ul className="space-y-3">
                <li className="flex items-center gap-3">
                  <span className="w-8 h-8 flex items-center justify-center rounded-full bg-primary/20">🌱</span>
                  <span className="text-foreground font-medium">Precision Soil Analysis</span>
                </li>
                <li className="flex items-center gap-3">
                  <span className="w-8 h-8 flex items-center justify-center rounded-full bg-primary/20">📊</span>
                  <span className="text-foreground font-medium">Data-Driven Insights</span>
                </li>
                <li className="flex items-center gap-3">
                  <span className="w-8 h-8 flex items-center justify-center rounded-full bg-primary/20">🌍</span>
                  <span className="text-foreground font-medium">Sustainable Practices</span>
                </li>
              </ul>
            </motion.div> */}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
