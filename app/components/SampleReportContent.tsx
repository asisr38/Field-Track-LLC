"use client";

import { motion, Variants } from "framer-motion";
import Image from "next/image";
import {
  Map,
  Ruler,
  BoxSelect,
  Shield,
  Clock,
  Layout,
  TrendingUp,
  Calculator,
  Calendar,
  Package,
  HelpCircle,
  LineChart,
  Settings,
  ArrowRight,
  FileBarChart,
  Layers3,
  Download
} from "lucide-react";
import Link from "next/link";
import React, {
  useEffect,
  useRef,
  useState,
  useCallback,
  useMemo
} from "react";
import fieldData from "../data/Boundary_Demo.json";
import soilSampleData from "../data/Point_Demo.json";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";
import type { Map as LeafletMap, Control } from "leaflet";

// Define interfaces for the Leaflet types we need
interface LeafletStatic {
  Map: any;
  control: any;
  tileLayer: any;
  geoJSON: any;
  featureGroup: any;
  circleMarker: any;
  DomUtil: any;
}

declare global {
  interface Window {
    L: any; // Keep as any to avoid type conflicts
  }
}

interface LegendControl {
  onAdd(map: any): HTMLElement;
  addTo(map: any): void;
}

interface FieldFeature {
  type: "Feature";
  properties: {
    name: string;
  };
  geometry: {
    type: "Polygon";
    coordinates: number[][][];
  };
}

// Define interface for soil sample properties
interface SampleProperties {
  SampleID: number;
  "pH (1_1)": number;
  "P (B1 1_7)": number;
  "K (AA)": number;
  [key: string]: any; // Allow for dynamic property access with string keys
}

// Soil analysis data
const soilData = [
  {
    id: 1,
    ph: 7.0,
    cec: 8.6,
    om: 2.2,
    p: 27,
    k: 136,
    ca_ppm: 1347,
    mg_ppm: 183,
    ca_pct: 78.2,
    k_pct: 4.1,
    mg_pct: 17.7,
    h: "NA"
  },
  {
    id: 2,
    ph: 5.1,
    cec: 7.8,
    om: 1.9,
    p: 32,
    k: 80,
    ca_ppm: 636,
    mg_ppm: 93,
    ca_pct: 41.0,
    k_pct: 2.6,
    mg_pct: 10.0,
    h: 46.4
  },
  {
    id: 3,
    ph: 6.8,
    cec: 8.7,
    om: 2.6,
    p: 12,
    k: 115,
    ca_ppm: 1347,
    mg_ppm: 172,
    ca_pct: 77.6,
    k_pct: 3.4,
    mg_pct: 16.5,
    h: 2.4
  },
  {
    id: 4,
    ph: 7.2,
    cec: 8.8,
    om: 2.2,
    p: 33,
    k: 82,
    ca_ppm: 1459,
    mg_ppm: 161,
    ca_pct: 82.5,
    k_pct: 2.4,
    mg_pct: 15.2,
    h: "NA"
  },
  {
    id: 5,
    ph: 6.8,
    cec: 8.4,
    om: 2.0,
    p: 35,
    k: 97,
    ca_ppm: 1312,
    mg_ppm: 161,
    ca_pct: 78.5,
    k_pct: 3.0,
    mg_pct: 16.1,
    h: 2.5
  },
  {
    id: 6,
    ph: 5.8,
    cec: 6.7,
    om: 1.9,
    p: 63,
    k: 104,
    ca_ppm: 860,
    mg_ppm: 112,
    ca_pct: 64.2,
    k_pct: 4.0,
    mg_pct: 13.9,
    h: 17.9
  },
  {
    id: 7,
    ph: 4.9,
    cec: 11.4,
    om: 2.1,
    p: 76,
    k: 143,
    ca_ppm: 566,
    mg_ppm: 119,
    ca_pct: 24.9,
    k_pct: 3.2,
    mg_pct: 8.7,
    h: 63.2
  },
  {
    id: 8,
    ph: 5.7,
    cec: 5.2,
    om: 1.7,
    p: 19,
    k: 60,
    ca_ppm: 580,
    mg_ppm: 111,
    ca_pct: 56.0,
    k_pct: 3.0,
    mg_pct: 17.9,
    h: 23.2
  },
  {
    id: 9,
    ph: 7.0,
    cec: 9.8,
    om: 3.0,
    p: 36,
    k: 255,
    ca_ppm: 1497,
    mg_ppm: 196,
    ca_pct: 76.6,
    k_pct: 6.7,
    mg_pct: 16.7,
    h: "NA"
  },
  {
    id: 10,
    ph: 6.4,
    cec: 9.6,
    om: 2.6,
    p: 42,
    k: 183,
    ca_ppm: 1310,
    mg_ppm: 170,
    ca_pct: 68.0,
    k_pct: 4.9,
    mg_pct: 14.7,
    h: 12.5
  },
  {
    id: 11,
    ph: 4.9,
    cec: 11.9,
    om: 2.1,
    p: 35,
    k: 121,
    ca_ppm: 712,
    mg_ppm: 103,
    ca_pct: 29.8,
    k_pct: 2.6,
    mg_pct: 7.2,
    h: 60.4
  },
  {
    id: 12,
    ph: 4.6,
    cec: 24.4,
    om: 2.1,
    p: 29,
    k: 102,
    ca_ppm: 769,
    mg_ppm: 131,
    ca_pct: 15.8,
    k_pct: 1.1,
    mg_pct: 4.5,
    h: 78.7
  },
  {
    id: 13,
    ph: 5.0,
    cec: 8.0,
    om: 2.6,
    p: 32,
    k: 194,
    ca_ppm: 633,
    mg_ppm: 90,
    ca_pct: 39.5,
    k_pct: 6.2,
    mg_pct: 9.4,
    h: 44.9
  },
  {
    id: 14,
    ph: 6.0,
    cec: 7.6,
    om: 2.3,
    p: 18,
    k: 103,
    ca_ppm: 1011,
    mg_ppm: 135,
    ca_pct: 66.1,
    k_pct: 3.5,
    mg_pct: 14.7,
    h: 15.7
  }
];

// Calculate field center from GeoJSON coordinates
const calculateFieldCenter = (coordinates: number[][]) => {
  let sumLat = 0;
  let sumLng = 0;
  const n = coordinates.length;

  coordinates.forEach(coord => {
    sumLng += coord[0];
    sumLat += coord[1];
  });

  return [sumLat / n, sumLng / n];
};

// Fix for the 'new Map()' error
const createMap = () => {
  // Use a type assertion to avoid TypeScript errors
  return {} as any;
};

// Calculate field center once outside of component to avoid recalculation
const FIELD_CENTER = calculateFieldCenter(
  fieldData.features[0].geometry.coordinates[0]
);

// Field Overview Map Component
function FieldMap() {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const [selectedSample, setSelectedSample] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (
      typeof window !== "undefined" &&
      mapRef.current &&
      !mapInstanceRef.current
    ) {
      try {
        setIsLoading(true);
        const L = window.L;
        if (!L) {
          console.error("Leaflet not loaded");
          return;
        }

        // Initialize the map with performance optimizations
        const map = L.map(mapRef.current, {
          center: FIELD_CENTER,
          zoom: 16,
          minZoom: 12,
          maxZoom: 19,
          zoomControl: false, // Disable default zoom control, we'll add our own
          scrollWheelZoom: false, // Disable scroll wheel zoom
          preferCanvas: true, // Use canvas renderer for better performance
          renderer: L.canvas(), // Force canvas renderer
          tap: true, // Enable tap for mobile
          touchZoom: true // Enable pinch zoom on mobile
        });

        mapInstanceRef.current = map;

        // Add custom zoom control
        L.control
          .zoom({
            position: "bottomright",
            zoomInTitle: "Zoom in",
            zoomOutTitle: "Zoom out"
          })
          .addTo(map);

        // Define base maps
        const baseMaps = {
          Satellite: L.tileLayer(
            "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
            {
              maxZoom: 19,
              attribution:
                "© Esri — Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community"
            }
          ),
          OpenStreetMap: L.tileLayer(
            "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
            {
              maxZoom: 19,
              attribution: "© OpenStreetMap contributors"
            }
          ),
          Terrain: L.tileLayer(
            "https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}",
            {
              maxZoom: 19,
              attribution:
                "© Esri — Esri, DeLorme, NAVTEQ, TomTom, Intermap, iPC, USGS, FAO, NPS, NRCAN, GeoBase, Kadaster NL, Ordnance Survey, Esri Japan, METI, and the GIS User Community"
            }
          )
        };

        // Add the default base map (Satellite)
        baseMaps["Satellite"].addTo(map);

        // Create field boundary layer
        const fieldLayer = L.geoJSON(fieldData, {
          style: {
            color: "#22c55e",
            fillColor: "#22c55e",
            fillOpacity: 0.3,
            weight: 2
          }
        }).addTo(map);

        // Create a feature group for sample points
        const samplingLayer = L.featureGroup().addTo(map);

        // Add soil sample points
        soilSampleData.features.forEach(point => {
          const latlng = [
            point.geometry.coordinates[1],
            point.geometry.coordinates[0]
          ];

          const marker = L.circleMarker(latlng, {
            radius: 8,
            fillColor: "#3b82f6",
            color: "#fff",
            weight: 1,
            opacity: 1,
            fillOpacity: 0.8
          });

          // Only create tooltip content if it hasn't been created already
          if (
            !createMap().has(
              (point.properties as unknown as SampleProperties).SampleID
            )
          ) {
            const tooltipContent = `
              <div class="p-2">
                <div class="font-bold">Sample ID: ${
                  (point.properties as unknown as SampleProperties).SampleID
                }</div>
                <div>pH: ${
                  (point.properties as unknown as SampleProperties)["pH (1_1)"]
                }</div>
                <div>P: ${
                  (point.properties as unknown as SampleProperties)[
                    "P (B1 1_7)"
                  ]
                } ppm</div>
                <div>K: ${
                  (point.properties as unknown as SampleProperties)["K (AA)"]
                } ppm</div>
              </div>
            `;
            createMap().set(
              (point.properties as unknown as SampleProperties).SampleID,
              tooltipContent
            );
          }

          // Use the cached tooltip content
          marker.bindTooltip(
            createMap().get(
              (point.properties as unknown as SampleProperties).SampleID
            ),
            {
              direction: "top",
              offset: [0, -10]
            }
          );

          marker.on("click", () => {
            setSelectedSample(point.properties);
          });

          samplingLayer.addLayer(marker);
        });

        // Add layer controls
        L.control
          .layers(
            baseMaps,
            {
              "Field Boundary": fieldLayer,
              "Sampling Points": samplingLayer
            },
            {
              collapsed: false,
              position: "topright"
            }
          )
          .addTo(map);

        // Add scale control
        L.control
          .scale({
            imperial: true,
            metric: true,
            position: "bottomright"
          })
          .addTo(map);

        // Fit map to field bounds with padding
        const bounds = fieldLayer.getBounds();
        if (bounds.isValid()) {
          map.fitBounds(bounds.pad(0.1));
        }

        // Clean up on unmount
        return () => {
          // Only attempt to remove the map if it was created
          if (mapInstanceRef.current) {
            mapInstanceRef.current.remove();
            mapInstanceRef.current = null;
          }
        };
      } catch (error) {
        console.error("Error initializing map:", error);
      } finally {
        setIsLoading(false);
      }
    }
  }, []);

  return (
    <div className="space-y-4">
      <div className="relative h-[400px] rounded-2xl overflow-hidden border border-border/50">
        <div
          ref={mapRef}
          className="w-full h-full"
          style={{ background: "#f0f0f0" }}
        />
      </div>
      {selectedSample && (
        <div className="bg-white p-4 rounded-lg shadow-lg max-w-2xl mx-auto">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-semibold text-primary">
              Sample Point{" "}
              {(selectedSample as unknown as SampleProperties).SampleID}
            </h3>
          </div>
          <div className="space-y-4">
            <div className="bg-gray-50 p-3 rounded-lg">
              <p className="mb-1">
                <span className="font-semibold text-gray-700">Date:</span>{" "}
                {new Date(selectedSample.SampleDate).toLocaleDateString()}
              </p>
              <p className="mb-1">
                <span className="font-semibold text-gray-700">Crop Year:</span>{" "}
                {selectedSample.CropYear}
              </p>
              <p>
                <span className="font-semibold text-gray-700">Depth:</span>{" "}
                {selectedSample.Depth} {selectedSample.DepthUnits}
              </p>
            </div>

            <div className="bg-gray-50 p-3 rounded-lg">
              <p className="font-semibold text-primary text-lg mb-2">
                Primary Nutrients
              </p>
              <div className="grid grid-cols-2 gap-3">
                <p>
                  <span className="font-semibold text-gray-700">pH:</span>{" "}
                  {selectedSample["pH (1_1)"]}
                </p>
                <p>
                  <span className="font-semibold text-gray-700">OM:</span>{" "}
                  {selectedSample["OM (WB)"]} {selectedSample["OM (WB)U"]}
                </p>
                <p>
                  <span className="font-semibold text-gray-700">P:</span>{" "}
                  {selectedSample["P (B1 1_7)"]} {selectedSample["P (B1 1__1"]}
                </p>
                <p>
                  <span className="font-semibold text-gray-700">K:</span>{" "}
                  {selectedSample["K (AA)"]} {selectedSample["K (AA)U"]}
                </p>
              </div>
            </div>

            <div className="bg-gray-50 p-3 rounded-lg">
              <p className="font-semibold text-primary text-lg mb-2">
                Secondary Nutrients
              </p>
              <div className="grid grid-cols-2 gap-3">
                <p>
                  <span className="font-semibold text-gray-700">Ca:</span>{" "}
                  {selectedSample["Ca (AA)"]} {selectedSample["Ca (AA)U"]}
                </p>
                <p>
                  <span className="font-semibold text-gray-700">Mg:</span>{" "}
                  {selectedSample["Mg (AA)"]} {selectedSample["Mg (AA)U"]}
                </p>
                <p>
                  <span className="font-semibold text-gray-700">S:</span>{" "}
                  {selectedSample["S (M3)"]} {selectedSample["S (M3)U"]}
                </p>
                <p>
                  <span className="font-semibold text-gray-700">CEC:</span>{" "}
                  {selectedSample["CEC (AA)"]} {selectedSample["CEC (AA)U"]}
                </p>
              </div>
            </div>

            <div className="bg-gray-50 p-3 rounded-lg">
              <p className="font-semibold text-primary text-lg mb-2">
                Base Saturation
              </p>
              <div className="grid grid-cols-2 gap-3">
                <p>
                  <span className="font-semibold text-gray-700">K:</span>{" "}
                  {selectedSample["BS-K"]}
                  {selectedSample["BS-KU"]}
                </p>
                <p>
                  <span className="font-semibold text-gray-700">Mg:</span>{" "}
                  {selectedSample["BS-Mg"]}
                  {selectedSample["BS-MgU"]}
                </p>
                <p>
                  <span className="font-semibold text-gray-700">Ca:</span>{" "}
                  {selectedSample["BS-Ca"]}
                  {selectedSample["BS-CaU"]}
                </p>
                <p>
                  <span className="font-semibold text-gray-700">Total:</span>{" "}
                  {selectedSample["BS"]}
                  {selectedSample["BSU"]}
                </p>
              </div>
            </div>

            <div className="bg-gray-50 p-3 rounded-lg">
              <p className="font-semibold text-primary text-lg mb-2">Ratios</p>
              <div className="grid grid-cols-2 gap-3">
                <p>
                  <span className="font-semibold text-gray-700">Mg/K:</span>{" "}
                  {selectedSample["Mg_K"]}
                </p>
                <p>
                  <span className="font-semibold text-gray-700">Ca/Mg:</span>{" "}
                  {selectedSample["Ca_Mg"]}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function NutrientMap() {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const [selectedNutrient, setSelectedNutrient] = useState("N");

  // Memoize the color function to avoid recalculation
  const getColor = useCallback((value: number, nutrient: string) => {
    // Different color schemes for different nutrients
    const colors = {
      N: {
        // Green shades for Nitrogen
        ranges: [0, 20, 40, 60, 80, 100, 120, 140, 160, 180],
        colors: [
          "#f7fcf5",
          "#e5f5e0",
          "#c7e9c0",
          "#a1d99b",
          "#74c476",
          "#41ab5d",
          "#238b45",
          "#006d2c",
          "#00441b",
          "#002910"
        ]
      },
      P: {
        // Red shades for Phosphorus
        ranges: [0, 20, 40, 60, 80, 100, 120, 140, 160, 180],
        colors: [
          "#fff5f0",
          "#fee0d2",
          "#fcbba1",
          "#fc9272",
          "#fb6a4a",
          "#ef3b2c",
          "#cb181d",
          "#a50f15",
          "#67000d",
          "#3f0008"
        ]
      },
      K: {
        // Blue shades for Potassium
        ranges: [0, 20, 40, 60, 80, 100, 120, 140, 160, 180],
        colors: [
          "#f7fbff",
          "#deebf7",
          "#c6dbef",
          "#9ecae1",
          "#6baed6",
          "#4292c6",
          "#2171b5",
          "#08519c",
          "#08306b",
          "#051b3f"
        ]
      }
    };

    const nutrientColors = colors[nutrient as keyof typeof colors];
    for (let i = nutrientColors.ranges.length - 1; i >= 0; i--) {
      if (value > nutrientColors.ranges[i]) {
        return nutrientColors.colors[i];
      }
    }
    return nutrientColors.colors[0];
  }, []);

  useEffect(() => {
    if (
      typeof window !== "undefined" &&
      mapRef.current &&
      !mapInstanceRef.current
    ) {
      try {
        const L = window.L;
        if (!L) {
          console.error("Leaflet not loaded");
          return;
        }

        // Initialize the map with performance optimizations
        const map = L.map(mapRef.current, {
          center: FIELD_CENTER,
          zoom: 16,
          minZoom: 12,
          maxZoom: 19,
          zoomControl: false,
          scrollWheelZoom: false,
          preferCanvas: true,
          renderer: L.canvas(),
          tap: true,
          touchZoom: true
        });

        mapInstanceRef.current = map;

        // Add custom zoom control
        L.control
          .zoom({
            position: "bottomright",
            zoomInTitle: "Zoom in",
            zoomOutTitle: "Zoom out"
          })
          .addTo(map);

        // Add satellite imagery base layer
        L.tileLayer(
          "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
          {
            maxZoom: 19,
            attribution: "© Esri"
          }
        ).addTo(map);

        // Create field boundary layer with styling
        const fieldLayer = L.geoJSON(fieldData, {
          style: {
            color: "#000",
            weight: 2,
            opacity: 1,
            fillColor: getColor(100, selectedNutrient),
            fillOpacity: 0.8
          }
        }).addTo(map);

        // Add legend
        const legend = L.control({ position: "topright" }) as LegendControl;
        legend.onAdd = function (map: L.Map): HTMLElement {
          const div = L.DomUtil.create(
            "div",
            "info legend bg-white p-2 rounded-lg shadow-lg"
          );
          const ranges = [0, 20, 40, 60, 80, 100, 120, 140, 160, 180];
          const labels = ["Very Low", "Low", "Medium", "High", "Very High"];

          let html = `<div class="text-sm font-semibold mb-2">${selectedNutrient} Rate (lb/ac)</div>`;

          for (let i = 0; i < ranges.length; i++) {
            const from = ranges[i];
            const to = ranges[i + 1];
            html += `
              <div class="flex items-center gap-2 my-1">
                <i style="background:${getColor(
                  from + 1,
                  selectedNutrient
                )}; width: 18px; height: 18px; display: inline-block;"></i>
                <span class="text-xs">${from}${to ? "&ndash;" + to : "+"}</span>
              </div>`;
          }

          div.innerHTML = html;
          return div;
        };
        legend.addTo(map);

        // Fit map to field bounds with padding
        const bounds = fieldLayer.getBounds();
        if (bounds.isValid()) {
          map.fitBounds(bounds.pad(0.1));
        }

        // Clean up on unmount
        return () => {
          if (mapInstanceRef.current) {
            mapInstanceRef.current.remove();
            mapInstanceRef.current = null;
          }
        };
      } catch (error) {
        console.error("Error initializing map:", error);
      }
    }
  }, [getColor, selectedNutrient]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <select
            value={selectedNutrient}
            onChange={e => setSelectedNutrient(e.target.value)}
            className="px-3 py-2 rounded-lg border border-border bg-background text-sm"
          >
            <option value="N">Nitrogen (N)</option>
            <option value="P">Phosphorus (P)</option>
            <option value="K">Potassium (K)</option>
          </select>
          <div className="text-sm text-muted-foreground">
            {selectedNutrient === "N" &&
              "Nitrogen map showing application rates and zones of varying N requirements"}
            {selectedNutrient === "P" &&
              "Phosphorus distribution indicating areas of deficiency and surplus"}
            {selectedNutrient === "K" &&
              "Potassium availability map highlighting zones needing targeted application"}
          </div>
        </div>
      </div>
      <div
        className="relative h-[500px] rounded-2xl overflow-hidden border border-border/50"
        style={{ zIndex: 1 }}
      >
        <div
          ref={mapRef}
          className="w-full h-full"
          style={{ background: "#f0f0f0" }}
        />
      </div>

      <style jsx global>{`
        .leaflet-control-container {
          pointer-events: auto;
        }
        .leaflet-control-zoom {
          pointer-events: auto;
        }
        .leaflet-control-zoom a {
          pointer-events: auto;
        }
      `}</style>
    </div>
  );
}

function SampleDistributionMap() {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);

  useEffect(() => {
    if (
      typeof window !== "undefined" &&
      mapRef.current &&
      !mapInstanceRef.current
    ) {
      try {
        const L = window.L;
        if (!L) {
          console.error("Leaflet not loaded");
          return;
        }

        // Initialize the map with performance optimizations
        const map = L.map(mapRef.current, {
          center: FIELD_CENTER,
          zoom: 16,
          minZoom: 12,
          maxZoom: 19,
          zoomControl: false, // Disable default zoom control, we'll add our own
          scrollWheelZoom: false, // Disable scroll wheel zoom
          preferCanvas: true, // Use canvas renderer for better performance
          renderer: L.canvas(), // Force canvas renderer
          tap: true, // Enable tap for mobile
          touchZoom: true // Enable pinch zoom on mobile
        });

        mapInstanceRef.current = map;

        // Add custom zoom control
        L.control
          .zoom({
            position: "bottomright",
            zoomInTitle: "Zoom in",
            zoomOutTitle: "Zoom out"
          })
          .addTo(map);

        // Add satellite imagery base layer
        L.tileLayer(
          "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
          {
            maxZoom: 19,
            attribution: "© Esri"
          }
        ).addTo(map);

        // Create field boundary layer with styling
        const fieldLayer = L.geoJSON(fieldData, {
          style: {
            color: "#475569",
            weight: 2,
            opacity: 0.8,
            fillColor: "#64748b",
            fillOpacity: 0.05
          }
        }).addTo(map);

        // Create sample points layer group
        const samplesLayer = L.featureGroup().addTo(map);

        // Batch process markers to improve performance
        const markerBatch: L.CircleMarker[] = [];
        soilSampleData.features.forEach(point => {
          const latlng = [
            point.geometry.coordinates[1],
            point.geometry.coordinates[0]
          ];

          const marker = L.circleMarker(latlng, {
            radius: 6,
            fillColor: "#3b82f6",
            color: "#ffffff",
            weight: 1,
            opacity: 1,
            fillOpacity: 0.8
          });

          // Keep simple tooltip without complex HTML
          marker.bindTooltip(
            `Sample ${
              (point.properties as unknown as SampleProperties).SampleID
            }`,
            {
              direction: "top",
              offset: [0, -8]
            }
          );

          markerBatch.push(marker);
          markersRef.current.push(marker);
        });

        // Add all markers at once
        const samplesGroup = L.featureGroup(markerBatch).addTo(map);

        // Add layer controls with simplified options
        L.control
          .layers(
            {},
            {
              "Sample Points": samplesGroup
            },
            {
              collapsed: false,
              position: "bottomright"
            }
          )
          .addTo(map);

        // Fit map to field bounds with padding
        const bounds = fieldLayer.getBounds();
        if (bounds.isValid()) {
          map.fitBounds(bounds.pad(0.1));
        }

        // Clean up on unmount
        return () => {
          if (mapInstanceRef.current) {
            // Clear marker references
            markersRef.current = [];
            mapInstanceRef.current.remove();
            mapInstanceRef.current = null;
          }
        };
      } catch (error) {
        console.error("Error initializing map:", error);
      }
    }
  }, []);

  return (
    <div className="space-y-4">
      <div
        className="relative h-[400px] rounded-2xl overflow-hidden border border-border/50"
        style={{ zIndex: 1 }}
      >
        <div
          ref={mapRef}
          className="w-full h-full"
          style={{ background: "#f0f0f0" }}
        />
        <style jsx global>{`
          .leaflet-control-container {
            pointer-events: auto;
          }
          .leaflet-control-zoom {
            pointer-events: auto;
          }
          .leaflet-control-zoom a {
            pointer-events: auto;
          }
        `}</style>
      </div>
      <p className="text-sm text-center text-muted-foreground">
        Each point represents a soil sample location in the field.
      </p>
    </div>
  );
}

function FertilizerRecommendations() {
  // Calculate average values from soil data
  const averages = useMemo(() => {
    const sum = soilData.reduce(
      (acc, sample) => ({
        ph: acc.ph + sample.ph,
        cec: acc.cec + sample.cec,
        om: acc.om + sample.om,
        p: acc.p + sample.p,
        k: acc.k + sample.k,
        ca_ppm: acc.ca_ppm + sample.ca_ppm,
        mg_ppm: acc.mg_ppm + sample.mg_ppm
      }),
      {
        ph: 0,
        cec: 0,
        om: 0,
        p: 0,
        k: 0,
        ca_ppm: 0,
        mg_ppm: 0
      }
    );

    const count = soilData.length;
    return {
      ph: (sum.ph / count).toFixed(1),
      cec: (sum.cec / count).toFixed(1),
      om: (sum.om / count).toFixed(1),
      p: (sum.p / count).toFixed(0),
      k: (sum.k / count).toFixed(0),
      ca_ppm: (sum.ca_ppm / count).toFixed(0),
      mg_ppm: (sum.mg_ppm / count).toFixed(0)
    };
  }, []);

  // Define optimal ranges for each nutrient
  const optimalRanges = {
    ph: { min: 6.0, max: 7.0, unit: "" },
    cec: { min: 10, max: 20, unit: "meq/100g" },
    om: { min: 2.0, max: 5.0, unit: "%" },
    p: { min: 30, max: 50, unit: "ppm" },
    k: { min: 120, max: 200, unit: "ppm" },
    ca_ppm: { min: 1000, max: 2000, unit: "ppm" },
    mg_ppm: { min: 120, max: 180, unit: "ppm" }
  };

  // Calculate recommendations based on averages and optimal ranges
  const getRecommendation = (
    nutrient: string,
    value: number,
    range: { min: number; max: number }
  ) => {
    if (value < range.min) {
      return "Increase needed";
    } else if (value > range.max) {
      return "Reduce applications";
    }
    return "Maintain current levels";
  };

  return (
    <div className="space-y-8">
      {/* Summary Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-border/50">
          <h3 className="text-lg font-semibold mb-4">Current Soil Status</h3>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Parameter</TableHead>
                <TableHead>Average</TableHead>
                <TableHead>Optimal Range</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {Object.entries(averages).map(([key, value]) => (
                <TableRow key={key}>
                  <TableCell className="font-medium">
                    {key.toUpperCase().replace("_PPM", "")}
                  </TableCell>
                  <TableCell>
                    {value}{" "}
                    {optimalRanges[key as keyof typeof optimalRanges].unit}
                  </TableCell>
                  <TableCell>
                    {optimalRanges[key as keyof typeof optimalRanges].min} -{" "}
                    {optimalRanges[key as keyof typeof optimalRanges].max}{" "}
                    {optimalRanges[key as keyof typeof optimalRanges].unit}
                  </TableCell>
                  <TableCell>
                    <span
                      className={
                        Number(value) <
                        optimalRanges[key as keyof typeof optimalRanges].min
                          ? "text-red-500"
                          : Number(value) >
                            optimalRanges[key as keyof typeof optimalRanges].max
                          ? "text-yellow-500"
                          : "text-green-500"
                      }
                    >
                      {getRecommendation(
                        key,
                        Number(value),
                        optimalRanges[key as keyof typeof optimalRanges]
                      )}
                    </span>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {/* Recommendations Card */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-border/50">
          <h3 className="text-lg font-semibold mb-4">
            Step-by-Step Recommendations
          </h3>
          <div className="space-y-4">
            <div className="p-4 bg-blue-50 rounded-lg">
              <h4 className="font-medium text-blue-700 mb-2">
                1. pH Management
              </h4>
              <p className="text-sm text-blue-600">
                {Number(averages.ph) < 6.0
                  ? "Apply lime to raise pH. Calculate lime requirement based on buffer pH and CEC."
                  : Number(averages.ph) > 7.0
                  ? "Consider acidifying amendments or sulfur application if growing acid-loving crops."
                  : "pH is in optimal range. Monitor annually."}
              </p>
            </div>

            <div className="p-4 bg-green-50 rounded-lg">
              <h4 className="font-medium text-green-700 mb-2">
                2. Primary Nutrients (NPK)
              </h4>
              <ul className="text-sm text-green-600 space-y-2">
                <li>
                  • Phosphorus (P):{" "}
                  {Number(averages.p) < 30
                    ? "Apply 80-100 lbs P₂O₅/acre"
                    : Number(averages.p) < 50
                    ? "Apply 40-60 lbs P₂O₅/acre"
                    : "Maintain current levels"}
                </li>
                <li>
                  • Potassium (K):{" "}
                  {Number(averages.k) < 120
                    ? "Apply 100-120 lbs K₂O/acre"
                    : Number(averages.k) < 200
                    ? "Apply 60-80 lbs K₂O/acre"
                    : "Maintain current levels"}
                </li>
              </ul>
            </div>

            <div className="p-4 bg-purple-50 rounded-lg">
              <h4 className="font-medium text-purple-700 mb-2">
                3. Secondary Nutrients
              </h4>
              <ul className="text-sm text-purple-600 space-y-2">
                <li>
                  • Calcium:{" "}
                  {Number(averages.ca_ppm) < 1000
                    ? "Consider gypsum application"
                    : "Adequate levels"}
                </li>
                <li>
                  • Magnesium:{" "}
                  {Number(averages.mg_ppm) < 120
                    ? "Apply magnesium sulfate"
                    : "Adequate levels"}
                </li>
              </ul>
            </div>

            <div className="p-4 bg-amber-50 dark:bg-amber-950/50 rounded-lg">
              <h4 className="font-medium text-amber-700 dark:text-amber-400 mb-2">
                4. Organic Matter Management
              </h4>
              <p className="text-sm text-amber-600 dark:text-amber-300">
                {Number(averages.om) < 2.0
                  ? "Implement cover cropping and add organic amendments"
                  : Number(averages.om) < 3.0
                  ? "Continue building organic matter through crop residue management"
                  : "Maintain current organic matter management practices"}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Application Timing Guide */}
      <div className="bg-white dark:bg-card p-6 rounded-xl shadow-sm border border-border/50">
        <h3 className="text-lg font-semibold mb-4">
          Seasonal Application Guide
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 bg-orange-50 dark:bg-orange-950/50 rounded-lg">
            <h4 className="font-medium text-orange-700 dark:text-orange-400 mb-2">
              Pre-Plant
            </h4>
            <ul className="text-sm text-orange-600 dark:text-orange-300 space-y-1">
              <li>• Apply lime if needed (pH adjustment)</li>
              <li>• Incorporate P & K fertilizers</li>
              <li>• Add organic amendments</li>
            </ul>
          </div>

          <div className="p-4 bg-emerald-50 dark:bg-emerald-950/50 rounded-lg">
            <h4 className="font-medium text-emerald-700 dark:text-emerald-400 mb-2">
              During Growing Season
            </h4>
            <ul className="text-sm text-emerald-600 dark:text-emerald-300 space-y-1">
              <li>• Split N applications</li>
              <li>• Foliar micronutrient sprays</li>
              <li>• Fertigation if irrigation available</li>
            </ul>
          </div>

          <div className="p-4 bg-cyan-50 dark:bg-cyan-950/50 rounded-lg">
            <h4 className="font-medium text-cyan-700 dark:text-cyan-400 mb-2">
              Post-Harvest
            </h4>
            <ul className="text-sm text-cyan-600 dark:text-cyan-300 space-y-1">
              <li>• Soil testing</li>
              <li>• Cover crop planting</li>
              <li>• Residue management</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function SampleReportContent() {
  const [isClient, setIsClient] = useState(false);
  const [activeStep, setActiveStep] = useState(1);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const animationConfig = {
    once: true,
    amount: 0.3
  } as const;

  // Define the steps for the soil analysis process
  const analysisSteps = [
    {
      number: 1,
      title: "Field Mapping & Sample Collection",
      description:
        "The foundation of accurate soil analysis begins with proper field mapping and strategic sample collection.",
      component: <SampleDistributionMap />,
      details: [
        {
          title: "GPS-Guided Sampling",
          description:
            "Using precision GPS technology, we collect soil samples in a systematic grid pattern across your field.",
          icon: Map,
          component: null // Add optional component property with null default
        },
        {
          title: "Sample Depth Consistency",
          description:
            "All samples are taken at consistent depths to ensure accurate comparison and analysis.",
          icon: Ruler
        },
        {
          title: "Field Boundary Mapping",
          description:
            "Complete field boundaries are mapped to create accurate management zones.",
          icon: BoxSelect
        }
      ]
    },
    {
      number: 2,
      title: "Laboratory Analysis",
      description:
        "Through our partnership with A&L Labs, we deliver rapid and reliable soil analysis results.",
      component: (
        <div className="space-y-6">
          {/* Tabs Navigation */}
          <div className="flex flex-wrap gap-2">
            {["Soil Properties", "Base Saturation", "Summary"].map(
              (tab, index) => (
                <button
                  key={tab}
                  onClick={() => setActiveStep(index + 1)}
                  className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                    activeStep === index + 1
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted hover:bg-muted/80 text-muted-foreground"
                  }`}
                >
                  {tab}
                </button>
              )
            )}
          </div>

          {/* Soil Properties Tab */}
          {activeStep === 1 && (
            <div className="space-y-6">
              {/* First Row - Quick Stats */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {[
                  { label: "Average pH", value: "5.9", range: "4.6 - 7.2" },
                  { label: "Average CEC", value: "9.8", range: "5.2 - 24.4" },
                  { label: "Average OM", value: "2.2%", range: "1.7 - 3.0%" },
                  {
                    label: "Total Samples",
                    value: "14",
                    range: "Field Coverage"
                  }
                ].map(stat => (
                  <div
                    key={stat.label}
                    className="bg-white dark:bg-card p-4 rounded-lg border border-border/50"
                  >
                    <p className="text-sm text-muted-foreground">
                      {stat.label}
                    </p>
                    <p className="text-2xl font-semibold text-primary mt-1">
                      {stat.value}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Range: {stat.range}
                    </p>
                  </div>
                ))}
              </div>

              {/* Second Row - Detailed Analysis */}
              <div className="bg-white dark:bg-card p-6 rounded-xl shadow-sm border border-border/50">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h4 className="text-lg font-medium">
                      Soil Properties & Nutrients
                    </h4>
                    <p className="text-sm text-muted-foreground mt-1">
                      Analysis by A&L Labs • 48-72 hour turnaround
                    </p>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-sm text-muted-foreground">
                      Showing samples 1-14
                    </span>
                  </div>
                </div>

                <div className="overflow-auto max-h-[300px] rounded-lg">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Sample</TableHead>
                        <TableHead>pH</TableHead>
                        <TableHead>CEC</TableHead>
                        <TableHead>OM</TableHead>
                        <TableHead>P</TableHead>
                        <TableHead>K</TableHead>
                        <TableHead>Ca</TableHead>
                        <TableHead>Mg</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {soilData.map(sample => (
                        <TableRow key={sample.id}>
                          <TableCell className="font-medium">
                            {sample.id}
                          </TableCell>
                          <TableCell>{sample.ph}</TableCell>
                          <TableCell>{sample.cec}</TableCell>
                          <TableCell>{sample.om}</TableCell>
                          <TableCell>{sample.p}</TableCell>
                          <TableCell>{sample.k}</TableCell>
                          <TableCell>{sample.ca_ppm}</TableCell>
                          <TableCell>{sample.mg_ppm}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
            </div>
          )}

          {/* Base Saturation Tab */}
          {activeStep === 2 && (
            <div className="grid grid-cols-1 gap-6">
              {" "}
              {/* Right Column - Ratio Cards */}
              <div className="space-y-6">
                {/* Ratio Cards */}
                <div className="grid grid-cols-3 gap-4">
                  {[
                    {
                      title: "K:Mg Ratio",
                      value: "0.27:1",
                      status: "Low",
                      optimal: "0.3-0.5",
                      description: "Consider additional K to improve ratio"
                    },
                    {
                      title: "Ca:K Ratio",
                      value: "16:1",
                      status: "High",
                      optimal: "13-17",
                      description:
                        "Monitor K levels to balance calcium dominance"
                    },
                    {
                      title: "Ca:Mg Ratio",
                      value: "4.4:1",
                      status: "Optimal",
                      optimal: "4-6",
                      description: "Maintain current balance"
                    }
                  ].map((ratio, index) => (
                    <div
                      key={index}
                      className="bg-white dark:bg-card p-4 rounded-lg border border-border/50"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <h5 className="font-medium">{ratio.title}</h5>
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${
                            ratio.status === "Optimal"
                              ? "bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-400"
                              : ratio.status === "Low"
                              ? "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/50 dark:text-yellow-400"
                              : "bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-400"
                          }`}
                        >
                          {ratio.status}
                        </span>
                      </div>
                      <div className="flex items-baseline gap-2 mb-2">
                        <span className="text-2xl font-semibold">
                          {ratio.value}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              {/* Left Column - Base Saturation Table */}
              <div className="bg-white dark:bg-card p-6 rounded-xl shadow-sm border border-border/50">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h4 className="text-lg font-medium">
                      Base Saturation Analysis
                    </h4>
                    <p className="text-sm text-muted-foreground mt-1">
                      Cation balance and soil fertility indicators
                    </p>
                  </div>
                </div>

                <div className="overflow-auto max-h-[400px] rounded-lg">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Variable</TableHead>
                        <TableHead>Mean</TableHead>
                        <TableHead>Min</TableHead>
                        <TableHead>Max</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      <TableRow>
                        <TableCell className="font-medium">BS Ca (%)</TableCell>
                        <TableCell>57.0</TableCell>
                        <TableCell>15.8</TableCell>
                        <TableCell>82.5</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className="font-medium">BS K (%)</TableCell>
                        <TableCell>3.6</TableCell>
                        <TableCell>1.1</TableCell>
                        <TableCell>6.7</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className="font-medium">BS Mg (%)</TableCell>
                        <TableCell>13.1</TableCell>
                        <TableCell>4.5</TableCell>
                        <TableCell>17.9</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className="font-medium">BS H (%)</TableCell>
                        <TableCell>33.4</TableCell>
                        <TableCell>2.4</TableCell>
                        <TableCell>78.7</TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </div>
              </div>
            </div>
          )}

          {/* Summary Tab */}
          {activeStep === 3 && (
            <div className="space-y-6">
              {/* First Row - Statistical Summary */}
              <div className="bg-white dark:bg-card p-6 rounded-xl shadow-sm border border-border/50">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h4 className="text-lg font-medium">Statistical Summary</h4>
                  </div>
                </div>
                <div className="overflow-auto rounded-lg">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Variable</TableHead>
                        <TableHead>Mean</TableHead>
                        <TableHead>Min</TableHead>
                        <TableHead>Max</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      <TableRow>
                        <TableCell className="font-medium">pH</TableCell>
                        <TableCell>5.9</TableCell>
                        <TableCell>4.6</TableCell>
                        <TableCell>7.2</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className="font-medium">CEC</TableCell>
                        <TableCell>9.8</TableCell>
                        <TableCell>5.2</TableCell>
                        <TableCell>24.4</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className="font-medium">OM (%)</TableCell>
                        <TableCell>2.2</TableCell>
                        <TableCell>1.7</TableCell>
                        <TableCell>3.0</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className="font-medium">P (ppm)</TableCell>
                        <TableCell>35.0</TableCell>
                        <TableCell>12.0</TableCell>
                        <TableCell>76.0</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className="font-medium">K (ppm)</TableCell>
                        <TableCell>127.0</TableCell>
                        <TableCell>60.0</TableCell>
                        <TableCell>255.0</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className="font-medium">Ca (ppm)</TableCell>
                        <TableCell>1003.0</TableCell>
                        <TableCell>566.0</TableCell>
                        <TableCell>1497.0</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className="font-medium">Mg (ppm)</TableCell>
                        <TableCell>138.0</TableCell>
                        <TableCell>90.0</TableCell>
                        <TableCell>196.0</TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </div>
              </div>
            </div>
          )}
        </div>
      ),
      details: [
        {
          title: "Professional Lab Analysis",
          description:
            "48-72 hour turnaround from A&L Labs for comprehensive soil testing including pH, CEC, OM, and nutrients",
          icon: Calculator,
          component: <></>
        },
        {
          title: "Data Processing",
          description:
            "Advanced data cleaning, normalization, and enrichment with historical and regional soil databases",
          icon: Shield,
          component: <></>
        },
        {
          title: "Results Integration",
          description:
            "Automated integration of lab results with field mapping data and statistical analysis",
          icon: LineChart,
          component: (
            <>
              {/* Quality Control Process */}
              <div className="bg-white dark:bg-card p-6 rounded-xl shadow-sm border border-border/50">
                <h4 className="text-base font-medium mb-4">
                  Quality Control Process
                </h4>
                <div className="space-y-3">
                  <p className="text-sm text-muted-foreground">
                    Our rigorous validation process includes:
                  </p>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li className="flex items-start gap-2">
                      <Shield className="w-4 h-4 text-primary mt-1" />
                      <span>Outlier detection and verification</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <LineChart className="w-4 h-4 text-primary mt-1" />
                      <span>Cross-reference with historical data</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Settings className="w-4 h-4 text-primary mt-1" />
                      <span>Verification against regional soil databases</span>
                    </li>
                  </ul>
                </div>
              </div>
            </>
          )
        }
      ]
    },
    {
      number: 3,
      title: "Nutrient Mapping",
      description:
        "Advanced geospatial analysis of soil nutrients using precision mapping technology. Our system generates high-resolution nutrient distribution maps, identifies management zones, and tracks temporal changes in soil fertility patterns.",
      component: <NutrientMap />,
      details: [
        {
          title: "Nutrient Variability Analysis",
          description:
            "Comprehensive mapping of macro and micronutrients (N, P, K, Ca, Mg, S) with detailed spatial analysis of deficiencies, excesses, and balanced zones. Includes pH and CEC distribution for enhanced nutrient availability understanding.",
          icon: Map
        },
        {
          title: "Management Zone Delineation",
          description:
            "Creation of data-driven management zones based on multiple parameters including soil texture, organic matter, CEC, and nutrient levels. Zones are optimized for variable rate application and targeted soil amendments.",
          icon: Layout
        },
        {
          title: "Precision Recommendations",
          description:
            "Zone-specific nutrient recommendations considering crop requirements, yield goals, and economic factors. Includes variable rate prescriptions for optimal resource utilization.",
          icon: Calculator
        }
      ]
    },
    {
      number: 4,
      title: "Customized Recommendations",
      description:
        "Expert fertilizer and soil amendment recommendations tailored to your field's unique characteristics, focusing on practical solutions and sustainable management practices.",
      component: (
        <div className="space-y-6">
          {/* Tabs Navigation */}
          <div className="flex flex-wrap gap-2">
            {["Nitrogen", "Phosphorus", "Potassium", "Lime"].map(
              (tab, index) => (
                <button
                  key={tab}
                  onClick={() => setActiveStep(index + 1)}
                  className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                    activeStep === index + 1
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted hover:bg-muted/80 text-muted-foreground"
                  }`}
                >
                  {tab}
                </button>
              )
            )}
          </div>

          {/* Nitrogen Management Tab */}
          {activeStep === 1 && (
            <div className="grid grid-cols-1 gap-6">
              <div className="bg-white dark:bg-card p-6 rounded-xl shadow-sm border border-border/50">
                <h4 className="text-lg font-medium mb-4">
                  Nitrogen Management
                </h4>
                <div className="space-y-6">
                  <div className="grid grid-cols-2 gap-6">
                    <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
                      <p className="text-sm font-medium mb-4">
                        Application Details
                      </p>
                      <Table>
                        <TableBody>
                          <TableRow>
                            <TableCell className="font-medium">
                              Source
                            </TableCell>
                            <TableCell>82-0-0, anhydrous ammonia</TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell className="font-medium">Area</TableCell>
                            <TableCell>75.04 ac</TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell className="font-medium">
                              Yield Goal
                            </TableCell>
                            <TableCell>175 bu/ac</TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell className="font-medium">
                              VR Stats
                            </TableCell>
                            <TableCell>
                              Mean: 196 lb/ac (90-240 lb/ac)
                            </TableCell>
                          </TableRow>
                        </TableBody>
                      </Table>
                    </div>
                    <div className="p-4 bg-amber-50 dark:bg-amber-950/50 rounded-lg">
                      <p className="text-sm font-medium text-amber-800 dark:text-amber-400 mb-2">
                        Agronomist Notes
                      </p>
                      <p className="text-sm text-amber-700 dark:text-amber-300">
                        Sample #12 shows unusually high CEC relative to the rest
                        of the field, along with very low pH.
                      </p>
                    </div>
                  </div>

                  <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg">
                    <p className="text-sm font-medium mb-4">
                      Application Type Comparison
                    </p>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Metric</TableHead>
                          <TableHead>Uniform</TableHead>
                          <TableHead>Variable</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        <TableRow>
                          <TableCell className="font-medium">
                            Total Product (lb)
                          </TableCell>
                          <TableCell>14,700</TableCell>
                          <TableCell>14,280</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell className="font-medium">
                            Product Cost (USD)
                          </TableCell>
                          <TableCell>$5,145</TableCell>
                          <TableCell>$4,998</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell className="font-medium">
                            Application (USD)
                          </TableCell>
                          <TableCell>$375</TableCell>
                          <TableCell>$525</TableCell>
                        </TableRow>
                        <TableRow className="font-medium">
                          <TableCell>Field Total (USD)</TableCell>
                          <TableCell>$5,520</TableCell>
                          <TableCell>$5,523</TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Phosphorus Management Tab */}
          {activeStep === 2 && (
            <div className="grid grid-cols-1 gap-6">
              <div className="bg-white dark:bg-card p-6 rounded-xl shadow-sm border border-border/50">
                <h4 className="text-lg font-medium mb-4">
                  Phosphorus Management
                </h4>
                <div className="space-y-6">
                  <div className="grid grid-cols-2 gap-6">
                    <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
                      <p className="text-sm font-medium mb-4">
                        Application Details
                      </p>
                      <Table>
                        <TableBody>
                          <TableRow>
                            <TableCell className="font-medium">
                              Source
                            </TableCell>
                            <TableCell>18-46-0, DAP</TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell className="font-medium">Area</TableCell>
                            <TableCell>75.04 ac</TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell className="font-medium">
                              Yield Goal
                            </TableCell>
                            <TableCell>175 bu/ac</TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell className="font-medium">
                              VR Stats
                            </TableCell>
                            <TableCell>Mean: 41 lb/ac (0-180 lb/ac)</TableCell>
                          </TableRow>
                        </TableBody>
                      </Table>
                    </div>
                    <div className="p-4 bg-amber-50 dark:bg-amber-950/50 rounded-lg">
                      <p className="text-sm font-medium text-amber-800 dark:text-amber-400 mb-2">
                        Agronomist Notes
                      </p>
                      <p className="text-sm text-amber-700 dark:text-amber-300">
                        Much of the field has sufficient P levels, but the SW
                        edge and Eastern finger could benefit from fertilizer or
                        manure application.
                      </p>
                    </div>
                  </div>

                  <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg">
                    <p className="text-sm font-medium mb-4">
                      Application Type Comparison
                    </p>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Metric</TableHead>
                          <TableHead>Uniform</TableHead>
                          <TableHead>Variable</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        <TableRow>
                          <TableCell className="font-medium">
                            Total Product (lb)
                          </TableCell>
                          <TableCell>7,425</TableCell>
                          <TableCell>7,271</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell className="font-medium">
                            Product Cost (USD)
                          </TableCell>
                          <TableCell>$1,392</TableCell>
                          <TableCell>$1,363</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell className="font-medium">
                            Application (USD)
                          </TableCell>
                          <TableCell>$375</TableCell>
                          <TableCell>$525</TableCell>
                        </TableRow>
                        <TableRow className="font-medium">
                          <TableCell>Field Total (USD)</TableCell>
                          <TableCell>$1,767</TableCell>
                          <TableCell>$1,888</TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Potassium Management Tab */}
          {activeStep === 3 && (
            <div className="grid grid-cols-1 gap-6">
              <div className="bg-white dark:bg-card p-6 rounded-xl shadow-sm border border-border/50">
                <h4 className="text-lg font-medium mb-4">
                  Potassium Management
                </h4>
                <div className="space-y-6">
                  <div className="grid grid-cols-2 gap-6">
                    <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
                      <p className="text-sm font-medium mb-4">
                        Application Details
                      </p>
                      <Table>
                        <TableBody>
                          <TableRow>
                            <TableCell className="font-medium">
                              Source
                            </TableCell>
                            <TableCell>0-0-60, Potash</TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell className="font-medium">Area</TableCell>
                            <TableCell>75.04 ac</TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell className="font-medium">
                              Yield Goal
                            </TableCell>
                            <TableCell>175 bu/ac</TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell className="font-medium">
                              VR Stats
                            </TableCell>
                            <TableCell>Mean: 97 lb/ac (0-180 lb/ac)</TableCell>
                          </TableRow>
                        </TableBody>
                      </Table>
                    </div>
                    <div className="p-4 bg-amber-50 dark:bg-amber-950/50 rounded-lg">
                      <p className="text-sm font-medium text-amber-800 dark:text-amber-400 mb-2">
                        Agronomist Notes
                      </p>
                      <p className="text-sm text-amber-700 dark:text-amber-300">
                        K levels are generally adequate but variable. Consider
                        split application to improve efficiency and reduce
                        leaching risk.
                      </p>
                    </div>
                  </div>

                  <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg">
                    <p className="text-sm font-medium mb-4">
                      Application Type Comparison
                    </p>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Metric</TableHead>
                          <TableHead>Uniform</TableHead>
                          <TableHead>Variable</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        <TableRow>
                          <TableCell className="font-medium">
                            Total Product (lb)
                          </TableCell>
                          <TableCell>12,100</TableCell>
                          <TableCell>12,050</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell className="font-medium">
                            Product Cost (USD)
                          </TableCell>
                          <TableCell>$2,420</TableCell>
                          <TableCell>$2,410</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell className="font-medium">
                            Application (USD)
                          </TableCell>
                          <TableCell>$375</TableCell>
                          <TableCell>$525</TableCell>
                        </TableRow>
                        <TableRow className="font-medium">
                          <TableCell>Field Total (USD)</TableCell>
                          <TableCell>$2,795</TableCell>
                          <TableCell>$2,935</TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Lime Management Tab */}
          {activeStep === 4 && (
            <div className="grid grid-cols-1 gap-6">
              <div className="bg-white dark:bg-card p-6 rounded-xl shadow-sm border border-border/50">
                <h4 className="text-lg font-medium mb-4">Lime Requirements</h4>
                <div className="space-y-6">
                  <div className="grid grid-cols-2 gap-6">
                    <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
                      <p className="text-sm font-medium mb-4">
                        Application Details
                      </p>
                      <Table>
                        <TableBody>
                          <TableRow>
                            <TableCell className="font-medium">
                              Source
                            </TableCell>
                            <TableCell>Ag Lime (80% ECC)</TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell className="font-medium">Area</TableCell>
                            <TableCell>75.04 ac</TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell className="font-medium">
                              Target pH
                            </TableCell>
                            <TableCell>6.5</TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell className="font-medium">
                              VR Stats
                            </TableCell>
                            <TableCell>
                              Mean: 2.8 tons/ac (0-4 tons/ac)
                            </TableCell>
                          </TableRow>
                        </TableBody>
                      </Table>
                    </div>
                    <div className="p-4 bg-red-50 dark:bg-red-950/50 rounded-lg">
                      <p className="text-sm font-medium text-red-700 dark:text-red-400 mb-2">
                        Important Note
                      </p>
                      <p className="text-sm text-red-600 dark:text-red-300">
                        The eastern finger has very low pH levels. Do not exceed
                        2 tons/ac of lime in a single application. Contact for
                        assistance in amending the prescription for safe
                        one-time application.
                      </p>
                    </div>
                  </div>

                  <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg">
                    <p className="text-sm font-medium mb-4">
                      Application Type Comparison
                    </p>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Metric</TableHead>
                          <TableHead>Uniform</TableHead>
                          <TableHead>Variable</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        <TableRow>
                          <TableCell className="font-medium">
                            Total Product (tons)
                          </TableCell>
                          <TableCell>215</TableCell>
                          <TableCell>211</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell className="font-medium">
                            Product Cost (USD)
                          </TableCell>
                          <TableCell>$3,229</TableCell>
                          <TableCell>$3,167</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell className="font-medium">
                            Application (USD)
                          </TableCell>
                          <TableCell>$375</TableCell>
                          <TableCell>$525</TableCell>
                        </TableRow>
                        <TableRow className="font-medium">
                          <TableCell>Field Total (USD)</TableCell>
                          <TableCell>$3,604</TableCell>
                          <TableCell>$3,692</TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      ),
      details: [
        {
          title: "Nutrient Planning",
          description:
            "Customized application plans based on your soil test results and crop yield goals. Includes split application strategies for nitrogen, targeted phosphorus applications for deficient zones, optimized potassium rates, and pH management through careful lime applications.",
          icon: Calculator
        },
        {
          title: "Cost Analysis",
          description:
            "Clear comparison between uniform and variable rate application strategies. We analyze product costs, application expenses, and potential savings to help you make informed decisions about your fertilizer investment.",
          icon: TrendingUp
        },
        {
          title: "Application Timing",
          description:
            "Strategic timing recommendations aligned with your crop's growth stages. Spring pre-plant applications, early-season adjustments, summer side-dress options, and fall maintenance programs tailored to your operation.",
          icon: Calendar
        }
      ]
    },
    {
      number: 5,
      title: "Implementation & Monitoring",
      description:
        "Simple, practical steps to put your soil management plan into action, with ongoing support to ensure success.",
      component: (
        <div className="grid grid-cols-1 md:grid-cols-1 gap-6">
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
                <h5 className="font-medium mb-1">Variable Rate Analysis</h5>
                <p className="text-sm text-muted-foreground">
                  Prescription Maps and spatial patterns report
                </p>
              </button>
              <button className="p-6 bg-muted rounded-lg hover:bg-muted/70 transition-colors text-center">
                <Download className="w-6 h-6 text-primary mx-auto mb-3" />
                <h5 className="font-medium mb-1"> Yield & Application</h5>
                <p className="text-sm text-muted-foreground">
                  Cleaned and processed data files
                </p>
              </button>
            </div>
          </div>
        </div>
      ),
      details: [
        {
          title: "Advanced Prescriptions",
          description:
            "Customized variable rate prescriptions for all inputs, delivered in formats compatible with your equipment and supported by our technical team.",
          icon: HelpCircle
        },
        {
          title: "Comprehensive Analytics",
          description:
            "Continuous monitoring of field conditions, weather patterns, and crop performance, with regular data analysis and reporting.",
          icon: LineChart
        },
        {
          title: "Year-Round Support",
          description:
            "Dedicated agronomist support throughout the season, with regular check-ins and proactive adjustments to maximize your ROI.",
          icon: Settings
        }
      ]
    }
  ];

  if (!isClient) {
    return (
      <div className="w-full h-screen flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">
          Loading report...
        </div>
      </div>
    );
  }

  return (
    <section
      id="sample-report"
      className="flex min-h-screen flex-col scroll-mt-16 py-12"
    >
      <div className="container mx-auto px-4 max-w-7xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={animationConfig}
          transition={{ duration: 0.3 }}
          className="text-center mb-24"
        >
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            Soil Analysis <span className="text-primary">Process</span>
          </h1>
          <p className="text-base text-muted-foreground max-w-2xl mx-auto leading-7">
            Our comprehensive soil analysis process combines precision sampling,
            advanced laboratory testing, and expert recommendations to optimize
            your field's productivity.
          </p>
        </motion.div>

        {/* Process Steps */}
        <div className="space-y-24">
          {analysisSteps.map((step, index) => (
            <motion.div
              key={step.number}
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={animationConfig}
              transition={{ duration: 0.3 }}
              className="relative"
            >
              {/* Step Number - adjusted size */}
              <div className="absolute -left-3 -top-3 w-12 h-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-base font-medium">
                {step.number}
              </div>

              {/* Step Content */}
              <div className="bg-background/50 backdrop-blur-sm border border-muted rounded-xl p-8 shadow-sm ml-6">
                <div className="grid lg:grid-cols-2 gap-12 items-start">
                  {/* Text Content */}
                  <div className="space-y-6">
                    <div className="space-y-3">
                      {/* Step title - more subtle */}
                      <h2 className="text-xl font-medium text-foreground tracking-tight">
                        {step.title}
                      </h2>
                      {/* Step description - improved readability */}
                      <p className="text-base text-muted-foreground leading-7">
                        {step.description}
                      </p>
                    </div>

                    {/* Details Grid */}
                    <div className="grid gap-6">
                      {step.details.map((detail, i) => (
                        <div key={i} className="flex items-start gap-4">
                          <div className="mt-1.5 shrink-0">
                            <detail.icon className="w-4 h-4 text-primary" />
                          </div>
                          <div className="space-y-1.5">
                            {/* Detail title - smaller and consistent */}
                            <h3 className="text-sm font-medium text-foreground">
                              {detail.title}
                            </h3>
                            {/* Detail description - improved readability */}
                            <p className="text-sm text-muted-foreground leading-6">
                              {detail.description}
                            </p>
                            {detail.component && (
                              <p className="text-sm text-muted-foreground leading-6">
                                {detail.component}
                              </p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Visual Component */}
                  <div className="lg:mt-0 mt-8">{step.component}</div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
