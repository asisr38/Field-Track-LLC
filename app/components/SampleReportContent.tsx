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
import soilSampleData from "@/public/field-sampling/data/field-sampling-demo.json";
import fieldData from "@/public/field-sampling/data/field-sampling-boundary.geojson";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";
import type { Map as LeafletMap, Control } from "leaflet";
import L from "leaflet";
import type { Feature, Geometry } from "geojson";
import GeoRasterLayer from "georaster-layer-for-leaflet";

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
  pH_1_1: number;
  P_M3_ppm: number;
  K_M3_ppm: number;
  OM_LOI_per: number;
  CEC_M3: number;
  Ca_M3_ppm: number;
  Mg_M3_ppm: number;
  Depth_in: number;
  [key: string]: any; // Allow for dynamic property access with string keys
}

// Define interfaces for analysis steps and details
interface AnalysisStepDetail {
  title: string;
  description: string;
  icon: React.ElementType;
  component?: React.ReactNode | null;
}

interface AnalysisStep {
  number: number;
  title: string;
  description: string;
  component: React.ReactNode;
  details: AnalysisStepDetail[];
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
          minZoom: 15,
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
              attribution: "© Esri"
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
              attribution: "© Esri"
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
                <div class="font-bold">Sample ID: ${point.properties.SampleID}</div>
                <div>pH: ${point.properties.pH_1_1}</div>
                <div>P: ${point.properties.P_M3_ppm} ppm</div>
                <div>K: ${point.properties.K_M3_ppm} ppm</div>
                <div>OM: ${point.properties.OM_LOI_per}%</div>
                <div>CEC: ${point.properties.CEC_M3} meq/100g</div>
                <div>Ca: ${point.properties.Ca_M3_ppm} ppm</div>
                <div>Mg: ${point.properties.Mg_M3_ppm} ppm</div>
                <div>Depth: ${point.properties.Depth_in} inches</div>
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
                  {selectedSample["pH_1_1"]}
                </p>
                <p>
                  <span className="font-semibold text-gray-700">OM:</span>{" "}
                  {selectedSample["OM_LOI_per"]} {selectedSample["OM_LOI_unit"]}
                </p>
                <p>
                  <span className="font-semibold text-gray-700">P:</span>{" "}
                  {selectedSample["P_M3_ppm"]} {selectedSample["P_M3_unit"]}
                </p>
                <p>
                  <span className="font-semibold text-gray-700">K:</span>{" "}
                  {selectedSample["K_M3_ppm"]} {selectedSample["K_M3_unit"]}
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
                  {selectedSample["Ca_M3_ppm"]} {selectedSample["Ca_M3_unit"]}
                </p>
                <p>
                  <span className="font-semibold text-gray-700">Mg:</span>{" "}
                  {selectedSample["Mg_M3_ppm"]} {selectedSample["Mg_M3_unit"]}
                </p>
                <p>
                  <span className="font-semibold text-gray-700">S:</span>{" "}
                  {selectedSample["S_M3_ppm"]} {selectedSample["S_M3_unit"]}
                </p>
                <p>
                  <span className="font-semibold text-gray-700">CEC:</span>{" "}
                  {selectedSample["CEC_M3"]} {selectedSample["CEC_M3_unit"]}
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
                  {selectedSample["BS_K_M3_ppm"]}
                  {selectedSample["BS_K_M3_unit"]}
                </p>
                <p>
                  <span className="font-semibold text-gray-700">Mg:</span>{" "}
                  {selectedSample["BS_Mg_M3_ppm"]}
                  {selectedSample["BS_Mg_M3_unit"]}
                </p>
                <p>
                  <span className="font-semibold text-gray-700">Ca:</span>{" "}
                  {selectedSample["BS_Ca_M3_ppm"]}
                  {selectedSample["BS_Ca_M3_unit"]}
                </p>
                <p>
                  <span className="font-semibold text-gray-700">Total:</span>{" "}
                  {selectedSample["BS_M3_ppm"]}
                  {selectedSample["BS_M3_unit"]}
                </p>
              </div>
            </div>

            <div className="bg-gray-50 p-3 rounded-lg">
              <p className="font-semibold text-primary text-lg mb-2">Ratios</p>
              <div className="grid grid-cols-2 gap-3">
                <p>
                  <span className="font-semibold text-gray-700">Mg/K:</span>{" "}
                  {selectedSample["Mg_K_M3_ppm"]}
                </p>
                <p>
                  <span className="font-semibold text-gray-700">Ca/Mg:</span>{" "}
                  {selectedSample["Ca_Mg_M3_ppm"]}
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
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);
  const legendRef = useRef<any>(null);
  const vrLayerRef = useRef<any>(null);
  const plotLayerRef = useRef<any>(null);
  const [selectedNutrient, setSelectedNutrient] =
    useState<keyof typeof nutrientInfo>("phosphorus");
  const [vrData, setVrData] = useState<any>(null);
  const [plotData, setPlotData] = useState<any>(null);
  const [mapInitialized, setMapInitialized] = useState<boolean>(false);

  // Define color scales and ranges for each nutrient
  interface NutrientInfo {
    displayName: string;
    ranges: number[];
    colors: string[];
    unit: string;
    property: string;
  }

  interface NutrientInfoMap {
    [key: string]: NutrientInfo;
  }

  const nutrientInfo: NutrientInfoMap = {
    phosphorus: {
      displayName: "Phosphorus (P)",
      ranges: [0, 20, 40, 60, 80, 90],
      colors: [
        "#FFE5E5", // 0-20
        "#FFB3B3", // 20-40
        "#FF8080", // 40-60
        "#FF4D4D", // 60-80
        "#FF1A1A", // 80-90
        "#E60000" // 90+
      ],
      unit: "ppm",
      property: "18-46-D"
    },
    potassium: {
      displayName: "Potassium (K)",
      ranges: [190, 195, 200, 205, 210],
      colors: [
        "#E6F3FF", // 190-195
        "#B3D9FF", // 195-200
        "#80BFFF", // 200-205
        "#4DA6FF", // 205-210
        "#1A8CFF" // 210+
      ],
      unit: "ppm",
      property: "0-0-60p"
    },
    lime: {
      displayName: "Lime Application",
      ranges: [0, 1],
      colors: ["#FFFFFF", "#90EE90"], // White for no lime, Light green for lime
      unit: "",
      property: "Ag Lime"
    }
  };

  const getColor = (value: number, nutrient: NutrientInfo) => {
    for (let i = 0; i < nutrient.ranges.length - 1; i++) {
      if (value >= nutrient.ranges[i] && value < nutrient.ranges[i + 1]) {
        return nutrient.colors[i];
      }
    }
    return nutrient.colors[nutrient.colors.length - 1];
  };

  const loadVrData = async () => {
    try {
      const response = await fetch(
        `/field-sampling/data/${selectedNutrient}_VR_v2.json`
      );
      const data = await response.json();
      setVrData(data);
    } catch (error) {
      console.error("Error loading VR data:", error);
    }
  };

  // Initialize map once
  useEffect(() => {
    if (!mapContainerRef.current || mapInitialized) return;

    try {
      // Create map instance
      const map = L.map(mapContainerRef.current, {
        center: [41.5, -93.6],
        zoom: 16,
        minZoom: 16,
        maxZoom: 17,
        zoomControl: false,
        scrollWheelZoom: false,
        dragging: true,
        doubleClickZoom: false,
        boxZoom: false,
        keyboard: false,
        preferCanvas: true,
        renderer: L.canvas()
      });

      // Add zoom control
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
          attribution: "@Esri",
          opacity: 0.5
        }
      ).addTo(map);

      // Store map reference
      mapRef.current = map;
      setMapInitialized(true);
    } catch (error) {
      console.error("Error initializing map:", error);
    }

    // Cleanup on unmount
    return () => {
      cleanupMap();
    };
  }, []);

  // Load data when nutrient selection changes
  useEffect(() => {
    loadVrData();
  }, [selectedNutrient]);

  // Update map when data changes
  useEffect(() => {
    if (!mapRef.current || !vrData || !mapInitialized) return;

    try {
      // Clean up previous layers
      if (vrLayerRef.current) {
        mapRef.current.removeLayer(vrLayerRef.current);
        vrLayerRef.current = null;
      }

      if (plotLayerRef.current) {
        mapRef.current.removeLayer(plotLayerRef.current);
        plotLayerRef.current = null;
      }

      if (legendRef.current) {
        mapRef.current.removeControl(legendRef.current);
        legendRef.current = null;
      }

      // Add nutrient layer
      const nutrient = nutrientInfo[selectedNutrient];
      const vrLayer = L.geoJSON(vrData, {
        style: (
          feature: Feature<Geometry, { [key: string]: number }> | undefined
        ): L.PathOptions => {
          if (!feature) return { fillColor: "#ffffff" };
          const value = feature.properties[nutrient.property];
          return {
            fillColor: getColor(value, nutrient),
            weight: 0,
            opacity: 0,
            fillOpacity: 1
          };
        }
      }).addTo(mapRef.current);

      vrLayerRef.current = vrLayer;

      // Fit map to field bounds with padding
      const bounds = vrLayer.getBounds();
      if (bounds.isValid()) {
        mapRef.current.fitBounds(bounds.pad(0.05));
        mapRef.current.setMaxBounds(bounds.pad(0.1));
      }

      // Add legend
      const legend = new L.Control({ position: "topright" });
      legend.onAdd = function (map: L.Map): HTMLElement {
        const div = L.DomUtil.create(
          "div",
          "info legend bg-white p-2 rounded shadow-md border border-gray-200"
        );
        const ranges = nutrient.ranges;
        const colors = nutrient.colors;

        let html = `
          <div class="text-sm font-bold mb-2 text-gray-800">${nutrient.displayName}</div>
          <div class="text-xs text-gray-600 mb-2">${nutrient.unit}</div>
        `;

        for (let i = 0; i < ranges.length; i++) {
          const from = ranges[i];
          const to = ranges[i + 1];
          const label =
            selectedNutrient === "lime"
              ? from === 0
                ? "Not Applied"
                : "Applied"
              : `${from}${to ? "&ndash;" + to : "+"}`;

          html += `
            <div class="flex items-center gap-2 my-1">
              <i style="background:${colors[i]}; width: 20px; height: 20px; display: inline-block; border: 1px solid #ccc;"></i>
              <span class="text-xs font-medium">${label}</span>
            </div>`;
        }

        div.innerHTML = html;
        return div;
      };

      legend.addTo(mapRef.current);
      legendRef.current = legend;

      // Add plot outlines if available
      if (plotData) {
        const plotLayer = L.geoJSON(plotData as Feature<Geometry>, {
          style: {
            color: "#000",
            weight: 2,
            fillColor: "transparent",
            fillOpacity: 0
          },
          pane: "vector-pane"
        });

        mapRef.current.addLayer(plotLayer);
        plotLayerRef.current = plotLayer;

        const plotBounds = plotLayer.getBounds();
        if (plotBounds.isValid()) {
          mapRef.current.fitBounds(plotBounds, {
            padding: [50, 50],
            animate: true,
            maxZoom: 20
          });
        }
      }
    } catch (error) {
      console.error("Error updating map:", error);
    }
  }, [vrData, selectedNutrient, mapInitialized]);

  // Clean up map and all references
  const cleanupMap = () => {
    try {
      if (plotLayerRef.current && mapRef.current) {
        mapRef.current.removeLayer(plotLayerRef.current);
        plotLayerRef.current = null;
      }

      if (vrLayerRef.current && mapRef.current) {
        mapRef.current.removeLayer(vrLayerRef.current);
        vrLayerRef.current = null;
      }

      if (legendRef.current && mapRef.current) {
        mapRef.current.removeControl(legendRef.current);
        legendRef.current = null;
      }

      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }

      setMapInitialized(false);
    } catch (error) {
      console.error("Error cleaning up map:", error);
    }
  };

  // Component unmount cleanup
  useEffect(() => {
    return () => {
      cleanupMap();
    };
  }, []);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <select
            value={selectedNutrient}
            onChange={e =>
              setSelectedNutrient(e.target.value as keyof typeof nutrientInfo)
            }
            className="px-3 py-2 rounded-lg border border-border bg-background text-sm font-medium"
          >
            <option value="phosphorus">Phosphorus (P)</option>
            <option value="potassium">Potassium (K)</option>
            <option value="lime">Lime Application</option>
          </select>
        </div>
      </div>
      <div
        className="relative h-[500px] rounded-2xl overflow-hidden border border-border/50 shadow-lg"
        style={{ zIndex: 1 }}
      >
        <div
          ref={mapContainerRef}
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
        .vr-polygon {
          transition: fill-color 0.3s ease;
        }
        .info.legend {
          min-width: 150px;
        }
      `}</style>
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
  const analysisSteps: AnalysisStep[] = [
    {
      number: 1,
      title: "Laboratory Analysis",
      description:
        "We work with certified soil testing laboratories to deliver rapid and reliable soil analysis results.",
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
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
                {[
                  { label: "Average pH", value: "5.9", range: "4.6 - 7.2" },
                  { label: "Average CEC", value: "9.8", range: "5.2 - 24.4" },
                  { label: "Average OM", value: "2.2%", range: "1.7 - 3.0%" },
                  {
                    label: "Total Samples",
                    value: "18",
                    range: "Field Coverage"
                  }
                ].map(stat => (
                  <div
                    key={stat.label}
                    className="bg-white dark:bg-card p-3 md:p-4 rounded-lg border border-border/50"
                  >
                    <p className="text-xs md:text-sm text-muted-foreground">
                      {stat.label}
                    </p>
                    <p className="text-xl md:text-2xl font-semibold text-primary mt-1">
                      {stat.value}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Range: {stat.range}
                    </p>
                  </div>
                ))}
              </div>

              {/* Second Row - Detailed Analysis */}
              <div className="bg-white dark:bg-card p-3 md:p-6 rounded-xl shadow-sm border border-border/50">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4 md:mb-6 gap-2">
                  <div>
                    <h4 className="text-base md:text-lg font-medium">
                      Soil Properties & Nutrients
                    </h4>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-xs md:text-sm text-muted-foreground">
                      Showing samples 1-14
                    </span>
                  </div>
                </div>

                {/* Desktop table view - hidden on mobile */}
                <div className="hidden md:block">
                  <div className="overflow-x-auto">
                    <div className="max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                      <Table>
                        <TableHeader className="sticky top-0 bg-white dark:bg-card z-10">
                          <TableRow>
                            <TableHead className="w-[60px] text-sm">
                              Sample
                            </TableHead>
                            <TableHead className="w-[60px] text-sm">
                              pH
                            </TableHead>
                            <TableHead className="w-[60px] text-sm">
                              CEC
                            </TableHead>
                            <TableHead className="w-[60px] text-sm">
                              OM
                            </TableHead>
                            <TableHead className="w-[60px] text-sm">
                              P
                            </TableHead>
                            <TableHead className="w-[60px] text-sm">
                              K
                            </TableHead>
                            <TableHead className="w-[60px] text-sm">
                              Ca
                            </TableHead>
                            <TableHead className="w-[60px] text-sm">
                              Mg
                            </TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {soilData.map(sample => (
                            <TableRow key={sample.id}>
                              <TableCell className="text-sm font-medium">
                                {sample.id}
                              </TableCell>
                              <TableCell className="text-sm">
                                {sample.ph}
                              </TableCell>
                              <TableCell className="text-sm">
                                {sample.cec}
                              </TableCell>
                              <TableCell className="text-sm">
                                {sample.om}
                              </TableCell>
                              <TableCell className="text-sm">
                                {sample.p}
                              </TableCell>
                              <TableCell className="text-sm">
                                {sample.k}
                              </TableCell>
                              <TableCell className="text-sm">
                                {sample.ca_ppm}
                              </TableCell>
                              <TableCell className="text-sm">
                                {sample.mg_ppm}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </div>
                </div>

                {/* Mobile-friendly card view - visible only on mobile */}
                <div className="md:hidden space-y-4">
                  <div className="flex justify-between items-center border-b border-border/30 pb-2 mb-2 sticky top-0 bg-white dark:bg-card z-10">
                    <div className="font-medium text-xs w-12 text-center">
                      Sample
                    </div>
                    <div className="font-medium text-xs w-8 text-center">
                      pH
                    </div>
                    <div className="font-medium text-xs w-8 text-center">
                      CEC
                    </div>
                    <div className="font-medium text-xs w-8 text-center">
                      OM
                    </div>
                    <div className="font-medium text-xs w-8 text-center">P</div>
                    <div className="font-medium text-xs w-8 text-center">K</div>
                  </div>

                  <div className="max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                    {soilData.map(sample => (
                      <div
                        key={sample.id}
                        className="flex justify-between items-center border-b border-border/10 pb-2 mb-2"
                      >
                        <div className="text-xs font-medium w-12 text-center">
                          {sample.id}
                        </div>
                        <div className="text-xs w-8 text-center">
                          {sample.ph}
                        </div>
                        <div className="text-xs w-8 text-center">
                          {sample.cec}
                        </div>
                        <div className="text-xs w-8 text-center">
                          {sample.om}
                        </div>
                        <div className="text-xs w-8 text-center">
                          {sample.p}
                        </div>
                        <div className="text-xs w-8 text-center">
                          {sample.k}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Base Saturation Tab */}
          {activeStep === 2 && (
            <div className="space-y-6">
              {/* Ratio Cards */}
              <div className="grid grid-cols-3 gap-3 md:gap-4">
                <div className="bg-white dark:bg-card p-3 md:p-4 rounded-lg border border-border/50">
                  <p className="text-xs md:text-sm font-medium">K:Mg Ratio</p>
                  <p className="text-xl md:text-2xl font-semibold text-primary mt-1">
                    0.27:1
                  </p>
                </div>

                <div className="bg-white dark:bg-card p-3 md:p-4 rounded-lg border border-border/50">
                  <p className="text-xs md:text-sm font-medium">Ca:K Ratio</p>
                  <p className="text-xl md:text-2xl font-semibold text-primary mt-1">
                    16:1
                  </p>
                </div>

                <div className="bg-white dark:bg-card p-3 md:p-4 rounded-lg border border-border/50">
                  <p className="text-xs md:text-sm font-medium">Ca:Mg Ratio</p>
                  <p className="text-xl md:text-2xl font-semibold text-primary mt-1">
                    4.4:1
                  </p>
                </div>
              </div>

              <div className="bg-white dark:bg-card p-3 md:p-6 rounded-xl shadow-sm border border-border/50">
                <h4 className="text-base md:text-lg font-medium mb-4">
                  Base Saturation Analysis
                </h4>
                <p className="text-sm text-muted-foreground mb-4">
                  Cation balance and soil fertility indicators
                </p>

                {/* Desktop table view - hidden on mobile */}
                <div className="hidden md:block">
                  <div className="overflow-x-auto">
                    <div className="max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                      <Table>
                        <TableHeader className="sticky top-0 bg-white dark:bg-card z-10">
                          <TableRow>
                            <TableHead className="text-sm">Variable</TableHead>
                            <TableHead className="text-sm">Mean</TableHead>
                            <TableHead className="text-sm">Min</TableHead>
                            <TableHead className="text-sm">Max</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          <TableRow>
                            <TableCell className="text-sm font-medium">
                              BS Ca (%)
                            </TableCell>
                            <TableCell className="text-sm">51.0</TableCell>
                            <TableCell className="text-sm">55.0</TableCell>{" "}
                            <TableCell className="text-sm">68.0</TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell className="text-sm font-medium">
                              BS K (%)
                            </TableCell>
                            <TableCell className="text-sm">3.6</TableCell>
                            <TableCell className="text-sm">1.1</TableCell>
                            <TableCell className="text-sm">6.7</TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell className="text-sm font-medium">
                              BS Mg (%)
                            </TableCell>
                            <TableCell className="text-sm">13.1</TableCell>
                            <TableCell className="text-sm">4.5</TableCell>
                            <TableCell className="text-sm">17.9</TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell className="text-sm font-medium">
                              BS H (%)
                            </TableCell>
                            <TableCell className="text-sm">5.1</TableCell>
                            <TableCell className="text-sm">2.4</TableCell>
                            <TableCell className="text-sm">7.8</TableCell>
                          </TableRow>
                        </TableBody>
                      </Table>
                    </div>
                  </div>
                </div>

                {/* Mobile-friendly card view - visible only on mobile */}
                <div className="md:hidden space-y-4">
                  <div className="flex justify-between items-center border-b border-border/30 pb-2 mb-2 sticky top-0 bg-white dark:bg-card z-10">
                    <div className="font-medium text-xs w-24 text-left">
                      Variable
                    </div>
                    <div className="font-medium text-xs w-12 text-center">
                      Mean
                    </div>
                    <div className="font-medium text-xs w-12 text-center">
                      Min
                    </div>
                    <div className="font-medium text-xs w-12 text-center">
                      Max
                    </div>
                  </div>

                  <div className="flex justify-between items-center border-b border-border/10 pb-2">
                    <div className="text-xs font-medium w-24 text-left">
                      BS Ca (%)
                    </div>
                    <div className="text-xs w-12 text-center">57.0</div>
                    <div className="text-xs w-12 text-center">15.8</div>
                    <div className="text-xs w-12 text-center">82.5</div>
                  </div>

                  <div className="flex justify-between items-center border-b border-border/10 pb-2">
                    <div className="text-xs font-medium w-24 text-left">
                      BS K (%)
                    </div>
                    <div className="text-xs w-12 text-center">3.6</div>
                    <div className="text-xs w-12 text-center">1.1</div>
                    <div className="text-xs w-12 text-center">6.7</div>
                  </div>

                  <div className="flex justify-between items-center border-b border-border/10 pb-2">
                    <div className="text-xs font-medium w-24 text-left">
                      BS Mg (%)
                    </div>
                    <div className="text-xs w-12 text-center">13.1</div>
                    <div className="text-xs w-12 text-center">4.5</div>
                    <div className="text-xs w-12 text-center">17.9</div>
                  </div>

                  <div className="flex justify-between items-center border-b border-border/10 pb-2">
                    <div className="text-xs font-medium w-24 text-left">
                      BS H (%)
                    </div>
                    <div className="text-xs w-12 text-center">33.4</div>
                    <div className="text-xs w-12 text-center">2.4</div>
                    <div className="text-xs w-12 text-center">78.7</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Summary Tab */}
          {activeStep === 3 && (
            <div className="space-y-6">
              <div className="bg-white dark:bg-card p-3 md:p-6 rounded-xl shadow-sm border border-border/50">
                <h4 className="text-base md:text-lg font-medium mb-4">
                  Statistical Summary
                </h4>

                {/* Desktop table view - hidden on mobile */}
                <div className="hidden md:block">
                  <div className="overflow-x-auto">
                    <div className="max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                      <Table>
                        <TableHeader className="sticky top-0 bg-white dark:bg-card z-10">
                          <TableRow>
                            <TableHead className="text-sm">Variable</TableHead>
                            <TableHead className="text-sm">Mean</TableHead>
                            <TableHead className="text-sm">Min</TableHead>
                            <TableHead className="text-sm">Max</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          <TableRow>
                            <TableCell className="text-sm font-medium">
                              pH
                            </TableCell>
                            <TableCell className="text-sm">5.9</TableCell>
                            <TableCell className="text-sm">4.6</TableCell>
                            <TableCell className="text-sm">7.2</TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell className="text-sm font-medium">
                              CEC
                            </TableCell>
                            <TableCell className="text-sm">9.8</TableCell>
                            <TableCell className="text-sm">5.2</TableCell>
                            <TableCell className="text-sm">24.4</TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell className="text-sm font-medium">
                              OM (%)
                            </TableCell>
                            <TableCell className="text-sm">2.2</TableCell>
                            <TableCell className="text-sm">1.7</TableCell>
                            <TableCell className="text-sm">3.0</TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell className="text-sm font-medium">
                              P (ppm)
                            </TableCell>
                            <TableCell className="text-sm">35.0</TableCell>
                            <TableCell className="text-sm">12.0</TableCell>
                            <TableCell className="text-sm">76.0</TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell className="text-sm font-medium">
                              K (ppm)
                            </TableCell>
                            <TableCell className="text-sm">127.0</TableCell>
                            <TableCell className="text-sm">60.0</TableCell>
                            <TableCell className="text-sm">255.0</TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell className="text-sm font-medium">
                              Ca (ppm)
                            </TableCell>
                            <TableCell className="text-sm">1003.0</TableCell>
                            <TableCell className="text-sm">566.0</TableCell>
                            <TableCell className="text-sm">1497.0</TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell className="text-sm font-medium">
                              Mg (ppm)
                            </TableCell>
                            <TableCell className="text-sm">138.0</TableCell>
                            <TableCell className="text-sm">90.0</TableCell>
                            <TableCell className="text-sm">196.0</TableCell>
                          </TableRow>
                        </TableBody>
                      </Table>
                    </div>
                  </div>
                </div>

                {/* Mobile-friendly card view - visible only on mobile */}
                <div className="md:hidden space-y-4">
                  <div className="flex justify-between items-center border-b border-border/30 pb-2 mb-2 sticky top-0 bg-white dark:bg-card z-10">
                    <div className="font-medium text-xs w-24 text-left">
                      Variable
                    </div>
                    <div className="font-medium text-xs w-12 text-center">
                      Mean
                    </div>
                    <div className="font-medium text-xs w-12 text-center">
                      Min
                    </div>
                    <div className="font-medium text-xs w-12 text-center">
                      Max
                    </div>
                  </div>

                  <div className="max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                    <div className="flex justify-between items-center border-b border-border/10 pb-2 mb-2">
                      <div className="text-xs font-medium w-24 text-left">
                        pH
                      </div>
                      <div className="text-xs w-12 text-center">5.9</div>
                      <div className="text-xs w-12 text-center">4.6</div>
                      <div className="text-xs w-12 text-center">7.2</div>
                    </div>

                    <div className="flex justify-between items-center border-b border-border/10 pb-2 mb-2">
                      <div className="text-xs font-medium w-24 text-left">
                        CEC
                      </div>
                      <div className="text-xs w-12 text-center">9.8</div>
                      <div className="text-xs w-12 text-center">5.2</div>
                      <div className="text-xs w-12 text-center">24.4</div>
                    </div>

                    <div className="flex justify-between items-center border-b border-border/10 pb-2 mb-2">
                      <div className="text-xs font-medium w-24 text-left">
                        OM (%)
                      </div>
                      <div className="text-xs w-12 text-center">2.2</div>
                      <div className="text-xs w-12 text-center">1.7</div>
                      <div className="text-xs w-12 text-center">3.0</div>
                    </div>

                    <div className="flex justify-between items-center border-b border-border/10 pb-2 mb-2">
                      <div className="text-xs font-medium w-24 text-left">
                        P (ppm)
                      </div>
                      <div className="text-xs w-12 text-center">35.0</div>
                      <div className="text-xs w-12 text-center">12.0</div>
                      <div className="text-xs w-12 text-center">76.0</div>
                    </div>

                    <div className="flex justify-between items-center border-b border-border/10 pb-2 mb-2">
                      <div className="text-xs font-medium w-24 text-left">
                        K (ppm)
                      </div>
                      <div className="text-xs w-12 text-center">127.0</div>
                      <div className="text-xs w-12 text-center">60.0</div>
                      <div className="text-xs w-12 text-center">255.0</div>
                    </div>

                    <div className="flex justify-between items-center border-b border-border/10 pb-2 mb-2">
                      <div className="text-xs font-medium w-24 text-left">
                        Ca (ppm)
                      </div>
                      <div className="text-xs w-12 text-center">1003.0</div>
                      <div className="text-xs w-12 text-center">566.0</div>
                      <div className="text-xs w-12 text-center">1497.0</div>
                    </div>

                    <div className="flex justify-between items-center border-b border-border/10 pb-2 mb-2">
                      <div className="text-xs font-medium w-24 text-left">
                        Mg (ppm)
                      </div>
                      <div className="text-xs w-12 text-center">138.0</div>
                      <div className="text-xs w-12 text-center">90.0</div>
                      <div className="text-xs w-12 text-center">196.0</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      ),
      details: [
        {
          title: "Comprehensive Testing",
          description:
            "We coordinate with certified regional laboratories to analyze samples tailored to your specific crop and region needs.",
          icon: FileBarChart,
          component: null
        },
        {
          title: "Flexible Processing",
          description:
            "Sample processing timelines are optimized based on your location and selected laboratory partners to ensure timely decision-making.",
          icon: Clock,
          component: null
        },
        {
          title: "Quality Control",
          description:
            "All samples undergo rigorous quality control checks to ensure accuracy and reliability.",
          icon: Shield,
          component: null
        }
      ]
    },
    {
      number: 3,
      title: "Nutrient Mapping",
      description:
        "Interactive soil nutrient maps showing distribution patterns across your field.",
      component: <NutrientMap />,
      details: [
        {
          title: "Nutrient Analysis",
          description: "Visual mapping of key nutrients.",
          icon: Map
        },
        {
          title: "Management Zones",
          description:
            "Field segmentation based on soil samples for targeted applications.",
          icon: Layout
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
          {/* Tabs Navigation - Improved for mobile */}
          <div className="flex flex-wrap gap-2 justify-center md:justify-start">
            {["Phosphorus", "Potassium", "Lime"].map((tab, index) => (
              <button
                key={tab}
                onClick={() => setActiveStep(index + 1)}
                className={`px-3 py-2 text-xs md:text-sm font-medium rounded-lg transition-colors ${
                  activeStep === index + 1
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted hover:bg-muted/80 text-muted-foreground"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Phosphorus Management Tab - Mobile optimized */}
          {activeStep === 1 && (
            <div className="grid grid-cols-1 gap-4 md:gap-6">
              <div className="bg-white dark:bg-card p-4 md:p-6 rounded-xl shadow-sm border border-border/50">
                <h4 className="text-base md:text-lg font-medium mb-3 md:mb-4">
                  Phosphorus Management
                </h4>
                <div className="space-y-4 md:space-y-6">
                  {/* Mobile view - Application Details */}
                  <div className="md:hidden space-y-4">
                    <div className="p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
                      <p className="text-xs font-medium mb-2">
                        Application Details
                      </p>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-xs font-medium">Source:</span>
                          <span className="text-xs">18-46-0, DAP</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-xs font-medium">Area:</span>
                          <span className="text-xs">75.04 ac</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-xs font-medium">
                            Yield Goal:
                          </span>
                          <span className="text-xs">175 bu/ac</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-xs font-medium">VR Stats:</span>
                          <span className="text-xs">
                            Mean: 41 lb/ac (0-180 lb/ac)
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="p-3 bg-amber-50 dark:bg-amber-950/50 rounded-lg">
                      <p className="text-xs font-medium text-amber-800 dark:text-amber-400 mb-1">
                        Agronomist Notes
                      </p>
                      <p className="text-xs text-amber-700 dark:text-amber-300">
                        Much of the field has sufficient P levels, but the SW
                        edge and Eastern edge could benefit from fertilizer or
                        manure application.
                      </p>
                    </div>
                  </div>

                  {/* Desktop view - Application Details */}
                  <div className="hidden md:grid md:grid-cols-2 gap-6">
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
                        edge and Eastern edge could benefit from fertilizer or
                        manure application.
                      </p>
                    </div>
                  </div>

                  {/* Mobile view - Comparison Table */}
                  <div className="md:hidden">
                    <p className="text-xs font-medium mb-2">
                      Application Type Comparison
                    </p>
                    <div className="space-y-3">
                      <div className="bg-gray-50 dark:bg-gray-900 p-3 rounded-lg">
                        <div className="flex justify-between items-center border-b border-border/30 pb-1 mb-2">
                          <span className="text-xs font-medium">Metric</span>
                          <div className="flex gap-3">
                            <span className="text-xs font-medium w-16 text-right">
                              Uniform
                            </span>
                            <span className="text-xs font-medium w-16 text-right">
                              Variable
                            </span>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <div className="flex justify-between items-center">
                            <span className="text-xs">Total Product (lb)</span>
                            <div className="flex gap-3">
                              <span className="text-xs w-16 text-right">
                                7,425
                              </span>
                              <span className="text-xs w-16 text-right">
                                7,271
                              </span>
                            </div>
                          </div>

                          <div className="flex justify-between items-center">
                            <span className="text-xs">Product Cost (USD)</span>
                            <div className="flex gap-3">
                              <span className="text-xs w-16 text-right">
                                $1,392
                              </span>
                              <span className="text-xs w-16 text-right">
                                $1,363
                              </span>
                            </div>
                          </div>

                          <div className="flex justify-between items-center">
                            <span className="text-xs">Application (USD)</span>
                            <div className="flex gap-3">
                              <span className="text-xs w-16 text-right">
                                $375
                              </span>
                              <span className="text-xs w-16 text-right">
                                $525
                              </span>
                            </div>
                          </div>

                          <div className="flex justify-between items-center pt-1 border-t border-border/30">
                            <span className="text-xs font-medium">
                              Field Total (USD)
                            </span>
                            <div className="flex gap-3">
                              <span className="text-xs font-medium w-16 text-right">
                                $1,767
                              </span>
                              <span className="text-xs font-medium w-16 text-right">
                                $1,888
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Desktop view - Comparison Table */}
                  <div className="hidden md:block bg-gray-50 dark:bg-gray-900 p-4 rounded-lg">
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

          {/* Potassium Management Tab - Mobile optimized */}
          {activeStep === 2 && (
            <div className="grid grid-cols-1 gap-4 md:gap-6">
              <div className="bg-white dark:bg-card p-4 md:p-6 rounded-xl shadow-sm border border-border/50">
                <h4 className="text-base md:text-lg font-medium mb-3 md:mb-4">
                  Potassium Management
                </h4>
                <div className="space-y-4 md:space-y-6">
                  {/* Mobile view - Application Details */}
                  <div className="md:hidden space-y-4">
                    <div className="p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
                      <p className="text-xs font-medium mb-2">
                        Application Details
                      </p>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-xs font-medium">Source:</span>
                          <span className="text-xs">0-0-60, Potash</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-xs font-medium">Area:</span>
                          <span className="text-xs">75.04 ac</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-xs font-medium">
                            Yield Goal:
                          </span>
                          <span className="text-xs">175 bu/ac</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-xs font-medium">VR Stats:</span>
                          <span className="text-xs">
                            Mean: 97 lb/ac (0-180 lb/ac)
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="p-3 bg-amber-50 dark:bg-amber-950/50 rounded-lg">
                      <p className="text-xs font-medium text-amber-800 dark:text-amber-400 mb-1">
                        Agronomist Notes
                      </p>
                      <p className="text-xs text-amber-700 dark:text-amber-300">
                        K levels are generally adequate but variable. Consider
                        split application to improve efficiency and reduce
                        leaching risk.
                      </p>
                    </div>
                  </div>

                  {/* Desktop view - Application Details */}
                  <div className="hidden md:grid md:grid-cols-2 gap-6">
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

                  {/* Mobile view - Comparison Table */}
                  <div className="md:hidden">
                    <p className="text-xs font-medium mb-2">
                      Application Type Comparison
                    </p>
                    <div className="space-y-3">
                      <div className="bg-gray-50 dark:bg-gray-900 p-3 rounded-lg">
                        <div className="flex justify-between items-center border-b border-border/30 pb-1 mb-2">
                          <span className="text-xs font-medium">Metric</span>
                          <div className="flex gap-3">
                            <span className="text-xs font-medium w-16 text-right">
                              Uniform
                            </span>
                            <span className="text-xs font-medium w-16 text-right">
                              Variable
                            </span>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <div className="flex justify-between items-center">
                            <span className="text-xs">Total Product (lb)</span>
                            <div className="flex gap-3">
                              <span className="text-xs w-16 text-right">
                                12,100
                              </span>
                              <span className="text-xs w-16 text-right">
                                12,050
                              </span>
                            </div>
                          </div>

                          <div className="flex justify-between items-center">
                            <span className="text-xs">Product Cost (USD)</span>
                            <div className="flex gap-3">
                              <span className="text-xs w-16 text-right">
                                $2,420
                              </span>
                              <span className="text-xs w-16 text-right">
                                $2,410
                              </span>
                            </div>
                          </div>

                          <div className="flex justify-between items-center">
                            <span className="text-xs">Application (USD)</span>
                            <div className="flex gap-3">
                              <span className="text-xs w-16 text-right">
                                $375
                              </span>
                              <span className="text-xs w-16 text-right">
                                $525
                              </span>
                            </div>
                          </div>

                          <div className="flex justify-between items-center pt-1 border-t border-border/30">
                            <span className="text-xs font-medium">
                              Field Total (USD)
                            </span>
                            <div className="flex gap-3">
                              <span className="text-xs font-medium w-16 text-right">
                                $2,795
                              </span>
                              <span className="text-xs font-medium w-16 text-right">
                                $2,935
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Desktop view - Comparison Table */}
                  <div className="hidden md:block bg-gray-50 dark:bg-gray-900 p-4 rounded-lg">
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

          {/* Lime Management Tab - Mobile optimized */}
          {activeStep === 3 && (
            <div className="grid grid-cols-1 gap-4 md:gap-6">
              <div className="bg-white dark:bg-card p-4 md:p-6 rounded-xl shadow-sm border border-border/50">
                <h4 className="text-base md:text-lg font-medium mb-3 md:mb-4">
                  Lime Requirements
                </h4>
                <div className="space-y-4 md:space-y-6">
                  {/* Mobile view - Application Details */}
                  <div className="md:hidden space-y-4">
                    <div className="p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
                      <p className="text-xs font-medium mb-2">
                        Application Details
                      </p>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-xs font-medium">Source:</span>
                          <span className="text-xs">Ag Lime (80% ECC)</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-xs font-medium">Area:</span>
                          <span className="text-xs">75.04 ac</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-xs font-medium">
                            Target pH:
                          </span>
                          <span className="text-xs">6.5</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-xs font-medium">VR Stats:</span>
                          <span className="text-xs">
                            Mean: 2.8 tons/ac (0-4 tons/ac)
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="p-3 bg-red-50 dark:bg-red-950/50 rounded-lg">
                      <p className="text-xs font-medium text-red-700 dark:text-red-400 mb-1">
                        Important Note
                      </p>
                      <p className="text-xs text-red-600 dark:text-red-300">
                        The eastern edge has very low pH levels. Do not exceed 2
                        tons/ac of lime in a single application. Contact for
                        assistance in amending the prescription for safe
                        one-time application.
                      </p>
                    </div>
                  </div>

                  {/* Desktop view - Application Details */}
                  <div className="hidden md:grid md:grid-cols-2 gap-6">
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
                        The eastern edge has very low pH levels. Do not exceed 2
                        tons/ac of lime in a single application. Contact for
                        assistance in amending the prescription for safe
                        one-time application.
                      </p>
                    </div>
                  </div>

                  {/* Mobile view - Comparison Table */}
                  <div className="md:hidden">
                    <p className="text-xs font-medium mb-2">
                      Application Type Comparison
                    </p>
                    <div className="space-y-3">
                      <div className="bg-gray-50 dark:bg-gray-900 p-3 rounded-lg">
                        <div className="flex justify-between items-center border-b border-border/30 pb-1 mb-2">
                          <span className="text-xs font-medium">Metric</span>
                          <div className="flex gap-3">
                            <span className="text-xs font-medium w-16 text-right">
                              Uniform
                            </span>
                            <span className="text-xs font-medium w-16 text-right">
                              Variable
                            </span>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <div className="flex justify-between items-center">
                            <span className="text-xs">
                              Total Product (tons)
                            </span>
                            <div className="flex gap-3">
                              <span className="text-xs w-16 text-right">
                                215
                              </span>
                              <span className="text-xs w-16 text-right">
                                211
                              </span>
                            </div>
                          </div>

                          <div className="flex justify-between items-center">
                            <span className="text-xs">Product Cost (USD)</span>
                            <div className="flex gap-3">
                              <span className="text-xs w-16 text-right">
                                $3,229
                              </span>
                              <span className="text-xs w-16 text-right">
                                $3,167
                              </span>
                            </div>
                          </div>

                          <div className="flex justify-between items-center">
                            <span className="text-xs">Application (USD)</span>
                            <div className="flex gap-3">
                              <span className="text-xs w-16 text-right">
                                $375
                              </span>
                              <span className="text-xs w-16 text-right">
                                $525
                              </span>
                            </div>
                          </div>

                          <div className="flex justify-between items-center pt-1 border-t border-border/30">
                            <span className="text-xs font-medium">
                              Field Total (USD)
                            </span>
                            <div className="flex gap-3">
                              <span className="text-xs font-medium w-16 text-right">
                                $3,604
                              </span>
                              <span className="text-xs font-medium w-16 text-right">
                                $3,692
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Desktop view - Comparison Table */}
                  <div className="hidden md:block bg-gray-50 dark:bg-gray-900 p-4 rounded-lg">
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
            "Customized application plans based on soil test results and crop yield goals.",
          icon: Calculator
        },
        {
          title: "Cost Analysis",
          description:
            "Comparison between uniform and variable rate application strategies to help you make informed decisions.",
          icon: TrendingUp
        },
        {
          title: "Application Timing",
          description:
            "Strategic timing recommendations aligned with your crop's growth stages.",
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
      <div className="w-full min-h-screen flex items-center justify-center">
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
