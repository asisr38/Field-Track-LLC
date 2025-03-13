"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import {
  Beaker,
  LineChart,
  Map,
  Layout,
  Ruler,
  Calculator,
  BarChart2,
  Table,
  ArrowUpDown,
  Sigma,
  Sprout,
  FileBarChart,
  Download,
  Microscope,
  SplitSquareHorizontal,
  Grid,
  Target,
  Layers3
} from "lucide-react";
import dynamic from "next/dynamic";
import { useState, useEffect } from "react";
import trialData from "@/public/onfarm/trial-design-seed-2025_v2.json";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { IconContext } from "react-icons";
import {
  FaSeedling,
  FaChartBar,
  FaMapMarkedAlt,
  FaFlask,
  FaChartLine,
  FaCalculator,
  FaLeaf
} from "react-icons/fa";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ScatterChart,
  Scatter,
  Label,
  ComposedChart,
  Line,
  Rectangle,
  ReferenceArea
} from "recharts";
import { useTheme } from "next-themes";

// Dynamically import the map component to avoid SSR issues with Leaflet
const OnFarmMap = dynamic(() => import("../../components/OnFarmMap"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[600px] bg-muted/20 animate-pulse rounded-lg flex items-center justify-center">
      <p className="text-muted-foreground">Loading trial map...</p>
    </div>
  )
});

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
    name: "Trial Design Visualization",
    description:
      "Interactive map visualization of trial plots with seed rates and yield data",
    icon: FaMapMarkedAlt
  },
  {
    name: "Yield Analysis",
    description:
      "Comprehensive analysis of yield performance across different seed rates",
    icon: FaChartLine
  },
  {
    name: "Agronomic Insights",
    description:
      "Expert interpretation of trial results for informed decision-making",
    icon: FaLeaf
  },
  {
    name: "Statistical Reports",
    description:
      "Detailed statistical analysis of trial outcomes and recommendations",
    icon: FaChartBar
  }
];

// Custom Box Plot component
const CustomBoxPlot = ({
  x,
  y,
  width,
  height,
  q1,
  q3,
  median,
  min,
  max,
  fill,
  strokeColor
}: any) => {
  const strokeWidth = 1;
  const medianStrokeWidth = 2;
  const boxWidth = 40;

  // Calculate positions
  const xPos = x - boxWidth / 2;

  return (
    <g>
      {/* Box */}
      <rect
        x={xPos}
        y={y + height - q3}
        width={boxWidth}
        height={q3 - q1}
        fill={fill}
        fillOpacity={0.8}
        stroke={strokeColor}
        strokeWidth={strokeWidth}
      />

      {/* Median line */}
      <line
        x1={xPos}
        x2={xPos + boxWidth}
        y1={y + height - median}
        y2={y + height - median}
        stroke={strokeColor}
        strokeWidth={medianStrokeWidth}
      />

      {/* Min whisker */}
      <line
        x1={x}
        x2={x}
        y1={y + height - q1}
        y2={y + height - min}
        stroke={strokeColor}
        strokeWidth={strokeWidth}
      />
      <line
        x1={xPos - 5}
        x2={xPos + boxWidth + 5}
        y1={y + height - min}
        y2={y + height - min}
        stroke={strokeColor}
        strokeWidth={strokeWidth}
      />

      {/* Max whisker */}
      <line
        x1={x}
        x2={x}
        y1={y + height - q3}
        y2={y + height - max}
        stroke={strokeColor}
        strokeWidth={strokeWidth}
      />
      <line
        x1={xPos - 5}
        x2={xPos + boxWidth + 5}
        y1={y + height - max}
        y2={y + height - max}
        stroke={strokeColor}
        strokeWidth={strokeWidth}
      />
    </g>
  );
};

export default function OnFarmResearchPage() {
  const [isClient, setIsClient] = useState(false);
  const [trialResults, setTrialResults] = useState<any[]>([]);
  const [scatterData, setScatterData] = useState<any[]>([]);
  const [boxPlotData, setBoxPlotData] = useState<any[]>([]);
  const [combinedData, setCombinedData] = useState<any[]>([]);
  const { theme } = useTheme();

  // Define chart colors based on theme
  const chartColors = {
    axis: theme === "dark" ? "#e1e1e1" : "#333333",
    grid: theme === "dark" ? "#444444" : "#e0e0e0",
    text: theme === "dark" ? "#f5f5f5" : "#333333",
    tooltip: {
      bg: theme === "dark" ? "#1f1f1f" : "#ffffff",
      border: theme === "dark" ? "#444444" : "#e0e0e0",
      text: theme === "dark" ? "#f5f5f5" : "#333333"
    }
  };

  // Define colors for each seed rate based on theme
  const seedRateColors: Record<number, string> = {
    26000: theme === "dark" ? "#8ecae6" : "#023e8a",
    28000: theme === "dark" ? "#a8dadc" : "#0077b6",
    30000: theme === "dark" ? "#90be6d" : "#2a9d8f",
    32000: theme === "dark" ? "#f9c74f" : "#e76f51",
    34000: theme === "dark" ? "#f8961e" : "#d62828"
  };

  useEffect(() => {
    setIsClient(true);

    // Process trial data for visualization
    const processedData = trialData.features
      .reduce((acc: any, feature: any) => {
        const seedRate = parseInt(feature.properties.tgt_seed);
        const yield_value = parseFloat(feature.properties.Yield);

        const existingRate = acc.find((d: any) => d.seedRate === seedRate);
        if (existingRate) {
          existingRate.plots += 1;
          existingRate.totalYield += yield_value;
          existingRate.avgYield = existingRate.totalYield / existingRate.plots;
          existingRate.yieldValues.push(yield_value);
        } else {
          acc.push({
            seedRate,
            plots: 1,
            totalYield: yield_value,
            avgYield: yield_value,
            yieldValues: [yield_value],
            color:
              seedRateColors[seedRate] ||
              (theme === "dark" ? "#90be6d" : "#2a9d8f")
          });
        }
        return acc;
      }, [])
      .sort((a: any, b: any) => a.seedRate - b.seedRate);

    setTrialResults(processedData);

    // Create scatter plot data
    const scatterPoints = trialData.features.map((feature: any) => ({
      seedRate: parseInt(feature.properties.tgt_seed),
      yield: parseFloat(feature.properties.Yield),
      plotId: feature.properties.ID_1,
      color:
        seedRateColors[parseInt(feature.properties.tgt_seed)] ||
        (theme === "dark" ? "#90be6d" : "#2a9d8f")
    }));
    setScatterData(scatterPoints);

    // Create box plot data
    const boxPlotData = processedData.map((item: any) => {
      // Sort yield values for calculating quartiles
      const sortedYields = [...item.yieldValues].sort(
        (a: number, b: number) => a - b
      );
      const n = sortedYields.length;

      // Calculate quartiles and other statistics
      const min = sortedYields[0];
      const max = sortedYields[n - 1];
      const q1 = sortedYields[Math.floor(n * 0.25)];
      const median =
        n % 2 === 0
          ? (sortedYields[n / 2 - 1] + sortedYields[n / 2]) / 2
          : sortedYields[Math.floor(n / 2)];
      const q3 = sortedYields[Math.floor(n * 0.75)];

      return {
        seedRate: item.seedRate,
        median,
        q1,
        q3,
        min,
        max,
        color: item.color
      };
    });

    setBoxPlotData(boxPlotData);

    // Create a combined dataset for visualization
    const combinedDataset = boxPlotData.map(
      (item: {
        seedRate: number;
        median: number;
        q1: number;
        q3: number;
        min: number;
        max: number;
        color: string;
      }) => {
        return {
          seedRate: item.seedRate,
          median: item.median,
          q1: item.q1,
          q3: item.q3,
          min: item.min,
          max: item.max,
          color: item.color
        };
      }
    );

    setCombinedData(combinedDataset);
  }, [theme]);

  return (
    <div className="min-h-screen bg-background pt-16">
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
              OnFarm <span className="text-primary">Research</span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Optimize your farming decisions with data-driven insights from
              field trials. Our On-Farm Research service helps you understand
              the impact of different seed rates on yield performance.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Map Section */}
      <section className="bg-muted/30 py-16">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="space-y-4"
          >
            <div className="flex items-center gap-3 mb-1">
              <Map className="w-8 h-8 text-primary" />
              <h3 className="text-lg font-semibold">
                Seed Rate Trial Design
              </h3>{" "}
            </div>

            <Card className="p-6">
              <span className="text-sm text-muted-foreground ml-2">
                Discover the optimal seed rates for your fields through
                data-driven field trials and real-world performance analysis.
                Our interactive visualization tools help you make informed
                planting decisions.
              </span>

              <div className="bg-muted/50 rounded-lg p-4 shadow-inner mb-6 mt-4">
                <div className="h-[600px] w-full rounded-lg overflow-hidden">
                  {isClient && <OnFarmMap />}
                </div>
              </div>

              {/* Trial Information Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Map Legend Card */}
                <DataCard
                  title="Map Legend"
                  icon={<Layers3 className="w-5 h-5" />}
                >
                  <p className="text-sm text-muted-foreground mb-3">
                    The map uses color coding to represent different seed rates:
                  </p>
                  <div className="grid grid-cols-1 gap-2">
                    <div className="flex items-center">
                      <div className="w-4 h-4 bg-[#FEE4D8] mr-2"></div>
                      <span className="text-sm">26,000 seeds/acre</span>
                    </div>
                    <div className="flex items-center">
                      <div className="w-4 h-4 bg-[#FCB195] mr-2"></div>
                      <span className="text-sm">28,000 seeds/acre</span>
                    </div>
                    <div className="flex items-center">
                      <div className="w-4 h-4 bg-[#FB795A] mr-2"></div>
                      <span className="text-sm">30,000 seeds/acre</span>
                    </div>
                    <div className="flex items-center">
                      <div className="w-4 h-4 bg-[#EF3C2D] mr-2"></div>
                      <span className="text-sm">32,000 seeds/acre</span>
                    </div>
                    <div className="flex items-center">
                      <div className="w-4 h-4 bg-[#BB1419] mr-2"></div>
                      <span className="text-sm">34,000 seeds/acre</span>
                    </div>
                  </div>
                </DataCard>

                {/* Trial Information Card */}
                <DataCard
                  title="Trial Information"
                  icon={<FileBarChart className="w-5 h-5" />}
                >
                  <div className="space-y-2">
                    <DataRow label="Location" value="Central Illinois" />
                    <DataRow label="Crop" value="Corn" />
                    <DataRow label="Planting Date" value="April 15, 2025" />
                    <DataRow label="Harvest Date" value="October 10, 2025" />
                    <DataRow
                      label="Number of Plots"
                      value={trialData.features.length.toString()}
                    />
                  </div>
                </DataCard>

                {/* Study Design Card */}
                <DataCard
                  title="Study Design"
                  icon={<Target className="w-5 h-5" />}
                >
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-3 bg-muted/50 rounded-lg">
                      <div className="text-lg font-semibold text-primary">
                        5
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Seed Rates
                      </div>
                    </div>
                    <div className="text-center p-3 bg-muted/50 rounded-lg">
                      <div className="text-lg font-semibold text-primary">
                        4
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Replications
                      </div>
                    </div>
                    <div className="text-center p-3 bg-muted/50 rounded-lg">
                      <div className="text-lg font-semibold text-primary">
                        {trialData.features.length}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Total Plots
                      </div>
                    </div>
                    <div className="text-center p-3 bg-muted/50 rounded-lg">
                      <div className="text-lg font-semibold text-primary">
                        30'x40'
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Plot Size
                      </div>
                    </div>
                  </div>
                </DataCard>
              </div>
            </Card>
          </motion.div>
        </div>
      </section>

      {/* Trial Results Analysis */}
      <section className="bg-background py-16 sm:py-24">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mx-auto max-w-3xl text-center mb-12 sm:mb-16"
          >
            <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              Trial Results Analysis
            </h2>
            <p className="mt-6 text-lg leading-8 text-muted-foreground">
              Our comprehensive analysis helps you understand the relationship
              between seed rates and yield performance, enabling data-driven
              decisions for your farming operation.
            </p>
          </motion.div>

          <div className="grid gap-6 sm:gap-8 lg:grid-cols-2">
            {/* Average Yield by Seed Rate */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <Card className="h-full overflow-hidden border-border shadow-sm dark:bg-card/95">
                <div className="p-4 sm:p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <BarChart2 className="w-5 h-5 text-primary" />
                    <h3 className="text-lg font-semibold text-foreground">
                      Average Yield by Seed Rate
                    </h3>
                  </div>
                  <p className="text-sm text-muted-foreground mb-4">
                    This chart shows the average yield achieved at each seed
                    rate, helping identify which planting density produces the
                    highest overall yields.
                  </p>
                  <div className="h-[350px] sm:h-[400px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={trialResults}
                        margin={{ top: 20, right: 30, left: 20, bottom: 30 }}
                      >
                        <CartesianGrid
                          strokeDasharray="3 3"
                          stroke={chartColors.grid}
                        />
                        <XAxis
                          dataKey="seedRate"
                          tickFormatter={value => `${value / 1000}K`}
                          padding={{ left: 20, right: 20 }}
                          tick={{ fontSize: 12, fill: chartColors.text }}
                          stroke={chartColors.axis}
                        >
                          <Label
                            value="Seed Rate (seeds/acre)"
                            position="bottom"
                            offset={20}
                            style={{
                              fill: chartColors.text,
                              textAnchor: "middle",
                              fontSize: 13,
                              fontWeight: 500
                            }}
                          />
                        </XAxis>
                        <YAxis
                          tick={{ fontSize: 12, fill: chartColors.text }}
                          tickFormatter={value => `${value}`}
                          stroke={chartColors.axis}
                        >
                          <Label
                            value="Average Yield (bu/ac)"
                            angle={-90}
                            position="left"
                            offset={-10}
                            style={{
                              fill: chartColors.text,
                              textAnchor: "middle",
                              fontSize: 13,
                              fontWeight: 500
                            }}
                          />
                        </YAxis>
                        <Tooltip
                          formatter={(value: any) => [
                            `${value.toFixed(1)}`,
                            "bu/ac"
                          ]}
                          labelFormatter={value =>
                            `${value / 1000}K seeds/acre`
                          }
                          contentStyle={{
                            backgroundColor: chartColors.tooltip.bg,
                            borderColor: chartColors.tooltip.border,
                            color: chartColors.tooltip.text,
                            borderRadius: "0.375rem",
                            padding: "0.5rem 0.75rem",
                            fontSize: "0.875rem",
                            boxShadow: "0 1px 3px 0 rgba(0, 0, 0, 0.1)"
                          }}
                        />
                        <Legend
                          wrapperStyle={{
                            color: chartColors.text,
                            fontSize: "0.875rem",
                            paddingTop: "40px"
                          }}
                        />
                        <Bar
                          dataKey="avgYield"
                          fill={"#90be6d"}
                          name="Average Yield"
                          barSize={40}
                          radius={[4, 4, 0, 0]}
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </Card>
            </motion.div>

            {/* Box Plot with Scatter Points */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <Card className="h-full overflow-hidden border-border shadow-sm dark:bg-card/95">
                <div className="p-4 sm:p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <Sigma className="w-5 h-5 text-primary" />
                    <h3 className="text-lg font-semibold text-foreground">
                      Yield Distribution by Seed Rate
                    </h3>
                  </div>
                  <p className="text-sm text-muted-foreground mb-4">
                    This chart shows the yield distribution statistics for each
                    seed rate, including minimum, lower quartile, median, upper
                    quartile, and maximum values. Higher bars indicate better
                    yield performance across different field conditions.
                  </p>
                  <div className="h-[350px] sm:h-[400px]">
                    {isClient && (
                      <ResponsiveContainer width="100%" height="100%">
                        <ComposedChart
                          margin={{ top: 20, right: 30, left: 20, bottom: 30 }}
                          data={boxPlotData}
                          barCategoryGap="20%"
                        >
                          <CartesianGrid
                            strokeDasharray="3 3"
                            stroke={chartColors.grid}
                          />
                          <XAxis
                            dataKey="seedRate"
                            tickFormatter={value => `${value / 1000}K`}
                            stroke={chartColors.axis}
                            padding={{ left: 20, right: 20 }}
                            tick={{ fontSize: 12, fill: chartColors.text }}
                          >
                            <Label
                              value="Seed Rate (seeds/acre)"
                              position="bottom"
                              offset={20}
                              style={{
                                fill: chartColors.text,
                                textAnchor: "middle",
                                fontSize: 13,
                                fontWeight: 500
                              }}
                            />
                          </XAxis>
                          <YAxis
                            domain={[195, 235]}
                            stroke={chartColors.axis}
                            tick={{ fontSize: 12, fill: chartColors.text }}
                            tickFormatter={value => `${value}`}
                          >
                            <Label
                              value="Yield (bu/ac)"
                              angle={-90}
                              position="left"
                              offset={-10}
                              style={{
                                fill: chartColors.text,
                                textAnchor: "middle",
                                fontSize: 13,
                                fontWeight: 500
                              }}
                            />
                          </YAxis>
                          <Tooltip
                            formatter={(value: any) => [
                              `${value.toFixed(1)} bu/ac`,
                              ""
                            ]}
                            labelFormatter={value =>
                              `${Number(
                                value / 1000
                              ).toLocaleString()}K seeds/acre`
                            }
                            contentStyle={{
                              backgroundColor: chartColors.tooltip.bg,
                              borderColor: chartColors.tooltip.border,
                              color: chartColors.tooltip.text,
                              borderRadius: "0.375rem",
                              padding: "0.5rem 0.75rem",
                              fontSize: "0.875rem",
                              boxShadow: "0 1px 3px 0 rgba(0, 0, 0, 0.1)"
                            }}
                            itemStyle={{
                              color: chartColors.text,
                              fontSize: "0.875rem",
                              padding: "2px 0"
                            }}
                          />
                          <Legend
                            wrapperStyle={{
                              color: chartColors.text,
                              fontSize: "0.875rem",
                              paddingTop: "40px"
                            }}
                          />
                          <Bar
                            dataKey="min"
                            name="Minimum Yield"
                            fill={theme === "dark" ? "#8ecae6" : "#023e8a"}
                            radius={[4, 4, 0, 0]}
                            maxBarSize={35}
                          />
                          <Bar
                            dataKey="q1"
                            name="Lower Quartile"
                            fill={theme === "dark" ? "#a8dadc" : "#0077b6"}
                            radius={[4, 4, 0, 0]}
                            maxBarSize={35}
                          />
                          <Bar
                            dataKey="median"
                            name="Median Yield"
                            fill={theme === "dark" ? "#90be6d" : "#2a9d8f"}
                            radius={[4, 4, 0, 0]}
                            maxBarSize={35}
                          />
                          <Bar
                            dataKey="q3"
                            name="Upper Quartile"
                            fill={theme === "dark" ? "#f9c74f" : "#e76f51"}
                            radius={[4, 4, 0, 0]}
                            maxBarSize={35}
                          />
                          <Bar
                            dataKey="max"
                            name="Maximum Yield"
                            fill={theme === "dark" ? "#f8961e" : "#d62828"}
                            radius={[4, 4, 0, 0]}
                            maxBarSize={35}
                          />
                          <Line
                            type="monotone"
                            dataKey="median"
                            name="Median Trend"
                            stroke={theme === "dark" ? "#ffffff" : "#000000"}
                            strokeWidth={2}
                            dot={{
                              r: 5,
                              fill: theme === "dark" ? "#ffffff" : "#000000"
                            }}
                            activeDot={{ r: 7 }}
                          />
                        </ComposedChart>
                      </ResponsiveContainer>
                    )}
                  </div>
                </div>
              </Card>
            </motion.div>
          </div>

          {/* Insights Cards */}
          <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              <Card className="h-full border-border shadow-sm dark:bg-card/95">
                <div className="p-4 sm:p-5 bg-primary/5 dark:bg-primary/10 rounded-lg h-full">
                  <h4 className="text-sm font-medium mb-2 flex items-center gap-2 text-foreground">
                    <Target className="h-4 w-4 text-primary" />
                    Key Insights
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    The 30K and 32K seed rates show the highest median yields,
                    suggesting an optimal balance between plant population and
                    resource utilization.
                  </p>
                </div>
              </Card>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.5 }}
            >
              <Card className="h-full border-border shadow-sm dark:bg-card/95">
                <div className="p-4 sm:p-5 bg-primary/5 dark:bg-primary/10 rounded-lg h-full">
                  <h4 className="text-sm font-medium mb-2 flex items-center gap-2 text-foreground">
                    <BarChart2 className="h-4 w-4 text-primary" />
                    Variability Analysis
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    Lower seed rates (26K) show greater yield variability,
                    indicating higher sensitivity to environmental conditions
                    and field variations.
                  </p>
                </div>
              </Card>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.6 }}
            >
              <Card className="h-full border-border shadow-sm dark:bg-card/95">
                <div className="p-4 sm:p-5 bg-primary/5 dark:bg-primary/10 rounded-lg h-full">
                  <h4 className="text-sm font-medium mb-2 flex items-center gap-2 text-foreground">
                    <LineChart className="h-4 w-4 text-primary" />
                    Recommendation
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    For consistent performance across variable field conditions,
                    the 30K-32K seed rate range offers the best combination of
                    yield potential and stability.
                  </p>
                </div>
              </Card>
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.7 }}
            className="mx-auto mt-12 sm:mt-16 max-w-3xl"
          >
            <Card className="border-border shadow-sm dark:bg-card/95">
              <div className="p-5 sm:p-6 bg-gradient-to-r from-primary/10 to-primary/5 dark:from-primary/20 dark:to-primary/10 rounded-lg">
                <h3 className="text-xl font-semibold text-center mb-4 text-foreground">
                  Why On-Farm Research Matters
                </h3>
                <p className="text-center text-muted-foreground mb-6">
                  Every field is unique, with its own soil characteristics,
                  moisture patterns, and yield potential. Generic
                  recommendations often fall short because they don't account
                  for your specific conditions. On-farm research trials allow
                  you to make data-driven decisions based on results from your
                  own fields, helping you optimize inputs, maximize returns, and
                  build long-term sustainability.
                </p>
                <div className="flex justify-center">
                  <a
                    href="/#contact"
                    className="bg-primary text-primary-foreground px-6 py-3 rounded-md hover:bg-primary/80 transition-colors font-medium"
                  >
                    Learn More About Our Trials
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
