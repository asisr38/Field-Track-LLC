"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import {
  Plane,
  Layers,
  LineChart,
  Layout,
  Camera,
  Calendar,
  Target,
  Wind,
  ImagePlus,
  GitMerge,
  FileCheck,
  BarChart,
  Sprout,
  Eye,
  Layers3,
  FileBarChart,
  Download
} from "lucide-react";
import dynamic from "next/dynamic";
import { useState, useEffect } from "react";
import demoPlotData from "@/public/simple-sense/ExtractionZones_v3.json";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { IconContext } from "react-icons";
import { FaLeaf, FaMapMarkerAlt, FaFlask } from "react-icons/fa";
import {
  BarChart as RechartsBarChart,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  LineChart as RechartsLineChart,
  Line,
  ResponsiveContainer
} from "recharts";
import plotData from "../../../public/simple-sense/ExtractionZones_v3.json";

// Dynamic import of TrialLayout component
const TrialLayout = dynamic(() => import("@/components/TrialLayout"), {
  ssr: false,
  loading: () => (
    <div className="h-[400px] bg-muted/20 animate-pulse rounded-lg flex items-center justify-center">
      <p className="text-muted-foreground">Loading layout...</p>
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

const DataCard = ({
  title,
  icon,
  children
}: {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}) => (
  <Card className="p-4 h-full dark:bg-card">
    <div className="flex items-center gap-2 mb-3">
      <IconContext.Provider
        value={{
          size: "1.2em",
          className: "text-emerald-600 dark:text-emerald-500"
        }}
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
    <span className="text-sm text-gray-600 dark:text-gray-400">{label}</span>
    <span className="font-medium dark:text-foreground">{value}</span>
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
    "V4" | "V9" | "R1" | "R3" | "R5"
  >("V4");
  const [selectedIndex, setSelectedIndex] = useState<"NDVI" | "NDRE" | "VARI">(
    "NDVI"
  );
  const [isPlaying, setIsPlaying] = useState(false);
  const plotData = demoPlotData.features[0].properties;
  const [layoutView, setLayoutView] = useState<"treatment" | "replication">(
    "treatment"
  );

  // Animation interval for growth stages
  useEffect(() => {
    if (isPlaying) {
      const stages: Array<"V4" | "V9" | "R1" | "R3" | "R5"> = [
        "V4",
        "V9",
        "R1",
        "R3",
        "R5"
      ];
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
    <div className="min-h-screen bg-background pt-16">
      {/* Hero Section */}
      <section className="relative pt-20 pb-16 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-green-100/20 to-transparent" />
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
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
              Our research-grade analysis pipeline delivers precise field
              insights designed to meet the rigorous demands of academic and
              industry research. We collect and process aerial imagery that
              seamlessly integrates into your existing projects, enabling
              data-driven decisions.
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
              className="space-y-6"
            >
              <div className="flex items-center gap-3 mb-6">
                <Layout className="w-8 h-8 text-primary" />
                <h2 className="text-2xl font-bold">1. Trial Layout</h2>
              </div>

              {/* Layout Maps Grid */}
              <Card className="p-6 mb-6">
                <div className="flex flex-wrap items-center gap-2 mb-6">
                  <GitMerge className="w-5 h-5 text-primary" />
                  <h3 className="text-lg font-semibold">
                    Create spatially consistent plot zones for your current
                    trial.
                  </h3>
                </div>

                <div className="mb-0">
                  <div className="flex justify-between items-center mb-4">
                    <h4 className="text-base font-medium">
                      An example of a small plot research trial{" "}
                    </h4>{" "}
                    <div className="flex items-center space-x-3">
                      <button
                        className={`text-sm font-medium cursor-pointer px-3 py-1 rounded-l-md ${
                          layoutView === "treatment"
                            ? "bg-primary text-white"
                            : "bg-muted text-muted-foreground"
                        }`}
                        onClick={() => setLayoutView("treatment")}
                      >
                        Treatment
                      </button>
                      <button
                        className={`text-sm font-medium cursor-pointer px-3 py-1  rounded-r-md ${
                          layoutView === "replication"
                            ? "bg-primary text-white"
                            : "bg-muted text-muted-foreground"
                        }`}
                        onClick={() => setLayoutView("replication")}
                      >
                        Replication
                      </button>
                    </div>
                  </div>
                  <div className="relative">
                    <TrialLayout
                      key={`layout-${layoutView}-${Date.now()}`}
                      view={layoutView}
                    />
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
                      <div className="text-sm text-gray-600">Replications</div>
                    </div>
                    <div className="text-center p-3 bg-gray-50 rounded-lg">
                      <div className="text-lg font-semibold text-emerald-600">
                        48
                      </div>
                      <div className="text-sm text-gray-600">Total Plots</div>
                    </div>
                    <div className="text-center p-3 bg-gray-50 rounded-lg">
                      <div className="text-lg font-semibold text-emerald-600">
                        10'x40'
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
                      <div className="text-sm grid grid-cols-1 xs:grid-cols-3 gap-2">
                        <div>Product A</div>
                        <div>Product B</div>
                        <div>Product C</div>
                      </div>
                    </div>
                    <div className="border-l-4 border-blue-500 pl-3">
                      <h5 className="font-medium mb-1">Application Timing</h5>
                      <div className="text-sm grid grid-cols-1 xs:grid-cols-2 gap-2">
                        <div>Time 1: Early</div>
                        <div>Time 2: Mid</div>
                        <div>Time 3: Late</div>
                        <div>Time 4: Final</div>
                      </div>
                    </div>
                  </div>
                </DataCard>
              </div>
            </motion.div>
          </div>

          {/* 2. Data Acquisition Section */}
          <div className="mb-16">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="space-y-6"
            >
              <div className="flex items-center gap-3 mb-6">
                <Camera className="w-8 h-8 text-primary" />
                <h2 className="text-2xl font-bold">2. Data Acquisition</h2>
              </div>

              {/* Data Acquisition Cards */}
              <div className="space-y-8">
                {/* Equipment Overview Card - Full Width */}
                <Card className="p-6">
                  <div className="flex items-center gap-2 mb-6">
                    <h3 className="text-lg font-semibold">
                      Equipment Overview
                    </h3>
                  </div>

                  <div className="flex flex-col md:flex-row items-start gap-4 mb-6">
                    <div className="space-y-4 w-full">
                      <p className="text-sm text-muted-foreground">
                        An advanced multispectral and RGB integrated imaging
                        system equipped with a 20MP RGB camera and four 5MP
                        multispectral cameras (covering green, red, red edge,
                        and near-infrared wavelengths). This innovative setup
                        supports a range of precision applications, including
                        high-resolution aerial surveys, detailed crop growth
                        analysis, and plot-level monitoring.
                      </p>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-4">
                        <div className="p-3 bg-muted/50 rounded-lg text-center">
                          <div className="font-medium">20MP</div>
                          <div className="text-xs text-muted-foreground">
                            RGB Camera
                          </div>
                        </div>
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
                      <DataRow label="Image Count" value="229" />
                      <DataRow label="Duration" value="~36 min" />
                    </div>
                  </DataCard>

                  {/* Quality Metrics Card */}
                  <DataCard
                    title="Quality Metrics"
                    icon={<FileCheck className="w-5 h-5" />}
                  >
                    <div className="space-y-2">
                      <DataRow label="Image Overlap" value="80%" />
                      <DataRow label="GSD Achieved" value="3.0 cm/px" />
                      <DataRow label="Coverage" value="100%" />
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
                          70°F
                        </div>
                        <div className="text-xs text-muted-foreground">
                          Temperature
                        </div>
                      </div>
                      <div className="text-center p-3 bg-muted/50 rounded-lg">
                        <div className="text-lg font-semibold text-emerald-600">
                          3.2 mph
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
                        <div className="text-sm grid grid-cols-1 xs:grid-cols-2 gap-2">
                          <div>Double Grid</div>
                          <div>90° Crosshatch</div>
                          <div>Front Overlap: 80%</div>
                          <div>Side Overlap: 75%</div>
                        </div>
                      </div>
                      <div className="border-l-4 border-blue-500 pl-3">
                        <h5 className="font-medium mb-1">Timing</h5>
                        <div className="text-sm grid grid-cols-1 xs:grid-cols-2 gap-2">
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
                <h2 className="text-2xl font-bold">
                  3. Image Processing & Analysis
                </h2>
              </div>

              {/* Combined Processing & Analysis */}
              <div className="grid md:grid-cols-2 gap-8">
                <div className="bg-card rounded-lg p-6 border border-border/50">
                  <h3 className="text-lg font-semibold mb-4">
                    Image Processing
                  </h3>
                  <div className="space-y-4">
                    {[
                      {
                        title: "Radiometric Processing",
                        description:
                          "Sensor calibration for precise spectral measurements"
                      },
                      {
                        title: "Spatial Referencing",
                        description:
                          "High-precision georeferencing with multiple positioning technologies"
                      },
                      {
                        title: "Image Integration",
                        description:
                          "Multi-sensor data fusion and visualization"
                      }
                    ].map(step => (
                      <div key={step.title} className="flex gap-4">
                        <div className="mt-1">
                          <FileCheck className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                          <h4 className="text-base">{step.title}</h4>
                          <p className="text-sm text-muted-foreground">
                            {step.description}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-card rounded-lg p-6 border border-border/50">
                  <h3 className="text-lg font-semibold mb-4">
                    Statistical Analysis
                  </h3>
                  <div className="space-y-4">
                    <p className="text-sm text-muted-foreground">
                      Advanced statistical modeling to identify significant
                      differences between treatment groups, enabling data-driven
                      decision making.
                    </p>
                    <div className="space-y-4">
                      {[
                        {
                          title: "Variance Analysis",
                          description:
                            "Isolate treatment effects from environmental factors"
                        },
                        {
                          title: "Treatment Evaluation",
                          description:
                            "Comparative analysis to identify patterns and relationships"
                        },
                        {
                          title: "Temporal Analysis",
                          description:
                            "Multi-level confidence intervals with temporal variation"
                        }
                      ].map(step => (
                        <div key={step.title} className="flex gap-4">
                          <div className="mt-1">
                            <BarChart className="w-5 h-5 text-primary" />
                          </div>
                          <div>
                            <h4 className="text-base">{step.title}</h4>
                            <p className="text-sm text-muted-foreground">
                              {step.description}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>

          {/* 4. Visualization and Reporting Section - Renumbered */}
          <div className="mb-20">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="space-y-8"
            >
              <div className="flex items-center gap-3 mb-6">
                <Eye className="w-8 h-8 text-primary" />
                <h2 className="text-2xl font-bold">
                  4. Visualization and Reporting
                </h2>
              </div>

              {/* Time Series Visualization */}
              <div className="space-y-6">
                <div className="space-y-2">
                  <h3 className="text-lg font-semibold">
                    Multispectral Imagery
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Interactive visualization of vegetation indices across
                    different growth stages. Toggle between the layers with the
                    controls in the top right.
                  </p>
                </div>

                <Card className="p-6">
                  <Tabs defaultValue="1" className="space-y-4">
                    <div className="overflow-x-auto pb-2">
                      <TabsList className="min-w-[500px]">
                        <TabsTrigger value="1" className="text-sm">
                          V4 (Early)
                        </TabsTrigger>
                        <TabsTrigger value="2" className="text-sm">
                          V9 (Rapid Growth)
                        </TabsTrigger>
                        <TabsTrigger value="3" className="text-sm">
                          R1 (Silking)
                        </TabsTrigger>
                        <TabsTrigger value="4" className="text-sm">
                          R3 (Milk)
                        </TabsTrigger>
                        <TabsTrigger value="5" className="text-sm">
                          R5 (Dent)
                        </TabsTrigger>
                      </TabsList>
                    </div>

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

              {/* 5. Treatment NDVI Line Chart Section - New section */}
              <div className="mb-20">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                  className="space-y-8"
                >
                  <div className="flex items-center gap-3 mb-6">
                    <LineChart className="w-8 h-8 text-primary" />
                    <h2 className="text-2xl font-bold">
                      5. Treatment Performance Analysis
                    </h2>
                  </div>

                  <div className="bg-card rounded-lg p-6 border border-border/50">
                    <h3 className="text-lg font-semibold mb-4">
                      NDVI Progression Across Growth Stages
                    </h3>
                    <div className="space-y-4">
                      <p className="text-sm text-muted-foreground">
                        This visualization shows the temporal progression of
                        NDVI values for different treatments throughout the
                        growing season. Tracking these patterns helps identify
                        which treatments perform best at each crop development
                        stage.
                      </p>
                      <div className="h-[450px] sm:h-[420px] lg:h-[400px] w-full mt-6">
                        <ResponsiveContainer width="100%" height="100%">
                          <RechartsLineChart
                            data={[
                              {
                                timing: 1,
                                growthStage: "V4",
                                A: 0.29,
                                B: 0.3,
                                C: 0.28,
                                D: 0.3,
                                E: 0.286,
                                F: 0.3,
                                G: 0.28,
                                H: 0.29,
                                I: 0.3,
                                J: 0.29,
                                K: 0.29,
                                L: 0.31
                              },
                              {
                                timing: 2,
                                growthStage: "V9",
                                A: 0.34,
                                B: 0.385,
                                C: 0.33,
                                D: 0.35,
                                E: 0.37,
                                F: 0.35,
                                G: 0.33,
                                H: 0.34,
                                I: 0.35,
                                J: 0.36,
                                K: 0.34,
                                L: 0.39
                              },
                              {
                                timing: 3,
                                growthStage: "R1",
                                A: 0.69,
                                B: 0.751,
                                C: 0.686,
                                D: 0.71,
                                E: 0.7,
                                F: 0.7,
                                G: 0.645,
                                H: 0.63,
                                I: 0.65,
                                J: 0.71,
                                K: 0.7,
                                L: 0.745
                              },
                              {
                                timing: 4,
                                growthStage: "R3",
                                A: 0.61,
                                B: 0.64,
                                C: 0.612,
                                D: 0.6,
                                E: 0.58,
                                F: 0.6,
                                G: 0.6,
                                H: 0.59,
                                I: 0.61,
                                J: 0.64,
                                K: 0.61,
                                L: 0.649
                              },
                              {
                                timing: 5,
                                growthStage: "R5",
                                A: 0.36,
                                B: 0.379,
                                C: 0.37,
                                D: 0.35,
                                E: 0.36,
                                F: 0.35,
                                G: 0.39,
                                H: 0.36,
                                I: 0.34,
                                J: 0.38,
                                K: 0.35,
                                L: 0.39
                              }
                            ]}
                            margin={{
                              top: 30,
                              right: 30,
                              left: 20,
                              bottom: 60
                            }}
                          >
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis
                              dataKey="timing"
                              label={{
                                value: "Growth Stage",
                                position: "insideBottom",
                                offset: -5
                              }}
                              domain={[0.5, 5.5]}
                              ticks={[1, 2, 3, 4, 5]}
                              tickFormatter={value => {
                                const stages = ["V4", "V9", "R1", "R3", "R5"];
                                return stages[value - 1] || "";
                              }}
                              tick={{ fontSize: 12 }}
                            />
                            <YAxis
                              domain={[0.2, 0.8]}
                              label={{
                                value: "NDVI",
                                angle: -90,
                                position: "insideLeft",
                                offset: 10
                              }}
                              tick={{ fontSize: 12 }}
                            />
                            <Tooltip
                              formatter={(value, name) => [
                                Number(value).toFixed(3),
                                ` ${name}`
                              ]}
                              labelFormatter={label => {
                                const stages = ["V4", "V9", "R1", "R3", "R5"];
                                return `Growth Stage: ${
                                  stages[label - 1] || ""
                                }`;
                              }}
                              contentStyle={{
                                borderColor: "var(--border)",
                                backgroundColor: "white",
                                color: "var(--foreground)",
                                fontSize: "12px"
                              }}
                              labelStyle={{
                                color: "black",
                                fontSize: "12px"
                              }}
                            />
                            <Legend
                              verticalAlign="bottom"
                              height={36}
                              iconSize={8}
                              wrapperStyle={{
                                fontSize: "14px",
                                overflowWrap: "break-word",
                                paddingTop: "32px"
                              }}
                              formatter={value => ` ${value}`}
                            />
                            {(() => {
                              // All treatments A through L
                              const treatments = [
                                "A",
                                "B",
                                "C",
                                "D",
                                "E",
                                "F",
                                "G",
                                "H",
                                "I",
                                "J",
                                "K",
                                "L"
                              ];

                              // Color palette using a broader range of distinct colors for 12 treatments
                              const colors = [
                                "#e6194B", // Red
                                "#3cb44b", // Green
                                "#ffe119", // Yellow
                                "#4363d8", // Blue
                                "#f58231", // Orange
                                "#911eb4", // Purple
                                "#42d4f4", // Cyan
                                "#f032e6", // Magenta
                                "#bfef45", // Lime
                                "#fabed4", // Pink
                                "#469990", // Teal
                                "#dcbeff" // Lavender
                              ];

                              return treatments.map((treatment, index) => (
                                <Line
                                  key={treatment}
                                  type="monotone"
                                  dataKey={treatment}
                                  name={treatment}
                                  stroke={colors[index % colors.length]}
                                  activeDot={{ r: 6 }}
                                  strokeWidth={2}
                                  dot={{ strokeWidth: 2, r: 4 }}
                                />
                              ));
                            })()}
                          </RechartsLineChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                  </div>
                </motion.div>
              </div>
              {/* Report Generation */}
              <div className="bg-card rounded-lg p-6 border border-border/50">
                <h3 className="text-lg font-semibold mb-4">
                  Report Generation
                </h3>
                <p className="text-sm text-muted-foreground pb-6">
                  We make remote sensing data easy to use, providing clear
                  insights that integrate seamlessly with your existing
                  datasets. Our reports include everything you need to support
                  your research, from datasets in your preferred format to
                  ready-to-use figures and tables for publications.
                </p>
                <div className="grid md:grid-cols-3 gap-6">
                  <button className="p-6 bg-muted rounded-lg hover:bg-muted/70 transition-colors text-center">
                    <FileBarChart className="w-6 h-6 text-primary mx-auto mb-3" />
                    <h5 className="text-sm font-medium mb-1">
                      Statistical Summary
                    </h5>
                    <p className="text-xs text-muted-foreground">
                      Complete analysis with statistical tests
                    </p>
                  </button>
                  <button className="p-6 bg-muted rounded-lg hover:bg-muted/70 transition-colors text-center">
                    <Layers3 className="w-6 h-6 text-primary mx-auto mb-3" />
                    <h5 className="font-medium mb-1">Spatial Analysis</h5>
                    <p className="text-xs text-muted-foreground">
                      Maps and spatial patterns report
                    </p>
                  </button>
                  <button className="p-6 bg-muted rounded-lg hover:bg-muted/70 transition-colors text-center">
                    <Download className="w-6 h-6 text-primary mx-auto mb-3" />
                    <h5 className="font-medium mb-1"> Data Export</h5>
                    <p className="text-xs text-muted-foreground">
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
