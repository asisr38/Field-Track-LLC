"use client";

import { Home, User, Briefcase, Phone, Code } from "lucide-react";
import { NavBar } from "./ui/tubelight-navbar";

const navItems = [
  { name: "Home", url: "#", icon: Home },
  { name: "About", url: "#about", icon: User },
  { name: "Services", url: "#services", icon: Code },
  { name: "Projects", url: "#portfolio", icon: Briefcase },
  { name: "Contact", url: "#contact", icon: Phone }
];

export default function Navigation() {
  return <NavBar items={navItems} />;
}
