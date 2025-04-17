"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import {
  Map,
  Grid,
  Microscope,
  FileBarChart,
  Layers3,
  Target,
  ChevronDown
} from "lucide-react";
import dynamic from "next/dynamic";
import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { IconContext } from "react-icons";
import {
  FaMapMarkedAlt,
  FaFlask,
  FaChartLine,
  FaCalculator,
  FaVial,
  FaRuler
} from "react-icons/fa";
import Head from "next/head";

// Dynamically import the FieldSamplingMap component to avoid SSR issues with Leaflet
const FieldSamplingMap = dynamic(
  () => import("../../components/FieldSamplingMap"),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-[400px] bg-muted/20 animate-pulse rounded-lg flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-primary border-t-transparent mb-2"></div>
          <p className="text-muted-foreground">Loading field sampling map...</p>
        </div>
      </div>
    )
  }
);

// Dynamically import the SampleReportContent component
const SampleReportContent = dynamic(
  () => import("../../components/SampleReportContent"),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-[600px] bg-muted/20 animate-pulse rounded-lg flex items-center justify-center">
        <p className="text-muted-foreground">
          Loading soil analysis content...
        </p>
      </div>
    )
  }
);

// DataCard and DataRow components for consistent styling
const DataCard = ({
  title,
  icon,
  children
}: {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}) => (
  <Card className="p-4 h-full">
    <div className="flex items-center gap-2 mb-3">
      <IconContext.Provider
        value={{ size: "1.2em", className: "text-primary" }}
      >
        {icon}
      </IconContext.Provider>
      <h3 className="font-semibold text-lg">{title}</h3>
    </div>
    <div className="space-y-2">{children}</div>
  </Card>
);

const DataRow = ({
  label,
  value
}: {
  label: string;
  value: string | number;
}) => (
  <div className="flex justify-between items-center">
    <span className="text-sm text-muted-foreground">{label}</span>
    <span className="font-medium">{value}</span>
  </div>
);

const features = [
  {
    name: "Precision Data Collection",
    description: "GPS-guided sampling with strategic patterns for analysis.",
    icon: FaMapMarkedAlt
  },
  {
    name: "Laboratory Analysis",
    description:
      "Soil, plant tissue, water, manure, compost, and fertilizer analysis.",
    icon: FaFlask
  },
  {
    name: "Spatial Mapping",
    description:
      "Collected data can be mapped and integrated with other supporting layers.",
    icon: FaChartLine
  },
  {
    name: "Custom Recommendations",
    description:
      "Tailored agronomic recommendations based on your specific crops and goals.",
    icon: FaCalculator
  }
];

// Define nutrient options for the dropdown
const nutrientOptions = [
  {
    value: "phosphorus",
    label: "Phosphorus (P₂O₅ - ppm)",
    description:
      "Essential for root development, flowering, and energy transfer"
  },
  {
    value: "potassium",
    label: "Potassium (K₂O - ppm)",
    description:
      "Critical for water regulation, disease resistance, and overall plant health"
  },
  {
    value: "magnesium",
    label: "Magnesium (Mg)",
    description: "Central component of chlorophyll and enzyme activation"
  },
  {
    value: "calcium",
    label: "Calcium (Ca)",
    description: "Important for cell wall structure and soil pH buffering"
  },
  {
    value: "ph",
    label: "pH",
    description: "Affects nutrient availability and microbial activity"
  },
  {
    value: "organicMatter",
    label: "Organic Matter",
    description:
      "Improves soil structure, water retention, and nutrient cycling"
  },
  {
    value: "cec",
    label: "CEC",
    description:
      "Cation Exchange Capacity - measures soil's ability to hold and exchange nutrients"
  }
];

// Define color scales and ranges for each nutrient
const nutrientColorScales = {
  phosphorus: {
    ranges: [0, 20, 40, 60, 80],
    colors: ["#FF5252", "#FF9800", "#FFEB3B", "#8BC34A", "#4CAF50"],
    unit: "ppm"
  },
  potassium: {
    ranges: [0, 30, 40, 50, 60],
    colors: ["#F44336", "#FB8C00", "#FFD54F", "#7CB342", "#2E7D32"],
    unit: "ppm"
  },
  magnesium: {
    ranges: [0, 100, 150, 200, 250],
    colors: ["#E53935", "#F57C00", "#FDD835", "#8BC34A", "#388E3C"],
    unit: "ppm"
  },
  calcium: {
    ranges: [0, 800, 1000, 1200, 1400],
    colors: ["#D32F2F", "#EF6C00", "#FBC02D", "#7CB342", "#388E3C"],
    unit: "ppm"
  },
  ph: {
    ranges: [5.5, 6.0, 6.5, 7.0, 7.5],
    colors: ["#F44336", "#FF9800", "#4CAF50", "#FF9800", "#F44336"],
    unit: ""
  },
  organicMatter: {
    ranges: [1.5, 1.8, 2.0, 2.2, 2.4],
    colors: ["#FFCDD2", "#FFAB91", "#A5D6A7", "#66BB6A", "#388E3C"],
    unit: "%"
  },
  cec: {
    ranges: [5, 6, 7, 8, 9],
    colors: ["#FFCDD2", "#FFAB91", "#A5D6A7", "#66BB6A", "#388E3C"],
    unit: "meq/100g"
  }
};

export default function FieldSamplingPage() {
  const [isClient, setIsClient] = useState(false);
  const [selectedNutrient, setSelectedNutrient] = useState("phosphorus");
  const [dropdownOpen, setDropdownOpen] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  // Get the current nutrient's color scale
  const currentNutrient = nutrientOptions.find(
    option => option.value === selectedNutrient
  );
  const currentColorScale =
    nutrientColorScales[selectedNutrient as keyof typeof nutrientColorScales];

  return (
    <div className="min-h-screen bg-background pt-16 overflow-x-hidden">
      <section className="relative pt-20 pb-16 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-green-100/20 to-transparent" />
        <div className="container mx-auto px-4 relative">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center"
          >
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              <span className="text-primary">Field Services</span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Get a complete picture of your field's health with our integrated
              approach - from soil and tissue testing to regular field
              observations and consultations. Make informed decisions with
              data-driven insights from every aspect of your operation.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="bg-gradient-to-b from-background to-muted/30">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            {features.map((feature, index) => (
              <motion.div
                key={feature.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="bg-card hover:bg-card/80 border border-border/50 rounded-lg p-6 transition-all duration-300 hover:shadow-md"
              >
                <div className="flex flex-col items-center text-center">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                    <IconContext.Provider
                      value={{ size: "1.5em", className: "text-primary" }}
                    >
                      {<feature.icon />}
                    </IconContext.Provider>
                  </div>
                  <h3 className="text-lg font-semibold mb-2">{feature.name}</h3>
                  <p className="text-sm text-muted-foreground">
                    {feature.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="bg-card border border-border/50 rounded-lg p-6 md:p-8 mb-8"
          >
            <h3 className="text-xl font-semibold mb-6 text-center">
              Understanding Your Field Through Data
            </h3>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              <div className="space-y-4">
                <div className="aspect-video relative rounded-lg overflow-hidden">
                  <Image
                    src="/field-sampling/soils.jpg"
                    alt="Soil sampling"
                    fill
                    className="object-cover"
                  />
                </div>
                <h4 className="font-semibold text-lg">Soil Sampling</h4>
                <p className="text-muted-foreground text-sm">
                  Soil sampling provides the foundation for all agronomic
                  decisions.
                </p>
              </div>

              <div className="space-y-4">
                <div className="aspect-video relative rounded-lg overflow-hidden">
                  <Image
                    src="/field-sampling/cornleaf.jpg"
                    alt="Plant tissue sampling"
                    fill
                    className="object-cover"
                  />
                </div>
                <h4 className="font-semibold text-lg">Tissue Sampling</h4>
                <p className="text-muted-foreground text-sm">
                  Plant tissue analysis complements soil testing by showing what
                  nutrients the plant is actually absorbing.
                </p>
              </div>

              <div className="space-y-4">
                <div className="aspect-video relative rounded-lg overflow-hidden">
                  <Image
                    src="/field-sampling/cornactual.jpg"
                    alt="Field scouting"
                    fill
                    className="object-cover"
                  />
                </div>
                <h4 className="font-semibold text-lg">Field Observations</h4>
                <p className="text-muted-foreground text-sm">
                  Regular field scouting provides critical context that
                  complements and enhances your data-driven decisions.
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Field Sampling Map Section */}
      <section className="bg-muted/30 py-16">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="space-y-4 mb-6"
          >
            <div className="flex items-center gap-3 mb-1">
              <Map className="w-8 h-8 text-primary" />
              <h3 className="text-2xl font-bold">Soil Sampling Map</h3>
            </div>
            <p className="text-muted-foreground text-base">
              Explore our interactive soil sampling map showing detailed
              nutrient levels across the field. Each point represents a soil
              sample. Click on sample points to view detailed information about
              soil health indicators and nutrient levels. Use the dropdown below
              to switch between different nutrients.
            </p>
          </motion.div>

          <Card className="p-4 md:p-6 mb-12 overflow-hidden">
            <div className="bg-muted/50 rounded-lg p-2 md:p-4 shadow-inner mb-4 md:mb-6 overflow-hidden">
              <div className="h-[500px] md:h-[700px] w-full rounded-lg overflow-hidden">
                {isClient && (
                  <FieldSamplingMap nutrientType={selectedNutrient} />
                )}
              </div>
            </div>

            {/* Sample Information Grid */}
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3 md:gap-6">
              <DataCard title="Field Information" icon={<FaMapMarkedAlt />}>
                <div className="space-y-2">
                  <DataRow label="Field Name" value="John Doe" />
                  <DataRow label="Property" value="DOE FAMILY FARMS" />
                  <DataRow label="Field Size" value="72 acres" />
                  <DataRow label="Next Crop" value="Soybean (2025)" />
                  <DataRow label="Previous Crop" value="Corn (2024)" />
                </div>
              </DataCard>

              <DataCard
                title="Sampling Details"
                icon={<Target className="text-primary" />}
              >
                <div className="space-y-2">
                  <DataRow label="Sample Date" value="October 12, 2024" />
                  <DataRow label="Number of Points" value="18" />
                  <DataRow label="Sampling Depth" value="6 inches" />
                  <DataRow label="Sampling Pattern" value="Grid" />
                </div>
              </DataCard>

              <DataCard
                title="Nutrient Selection"
                icon={<Layers3 className="text-primary" />}
              >
                <div className="space-y-3">
                  <div className="relative">
                    <button
                      onClick={() => setDropdownOpen(!dropdownOpen)}
                      className="w-full flex items-center justify-between p-2 border border-border rounded-md bg-card hover:bg-muted transition-colors"
                    >
                      <span className="truncate">{currentNutrient?.label}</span>
                      <ChevronDown
                        className={`w-4 h-4 flex-shrink-0 transition-transform ${
                          dropdownOpen ? "rotate-180" : ""
                        }`}
                      />
                    </button>

                    {dropdownOpen && (
                      <div className="absolute z-10 mt-1 w-full bg-card border border-border rounded-md shadow-lg max-h-60 overflow-auto">
                        {nutrientOptions.map(option => (
                          <button
                            key={option.value}
                            className="w-full text-left px-3 py-2 hover:bg-muted transition-colors"
                            onClick={() => {
                              setSelectedNutrient(option.value);
                              setDropdownOpen(false);
                            }}
                          >
                            <div className="font-medium truncate">
                              {option.label}
                            </div>
                            <div className="text-xs text-muted-foreground truncate">
                              {option.description}
                            </div>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="mt-4">
                    <div className="text-sm font-medium mb-2">
                      {currentNutrient?.label} Legend:
                    </div>
                    {currentColorScale.ranges.map((range, index) => (
                      <div key={index} className="flex items-center gap-2 mb-1">
                        <div
                          className="w-4 h-4 rounded-full flex-shrink-0"
                          style={{
                            backgroundColor: currentColorScale.colors[index]
                          }}
                        ></div>
                        <span className="text-sm truncate">
                          {index < currentColorScale.ranges.length - 1
                            ? `${range}-${
                                currentColorScale.ranges[index + 1]
                              } ${currentColorScale.unit}`
                            : `${range}+ ${currentColorScale.unit}`}
                        </span>
                      </div>
                    ))}
                  </div>

                  <div className="mt-2 text-xs text-muted-foreground">
                    Click on any sample point on the map to view detailed soil
                    analysis data.
                  </div>
                </div>
              </DataCard>
            </div>
          </Card>
        </div>
      </section>

      {isClient && <SampleReportContent />}

      {/* Call to Action */}
      <section className="bg-background py-16">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="max-w-3xl mx-auto"
          >
            <Card className="border-border shadow-sm dark:bg-card/95">
              <div className="p-6 sm:p-8 bg-gradient-to-r from-primary/10 to-primary/5 dark:from-primary/20 dark:to-primary/10 rounded-lg">
                <h3 className="text-xl font-semibold text-center mb-4 text-foreground">
                  Ready to Optimize Your Field Management?
                </h3>
                <p className="text-center text-muted-foreground mb-6">
                  Our field services include precision sampling, prescriptions,
                  data analysis, and agronomic support aimed at discovering ways
                  to boost yields and cut input costs.
                </p>
                <div className="flex justify-center">
                  <a
                    href="/#contact"
                    className="bg-primary text-primary-foreground px-6 py-3 rounded-md hover:bg-primary/80 transition-colors font-medium"
                  >
                    Schedule Your Field Services
                  </a>
                </div>
              </div>
            </Card>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
