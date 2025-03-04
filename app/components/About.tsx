"use client";

import { motion } from "framer-motion";
import { useInView } from "react-intersection-observer";
import {
  Microscope,
  Users,
  Sprout,
  TestTube2,
  Leaf,
  Tractor,
  Wheat,
  Droplet,
  LineChart
} from "lucide-react";
import { cn } from "@/lib/utils";
import Image from "next/image";

const stats = [
  {
    label: "Land Area Managed",
    value: "50K+",
    icon: Tractor,
    description: "Acres of land managed through our tech-driven solutions"
  },
  {
    label: "Efficiency Increase",
    value: "40%",
    icon: Sprout,
    description:
      "Average operational efficiency improvement reported by clients"
  },
  {
    label: "Resource Optimization",
    value: "35%",
    icon: LineChart,
    description:
      "Average reduction in resource waste through precision management"
  },
  {
    label: "Land Health Score",
    value: "90%",
    icon: Droplet,
    description: "Average improvement in overall land health indicators"
  },
  {
    label: "Expert Team",
    value: "30+",
    icon: Users,
    description: "Years of combined expertise in AgTech and land management"
  },
  {
    label: "Sustainable Impact",
    value: "100%",
    icon: Leaf,
    description: "Commitment to environmentally sustainable land management"
  }
] as const;

const industryComparison = [
  {
    category: "Traditional Land Managers",
    cost: "$20-30/acre",
    timeline: "2-3 weeks",
    structure: "Manual monitoring",
    communication: "Periodic visits",
    overhead: "High operational costs",
    drawbacks: "Limited tech integration, reactive approach",
    icon: Users
  },
  {
    category: "Generic AgTech Solutions",
    cost: "Varies",
    timeline: "1-2 weeks",
    structure: "One-size-fits-all approach",
    communication: "Automated only",
    overhead: "Software licensing fees",
    drawbacks: "Limited customization, minimal human expertise",
    icon: Wheat
  },
  {
    category: "Field Track LLC",
    cost: "$15-25/acre",
    timeline: "Real-time",
    structure: "Tech-driven comprehensive management",
    communication: "24/7 digital + expert support",
    overhead: "Optimized operations",
    valueProps: [
      "AI-powered land analysis",
      "Real-time monitoring & alerts",
      "Custom management strategies",
      "Integrated sustainability metrics"
    ],
    highlighted: true,
    icon: Microscope
  }
];

const ComparisonCard = ({
  option
}: {
  option: (typeof industryComparison)[0];
}) => {
  return (
    <div
      className={cn(
        "relative group h-full",
        "before:absolute before:inset-0 before:rounded-3xl",
        "before:border before:border-border before:bg-card/50 before:backdrop-blur-sm",
        "before:transition-all before:duration-300",
        "before:hover:scale-[1.02] before:-z-10",
        option.highlighted && [
          "before:border-primary/50",
          "before:shadow-[0_0_30px_1px] before:shadow-primary/30"
        ]
      )}
    >
      <div className="p-8 h-full">
        {/* Price Tag */}
        <div className="absolute -top-4 left-8 bg-background/80 backdrop-blur-sm border border-border rounded-full px-4 py-1">
          <span className="font-mono font-bold">{option.cost}</span>
        </div>

        {/* Header */}
        <div className="mb-8 pt-4">
          <div className="flex items-center gap-3 mb-2">
            <option.icon className="w-6 h-6 text-primary" />
            <h4
              className={cn(
                "text-2xl font-bold font-poppins",
                option.highlighted && "text-primary"
              )}
            >
              {option.category}
            </h4>
          </div>
          <p className="text-muted-foreground text-sm font-inter">
            Typical Timeline: {option.timeline}
          </p>
        </div>

        {/* Features List */}
        <div className="space-y-4">
          <Feature
            title="Service Structure"
            description={option.structure}
            highlighted={option.highlighted}
          />
          <Feature
            title="Communication"
            description={option.communication}
            highlighted={option.highlighted}
          />
          <Feature
            title="Cost Structure"
            description={option.overhead}
            highlighted={option.highlighted}
          />

          {option.highlighted ? (
            <div className="mt-8 pt-6 border-t border-border">
              <h5 className="text-sm font-semibold mb-3 text-primary font-poppins">
                Why Choose Us
              </h5>
              <div className="space-y-2">
                {option.valueProps?.map((prop, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-2 text-sm font-inter"
                  >
                    <span className="text-primary">→</span>
                    <span>{prop}</span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="mt-8 pt-6 border-t border-border">
              <h5 className="text-sm font-semibold mb-3 text-muted-foreground font-poppins">
                Limitations
              </h5>
              <p className="text-sm text-muted-foreground font-inter">
                {option.drawbacks}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const Feature = ({
  title,
  description,
  highlighted
}: {
  title: string;
  description: string;
  highlighted?: boolean;
}) => (
  <div className="flex items-start gap-3">
    <div
      className={cn(
        "mt-1 w-1.5 h-1.5 rounded-full",
        highlighted ? "bg-primary" : "bg-muted-foreground"
      )}
    />
    <div>
      <p className="font-medium text-sm font-poppins">{title}</p>
      <p className="text-sm text-muted-foreground font-inter">{description}</p>
    </div>
  </div>
);

export default function About() {
  return (
    <section
      id="about"
      className="py-20 bg-background/50 relative overflow-hidden"
    >
      {/* Background Gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-background/0 via-background/50 to-background/0" />

      <div className="container mx-auto px-4 relative">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Image Section */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="relative"
          >
            {/* Main Image */}
            <div className="relative aspect-[4/3] rounded-2xl overflow-hidden">
              <Image
                src="/images/rmsmith.png"
                alt="Agricultural field"
                fill
                sizes="(max-width: 768px) 100vw, 50vw"
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-tr from-primary/20 to-transparent" />
            </div>

            {/* Floating Images */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="absolute -bottom-12 -left-12 w-48 h-48 rounded-2xl overflow-hidden shadow-xl"
            >
              <Image
                src="/images/farmgrid2.png"
                alt="Field grid analysis"
                fill
                sizes="(max-width: 768px) 192px, 192px"
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-tr from-primary/20 to-transparent" />
            </motion.div>
          </motion.div>

          {/* Content Section */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="space-y-8"
          >
            <div>
              <h2 className="text-4xl font-primary mb-6">
                Pioneering Digital Agriculture Solutions
              </h2>
              <p className="text-xl text-muted-foreground font-secondary mb-8">
                We are a team of experienced agronomists and data scientists who
                are passionate about using technology to improve the efficiency
                and sustainability of agriculture.
              </p>
            </div>

            {/* Key Points with Images */}
            <div className="grid gap-6">
              {[
                {
                  title: "Expert Analysis",
                  description:
                    "Our team of certified agronomists provides detailed insights and recommendations.",
                  icon: "🔬",
                  image: "/images/farmGrid.png"
                },
                {
                  title: "Advanced Technology",
                  description:
                    "Utilizing state-of-the-art equipment and satellite imagery for precise field mapping.",
                  icon: "🛰️",
                  image: "/images/topography.png"
                },
                {
                  title: "Sustainable Practices",
                  description:
                    "Promoting environmentally conscious farming methods for long-term soil health.",
                  icon: "🌱",
                  image: "/images/farm3.jpg"
                }
              ].map((point, index) => (
                <motion.div
                  key={point.title}
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="flex gap-4 p-4 rounded-xl hover:bg-card/50 transition-colors group"
                >
                  <div className="relative w-24 h-24 rounded-xl overflow-hidden shrink-0">
                    <Image
                      src={point.image}
                      alt={point.title}
                      fill
                      sizes="96px"
                      className="object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-tr from-primary/20 to-transparent" />
                    <div className="absolute inset-0 flex items-center justify-center text-2xl">
                      {point.icon}
                    </div>
                  </div>
                  <div>
                    <h3 className="font-bold text-lg mb-2 font-primary">
                      {point.title}
                    </h3>
                    <p className="text-muted-foreground font-secondary">
                      {point.description}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Stats Section with Background Image */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="mt-20 relative rounded-2xl overflow-hidden"
        >
          <div className="absolute inset-0">
            <Image
              src="/images/farm2.jpg"
              alt="Farm landscape"
              fill
              sizes="100vw"
              className="object-cover brightness-90"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-slate-900/90 to-slate-900/80 backdrop-blur-[2px]" />
          </div>

          <div className="relative grid grid-cols-2 md:grid-cols-4 gap-8 p-12">
            {[
              { value: "25+", label: "Years Experience" },
              { value: "50K+", label: "Soil Samples Analyzed" },
              { value: "95%", label: "Client Satisfaction" },
              { value: "30%", label: "Average Yield Increase" }
            ].map(stat => (
              <div key={stat.label} className="text-center">
                <h4 className="text-5xl font-bold text-primary drop-shadow-md mb-2">
                  {stat.value}
                </h4>
                <p className="text-primary-foreground font-medium drop-shadow-sm">
                  {stat.label}
                </p>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
