import { cn } from "@/lib/utils";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";

export interface ServiceItem {
  title: string;
  description: string;
  icon: React.ReactNode;
  tags?: string[];
  meta?: string;
  cta?: string;
  image?: string;
  link?: string;
}

interface ServiceGridProps {
  items: ServiceItem[];
}

function ServiceGrid({ items }: ServiceGridProps) {
  return (
    <div className="flex flex-col space-y-6 sm:space-y-8 max-w-7xl mx-auto">
      {items.map((item, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: index * 0.2 }}
          className={cn(
            "group relative rounded-xl sm:rounded-2xl overflow-hidden",
            "h-auto sm:h-[280px]",
            "bg-card/50 backdrop-blur-sm border border-border/50",
            "hover:border-primary/50 transition-all duration-300",
            "[box-shadow:0_0_0_1px_rgba(0,0,0,.03),0_2px_4px_rgba(0,0,0,.05),0_12px_24px_rgba(0,0,0,.05)]",
            "dark:[box-shadow:0_-20px_80px_-20px_#ffffff1f_inset]"
          )}
        >
          <div className="grid grid-cols-1 lg:grid-cols-2 h-full">
            {/* Image Section - Full width on mobile, half width on desktop */}
            <div className="relative h-48 sm:h-full overflow-hidden">
              {item.image && (
                <Image
                  src={item.image}
                  alt={item.title}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  priority={index === 0}
                />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
            </div>

            {/* Content Section */}
            <div className="p-4 sm:p-6 lg:p-8 flex flex-col justify-between h-full relative">
              {/* Top Section with Icon and Title */}
              <div>
                <div className="flex items-start gap-3 sm:gap-4 mb-3 sm:mb-6">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl flex items-center justify-center bg-primary/10 text-primary border border-primary/10">
                    {item.icon}
                  </div>
                  <div>
                    <h3 className="text-xl sm:text-2xl font-bold text-foreground">
                      {item.title}
                    </h3>
                    <p className="text-xs sm:text-sm text-muted-foreground mt-1">
                      {item.meta}
                    </p>
                  </div>
                </div>

                {/* Description */}
                <p className="text-xs sm:text-sm md:text-[14px] text-muted-foreground leading-relaxed line-clamp-3 sm:line-clamp-3">
                  {item.description}
                </p>

                {/* Tags */}
                <div className="flex flex-wrap gap-1.5 sm:gap-2 mt-3 sm:mt-4">
                  {item.tags?.map((tag, i) => (
                    <span
                      key={i}
                      className="inline-flex items-center px-2 py-0.5 text-[10px] sm:text-xs font-medium rounded-md sm:rounded-lg bg-primary/10 text-primary border border-primary/10"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              {/* CTA Link - Positioned differently on mobile vs desktop */}
              <div className="mt-4 sm:mt-0 sm:absolute sm:top-6 sm:right-6 lg:top-8 lg:right-8">
                <Link
                  href={item.link || "#"}
                  className="group/link inline-flex items-center text-xs sm:text-sm font-medium text-primary"
                >
                  <span className="relative overflow-hidden inline-flex items-center">
                    <span className="sm:opacity-0 sm:-translate-y-6 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300 ease-out inline-flex items-center">
                      {item.cta || "Learn More"}
                      <ArrowRight className="ml-1 h-3 w-3 sm:h-4 sm:w-4 transition-transform group-hover/link:translate-x-1" />
                    </span>
                  </span>
                </Link>
              </div>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
}

export { ServiceGrid };
