"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import {
  Plane,
  Layers,
  LineChart,
  Maximize,
  Crop,
  Map,
  Layout,
  Camera,
  Ruler,
  Calendar,
  Target,
  Wind,
  ImagePlus,
  GitMerge,
  Workflow,
  Calculator,
  Gauge,
  FileCheck,
  Microscope,
  BarChart,
  Table,
  ArrowUpDown,
  GripVertical,
  Sigma,
  Dices,
  Sprout,
  Play,
  PauseCircle,
  Eye,
  Layers3,
  FileBarChart,
  Download
} from "lucide-react";
import dynamic from "next/dynamic";
import { useState, useEffect } from "react";
import demoPlotData from "@/public/simple-sense/DemoSmallPlot_250130_v6.json";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { ComponentType } from "react";
import type { TrialLayoutProps } from "@/components/TrialLayout";
import { IconContext } from "react-icons";
import {
  FaLeaf,
  FaRuler,
  FaMapMarkerAlt,
  FaFlask,
  FaSeedling,
  FaCalendarAlt
} from "react-icons/fa";
import { MdScience } from "react-icons/md";
import {
  BarChart as RechartsBarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  LineChart as RechartsLineChart,
  Line,
  ResponsiveContainer,
  ScatterChart,
  Scatter,
  ZAxis
} from "recharts";
import plotData from "../../../public/simple-sense/DemoSmallPlot_250130_v6.json";

// Dynamically import the map component to avoid SSR issues with Leaflet
const TrialLayout = dynamic(() => import("@/components/TrialLayout"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[500px] bg-muted/20 animate-pulse rounded-lg flex items-center justify-center">
      <p className="text-muted-foreground">Loading trial layout...</p>
    </div>
  )
});

const TemporalNDVIMap = dynamic(
  () => import("../../components/TemporalNDVIMap"),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-[500px] bg-muted/20 animate-pulse rounded-lg flex items-center justify-center">
        <p className="text-muted-foreground">Loading temporal map...</p>
      </div>
    )
  }
);

const features = [
  {
    title: "Multi-temporal Analysis",
    description:
      "Track crop development across multiple growth stages with time-series NDVI analysis",
    icon: <LineChart className="w-6 h-6" />
  },
  {
    title: "High Resolution Mapping",
    description:
      "Generate detailed field maps with centimeter-level precision for accurate decision making",
    icon: <Map className="w-6 h-6" />
  },
  {
    title: "Growth Stage Monitoring",
    description:
      "Monitor key crop development stages to optimize management decisions",
    icon: <Crop className="w-6 h-6" />
  },
  {
    title: "Spatial Analytics",
    description:
      "Identify field variability and patterns to guide precision agriculture practices",
    icon: <Layers className="w-6 h-6" />
  }
];

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
        value={{ size: "1.2em", className: "text-emerald-600" }}
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
    <span className="text-sm text-gray-600">{label}</span>
    <span className="font-medium">{value}</span>
  </div>
);

// Define the structure of the JSON data
interface PlotProperties {
  id: number;
  Plot: number;
  Rep: number;
  Trt: string;
  NDVI_M_1: number;
  NDVI_M_2: number;
  NDVI_M_3: number;
  NDVI_M_4: number;
  NDVI_M_5: number;
  NDVI_M_6: number;
  [key: string]: any;
}

interface PlotFeature {
  type: "Feature";
  properties: PlotProperties;
  geometry: any;
}

interface PlotData {
  type: "FeatureCollection";
  features: PlotFeature[];
}

const typedPlotData = plotData as unknown as PlotData;

interface TreatmentData {
  treatment: string;
  ndvi: number;
  group?: string;
}

interface BlockEffect {
  x: number;
  y: number;
}

const calculateMeanNDVI = (
  treatment: string,
  measurementKey: string
): number => {
  const treatmentPlots = typedPlotData.features.filter(
    plot => plot.properties.Trt === treatment
  );
  const values = treatmentPlots.map(
    plot => plot.properties[`NDVI_${measurementKey}`] as number
  );
  return values.reduce((sum, val) => sum + val, 0) / values.length;
};

const calculateOverallMeanNDVI = (measurementKey: string): number => {
  return (
    typedPlotData.features.reduce(
      (sum, plot) => sum + plot.properties[`NDVI_${measurementKey}`],
      0
    ) / typedPlotData.features.length
  );
};

const getTopPerformingTreatments = (
  measurementKey: string,
  count: number
): TreatmentData[] => {
  const treatmentAverages: Record<string, { sum: number; count: number }> = {};

  // Calculate average NDVI for each treatment
  typedPlotData.features.forEach(plot => {
    const trt = plot.properties.Trt;
    const ndvi = plot.properties[`NDVI_${measurementKey}`] as number;

    if (treatmentAverages[trt]) {
      treatmentAverages[trt].sum += ndvi;
      treatmentAverages[trt].count += 1;
    } else {
      treatmentAverages[trt] = { sum: ndvi, count: 1 };
    }
  });

  // Convert to array and calculate averages
  const averages: TreatmentData[] = Object.entries(treatmentAverages).map(
    ([treatment, data]): TreatmentData => ({
      treatment,
      ndvi: data.sum / data.count
    })
  );

  return averages.sort((a, b) => b.ndvi - a.ndvi).slice(0, count);
};

const getBlockEffects = (): BlockEffect[] => {
  return Array.from({ length: 4 }, (_, i): BlockEffect => {
    const rep = i + 1;
    const blockPlots = typedPlotData.features.filter(
      plot => plot.properties.Rep === rep
    );
    const avgNDVI =
      blockPlots.reduce(
        (sum: number, plot: PlotFeature) => sum + plot.properties.NDVI_M_4,
        0
      ) / blockPlots.length;
    return { x: rep, y: avgNDVI };
  });
};

const getAllTreatmentsData = () => {
  // Get unique treatments
  const treatments = Array.from(
    new Set(typedPlotData.features.map(plot => plot.properties.Trt))
  ).sort();

  // Create data points for each measurement
  const data = Array.from({ length: 6 }, (_, i) => {
    const measurementKey = `M_${i + 1}`;
    const point: any = { measurementTime: i + 1 };

    treatments.forEach(treatment => {
      point[treatment] = Number(
        calculateMeanNDVI(treatment, measurementKey).toFixed(5)
      );
    });

    return point;
  });

  return { data, treatments };
};

export default function SimpleSensePage() {
  const [selectedGrowthStage, setSelectedGrowthStage] = useState<
    "V4" | "V9" | "R1" | "R3"
  >("V4");
  const [selectedIndex, setSelectedIndex] = useState<"NDVI" | "NDRE" | "VARI">(
    "NDVI"
  );
  const [isPlaying, setIsPlaying] = useState(false);
  const plotData = demoPlotData.features[0].properties;

  // Animation interval for growth stages
  useEffect(() => {
    if (isPlaying) {
      const stages: Array<"V4" | "V9" | "R1" | "R3"> = ["V4", "V9", "R1", "R3"];
      const interval = setInterval(() => {
        setSelectedGrowthStage(current => {
          const currentIndex = stages.indexOf(current);
          return stages[(currentIndex + 1) % stages.length];
        });
      }, 2000);
      return () => clearInterval(interval);
    }
  }, [isPlaying]);

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative pt-32 pb-16 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent" />
        <div className="container mx-auto px-4 relative">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center mb-16"
          >
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Simple<span className="text-primary">Sense</span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Advanced aerial imagery analysis delivering precise field insights
              through multi-temporal NDVI analysis for data-driven agriculture.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Process Overview */}
      <section className="bg-muted/30">
        <div className="container mx-auto px-4">
          {/* 1. Trial Design Section */}
          <div className="mb-16">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="space-y-4"
            >
              <div className="flex items-center gap-3 mb-4">
                <Layout className="w-8 h-8 text-primary" />
                <h3 className="text-2xl font-bold">1. Trial Layout</h3>
              </div>

              {/* Trial Layout Cards */}
              <div className="space-y-8">
                {/* Experimental Design Card - Full Width */}
                <Card className="p-6">
                  <div className="flex items-center gap-2 mb-6">
                    <GitMerge className="w-5 h-5 text-primary" />
                    <h3 className="text-lg font-semibold">
                      Experimental Design
                    </h3>
                    <span className="text-sm text-muted-foreground ml-2">
                      Randomized Complete Block Factorial
                    </span>
                  </div>

                  {/* Layout Maps Grid */}
                  <div className="grid grid-cols-2 gap-8 mb-6">
                    <div>
                      <h4 className="text-base font-medium mb-4">
                        Treatment Layout
                      </h4>
                      <div className="relative">
                        <TrialLayout
                          key={`treatment-${Date.now()}-${Math.random()}`}
                          view="treatment"
                        />
                      </div>
                    </div>
                    <div>
                      <h4 className="text-base font-medium mb-4">
                        Replication Layout
                      </h4>
                      <div className="relative">
                        <TrialLayout
                          key={`replication-${Date.now()}-${Math.random()}`}
                          view="replication"
                        />
                      </div>
                    </div>
                  </div>
                </Card>

                {/* Trial Information Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {/* Cropping System Card */}
                  <DataCard title="Cropping System" icon={<FaLeaf />}>
                    <DataRow label="Crop Type" value={plotData.Crop} />
                    <DataRow label="Cultivar" value={plotData.Cultivar} />
                    <DataRow
                      label="Seed Rate"
                      value={`${plotData.SeedRate.toLocaleString()} seeds/acre`}
                    />
                    <DataRow
                      label="Planting Date"
                      value={new Date(plotData.PlantDate).toLocaleDateString()}
                    />
                  </DataCard>

                  {/* Study Area Card */}
                  <DataCard title="Study Area" icon={<FaMapMarkerAlt />}>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center p-3 bg-gray-50 rounded-lg">
                        <div className="text-lg font-semibold text-emerald-600">
                          12
                        </div>
                        <div className="text-sm text-gray-600">Treatments</div>
                      </div>
                      <div className="text-center p-3 bg-gray-50 rounded-lg">
                        <div className="text-lg font-semibold text-emerald-600">
                          4
                        </div>
                        <div className="text-sm text-gray-600">
                          Replications
                        </div>
                      </div>
                      <div className="text-center p-3 bg-gray-50 rounded-lg">
                        <div className="text-lg font-semibold text-emerald-600">
                          48
                        </div>
                        <div className="text-sm text-gray-600">Total Plots</div>
                      </div>
                      <div className="text-center p-3 bg-gray-50 rounded-lg">
                        <div className="text-lg font-semibold text-emerald-600">
                          30'x40'
                        </div>
                        <div className="text-sm text-gray-600">Plot Size</div>
                      </div>
                    </div>
                  </DataCard>

                  {/* Treatment Variables Card */}
                  <DataCard title="Treatment Variables" icon={<FaFlask />}>
                    <div className="space-y-3">
                      <div className="border-l-4 border-emerald-500 pl-3">
                        <h5 className="font-medium mb-1">Products</h5>
                        <div className="text-sm grid grid-cols-3 gap-2">
                          <div>Product A</div>
                          <div>Product B</div>
                          <div>Product C</div>
                        </div>
                      </div>
                      <div className="border-l-4 border-blue-500 pl-3">
                        <h5 className="font-medium mb-1">Application Timing</h5>
                        <div className="text-sm grid grid-cols-2 gap-2">
                          <div>Time 1: Early</div>
                          <div>Time 2: Mid</div>
                          <div>Time 3: Late</div>
                          <div>Time 4: Final</div>
                        </div>
                      </div>
                    </div>
                  </DataCard>
                </div>
              </div>
            </motion.div>
          </div>

          {/* 2. Data Acquisition Section */}
          <div className="mb-16">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="space-y-4"
            >
              <div className="flex items-center gap-3 mb-4">
                <Camera className="w-8 h-8 text-primary" />
                <h3 className="text-2xl font-bold">2. Data Acquisition</h3>
              </div>

              {/* Data Acquisition Cards */}
              <div className="space-y-8">
                {/* Equipment Overview Card - Full Width */}
                <Card className="p-6">
                  <div className="flex items-center gap-2 mb-6">
                    <Camera className="w-5 h-5 text-primary" />
                    <h3 className="text-lg font-semibold">
                      Equipment Overview
                    </h3>
                    <span className="text-sm text-muted-foreground ml-2">
                      DJI Mavic 3M Multispectral
                    </span>
                  </div>

                  <div className="flex items-start gap-4 mb-6">
                    <Image
                      src="/simple-sense/dji-mavic-3.jpg"
                      alt="DJI Mavic 3M"
                      width={200}
                      height={200}
                      className="rounded-lg"
                    />
                    <div className="space-y-4">
                      <p className="text-sm text-muted-foreground">
                        Multispectral Imaging System + RGB Highly integrated
                        imaging system Imaging system has one 20MP RGB camera
                        and four 5MP multispectral cameras (green, red, red
                        edge, and near infrared), enabling applications such as
                        high-precision aerial surveying, crop growth monitoring,
                        and natural resource surveys.
                      </p>
                      <div className="grid grid-cols-4 gap-4">
                        <div className="p-3 bg-muted/50 rounded-lg text-center">
                          <div className="font-medium">20MP</div>
                          <div className="text-xs text-muted-foreground">
                            RGB Camera
                          </div>
                        </div>{" "}
                        <div className="p-3 bg-muted/50 rounded-lg text-center">
                          <div className="font-medium">1/2000s</div>
                          <div className="text-xs text-muted-foreground">
                            Shutter Speed
                          </div>
                        </div>
                        <div className="p-3 bg-muted/50 rounded-lg text-center">
                          <div className="font-medium">4x 5MP</div>
                          <div className="text-xs text-muted-foreground">
                            Spectral Sensors
                          </div>
                        </div>
                        <div className="p-3 bg-muted/50 rounded-lg text-center">
                          <div className="font-medium">RTK</div>
                          <div className="text-xs text-muted-foreground">
                            Positioning
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>

                {/* Information Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {/* Spectral Bands Card */}
                  <DataCard
                    title="Spectral Bands"
                    icon={<Layers className="w-5 h-5" />}
                  >
                    <div className="space-y-2">
                      <DataRow label="NIR" value="860 nm ± 26 nm" />
                      <DataRow label="Red Edge" value="730 nm ± 16 nm" />
                      <DataRow label="Red" value="650 nm ± 16 nm" />
                      <DataRow label="Green" value="560 nm ± 16 nm" />
                    </div>
                  </DataCard>

                  {/* Flight Parameters Card */}
                  <DataCard
                    title="Flight Parameters"
                    icon={<Plane className="w-5 h-5" />}
                  >
                    <div className="space-y-2">
                      <DataRow label="Flight Height" value="76.2 m" />
                      <DataRow label="GSD" value="5 cm/px" />
                      <DataRow label="Image Count" value="229" />
                      <DataRow label="Duration" value="~10 min" />
                    </div>
                  </DataCard>

                  {/* Quality Metrics Card */}
                  <DataCard
                    title="Quality Metrics"
                    icon={<FileCheck className="w-5 h-5" />}
                  >
                    <div className="space-y-2">
                      <DataRow label="Image Overlap" value="80%" />
                      <DataRow label="GSD Achieved" value="4.8 cm/px" />
                      <DataRow label="Coverage" value="100%" />
                      <DataRow label="Accuracy" value="± 2cm" />
                    </div>
                  </DataCard>

                  {/* Ground Control Card */}
                  <DataCard
                    title="Ground Control"
                    icon={<Target className="w-5 h-5" />}
                  >
                    <div className="bg-muted/50 p-3 rounded-lg">
                      <h5 className="font-medium text-sm mb-2">GCP Network</h5>
                      <p className="text-sm text-muted-foreground mb-3">
                        5 points strategically placed for precise georeferencing
                      </p>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <DataRow label="Horizontal" value="± 2cm" />
                        <DataRow label="Vertical" value="± 3cm" />
                      </div>
                    </div>
                  </DataCard>

                  {/* Weather Conditions Card */}
                  <DataCard
                    title="Weather Conditions"
                    icon={<Wind className="w-5 h-5" />}
                  >
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center p-3 bg-muted/50 rounded-lg">
                        <div className="text-lg font-semibold text-emerald-600">
                          24°C
                        </div>
                        <div className="text-xs text-muted-foreground">
                          Temperature
                        </div>
                      </div>
                      <div className="text-center p-3 bg-muted/50 rounded-lg">
                        <div className="text-lg font-semibold text-emerald-600">
                          3.2 m/s
                        </div>
                        <div className="text-xs text-muted-foreground">
                          Wind Speed
                        </div>
                      </div>
                      <div className="text-center p-3 bg-muted/50 rounded-lg">
                        <div className="text-lg font-semibold text-emerald-600">
                          15%
                        </div>
                        <div className="text-xs text-muted-foreground">
                          Cloud Cover
                        </div>
                      </div>
                      <div className="text-center p-3 bg-muted/50 rounded-lg">
                        <div className="text-lg font-semibold text-emerald-600">
                          65°
                        </div>
                        <div className="text-xs text-muted-foreground">
                          Solar Angle
                        </div>
                      </div>
                    </div>
                  </DataCard>

                  {/* Mission Planning Card */}
                  <DataCard
                    title="Mission Planning"
                    icon={<Calendar className="w-5 h-5" />}
                  >
                    <div className="space-y-3">
                      <div className="border-l-4 border-emerald-500 pl-3">
                        <h5 className="font-medium mb-1">Flight Pattern</h5>
                        <div className="text-sm grid grid-cols-2 gap-2">
                          <div>Double Grid</div>
                          <div>90° Crosshatch</div>
                          <div>Front Overlap: 80%</div>
                          <div>Side Overlap: 75%</div>
                        </div>
                      </div>
                      <div className="border-l-4 border-blue-500 pl-3">
                        <h5 className="font-medium mb-1">Timing</h5>
                        <div className="text-sm grid grid-cols-2 gap-2">
                          <div>Solar Noon ±2h</div>
                          <div>Clear Sky</div>
                          <div>Low Wind</div>
                          <div>Optimal Light</div>
                        </div>
                      </div>
                    </div>
                  </DataCard>
                </div>
              </div>
            </motion.div>
          </div>

          {/* 3. Image Processing Section */}
          <div className="mb-20">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="space-y-8"
            >
              <div className="flex items-center gap-3 mb-6">
                <ImagePlus className="w-8 h-8 text-primary" />
                <h3 className="text-2xl font-bold">3. Image Processing</h3>
              </div>

              {/* Processing Workflow */}
              <div className="bg-card rounded-lg p-6 border border-border/50">
                <h4 className="font-semibold mb-6">Processing Workflow</h4>
                <div className="grid grid-cols-7 gap-4">
                  {[
                    {
                      icon: <Camera className="w-5 h-5" />,
                      label: "Acquisition"
                    },
                    {
                      icon: <Gauge className="w-5 h-5" />,
                      label: "Radiometric Adjustment"
                    },
                    {
                      icon: <GitMerge className="w-5 h-5" />,
                      label: "Orthomosaic"
                    },
                    {
                      icon: <Calculator className="w-5 h-5" />,
                      label: "Vegetation Indices"
                    },
                    {
                      icon: <Target className="w-5 h-5" />,
                      label: "Zonal Statistics"
                    },
                    {
                      icon: <Microscope className="w-5 h-5" />,
                      label: "Analysis"
                    },
                    {
                      icon: <LineChart className="w-5 h-5" />,
                      label: "Visualization"
                    }
                  ].map((step, index) => (
                    <div key={step.label} className="text-center space-y-2">
                      <div className="relative">
                        <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
                          <div className="text-primary">{step.icon}</div>
                        </div>
                        {index < 6 && (
                          <div className="absolute top-1/2 -right-2 w-4 h-0.5 bg-border" />
                        )}
                      </div>
                      <p className="text-xs font-medium">{step.label}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* WebODM Processing */}
              <div className="grid md:grid-cols-2 gap-8">
                <div className="bg-card rounded-lg p-6 border border-border/50">
                  <h4 className="font-semibold mb-4">
                    Advanced Image Processing
                  </h4>
                  <div className="space-y-4">
                    {[
                      {
                        title: "Radiometric Processing",
                        description:
                          "Advanced sensor calibration techniques ensuring precise spectral measurements across varying conditions"
                      },
                      {
                        title: "Spatial Referencing",
                        description:
                          "High-precision georeferencing system integrating multiple positioning technologies"
                      },
                      {
                        title: "Image Integration",
                        description:
                          "Sophisticated algorithms for seamless multi-sensor data fusion and visualization"
                      },
                      {
                        title: "Terrain Modeling",
                        description:
                          "Advanced surface modeling incorporating multiple data sources for enhanced accuracy"
                      },
                      {
                        title: "Quality Control",
                        description:
                          "Comprehensive multi-stage validation process ensuring data reliability and consistency"
                      }
                    ].map(step => (
                      <div key={step.title} className="flex gap-4">
                        <div className="mt-1">
                          <FileCheck className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                          <h5 className="font-medium mb-1">{step.title}</h5>
                          <p className="text-sm text-muted-foreground">
                            {step.description}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Vegetation Indices */}
                <div className="bg-card rounded-lg p-6 border border-border/50">
                  <h4 className="font-semibold mb-4">Vegetation Indices</h4>
                  <div className="space-y-6">
                    {[
                      {
                        name: "NDVI",
                        formula: "NDVI = (NIR₈₆₀ - RED₆₅₀) / (NIR₈₆₀ + RED₆₅₀)",
                        description:
                          "Measures vegetation health using NIR (860nm) and Red (650nm) bands"
                      },
                      {
                        name: "NDRE",
                        formula: "NDRE = (NIR - RE) / (NIR + RE)",
                        description:
                          "Uses red-edge band for enhanced sensitivity to chlorophyll content"
                      },
                      {
                        name: "VARI",
                        formula: "VARI = (GREEN - RED) / (GREEN + RED - BLUE)",
                        description:
                          "Atmospherically resistant index using visible spectrum"
                      }
                    ].map(index => (
                      <div key={index.name} className="p-4 bg-muted rounded-lg">
                        <div className="flex items-center gap-2 mb-2">
                          <Calculator className="w-4 h-4 text-primary" />
                          <h5 className="font-medium">{index.name}</h5>
                        </div>
                        <div className="text-sm font-mono bg-background/50 p-2 rounded mb-2">
                          {index.formula}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {index.description}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Statistical Analysis Section */}
              <div className="mb-20">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                  className="space-y-8"
                >
                  <div className="flex items-center gap-3 mb-6">
                    <BarChart className="w-8 h-8 text-primary" />
                    <h3 className="text-2xl font-bold">
                      4. Statistical Analysis
                    </h3>
                  </div>

                  {/* Analysis Methods */}
                  <div className="grid md:grid-cols-2 gap-8">
                    <div className="bg-card rounded-lg p-6 border border-border/50">
                      <h4 className="font-semibold mb-6">
                        Statistical Analysis
                      </h4>
                      <div className="space-y-6">
                        <p className="text-sm text-muted-foreground">
                          Advanced statistical modeling to identify significant
                          differences in vegetation indices between treatment
                          groups, enabling data-driven decision making.
                        </p>
                        <div className="bg-muted rounded-lg p-4">
                          <h5 className="font-medium mb-3">
                            Analysis Components
                          </h5>
                          <ul className="text-sm space-y-2 text-muted-foreground">
                            <li>
                              • Advanced variance decomposition to isolate
                              treatment effects from env. factors
                            </li>
                            <li>
                              • Comprehensive mean separation techniques for
                              treatment evaluation
                            </li>
                            <li>
                              • Multi-stage significance testing with
                              environmental covariate adjustment
                            </li>
                          </ul>
                        </div>
                      </div>
                    </div>

                    <div className="bg-card rounded-lg p-6 border border-border/50">
                      <h4 className="font-semibold mb-6">Post-hoc Analysis</h4>
                      <div className="space-y-6">
                        <p className="text-sm text-muted-foreground">
                          Detailed comparative analysis between treatment groups
                          to identify specific patterns and relationships in
                          your data.
                        </p>
                        <div className="bg-muted rounded-lg p-4">
                          <h5 className="font-medium mb-3">Key Features</h5>
                          <ul className="text-sm space-y-2 text-muted-foreground">
                            <li>
                              • Pairwise treatment comparisons with spatial
                              correlation adjustments
                            </li>
                            <li>
                              • Standardized and unstandardized effect size
                              estimation with confidence bounds
                            </li>
                            <li>
                              • Multi-level confidence intervals incorporating
                              temporal variation
                            </li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              </div>
            </motion.div>
          </div>

          {/* 5. Visualization and Reporting Section */}
          <div className="mb-20">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="space-y-8"
            >
              <div className="flex items-center gap-3 mb-6">
                <Eye className="w-8 h-8 text-primary" />
                <h3 className="text-2xl font-bold">
                  5. Visualization and Reporting
                </h3>
              </div>

              {/* Time Series Visualization */}
              <div className="space-y-6">
                <div className="space-y-2">
                  <h2 className="text-2xl font-bold tracking-tight">
                    Temporal NDVI Analysis
                  </h2>
                  <p className="text-muted-foreground">
                    Interactive visualization of NDVI measurements across
                    different growth stages for the demo plot.
                  </p>
                </div>

                <Card className="p-6">
                  <Tabs defaultValue="1" className="space-y-4">
                    <TabsList>
                      <TabsTrigger value="1">V4 Stage (Early)</TabsTrigger>
                      <TabsTrigger value="2">V9 Stage (Mid)</TabsTrigger>
                      <TabsTrigger value="3">R1 Stage (Silking)</TabsTrigger>
                      <TabsTrigger value="4">R3 Stage (Milk)</TabsTrigger>
                      <TabsTrigger value="5">R5 Stage (Dent)</TabsTrigger>
                      <TabsTrigger value="6">R6 Stage (Maturity)</TabsTrigger>
                    </TabsList>

                    <TabsContent value="1">
                      <TemporalNDVIMap
                        key={`temporal-1-${Date.now()}-${Math.random()}`}
                        trialData={demoPlotData}
                        measurementIndex={1}
                      />
                    </TabsContent>
                    <TabsContent value="2">
                      <TemporalNDVIMap
                        key={`temporal-2-${Date.now()}-${Math.random()}`}
                        trialData={demoPlotData}
                        measurementIndex={2}
                      />
                    </TabsContent>
                    <TabsContent value="3">
                      <TemporalNDVIMap
                        key={`temporal-3-${Date.now()}-${Math.random()}`}
                        trialData={demoPlotData}
                        measurementIndex={3}
                      />
                    </TabsContent>
                    <TabsContent value="4">
                      <TemporalNDVIMap
                        key={`temporal-4-${Date.now()}-${Math.random()}`}
                        trialData={demoPlotData}
                        measurementIndex={4}
                      />
                    </TabsContent>
                    <TabsContent value="5">
                      <TemporalNDVIMap
                        key={`temporal-5-${Date.now()}-${Math.random()}`}
                        trialData={demoPlotData}
                        measurementIndex={5}
                      />
                    </TabsContent>
                    <TabsContent value="6">
                      <TemporalNDVIMap
                        key={`temporal-6-${Date.now()}-${Math.random()}`}
                        trialData={demoPlotData}
                        measurementIndex={6}
                      />
                    </TabsContent>
                  </Tabs>
                </Card>
              </div>

              {/* Analysis Summary */}
              <div className="grid md:grid-cols-2 gap-8">
                <div className="bg-card rounded-lg p-6 border border-border/50">
                  <h4 className="font-semibold mb-6">Growth Stage Analysis</h4>
                  <div className="space-y-6">
                    {[
                      {
                        stage: "V4",
                        range: "0.30 - 0.60",
                        key: "Early vegetative growth shows initial treatment responses"
                      },
                      {
                        stage: "V9",
                        range: "0.40 - 0.75",
                        key: "Peak vegetative growth with clear treatment differentiation"
                      },
                      {
                        stage: "R1",
                        range: "0.40 - 0.90",
                        key: "Reproductive stage shows maximum treatment effects"
                      },
                      {
                        stage: "R3",
                        range: "0.40 - 1.00",
                        key: "Grain fill period reveals sustained treatment impacts"
                      }
                    ].map(stage => (
                      <div
                        key={stage.stage}
                        className="flex items-start gap-4 p-4 bg-muted rounded-lg"
                      >
                        <div className="p-2 rounded-lg bg-primary/10">
                          <Sprout className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <h5 className="font-medium">Stage {stage.stage}</h5>
                            <span className="text-xs text-muted-foreground">
                              NDVI: {stage.range}
                            </span>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {stage.key}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-card rounded-lg p-6 border border-border/50">
                  <h4 className="font-semibold mb-6">Key Findings</h4>
                  <div className="space-y-6">
                    <div className="p-4 bg-muted rounded-lg">
                      <h5 className="font-medium mb-3">Temporal Patterns</h5>
                      <ul className="space-y-2 text-sm text-muted-foreground">
                        <li className="flex items-start gap-2">
                          <FileBarChart className="w-4 h-4 text-primary mt-1" />
                          <span>
                            NDVI values increase progressively through growth
                            stages
                          </span>
                        </li>
                        <li className="flex items-start gap-2">
                          <FileBarChart className="w-4 h-4 text-primary mt-1" />
                          <span>
                            Treatment effects most pronounced during R1-R3
                            stages
                          </span>
                        </li>
                        <li className="flex items-start gap-2">
                          <FileBarChart className="w-4 h-4 text-primary mt-1" />
                          <span>
                            Spatial patterns reveal block and treatment
                            interactions
                          </span>
                        </li>
                      </ul>
                    </div>

                    <div className="p-4 bg-muted rounded-lg">
                      <h5 className="font-medium mb-3">Index Comparisons</h5>
                      <ul className="space-y-2 text-sm text-muted-foreground">
                        <li className="flex items-start gap-2">
                          <FileBarChart className="w-4 h-4 text-primary mt-1" />
                          <span>
                            NDVI and NDRE show strong correlation (r² &gt; 0.85)
                          </span>
                        </li>
                        <li className="flex items-start gap-2">
                          <FileBarChart className="w-4 h-4 text-primary mt-1" />
                          <span>
                            VARI provides complementary stress detection
                          </span>
                        </li>
                        <li className="flex items-start gap-2">
                          <FileBarChart className="w-4 h-4 text-primary mt-1" />
                          <span>
                            Multi-index approach improves treatment assessment
                          </span>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>

              {/* Report Generation */}
              <div className="bg-card rounded-lg p-6 border border-border/50">
                <h4 className="font-semibold mb-6">Report Generation</h4>
                <div className="grid md:grid-cols-3 gap-6">
                  <button className="p-6 bg-muted rounded-lg hover:bg-muted/70 transition-colors text-center">
                    <FileBarChart className="w-6 h-6 text-primary mx-auto mb-3" />
                    <h5 className="font-medium mb-1">Statistical Summary</h5>
                    <p className="text-sm text-muted-foreground">
                      Complete analysis with statistical tests
                    </p>
                  </button>
                  <button className="p-6 bg-muted rounded-lg hover:bg-muted/70 transition-colors text-center">
                    <Layers3 className="w-6 h-6 text-primary mx-auto mb-3" />
                    <h5 className="font-medium mb-1">Spatial Analysis</h5>
                    <p className="text-sm text-muted-foreground">
                      Maps and spatial patterns report
                    </p>
                  </button>
                  <button className="p-6 bg-muted rounded-lg hover:bg-muted/70 transition-colors text-center">
                    <Download className="w-6 h-6 text-primary mx-auto mb-3" />
                    <h5 className="font-medium mb-1">Raw Data Export</h5>
                    <p className="text-sm text-muted-foreground">
                      Download processed data files
                    </p>
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  );
}
