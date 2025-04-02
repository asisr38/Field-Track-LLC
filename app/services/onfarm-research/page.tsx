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
  Layers3,
  Check as CheckIcon,
  SlidersHorizontal
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
  BarChart as RechartsBarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend as RechartsLegend,
  ResponsiveContainer,
  ScatterChart,
  Scatter,
  Label,
  ComposedChart,
  Line,
  LineChart as RechartsLineChart,
  Rectangle,
  ReferenceArea,
  ErrorBar,
  Cell
} from "recharts";
import { useTheme } from "next-themes";

// Dynamically import the map components to avoid SSR issues with Leaflet
const OnFarmMap = dynamic(() => import("../../components/OnFarmMap"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[600px] bg-muted/20 animate-pulse rounded-lg flex items-center justify-center">
      <p className="text-muted-foreground">Loading trial map...</p>
    </div>
  )
});

const OnFarmTrialMap = dynamic(() => import("@/components/OnFarmTrialMap"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[600px] bg-muted/20 animate-pulse rounded-lg flex items-center justify-center">
      <p className="text-muted-foreground">Loading on-farm trial map...</p>
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

// Product Efficacy Tab Component
const ProductEfficacyTab = ({
  productData,
  productStats
}: {
  productData: any[];
  productStats: any;
}) => {
  // Ensure we have valid data for the charts - add a default fallback for empty arrays
  const validProductData =
    productData?.length > 0
      ? productData.filter(
          item =>
            typeof item?.yield === "number" &&
            !isNaN(item?.yield) &&
            typeof item?.error === "number" &&
            !isNaN(item?.error)
        )
      : [
          {
            name: "Product A",
            yield: 73.4,
            error: 3.2,
            yieldProd: 72.6,
            color: "#e6194B"
          },
          {
            name: "Product B",
            yield: 75.2,
            error: 2.8,
            yieldProd: 77.0,
            color: "#3cb44b"
          },
          {
            name: "Product C",
            yield: 68.5,
            error: 3.5,
            yieldProd: 66.8,
            color: "#ffe119"
          },
          {
            name: "Untreated",
            yield: 68.1,
            error: 4.0,
            yieldProd: 70.1,
            color: "#808080"
          }
        ];

  // Add safety to domain calculations to prevent NaN errors
  let domainMin = 64,
    domainMax = 76;

  try {
    if (validProductData.length > 0) {
      // Make sure we have valid numeric values before calculating
      const minValues = validProductData
        .map(d =>
          typeof d.yield === "number" && typeof d.error === "number"
            ? d.yield - d.error
            : null
        )
        .filter(v => v !== null && !isNaN(v));

      const maxValues = validProductData
        .map(d =>
          typeof d.yield === "number" && typeof d.error === "number"
            ? d.yield + d.error
            : null
        )
        .filter(v => v !== null && !isNaN(v));

      // Only calculate if we have valid data
      if (minValues.length > 0 && maxValues.length > 0) {
        const minYield = Math.min(...(minValues as number[]));
        const maxYield = Math.max(...(maxValues as number[]));

        // Ensure the values are valid numbers
        if (!isNaN(minYield) && !isNaN(maxYield)) {
          domainMin = Math.floor(minYield) - 1;
          domainMax = Math.ceil(maxYield) + 1;
        }
      }
    }
  } catch (e) {
    console.error("Error calculating domain bounds:", e);
    // Keep default values
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 mb-1">
        <Beaker className="w-5 h-5 text-primary" />
        <h4 className="text-base font-medium"> Performance Analysis</h4>
      </div>

      <span className="text-sm text-muted-foreground block mb-8">
        Compare performance across treatments to provide the results in your
        specific field conditions.
      </span>

      <div className="grid lg:grid-cols-5 gap-6">
        <div className="lg:col-span-3">
          <div className="bg-card rounded-lg p-4 shadow h-[450px]">
            <h5 className="text-lg font-medium mb-4">
              On-Farm Trial Results 2024
            </h5>
            <ResponsiveContainer width="100%" height="90%">
              <ComposedChart
                data={validProductData}
                margin={{ top: 20, right: 30, left: 20, bottom: 40 }}
              >
                <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                <XAxis
                  dataKey="name"
                  label={{
                    value: "Treatment",
                    position: "bottom",
                    offset: 2
                  }}
                />
                <YAxis
                  domain={[domainMin, domainMax]}
                  label={{
                    value: "Yield (Bu/Ac)",
                    angle: -90,
                    position: "insideLeft",
                    offset: 2
                  }}
                  tickCount={7}
                />
                <RechartsTooltip
                  formatter={(value, name) => {
                    if (name === "yield")
                      return [`${Number(value).toFixed(1)} bu/ac`, "Yield"];
                    if (name === "yieldProd")
                      return [`$${Number(value).toFixed(1)}`, "ROI"];
                    return [value, name];
                  }}
                />
                <Bar
                  dataKey="yield"
                  fill="#8884d8"
                  radius={[4, 4, 0, 0]}
                  barSize={60}
                >
                  {validProductData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={entry.color}
                      fillOpacity={0.8}
                    />
                  ))}
                  <ErrorBar
                    dataKey="error"
                    width={4}
                    strokeWidth={2}
                    stroke="#666"
                  />
                </Bar>
                <Scatter
                  dataKey="yield"
                  fill="#fff"
                  shape={(props: any) => {
                    const { cx, cy } = props;
                    return (
                      <circle
                        cx={cx}
                        cy={cy}
                        r={4}
                        stroke="#000"
                        strokeWidth={1}
                        fill="#fff"
                      />
                    );
                  }}
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="lg:col-span-2">
          <div className="space-y-4">
            <Card className="p-4">
              <h5 className="text-base font-medium mb-3">
                Product Summary Data
              </h5>
              <div className="space-y-3">
                {Object.keys(productStats).map(product => (
                  <div
                    key={product}
                    className="border-b border-border pb-2 last:border-0 last:pb-0"
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{
                          backgroundColor:
                            product === "Product A"
                              ? "#e6194B"
                              : product === "Product B"
                              ? "#3cb44b"
                              : product === "Product C"
                              ? "#ffe119"
                              : "#808080"
                        }}
                      />
                      <span className="font-medium">{product}</span>
                    </div>
                    <div className="pl-5 grid grid-cols-2 gap-x-2 gap-y-1 text-xs">
                      <span className="text-muted-foreground">Avg Yield:</span>
                      <span>{productStats[product]?.avgYield} bu/ac</span>
                      <span className="text-muted-foreground">
                        Yield Range:
                      </span>
                      <span>
                        {productStats[product]?.min} -{" "}
                        {productStats[product]?.max} bu/ac
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

// Multi-Year Component
const MultiYearChart = () => {
  const data = [
    { year: "2022", standard: 205, enhanced: 212, split: 218 },
    { year: "2023", standard: 215, enhanced: 224, split: 227 },
    { year: "2024", standard: 221, enhanced: 228, split: 233 }
  ];

  return (
    <ResponsiveContainer width="100%" height={200}>
      <RechartsLineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.1} />
        <XAxis dataKey="year" />
        <YAxis domain={[200, 240]} />
        <RechartsTooltip />
        <Line
          type="monotone"
          dataKey="standard"
          stroke="#8884d8"
          strokeWidth={2}
          dot={{ r: 4 }}
          name="Standard"
        />
        <Line
          type="monotone"
          dataKey="enhanced"
          stroke="#82ca9d"
          strokeWidth={2}
          dot={{ r: 4 }}
          name="Enhanced"
        />
        <Line
          type="monotone"
          dataKey="split"
          stroke="#ffc658"
          strokeWidth={2}
          dot={{ r: 4 }}
          name="Split App"
        />
      </RechartsLineChart>
    </ResponsiveContainer>
  );
};

// GDD vs NDVI Scatter Chart Component
const GDDvsNDVIChart = () => {
  // Ensure safe, valid data with default values
  const safeData = {
    productA: [
      { gdd: 1250, ndvi: 0.72, z: 215 },
      { gdd: 1320, ndvi: 0.75, z: 218 },
      { gdd: 1450, ndvi: 0.81, z: 221 }
    ],
    productB: [
      { gdd: 1280, ndvi: 0.75, z: 227 },
      { gdd: 1350, ndvi: 0.79, z: 230 },
      { gdd: 1480, ndvi: 0.85, z: 228 }
    ],
    productC: [
      { gdd: 1270, ndvi: 0.69, z: 210 },
      { gdd: 1340, ndvi: 0.73, z: 215 },
      { gdd: 1460, ndvi: 0.78, z: 220 }
    ],
    untreated: [
      { gdd: 1260, ndvi: 0.67, z: 208 },
      { gdd: 1330, ndvi: 0.7, z: 212 },
      { gdd: 1440, ndvi: 0.76, z: 216 }
    ]
  };

  return (
    <ResponsiveContainer width="100%" height={300}>
      <ScatterChart margin={{ top: 20, right: 20, bottom: 40, left: 20 }}>
        <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
        <XAxis
          type="number"
          dataKey="gdd"
          name="GDD"
          domain={[1200, 1600]}
          label={{ value: "Growing Degree Days", position: "bottom" }}
        />
        <YAxis
          type="number"
          dataKey="ndvi"
          name="NDVI"
          domain={[0.6, 0.9]}
          label={{ value: "NDVI Value", angle: -90, position: "insideLeft" }}
        />
        <RechartsTooltip
          formatter={(value: any, name: string) => {
            if (name === "NDVI" && typeof value === "number" && !isNaN(value))
              return [value.toFixed(2), name];
            return [value, name];
          }}
          cursor={{ strokeDasharray: "3 3" }}
        />
        <Scatter
          name="Product A"
          data={safeData.productA}
          fill="#e6194B"
          opacity={0.7}
        />
        <Scatter
          name="Product B"
          data={safeData.productB}
          fill="#3cb44b"
          opacity={0.7}
        />
        <Scatter
          name="Product C"
          data={safeData.productC}
          fill="#ffe119"
          opacity={0.7}
        />
        <Scatter
          name="Untreated"
          data={safeData.untreated}
          fill="#808080"
          opacity={0.7}
        />
        <RechartsLegend />
      </ScatterChart>
    </ResponsiveContainer>
  );
};

export default function OnFarmResearchPage() {
  const [isClient, setIsClient] = useState(false);
  const [trialResults, setTrialResults] = useState<any[]>([]);
  const [scatterData, setScatterData] = useState<any[]>([]);
  const [boxPlotData, setBoxPlotData] = useState<any[]>([]);
  const [combinedData, setCombinedData] = useState<any[]>([]);
  const [onFarmView, setOnFarmView] = useState<
    "product" | "replication" | "yield"
  >("product");
  const [selectedAnalysisTab, setSelectedAnalysisTab] =
    useState("product-efficacy");
  const { theme } = useTheme();

  // Preprocess on-farm yield data for product analysis
  const [productData, setProductData] = useState<any[]>([]);
  const [productStats, setProductStats] = useState<any>({});

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

    try {
      // Process trial data for visualization safely
      let processedData: any[] = [];

      if (
        trialData &&
        trialData.features &&
        Array.isArray(trialData.features)
      ) {
        processedData = trialData.features
          .reduce((acc: any[], feature: any) => {
            if (!feature || !feature.properties) return acc;

            // Safely parse values with fallbacks
            const seedRate = parseInt(feature.properties.tgt_seed) || 0;
            const yield_value = parseFloat(feature.properties.Yield) || 0;

            // Skip invalid entries
            if (
              isNaN(seedRate) ||
              isNaN(yield_value) ||
              seedRate <= 0 ||
              yield_value <= 0
            ) {
              return acc;
            }

            const existingRate = acc.find((d: any) => d.seedRate === seedRate);
            if (existingRate) {
              existingRate.plots += 1;
              existingRate.totalYield += yield_value;
              existingRate.avgYield =
                existingRate.totalYield / existingRate.plots;
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
      }

      // If we have no valid data, use fallback data
      if (processedData.length === 0) {
        processedData = [
          {
            seedRate: 26000,
            plots: 5,
            totalYield: 1070,
            avgYield: 214,
            yieldValues: [210, 212, 216, 220, 212],
            color: seedRateColors[26000]
          },
          {
            seedRate: 28000,
            plots: 5,
            totalYield: 1095,
            avgYield: 219,
            yieldValues: [215, 218, 220, 225, 217],
            color: seedRateColors[28000]
          },
          {
            seedRate: 30000,
            plots: 5,
            totalYield: 1130,
            avgYield: 226,
            yieldValues: [220, 225, 230, 228, 227],
            color: seedRateColors[30000]
          },
          {
            seedRate: 32000,
            plots: 5,
            totalYield: 1140,
            avgYield: 228,
            yieldValues: [225, 227, 230, 228, 230],
            color: seedRateColors[32000]
          },
          {
            seedRate: 34000,
            plots: 5,
            totalYield: 1125,
            avgYield: 225,
            yieldValues: [220, 228, 225, 230, 222],
            color: seedRateColors[34000]
          }
        ];
      }

      setTrialResults(processedData);

      // Safely create scatter plot data
      let scatterPoints: any[] = [];

      if (
        trialData &&
        trialData.features &&
        Array.isArray(trialData.features)
      ) {
        scatterPoints = trialData.features
          .filter(
            (feature: any) =>
              feature &&
              feature.properties &&
              !isNaN(parseFloat(feature.properties.Yield)) &&
              !isNaN(parseInt(feature.properties.tgt_seed))
          )
          .map((feature: any) => ({
            seedRate: parseInt(feature.properties.tgt_seed),
            yield: parseFloat(feature.properties.Yield),
            plotId: feature.properties.ID_1 || "",
            color:
              seedRateColors[parseInt(feature.properties.tgt_seed)] ||
              (theme === "dark" ? "#90be6d" : "#2a9d8f")
          }));
      }

      // Fallback scatter data if needed
      if (scatterPoints.length === 0) {
        scatterPoints = processedData.flatMap(group =>
          group.yieldValues.map((y: number, i: number) => ({
            seedRate: group.seedRate,
            yield: y,
            plotId: `Plot-${group.seedRate}-${i}`,
            color: group.color
          }))
        );
      }

      setScatterData(scatterPoints);

      // Create box plot data safely
      const safeBoxPlotData = processedData.map((item: any) => {
        try {
          // Sort yield values for calculating quartiles
          const sortedYields = [...item.yieldValues].sort(
            (a: number, b: number) => a - b
          );
          const n = sortedYields.length;

          if (n === 0) {
            return {
              seedRate: item.seedRate,
              median: 0,
              q1: 0,
              q3: 0,
              min: 0,
              max: 0,
              color: item.color
            };
          }

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
            median: isNaN(median) ? 0 : median,
            q1: isNaN(q1) ? 0 : q1,
            q3: isNaN(q3) ? 0 : q3,
            min: isNaN(min) ? 0 : min,
            max: isNaN(max) ? 0 : max,
            color: item.color
          };
        } catch (error) {
          console.error("Error calculating box plot data:", error);
          return {
            seedRate: item.seedRate,
            median: item.avgYield || 0,
            q1: item.avgYield - 5 || 0,
            q3: item.avgYield + 5 || 0,
            min: item.avgYield - 10 || 0,
            max: item.avgYield + 10 || 0,
            color: item.color
          };
        }
      });

      setBoxPlotData(safeBoxPlotData);

      // Create a combined dataset safely
      const safeCombinedDataset = safeBoxPlotData.map(
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

      setCombinedData(safeCombinedDataset);
    } catch (error) {
      console.error("Error processing trial data:", error);
      // Use fallback data in case of error
      const fallbackData = [
        {
          seedRate: 26000,
          avgYield: 214,
          color: seedRateColors[26000] || "#023e8a"
        },
        {
          seedRate: 28000,
          avgYield: 219,
          color: seedRateColors[28000] || "#0077b6"
        },
        {
          seedRate: 30000,
          avgYield: 226,
          color: seedRateColors[30000] || "#2a9d8f"
        },
        {
          seedRate: 32000,
          avgYield: 228,
          color: seedRateColors[32000] || "#e76f51"
        },
        {
          seedRate: 34000,
          avgYield: 225,
          color: seedRateColors[34000] || "#d62828"
        }
      ];
      setTrialResults(fallbackData);

      // Fallback for other data structures
      setBoxPlotData(
        fallbackData.map(item => ({
          seedRate: item.seedRate,
          median: item.avgYield,
          q1: item.avgYield - 5,
          q3: item.avgYield + 5,
          min: item.avgYield - 10,
          max: item.avgYield + 10,
          color: item.color
        }))
      );

      setCombinedData(
        fallbackData.map(item => ({
          seedRate: item.seedRate,
          median: item.avgYield,
          q1: item.avgYield - 5,
          q3: item.avgYield + 5,
          min: item.avgYield - 10,
          max: item.avgYield + 10,
          color: item.color
        }))
      );

      setScatterData(
        fallbackData.flatMap(item => [
          {
            seedRate: item.seedRate,
            yield: item.avgYield - 8,
            plotId: `Plot1-${item.seedRate}`,
            color: item.color
          },
          {
            seedRate: item.seedRate,
            yield: item.avgYield - 4,
            plotId: `Plot2-${item.seedRate}`,
            color: item.color
          },
          {
            seedRate: item.seedRate,
            yield: item.avgYield,
            plotId: `Plot3-${item.seedRate}`,
            color: item.color
          },
          {
            seedRate: item.seedRate,
            yield: item.avgYield + 4,
            plotId: `Plot4-${item.seedRate}`,
            color: item.color
          },
          {
            seedRate: item.seedRate,
            yield: item.avgYield + 8,
            plotId: `Plot5-${item.seedRate}`,
            color: item.color
          }
        ])
      );
    }
  }, [theme]);

  useEffect(() => {
    if (isClient) {
      try {
        // Import the actual plot data
        import("@/public/onfarm/Plots_250316_v2.json").then(plotsDataModule => {
          const plotsData = plotsDataModule.default;

          // Extract real data from Plots_250316_v2.json
          if (
            plotsData &&
            plotsData.features &&
            Array.isArray(plotsData.features)
          ) {
            // Group by product for analysis
            const productGroups = plotsData.features.reduce(
              (acc: any, feature: any) => {
                if (!feature || !feature.properties) return acc;

                const product = feature.properties.Product;
                if (!product) return acc;

                if (!acc[product]) {
                  acc[product] = [];
                }

                // Extract real values from the JSON data
                const yield_value = parseFloat(feature.properties.Yield) || 0;
                const yieldProd =
                  parseFloat(feature.properties.Yield_Prod) || 0;

                if (!isNaN(yield_value) && !isNaN(yieldProd)) {
                  acc[product].push({
                    id: feature.properties.id || "unknown",
                    yield: yield_value,
                    seedRate: feature.properties.SeedRate || 0,
                    yieldProd: yieldProd,
                    treatment: feature.properties.Treatment,
                    replication: feature.properties.Replicatio
                  });
                }

                return acc;
              },
              {}
            );

            // Calculate statistics based on the actual data
            const stats: any = {};
            const chartData = Object.keys(productGroups)
              .sort((a, b) => {
                const order = [
                  "Product A",
                  "Product B",
                  "Product C",
                  "Untreated"
                ];
                return order.indexOf(a) - order.indexOf(b);
              })
              .map(product => {
                const yields = productGroups[product].map(
                  (item: any) => item.yield
                );
                const yieldProds = productGroups[product].map(
                  (item: any) => item.yieldProd
                );

                // Handle empty arrays
                if (yields.length === 0) return null;

                let avgYield =
                  yields.reduce((sum: number, y: number) => sum + y, 0) /
                  yields.length;
                let avgYieldProd =
                  yieldProds.reduce((sum: number, y: number) => sum + y, 0) /
                  yieldProds.length;

                // Calculate standard deviation safely
                let stdDev = 0;
                try {
                  stdDev = Math.sqrt(
                    yields.reduce(
                      (sum: number, y: number) =>
                        sum + Math.pow(y - avgYield, 2),
                      0
                    ) / yields.length
                  );
                } catch (e) {
                  console.error("Error calculating stdDev:", e);
                }

                // Handle NaN values
                if (isNaN(stdDev)) stdDev = 0;
                if (isNaN(avgYield)) avgYield = 0;
                if (isNaN(avgYieldProd)) avgYieldProd = 0;

                stats[product] = {
                  avgYield: avgYield.toFixed(1),
                  stdDev: stdDev.toFixed(1),
                  min: Math.min(...yields).toFixed(1),
                  max: Math.max(...yields).toFixed(1),
                  avgYieldProd: avgYieldProd.toFixed(1),
                  count: yields.length
                };

                return {
                  name: product,
                  yield: avgYield,
                  error: stdDev,
                  yieldProd: avgYieldProd,
                  color:
                    product === "Product A"
                      ? "#e6194B"
                      : product === "Product B"
                      ? "#3cb44b"
                      : product === "Product C"
                      ? "#ffe119"
                      : "#808080"
                };
              })
              .filter(Boolean); // Remove null entries

            setProductData(chartData);
            setProductStats(stats);
          }
        });
      } catch (error) {
        console.error("Error in product data processing:", error);
      }
    }
  }, [isClient]);

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
              On-Farm <span className="text-primary">Research</span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              On-farm trials provide valuable, data-driven insights tailored to
              specific field conditions, offering a more precise approach than
              generalized recommendations. Our service helps validate practices
              with real-world data, empowering informed decision-making.
            </p>
          </motion.div>
        </div>
      </section>
      <div className="container mx-auto px-4 pb-12">
        <div className="grid md:grid-cols-3 gap-6">
          <Card className="p-5 hover:border-primary/50 transition-colors">
            <div className="bg-muted/20 rounded-full w-12 h-12 mb-4 flex items-center justify-center">
              <Beaker className="w-6 h-6 text-primary" />
            </div>
            <h5 className="font-medium text-base mb-2">Rate Testing</h5>
            <p className="text-sm text-muted-foreground">
              Compare different application rates for inputs.
            </p>
          </Card>

          <Card className="p-5 hover:border-primary/50 transition-colors">
            <div className="bg-muted/20 rounded-full w-12 h-12 mb-4 flex items-center justify-center">
              <Microscope className="w-6 h-6 text-primary" />
            </div>
            <h5 className="font-medium text-base mb-2">Variety Trials</h5>
            <p className="text-sm text-muted-foreground">
              Evaluate the performance of various crop hybrids or varieties.
            </p>
          </Card>

          <Card className="p-5 hover:border-primary/50 transition-colors">
            <div className="bg-muted/20 rounded-full w-12 h-12 mb-4 flex items-center justify-center">
              <SplitSquareHorizontal className="w-6 h-6 text-primary" />
            </div>
            <h5 className="font-medium text-base mb-2">Product Comparisons</h5>{" "}
            <p className="text-sm text-muted-foreground">
              Test standalone or combinations of ag products, timings, etc.
            </p>
          </Card>
        </div>
      </div>
      {/* Main Content Section */}
      <div className="container mx-auto px-4 pb-12">
        <div className="space-y-12">
          {/* Trial Example #1 */}
          <Card className="p-8">
            <div className="space-y-8">
              {/* Trial Layout Section */}
              <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center gap-3 border-b border-border pb-4">
                  <Map className="w-7 h-7 text-primary" />
                  <div>
                    <h3 className="text-lg font-semibold">
                      On-Farm Strip Trial
                    </h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      Real-world field trials with different treatments evaluate
                      performance.
                    </p>
                  </div>
                </div>
                <div className="bg-muted/50 rounded-lg p-4 shadow-inner">
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-4 gap-3">
                    <div className="grid grid-cols-2 sm:flex sm:flex-row sm:items-center gap-1 sm:space-x-0">
                      <button
                        className={`text-sm font-medium cursor-pointer px-3 py-1 rounded-bl-md sm:rounded-none ${
                          onFarmView === "product"
                            ? "bg-primary text-white"
                            : "bg-muted text-muted-foreground"
                        }`}
                        onClick={() => setOnFarmView("product")}
                      >
                        Product
                      </button>{" "}
                      <button
                        className={`text-sm font-medium cursor-pointer px-3 py-1 rounded-tr-md sm:rounded-none ${
                          onFarmView === "replication"
                            ? "bg-primary text-white"
                            : "bg-muted text-muted-foreground"
                        }`}
                        onClick={() => setOnFarmView("replication")}
                      >
                        Replication
                      </button>
                      <button
                        className={`text-sm font-medium cursor-pointer px-3 py-1 rounded-br-md sm:rounded-none sm:rounded-tr-md sm:rounded-br-md ${
                          onFarmView === "yield"
                            ? "bg-primary text-white"
                            : "bg-muted text-muted-foreground"
                        }`}
                        onClick={() => setOnFarmView("yield")}
                      >
                        Yield
                      </button>
                    </div>
                  </div>
                  <div className="h-[600px] w-full rounded-lg overflow-hidden">
                    {isClient && <OnFarmTrialMap view={onFarmView} />}
                  </div>
                </div>

                {/* Trial Information Grid */}
                <div className="grid sm:grid-cols-3 gap-6">
                  <DataCard
                    title="Trial Information"
                    icon={<FileBarChart className="w-5 h-5" />}
                  >
                    <div className="space-y-2">
                      <DataRow label="Location" value="Southeast Missouri" />
                      <DataRow label="Crop" value="Corn" />
                      <DataRow label="Planting Date" value="April 2, 2024" />
                      <DataRow
                        label="Harvest Date"
                        value="September 15, 2024"
                      />
                      <DataRow label="Number of Plots" value={12} />
                    </div>
                  </DataCard>

                  <DataCard
                    title="Study Design"
                    icon={<Target className="w-5 h-5" />}
                  >
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center p-3 bg-muted/50 rounded-lg">
                        <div className="text-lg font-semibold text-primary">
                          4
                        </div>
                        <div className="text-sm text-muted-foreground">
                          Treatments
                        </div>
                      </div>
                      <div className="text-center p-3 bg-muted/50 rounded-lg">
                        <div className="text-lg font-semibold text-primary">
                          3
                        </div>
                        <div className="text-sm text-muted-foreground">
                          Replications
                        </div>
                      </div>
                      <div className="text-center p-3 bg-muted/50 rounded-lg">
                        <div className="text-lg font-semibold text-primary">
                          12
                        </div>
                        <div className="text-sm text-muted-foreground">
                          Total Plots
                        </div>
                      </div>
                      <div className="text-center p-3 bg-muted/50 rounded-lg">
                        <div className="text-lg font-semibold text-primary">
                          60'x300'
                        </div>
                        <div className="text-sm text-muted-foreground">
                          Plot Size
                        </div>
                      </div>
                    </div>
                  </DataCard>

                  <DataCard
                    title="Trial Summary"
                    icon={<BarChart2 className="w-5 h-5" />}
                  >
                    <div className="space-y-2">
                      <DataRow label="Average Yield" value="222.1 bu/ac" />
                      <DataRow label="Yield Range" value="198 - 233 bu/ac" />
                      <DataRow label="Top Treatment" value="Product B" />
                    </div>
                  </DataCard>
                </div>
              </div>

              {/* Analysis Section */}
              <div className="space-y-6">
                <Tabs
                  defaultValue="product-efficacy"
                  onValueChange={setSelectedAnalysisTab}
                >
                  <div className="overflow-x-auto pb-2">
                    <TabsList className="mb-6 w-full flex flex-nowrap min-w-max md:w-auto">
                      <TabsTrigger
                        className="flex-1 text-xs sm:text-sm whitespace-nowrap"
                        value="product-efficacy"
                      >
                        Efficacy
                      </TabsTrigger>
                      <TabsTrigger
                        className="flex-1 text-xs sm:text-sm whitespace-nowrap"
                        value="validate-practices"
                      >
                        Validate Practices
                      </TabsTrigger>
                      <TabsTrigger
                        className="flex-1 text-xs sm:text-sm whitespace-nowrap"
                        value="spatial-integration"
                      >
                        Spatial Integration
                      </TabsTrigger>
                    </TabsList>
                  </div>

                  <TabsContent value="product-efficacy">
                    <ProductEfficacyTab
                      productData={productData}
                      productStats={productStats}
                    />
                  </TabsContent>

                  <TabsContent value="validate-practices" className="space-y-6">
                    <div className="flex items-center gap-2 mb-1">
                      <CheckIcon className="w-5 h-5 text-primary" />
                      <h4 className="text-base font-medium">
                        Validate Current Practices
                      </h4>
                    </div>

                    <span className="text-sm text-muted-foreground block mb-6">
                      Compare your current management practices against
                      alternatives to confirm effectiveness and identify
                      opportunities for improvement.
                    </span>

                    <div className="mt-8">
                      <Card className="p-6 bg-muted/10">
                        <h5 className="text-base font-medium mb-4 flex items-center gap-2">
                          <Target className="w-5 h-5 text-primary" />
                          <span>Practice Validation Process</span>
                        </h5>

                        <div className="grid md:grid-cols-3 gap-6">
                          <div className="space-y-3">
                            <div className="flex items-center gap-2">
                              <div className="rounded-full bg-primary/20 w-8 h-8 flex items-center justify-center text-primary font-medium">
                                1
                              </div>
                              <h6 className="font-medium">Design</h6>
                            </div>
                            <p className="text-sm text-muted-foreground pl-10">
                              We work with you to identify practices you want to
                              validate and design trials with proper controls
                              and replications.
                            </p>
                          </div>

                          <div className="space-y-3">
                            <div className="flex items-center gap-2">
                              <div className="rounded-full bg-primary/20 w-8 h-8 flex items-center justify-center text-primary font-medium">
                                2
                              </div>
                              <h6 className="font-medium">Implementation</h6>
                            </div>
                            <p className="text-sm text-muted-foreground pl-10">
                              Trials are established in your fields using
                              precision equipment to ensure accurate application
                              and data collection.
                            </p>
                          </div>

                          <div className="space-y-3">
                            <div className="flex items-center gap-2">
                              <div className="rounded-full bg-primary/20 w-8 h-8 flex items-center justify-center text-primary font-medium">
                                3
                              </div>
                              <h6 className="font-medium">Analysis</h6>
                            </div>
                            <p className="text-sm text-muted-foreground pl-10">
                              Results are analyzed using statistical methods to
                              determine significant differences and provide
                              actionable recommendations.
                            </p>
                          </div>
                        </div>
                      </Card>
                    </div>
                  </TabsContent>

                  <TabsContent
                    value="spatial-integration"
                    className="space-y-6"
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <Layers3 className="w-5 h-5 text-primary" />
                      <h4 className="text-base font-medium">
                        Spatial Data Integration
                      </h4>
                    </div>

                    <span className="text-sm text-muted-foreground block mb-6">
                      Combine trial results with other spatial data layers to
                      understand performance in the context of field variability
                      and environmental factors.
                    </span>

                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                      <Card className="p-4 flex flex-col h-full hover:border-primary transition-colors">
                        <div className="bg-muted/20 rounded-full w-12 h-12 mb-3 flex items-center justify-center">
                          <Layers3 className="w-6 h-6 text-primary" />
                        </div>
                        <h5 className="font-medium text-sm mb-2">
                          WSS Soil Types
                        </h5>
                        <p className="text-xs text-muted-foreground mt-auto">
                          Overlay trial data with USDA soil survey maps to
                          understand how different soil types affect product
                          performance and yield response.
                        </p>
                      </Card>

                      <Card className="p-4 flex flex-col h-full hover:border-primary transition-colors">
                        <div className="bg-muted/20 rounded-full w-12 h-12 mb-3 flex items-center justify-center">
                          <ArrowUpDown className="w-6 h-6 text-primary" />
                        </div>
                        <h5 className="font-medium text-sm mb-2">
                          Terrain Indices
                        </h5>
                        <p className="text-xs text-muted-foreground mt-auto">
                          Analyze how elevation, slope, and water flow affect
                          treatment efficacy and identify optimal management
                          zones based on topography.
                        </p>
                      </Card>

                      <Card className="p-4 flex flex-col h-full hover:border-primary transition-colors">
                        <div className="bg-muted/20 rounded-full w-12 h-12 mb-3 flex items-center justify-center">
                          <Sprout className="w-6 h-6 text-primary" />
                        </div>
                        <h5 className="font-medium text-sm mb-2">
                          Vegetative Reflectance (NDVI)
                        </h5>
                        <p className="text-xs text-muted-foreground mt-auto">
                          Correlate seasonal crop health imagery with treatment
                          responses to identify patterns in plant vigor across
                          different management practices.
                        </p>
                      </Card>

                      <Card className="p-4 flex flex-col h-full hover:border-primary transition-colors">
                        <div className="bg-muted/20 rounded-full w-12 h-12 mb-3 flex items-center justify-center">
                          <Grid className="w-6 h-6 text-primary" />
                        </div>
                        <h5 className="font-medium text-sm mb-2">
                          Custom Management Zones
                        </h5>
                        <p className="text-xs text-muted-foreground mt-auto">
                          Create tailored management zones based on multiple
                          data layers to optimize inputs and maximize ROI across
                          variable field conditions.
                        </p>
                      </Card>
                    </div>
                  </TabsContent>
                </Tabs>
              </div>
            </div>
          </Card>

          {/* Trial Example #2 */}
          <Card className="p-8">
            <div className="space-y-8">
              {/* Header */}

              {/* Trial Layout Section */}
              <div className="space-y-6">
                <div className="flex items-center gap-3 border-b border-border pb-4">
                  <Map className="w-8 h-8 text-primary" />
                  <div>
                    <h3 className="text-lg font-semibold">
                      Seeding Rate Trial
                    </h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      Discover the optimal seed rates for your fields through
                      data-driven field trials and real-world performance
                      analysis.
                    </p>
                  </div>
                </div>
                <div className="bg-muted/50 rounded-lg p-4 shadow-inner">
                  <div className="h-[600px] w-full rounded-lg overflow-hidden">
                    {isClient && <OnFarmMap />}
                  </div>
                </div>

                {/* Trial Information Grid */}
                <div className="grid sm:grid-cols-3 gap-6">
                  <DataCard
                    title="Trial Information"
                    icon={<FileBarChart className="w-5 h-5" />}
                  >
                    <div className="space-y-2">
                      <DataRow label="Location" value="Central Illinois" />
                      <DataRow label="Crop" value="Corn" />
                      <DataRow label="Planting Date" value="April 15, 2024" />
                      <DataRow label="Harvest Date" value="October 10, 2024" />
                      <DataRow
                        label="Number of Plots"
                        value={trialData.features.length.toString()}
                      />
                    </div>
                  </DataCard>

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
                          32
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
                          300'x35ft
                        </div>
                        <div className="text-sm text-muted-foreground">
                          Plot Size
                        </div>
                      </div>
                    </div>
                  </DataCard>

                  <DataCard
                    title="Map Legend"
                    icon={<Layers3 className="w-5 h-5" />}
                  >
                    <p className="text-sm text-muted-foreground mb-3">
                      The map uses color coding to represent different seed
                      rates:
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
                </div>
              </div>

              {/* Results Analysis Section */}
              <div className="space-y-6">
                <p className="text-sm text-muted-foreground mb-4">
                  Comprehensive analysis of yield performance across different
                  seeding rates, helping determine optimal planting density for
                  your specific field conditions.
                </p>
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
                          This chart shows the average yield for each seed rate,
                          helping identify which planting density produces the
                          highest overall yields.
                        </p>
                        <div className="h-[350px] sm:h-[400px]">
                          <ResponsiveContainer width="100%" height="100%">
                            <RechartsBarChart
                              data={trialResults}
                              margin={{
                                top: 20,
                                right: 30,
                                left: 20,
                                bottom: 30
                              }}
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
                              <RechartsTooltip
                                formatter={(value: any) => [
                                  `${value.toFixed(1)}`,
                                  "bu/ac"
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
                              />
                              <RechartsLegend
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
                            </RechartsBarChart>
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
                          This chart shows the yield distribution statistics for
                          each seed rate, including minimum, lower quartile,
                          median, upper quartile, and maximum values. Higher
                          bars indicate better yield performance across
                          different field conditions.
                        </p>
                        <div className="h-[350px] sm:h-[400px]">
                          {isClient && (
                            <ResponsiveContainer width="100%" height="100%">
                              <ComposedChart
                                margin={{
                                  top: 20,
                                  right: 30,
                                  left: 20,
                                  bottom: 30
                                }}
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
                                  tick={{
                                    fontSize: 12,
                                    fill: chartColors.text
                                  }}
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
                                  tick={{
                                    fontSize: 12,
                                    fill: chartColors.text
                                  }}
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
                                <RechartsTooltip
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
                                <RechartsLegend
                                  wrapperStyle={{
                                    color: chartColors.text,
                                    fontSize: "0.875rem",
                                    paddingTop: "40px"
                                  }}
                                />
                                <Bar
                                  dataKey="min"
                                  name="Minimum Yield"
                                  fill={
                                    theme === "dark" ? "#8ecae6" : "#023e8a"
                                  }
                                  radius={[4, 4, 0, 0]}
                                  maxBarSize={35}
                                />
                                <Bar
                                  dataKey="q1"
                                  name="Lower Quartile"
                                  fill={
                                    theme === "dark" ? "#a8dadc" : "#0077b6"
                                  }
                                  radius={[4, 4, 0, 0]}
                                  maxBarSize={35}
                                />
                                <Bar
                                  dataKey="median"
                                  name="Median Yield"
                                  fill={
                                    theme === "dark" ? "#90be6d" : "#2a9d8f"
                                  }
                                  radius={[4, 4, 0, 0]}
                                  maxBarSize={35}
                                />
                                <Bar
                                  dataKey="q3"
                                  name="Upper Quartile"
                                  fill={
                                    theme === "dark" ? "#f9c74f" : "#e76f51"
                                  }
                                  radius={[4, 4, 0, 0]}
                                  maxBarSize={35}
                                />
                                <Bar
                                  dataKey="max"
                                  name="Maximum Yield"
                                  fill={
                                    theme === "dark" ? "#f8961e" : "#d62828"
                                  }
                                  radius={[4, 4, 0, 0]}
                                  maxBarSize={35}
                                />
                                <Line
                                  type="monotone"
                                  dataKey="median"
                                  name="Median Trend"
                                  stroke={
                                    theme === "dark" ? "#ffffff" : "#000000"
                                  }
                                  strokeWidth={2}
                                  dot={{
                                    r: 5,
                                    fill:
                                      theme === "dark" ? "#ffffff" : "#000000"
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
                          The 30K and 32K seed rates show the highest median
                          yields, suggesting an optimal balance between plant
                          population and resource utilization.
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
                          indicating higher sensitivity to environmental
                          conditions and field variations.
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
                          For consistent performance across variable field
                          conditions, the 30K-32K seed rate range offers the
                          best combination of yield potential and stability.
                        </p>
                      </div>
                    </Card>
                  </motion.div>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Why On-Farm Research Matters Section */}
      <div className="container mx-auto px-4 pb-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.7 }}
          className="max-w-3xl mx-auto"
        >
          <Card className="border-border shadow-sm dark:bg-card/95">
            <div className="p-5 sm:p-6 bg-gradient-to-r from-primary/10 to-primary/5 dark:from-primary/20 dark:to-primary/10 rounded-lg">
              <h3 className="text-xl font-semibold text-center mb-4 text-foreground">
                Why On-Farm Research Matters
              </h3>
              <p className="text-center text-muted-foreground mb-6">
                Every field is unique, with its own soil characteristics,
                moisture patterns, and yield potential. Generic recommendations
                often fall short because they don't account for your specific
                conditions. On-farm research trials allow you to make
                data-driven decisions based on results from your own fields,
                helping you optimize inputs, maximize returns, and build
                long-term sustainability.
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
    </div>
  );
}
