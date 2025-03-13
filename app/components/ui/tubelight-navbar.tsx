"use client";

import React, { useEffect } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface NavItem {
  name: string;
  url: string;
  icon: LucideIcon;
}

interface NavBarProps {
  items: NavItem[];
  className?: string;
  onSectionChange?: (section: string) => void;
}

export function NavBar({ items, className, onSectionChange }: NavBarProps) {
  const [activeItem, setActiveItem] = React.useState<string | null>(null);

  useEffect(() => {
    const handleScroll = () => {
      // Only run on the homepage
      if (
        window.location.pathname !== "/" &&
        !window.location.pathname.endsWith("/")
      ) {
        return;
      }

      const sections = items.map(item => item.url.replace("/#", ""));
      const sectionElements = sections.map(section =>
        document.getElementById(section)
      );

      // Find the section that is currently in view
      const viewportHeight = window.innerHeight;
      const headerOffset = 100; // Approximate header height

      let currentSection = null;

      // Check each section from bottom to top (reverse order)
      // This ensures we highlight the section that takes up most of the viewport
      for (let i = sectionElements.length - 1; i >= 0; i--) {
        const element = sectionElements[i];
        if (!element) continue;

        const rect = element.getBoundingClientRect();
        // Section is considered in view if its top is above the middle of the viewport
        // and its bottom is below the header
        if (rect.top <= viewportHeight / 2 && rect.bottom >= headerOffset) {
          currentSection = sections[i];
          break;
        }
      }

      // If we're at the top of the page, highlight the first section
      if (window.scrollY < 100 && sections.includes("home")) {
        currentSection = "home";
      }

      if (currentSection !== activeItem) {
        setActiveItem(currentSection);
      }
    };

    // Initial check
    handleScroll();

    // Add scroll event listener
    window.addEventListener("scroll", handleScroll);

    // Clean up
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, [items, activeItem]);

  const handleClick = (url: string) => {
    const section = url.replace("/#", "");
    setActiveItem(section);
    if (onSectionChange) {
      onSectionChange(section);
    }
  };

  return (
    <nav className={cn("flex items-center gap-2", className)}>
      {items.map(item => {
        const Icon = item.icon;
        const isActive = activeItem === item.url.replace("/#", "");

        return (
          <Link
            key={item.name}
            href={item.url}
            onClick={() => handleClick(item.url)}
            className={cn(
              "relative px-4 py-2 rounded-full transition-all duration-300",
              "group flex items-center gap-2",
              "text-base font-medium",
              isActive
                ? "text-primary font-semibold"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <Icon
              className={cn(
                "w-4 h-4 transition-colors duration-300",
                isActive && "text-primary"
              )}
            />
            <span>{item.name}</span>
            {isActive && (
              <motion.div
                layoutId="navbar-indicator"
                className="absolute inset-0 z-[-1] rounded-full bg-primary/15"
                transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
              >
                <div className="absolute inset-0 rounded-full bg-gradient-to-r from-primary/30 to-primary/5 blur-[1px]" />
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 h-[2px] w-12 bg-primary/50">
                  <div className="absolute inset-0 blur-sm bg-primary/80" />
                </div>
              </motion.div>
            )}
          </Link>
        );
      })}
    </nav>
  );
}
