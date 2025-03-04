"use client";

import React from "react";
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

export function NavBar({
  items,
  className,
  onSectionChange
}: NavBarProps) {
  const [activeItem, setActiveItem] = React.useState<string | null>(null);

  const handleClick = (url: string) => {
    const section = url.replace("/#", "");
    setActiveItem(section);
    if (onSectionChange) {
      onSectionChange(section);
    }
  };

  return (
    <nav className={cn("flex items-center gap-2", className)}>
      {items.map((item) => {
        const Icon = item.icon;
        const isActive = activeItem === item.url.replace("/#", "");

        return (
          <Link
            key={item.name}
            href={item.url}
            onClick={() => handleClick(item.url)}
            className={cn(
              "relative px-4 py-2 rounded-full transition-colors",
              "group flex items-center gap-2",
              "text-base font-medium",
              "text-muted-foreground hover:text-foreground",
              isActive && "text-foreground"
            )}
          >
            <Icon className="w-4 h-4" />
            <span>{item.name}</span>
            {isActive && (
              <motion.div
                layoutId="navbar-indicator"
                className="absolute inset-0 z-[-1] rounded-full bg-primary/10"
                transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
              >
                <div className="absolute inset-0 rounded-full bg-gradient-to-r from-primary/20 to-primary/0 blur" />
                <div className="absolute top-0 left-1/2 -translate-x-1/2 h-px w-12 bg-primary/20">
                  <div className="absolute inset-0 blur-sm bg-primary/50" />
                </div>
              </motion.div>
            )}
          </Link>
        );
      })}
    </nav>
  );
}
