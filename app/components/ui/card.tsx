import * as React from "react"
import { cn } from "@/lib/utils"

const Card = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "rounded-xl border-2 bg-card text-card-foreground",
      "relative overflow-hidden",
      "before:absolute before:inset-0 before:bg-gradient-to-b before:from-[#4B6F44]/10 before:to-transparent before:opacity-70",
      "after:absolute after:inset-0 after:bg-[url('/images/farm-pattern.svg')] after:opacity-[0.15] after:mix-blend-color-burn",
      "hover:border-[#4B6F44]/30 transition-all duration-300",
      "hover:shadow-lg hover:-translate-y-0.5",
      "shadow-[0_4px_12px_-2px_rgba(75,111,68,0.15),inset_0_1px_0_0_rgba(255,255,255,0.1)]",
      "backdrop-blur-[2px]",
      className
    )}
    {...props}
  />
))
Card.displayName = "Card"

const CardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "flex flex-col space-y-1.5 p-6",
      "border-b border-[#4B6F44]/10",
      "bg-gradient-to-r from-[#4B6F44]/5 to-transparent",
      className
    )}
    {...props}
  />
))
CardHeader.displayName = "CardHeader"

const CardTitle = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "text-2xl leading-none tracking-tight",
      "text-[#4B6F44]",
      "merriweather-bold",
      "flex items-center gap-2",
      "before:content-['🌾'] before:text-lg before:opacity-80",
      className
    )}
    {...props}
  />
))
CardTitle.displayName = "CardTitle"

const CardDescription = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "text-sm text-[#4B6F44]/80",
      "font-merriweather pl-7",
      className
    )}
    {...props}
  />
))
CardDescription.displayName = "CardDescription"

const CardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div 
    ref={ref} 
    className={cn(
      "p-6 pt-0",
      "relative z-10",
      "bg-gradient-to-br from-transparent via-white/50 to-transparent",
      className
    )} 
    {...props} 
  />
))
CardContent.displayName = "CardContent"

const CardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "flex items-center p-6 pt-0",
      "border-t border-[#4B6F44]/10 mt-4",
      "bg-gradient-to-t from-[#4B6F44]/5 to-transparent",
      className
    )}
    {...props}
  />
))
CardFooter.displayName = "CardFooter"

export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent } 