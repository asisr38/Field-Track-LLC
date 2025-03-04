"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from "@/components/ui/tooltip";
import {
  Facebook,
  Instagram,
  Linkedin,
  Moon,
  Send,
  Sun,
  Twitter
} from "lucide-react";
import { useTheme } from "next-themes";

function Footerdemo() {
  const [mounted, setMounted] = React.useState(false);
  const { theme, setTheme } = useTheme();

  React.useEffect(() => {
    setMounted(true);
  }, []);

  // Return a simple loading state that matches the structure
  if (!mounted) {
    return (
      <footer className="relative border-t bg-background text-foreground transition-colors duration-300">
        <div className="container mx-auto px-4 py-12 md:px-6 lg:px-8">
          <div className="grid gap-12 md:grid-cols-3 border-b border-border pb-12">
            {/* Loading placeholders matching the structure */}
            <div className="flex flex-col gap-6" />
            <div className="flex flex-col gap-6" />
            <div className="flex flex-col gap-6" />
          </div>
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 pt-8">
            <div />
            <div />
          </div>
        </div>
      </footer>
    );
  }

  return (
    <footer className="relative border-t bg-background text-foreground transition-colors duration-300">
      <div className="container mx-auto px-4 py-12 md:px-6 lg:px-8">
        {/* Main Footer Grid */}
        <div className="grid gap-12 md:grid-cols-3 border-b border-border pb-12">
          {/* Column 1: Quick Links */}
          <div className="flex flex-col gap-6">
            <h3 className="text-lg font-semibold">Quick Links</h3>
            <nav className="grid grid-cols-2 gap-x-12 gap-y-4 text-sm">
              <a
                href="#home"
                className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors"
              >
                Home
              </a>
              <a
                href="#mission"
                className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors"
              >
                Mission
              </a>
              <a
                href="#services"
                className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors"
              >
                Services
              </a>
              <a
                href="#contact"
                className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors"
              >
                Contact
              </a>
            </nav>
          </div>

          {/* Column 2: Social Media */}
          <div className="flex flex-col gap-6">
            <h3 className="text-lg font-semibold">Follow Us</h3>
            <div className="flex gap-3">
              <Button
                variant="outline"
                size="icon"
                className="rounded-full h-10 w-10 border-border hover:bg-primary hover:text-primary-foreground"
              >
                <Linkedin className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                className="rounded-full h-10 w-10 border-border hover:bg-primary hover:text-primary-foreground"
              >
                <Twitter className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                className="rounded-full h-10 w-10 border-border hover:bg-primary hover:text-primary-foreground"
              >
                <Instagram className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Column 3: Contact Information (replacing Newsletter) */}
          <div className="flex flex-col gap-6">
            <div className="space-y-4">
              <h2 className="text-2xl font-bold">Contact Us</h2>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Have questions? We're here to help. Reach out to us through any
                of our channels.
              </p>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 pt-8">
          <p className="text-sm text-muted-foreground">
            © 2025 Basic Package LLC. All rights reserved.
          </p>
          <div className="flex items-center gap-8">
            {/* <div className="flex items-center gap-2 bg-secondary/50 px-3 py-1.5 rounded-full">
              <Sun className="h-4 w-4" />
              <Switch
                id="dark-mode"
                checked={theme === "dark"}
                onCheckedChange={checked =>
                  setTheme(checked ? "dark" : "light")
                }
              />
              <Moon className="h-4 w-4" />
            </div> */}
            <nav className="flex gap-6 text-sm">
              <a
                href="#"
                className="text-muted-foreground hover:text-primary transition-colors"
              >
                Privacy Policy
              </a>
              <a
                href="#"
                className="text-muted-foreground hover:text-primary transition-colors"
              >
                Terms of Service
              </a>
            </nav>
          </div>
        </div>
      </div>
    </footer>
  );
}

export { Footerdemo };
