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
  Phone,
  BookOpen,
  Users,
  FileText,
  Plane,
  Microscope,
  TestTube,
  ChevronDown
} from "lucide-react";
import { NavBar } from "./ui/tubelight-navbar";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import React from "react";

const serviceItems = [
  {
    name: "SimpleSense",
    description: "Advanced aerial imagery with multi-temporal NDVI analysis",
    icon: Plane,
    url: "/services/simple-sense"
  },
  {
    name: "On-Farm Research",
    description: "Comprehensive field trial services with spatial analytics",
    icon: Microscope,
    url: "/services/onfarm-research"
  },
  {
    name: "Field Services",
    description: "Professional soil and crop sampling services",
    icon: TestTube,
    url: "/services/field-sampling"
  }
];

const navItems = [
  { name: "Home", url: "/", icon: Home },
  {
    name: "Services",
    url: "/#services",
    icon: ClipboardList,
    hasDropdown: true,
    dropdownItems: serviceItems
  },
  { name: "Process", url: "/#process", icon: Sprout },
  { name: "About", url: "/#about", icon: BookOpen },
  { name: "Contact", url: "/#contact", icon: Phone }
];

export default function Header() {
  const [mounted, setMounted] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [isRotating, setIsRotating] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [activeSection, setActiveSection] = useState<string | null>(null);
  const dropdownRef = React.useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
    // Initialize theme based on system preference if not set
    if (!theme) {
      setTheme(resolvedTheme || "light");
    }

    // Check if we're on a service page and set activeSection accordingly
    const checkCurrentPath = () => {
      const path = window.location.pathname;

      if (path.startsWith("/services/")) {
        // On service pages, set activeSection to "services"
        setActiveSection("services");
      } else if (path === "/process") {
        // On process page, set activeSection to "process"
        setActiveSection("process");
      } else if (path === "/about") {
        // On about page, set activeSection to "about"
        setActiveSection("about");
      } else if (path === "/contact") {
        // On contact page, set activeSection to "contact"
        setActiveSection("contact");
      } else if (path === "/") {
        // On homepage, determine section based on scroll position
        const sections = navItems
          .filter(item => item.url.startsWith("/#"))
          .map(item => item.url.substring(2));

        const currentPosition = window.scrollY + 100;

        // If at the top of the page, set to home
        if (window.scrollY < 100) {
          setActiveSection("home");
          return;
        }

        let foundSection = false;
        for (let i = sections.length - 1; i >= 0; i--) {
          const section = document.getElementById(sections[i]);
          if (section && section.offsetTop <= currentPosition) {
            setActiveSection(sections[i]);
            foundSection = true;
            break;
          }
        }

        // If no section is found (e.g., at the very top), default to home
        if (!foundSection) {
          setActiveSection("home");
        }
      } else {
        // Extract the first part of the path to determine the section
        const section = path.split("/")[1];
        if (section) {
          setActiveSection(section);
        } else {
          // On other pages, don't highlight any section
          setActiveSection(null);
        }
      }
    };

    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);

      // Only update active section based on scroll on homepage
      if (window.location.pathname === "/") {
        checkCurrentPath();
      }
    };

    // Close dropdown when clicking outside
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setActiveDropdown(null);
      }
    };

    window.addEventListener("scroll", handleScroll);
    document.addEventListener("mousedown", handleClickOutside);

    // Initial check for active section
    checkCurrentPath();

    return () => {
      window.removeEventListener("scroll", handleScroll);
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [theme, setTheme, resolvedTheme]);

  const handleMenuToggle = () => {
    setIsMenuOpen(!isMenuOpen);
    // When opening the menu, prevent body scroll
    if (!isMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
  };

  // Add a useEffect to ensure body scroll is restored when component unmounts
  useEffect(() => {
    // Cleanup function to ensure body scroll is restored
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  // Add another useEffect to handle body scroll when menu state changes
  useEffect(() => {
    // If menu is closed, ensure body scroll is restored
    if (!isMenuOpen) {
      document.body.style.overflow = "";
    }
  }, [isMenuOpen]);

  // Close mobile menu when route changes
  useEffect(() => {
    const handleRouteChange = () => {
      setIsMenuOpen(false);
      setActiveDropdown(null);
      document.body.style.overflow = "";
    };

    window.addEventListener("popstate", handleRouteChange);

    return () => {
      window.removeEventListener("popstate", handleRouteChange);
    };
  }, []);

  const handleLinkClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    const href = e.currentTarget.getAttribute("href");

    // Handle root URL
    if (href === "/") {
      if (window.location.pathname === "/") {
        e.preventDefault();
        window.scrollTo({ top: 0, behavior: "smooth" });
        setActiveSection("home");
      }
      // Ensure we restore body scroll when navigating
      document.body.style.overflow = "";
      setIsMenuOpen(false);
      return;
    }

    // Handle service pages or other non-hash links
    if (href && !href.startsWith("/#")) {
      // Ensure we restore body scroll when navigating
      document.body.style.overflow = "";
      setIsMenuOpen(false);
      return;
    }

    if (href?.startsWith("/#")) {
      e.preventDefault();
      const targetId = href.substring(2);

      if (window.location.pathname !== "/") {
        // If we're not on the homepage, navigate to homepage with hash
        window.location.href = href;
        // Ensure we restore body scroll when navigating
        document.body.style.overflow = "";
        setIsMenuOpen(false);
        return;
      }

      const targetElement = document.getElementById(targetId);
      if (targetElement) {
        const isMobile = window.innerWidth < 768;
        const offset = isMobile ? 80 : 70;
        const offsetTop =
          targetElement.getBoundingClientRect().top + window.scrollY - offset;

        // Ensure menu is closed before scrolling
        setIsMenuOpen(false);
        document.body.style.overflow = "";

        // Small delay to ensure menu is closed before scrolling
        setTimeout(() => {
          window.scrollTo({ top: offsetTop, behavior: "smooth" });
          setActiveSection(targetId);
        }, 10);
      }
    }
  };

  // Don't render anything until client-side hydration is complete
  if (!mounted) {
    return (
      <header className="fixed top-0 w-full backdrop-blur-md border-b z-50 transition-all duration-300 bg-background border-transparent">
        <div className="container mx-auto px-4 md:px-6">
          <div className="flex items-center justify-between py-4">
            <div className="flex items-center gap-4">
              <span className="text-2xl font-bold text-primary font-primary">
                Field Track LLC
              </span>
            </div>
            <div className="hidden md:flex items-center gap-6">
              {/* Placeholder for navigation */}
              <nav className="flex items-center gap-2"></nav>
            </div>
          </div>
        </div>
      </header>
    );
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

  // Custom navigation with dropdown
  const CustomNavigation = () => {
    const toggleDropdown = (name: string) => {
      setActiveDropdown(prev => (prev === name ? null : name));
    };

    // Add a timeout ref to prevent flickering
    const timeoutRef = React.useRef<NodeJS.Timeout | null>(null);

    const handleMouseEnter = (name: string) => {
      // Clear any existing timeout
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
      // Set the active dropdown immediately
      setActiveDropdown(name);
    };

    const handleMouseLeave = () => {
      // Set a small delay before closing the dropdown
      timeoutRef.current = setTimeout(() => {
        setActiveDropdown(null);
      }, 100);
    };

    // Check if current path is a service page
    const isServicePage =
      typeof window !== "undefined" &&
      window.location.pathname.startsWith("/services/");

    return (
      <nav className="hidden md:flex items-center gap-2">
        {navItems.map((item, index) => {
          const isDropdownActive = activeDropdown === item.name;
          const isActive = activeSection === item.url.replace("/#", "");

          // Highlight Services nav item when on a service page
          const isServicesHighlighted =
            isServicePage && item.name === "Services";

          if (item.hasDropdown) {
            return (
              <div
                key={index}
                className="relative"
                onMouseEnter={() => handleMouseEnter(item.name)}
                onMouseLeave={handleMouseLeave}
              >
                <Link
                  href={item.url}
                  onClick={handleLinkClick}
                  className={cn(
                    "relative px-4 py-2 rounded-full transition-all duration-300",
                    "flex items-center gap-2",
                    "text-base font-medium",
                    isActive || isServicesHighlighted
                      ? "text-primary font-semibold"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  <item.icon className="w-5 h-5" />
                  <span>{item.name}</span>
                </Link>

                {/* Dropdown for services */}
                {isDropdownActive && (
                  <div
                    ref={dropdownRef}
                    className="absolute top-full left-0 mt-2 w-72 rounded-xl border border-border shadow-elevation-medium overflow-hidden z-50 dark:bg-card bg-background transition-all duration-200 origin-top-left"
                    onMouseEnter={() => {
                      // Clear any existing timeout when mouse enters dropdown
                      if (timeoutRef.current) {
                        clearTimeout(timeoutRef.current);
                        timeoutRef.current = null;
                      }
                    }}
                    onMouseLeave={handleMouseLeave}
                  >
                    <div className="p-2">
                      {item.dropdownItems?.map((dropdownItem, idx) => {
                        // Check if this service item matches current path
                        const isActiveService =
                          typeof window !== "undefined" &&
                          window.location.pathname === dropdownItem.url;

                        return (
                          <Link
                            key={idx}
                            href={dropdownItem.url}
                            onClick={e => {
                              // Close menu immediately
                              setIsMenuOpen(false);
                              setActiveDropdown(null);
                              document.body.style.overflow = "";
                              // Then handle the link click
                              handleLinkClick(e);
                            }}
                            className={cn(
                              "flex items-start gap-3 p-3 rounded-lg hover:bg-primary/10 transition-colors group",
                              isActiveService && "bg-primary/5"
                            )}
                          >
                            <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center text-primary flex-shrink-0 group-hover:bg-primary/20 transition-colors">
                              <dropdownItem.icon className="w-5 h-5" />
                            </div>
                            <div className="flex-1">
                              <div
                                className={cn(
                                  "font-medium text-foreground group-hover:text-primary transition-colors",
                                  isActiveService && "text-primary"
                                )}
                              >
                                {dropdownItem.name}
                              </div>
                              <div className="text-sm text-muted-foreground">
                                {dropdownItem.description}
                              </div>
                            </div>
                          </Link>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            );
          }

          return (
            <Link
              key={index}
              href={item.url}
              onClick={handleLinkClick}
              className={cn(
                "relative px-4 py-2 rounded-full transition-all duration-300",
                "flex items-center gap-2",
                "text-base font-medium",
                isActive || isServicesHighlighted
                  ? "text-primary font-semibold"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <item.icon className="w-5 h-5" />
              <span>{item.name}</span>
            </Link>
          );
        })}
      </nav>
    );
  };

  return (
    <header
      className={cn(
        "fixed top-0 w-full backdrop-blur-md border-b transition-all duration-300",
        "z-[9999]",
        isScrolled
          ? "bg-background/90 border-border/30 py-2"
          : "bg-background border-transparent py-3 md:py-4"
      )}
    >
      <div className="container mx-auto px-4 md:px-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              href="/"
              onClick={handleLinkClick}
              className="flex items-center gap-4 transition-all hover:opacity-90"
            >
              <span className="text-2xl sm:text-3xl font-bold text-primary font-primary">
                Field Track <span className="text-sm sm:text-base">LLC</span>
              </span>
            </Link>
          </div>

          <div className="flex items-center gap-3 md:gap-6">
            <CustomNavigation />

            {/* Theme Toggle */}
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

            {/* Mobile Menu Button */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleMenuToggle}
              className="md:hidden p-2 text-foreground rounded-lg hover:bg-primary/5 transition-colors"
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
            className="md:hidden bg-background border-t border-border/10 overflow-hidden"
          >
            <div className="container mx-auto px-4 py-4">
              <nav className="flex flex-col space-y-1">
                {navItems.map((item, index) => (
                  <div key={index} className="relative">
                    {item.hasDropdown ? (
                      <>
                        <button
                          onClick={() =>
                            setActiveDropdown(
                              activeDropdown === item.name ? null : item.name
                            )
                          }
                          className={cn(
                            "w-full flex items-center justify-between px-4 py-3 rounded-lg text-sm font-medium transition-colors",
                            activeSection === item.url.replace("/#", "") ||
                              (item.url === "/" && activeSection === "home") ||
                              (item.name === "Services" &&
                                activeSection === "services")
                              ? "bg-primary/10 text-primary"
                              : "text-foreground hover:bg-muted"
                          )}
                        >
                          <span className="flex items-center gap-2">
                            <item.icon className="w-5 h-5" />
                            {item.name}
                          </span>
                          <ChevronDown
                            className={cn(
                              "w-4 h-4 transition-transform",
                              activeDropdown === item.name && "rotate-180"
                            )}
                          />
                        </button>

                        <AnimatePresence>
                          {activeDropdown === item.name && (
                            <motion.div
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: "auto" }}
                              exit={{ opacity: 0, height: 0 }}
                              transition={{ duration: 0.2 }}
                              className="overflow-hidden"
                            >
                              <div className="pl-4 pr-2 py-2 space-y-1">
                                {item.dropdownItems?.map(
                                  (dropdownItem, idx) => (
                                    <Link
                                      key={idx}
                                      href={dropdownItem.url}
                                      onClick={e => {
                                        // Close menu immediately
                                        setIsMenuOpen(false);
                                        setActiveDropdown(null);
                                        document.body.style.overflow = "";
                                        // Then handle the link click
                                        handleLinkClick(e);
                                      }}
                                      className={cn(
                                        "flex items-start gap-3 p-3 rounded-lg hover:bg-primary/10 transition-colors group",
                                        activeSection ===
                                          item.url.replace("/#", "") ||
                                          (item.url === "/" &&
                                            activeSection === "home") ||
                                          (item.name === "Services" &&
                                            activeSection === "services")
                                          ? "bg-primary/5"
                                          : "text-foreground hover:bg-muted"
                                      )}
                                    >
                                      <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center text-primary flex-shrink-0 group-hover:bg-primary/20 transition-colors">
                                        <dropdownItem.icon className="w-5 h-5" />
                                      </div>
                                      <div className="flex-1">
                                        <div
                                          className={cn(
                                            "font-medium text-foreground group-hover:text-primary transition-colors",
                                            activeSection ===
                                              item.url.replace("/#", "") ||
                                              (item.url === "/" &&
                                                activeSection === "home") ||
                                              (item.name === "Services" &&
                                                activeSection === "services")
                                              ? "text-primary"
                                              : "text-foreground hover:text-primary"
                                          )}
                                        >
                                          {dropdownItem.name}
                                        </div>
                                        <div className="text-sm text-muted-foreground">
                                          {dropdownItem.description}
                                        </div>
                                      </div>
                                    </Link>
                                  )
                                )}
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </>
                    ) : (
                      <Link
                        href={item.url}
                        onClick={e => {
                          handleLinkClick(e);
                          setIsMenuOpen(false);
                          setActiveDropdown(null);
                          document.body.style.overflow = "";
                        }}
                        className={cn(
                          "flex items-center gap-2 px-4 py-3 rounded-lg text-sm font-medium transition-colors",
                          activeSection === item.url.replace("/#", "") ||
                            (item.url === "/" && activeSection === "home") ||
                            (item.name === "Services" &&
                              activeSection === "services")
                            ? "bg-primary/10 text-primary"
                            : "text-foreground hover:bg-muted"
                        )}
                      >
                        <item.icon className="w-5 h-5" />
                        <span>{item.name}</span>
                      </Link>
                    )}
                  </div>
                ))}
              </nav>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
