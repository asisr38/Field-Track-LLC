"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useTheme } from "next-themes";
import {
  Sprout,
  Sun,
  Menu,
  X,
  ClipboardList,
  Home,
  Code,
  Phone
} from "lucide-react";
import { NavBar } from "./ui/tubelight-navbar";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

const navItems = [
  { name: "Home", url: "/#home", icon: Home },
  { name: "Process", url: "/#process", icon: ClipboardList },
  { name: "Services", url: "/#services", icon: Code },
  { name: "Contact", url: "/#contact", icon: Phone }
];

export default function Header() {
  const [mounted, setMounted] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [isRotating, setIsRotating] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Initialize theme based on system preference if not set
    if (!theme) {
      setTheme(resolvedTheme || "light");
    }

    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener("scroll", handleScroll);

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, [theme, setTheme, resolvedTheme]);

  const handleMenuToggle = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const handleLinkClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    const href = e.currentTarget.getAttribute("href");
    if (href?.startsWith("/#")) {
      e.preventDefault();
      const targetId = href.substring(2);

      if (window.location.pathname !== "/") {
        window.location.href = href;
        return;
      }

      const targetElement = document.getElementById(targetId);
      if (targetElement) {
        const isMobile = window.innerWidth < 768;
        const offset = isMobile ? 80 : 70;
        const offsetTop =
          targetElement.getBoundingClientRect().top + window.scrollY - offset;
        window.scrollTo({ top: offsetTop, behavior: "smooth" });
      }

      setTimeout(() => setIsMenuOpen(false), 150);
    } else {
      setIsMenuOpen(false);
    }
  };

  if (!mounted) {
    return null;
  }

  const handleThemeChange = () => {
    setIsRotating(true);
    const newTheme = resolvedTheme === "dark" ? "light" : "dark";
    setTheme(newTheme);
    setTimeout(() => setIsRotating(false), 500);
  };

  const themeButtonClasses = cn(
    "p-2 rounded-full transition-all duration-500 relative group",
    "hover:scale-110 shadow-subtle hover:shadow-elevation-low",
    theme === "dark"
      ? [
          "bg-primary text-primary-foreground",
          "hover:bg-primary/90",
          "after:absolute after:inset-0 after:rounded-full after:ring-2",
          "after:ring-green-500/50 after:transition-all after:duration-500",
          "hover:after:ring-4 hover:after:ring-green-500/30",
          "before:absolute before:inset-0 before:rounded-full",
          "before:bg-gradient-to-r before:from-green-500/0",
          "before:to-green-500/30 before:opacity-0 before:transition-opacity",
          "hover:before:opacity-100"
        ].join(" ")
      : [
          "bg-primary text-primary-foreground",
          "hover:bg-primary/90",
          "after:absolute after:inset-0 after:rounded-full after:ring-2",
          "after:ring-orange-400/50 after:transition-all after:duration-500",
          "hover:after:ring-4 hover:after:ring-orange-400/30",
          "before:absolute before:inset-0 before:rounded-full",
          "before:bg-gradient-to-r before:from-orange-400/0",
          "before:to-orange-400/30 before:opacity-0 before:transition-opacity",
          "hover:before:opacity-100"
        ].join(" "),
    isRotating && "rotate-[360deg]"
  );

  const tooltipText =
    theme === "dark" ? "Switch to daylight mode" : "Switch to growth mode";

  return (
    <header
      className={cn(
        "fixed top-0 w-full backdrop-blur-md border-b z-50 transition-all duration-300",
        isScrolled
          ? "bg-background/95 border-border/60 shadow-elevation-low"
          : "bg-background/70 border-transparent"
      )}
    >
      <div className="container mx-auto px-4 md:px-6">
        <div className="flex items-center justify-between py-4">
          {/* Logo */}
          <Link
            href="/"
            className="flex items-center gap-2 transition-all hover:opacity-90"
          >
            <Image
              src="/logo/basic-package-logo-only.png"
              alt="Field Track Logo"
              width={40}
              height={40}
              className="object-contain"
            />
            <span className="text-2xl font-bold merriweather-bold text-foreground">
              Field Track LLC
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-6">
            <NavBar items={navItems} onSectionChange={() => {}} />
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleThemeChange}
              className={themeButtonClasses}
              title={tooltipText}
              aria-label={tooltipText}
            >
              <div className="relative w-5 h-5">
                <div
                  className={cn(
                    "absolute inset-0 transform transition-all duration-500",
                    theme === "dark"
                      ? "scale-100 rotate-0 opacity-100"
                      : "scale-0 rotate-180 opacity-0"
                  )}
                >
                  <Sprout size={20} className="animate-pulse-slow" />
                </div>
                <div
                  className={cn(
                    "absolute inset-0 transform transition-all duration-500",
                    theme === "dark"
                      ? "scale-0 -rotate-180 opacity-0"
                      : "scale-100 rotate-0 opacity-100"
                  )}
                >
                  <Sun size={20} className="animate-spin-slow" />
                </div>
              </div>
            </motion.button>
          </div>

          {/* Mobile Menu Button */}
          <div className="flex items-center gap-4 md:hidden">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleThemeChange}
              className={themeButtonClasses}
              title={tooltipText}
              aria-label={tooltipText}
            >
              <div className="relative w-5 h-5">
                <div
                  className={cn(
                    "absolute inset-0 transform transition-all duration-500",
                    theme === "dark"
                      ? "scale-100 rotate-0 opacity-100"
                      : "scale-0 rotate-180 opacity-0"
                  )}
                >
                  <Sprout size={20} className="animate-pulse-slow" />
                </div>
                <div
                  className={cn(
                    "absolute inset-0 transform transition-all duration-500",
                    theme === "dark"
                      ? "scale-0 -rotate-180 opacity-0"
                      : "scale-100 rotate-0 opacity-100"
                  )}
                >
                  <Sun size={20} className="animate-spin-slow" />
                </div>
              </div>
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleMenuToggle}
              className="p-2 text-foreground rounded-lg hover:bg-primary/5 transition-colors"
              aria-label="Toggle Menu"
            >
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </motion.button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="md:hidden glass border-t border-border"
          >
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1, duration: 0.3 }}
              className="container mx-auto px-4 py-6"
            >
              <NavBar
                items={navItems}
                className="flex-col items-start gap-6"
                onSectionChange={() => setIsMenuOpen(false)}
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
