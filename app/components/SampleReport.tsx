"use client";

import { motion } from "framer-motion";
import { Map } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";

// Add this at the top of the file, after imports:
declare global {
  interface Window {
    L: any;
  }
}

// Define interfaces for soil sample data
export interface SampleProperties {
  ID: number;
  "pH (1_1)": number;
  "P (B1 1_7)": number;
  "K (AA)": number;
  "OM (LOI)": number;
  "CEC (meq/100g)": number;
  Notes: string;
  [key: string]: any; // Allow for additional properties
}

export interface SampleFeature {
  type: "Feature";
  geometry: {
    type: "Point";
    coordinates: [number, number];
  };
  properties: SampleProperties;
}

export interface FieldBoundaryFeature {
  type: "Feature";
  properties: {
    name: string;
    area: string;
    farmID: string;
    [key: string]: any; // Allow for additional properties
  };
  geometry: {
    type: "Polygon";
    coordinates: number[][][];
  };
}

export interface GeoJSONFeatureCollection {
  type: "FeatureCollection";
  features: SampleFeature[] | FieldBoundaryFeature[];
}

// Define type for color ranges
interface ColorRange {
  min: number;
  max: number;
  color: string;
  label?: string;
}

// Define type for color ranges by property
interface ColorRanges {
  [key: string]: ColorRange[];
}

// Calculate the bounds of the field from the field boundary data
const calculateFieldBounds = (
  coordinates: number[][][]
): [[number, number], [number, number]] => {
  let minLat = Infinity;
  let maxLat = -Infinity;
  let minLng = Infinity;
  let maxLng = -Infinity;

  coordinates[0].forEach(coord => {
    const lng = coord[0];
    const lat = coord[1];

    minLat = Math.min(minLat, lat);
    maxLat = Math.max(maxLat, lat);
    minLng = Math.min(minLng, lng);
    maxLng = Math.max(maxLng, lng);
  });

  return [
    [minLat, minLng],
    [maxLat, maxLng]
  ];
};

// Get color based on soil property value
const getColorByValue = (value: number, property: string): string => {
  // Define color ranges for different soil properties
  const colorRanges: ColorRanges = {
    "pH (1_1)": [
      { min: 0, max: 5.0, color: "#d73027" }, // Very acidic - red
      { min: 5.0, max: 5.5, color: "#fc8d59" }, // Acidic - orange
      { min: 5.5, max: 6.0, color: "#fee090" }, // Slightly acidic - yellow
      { min: 6.0, max: 6.5, color: "#e0f3f8" }, // Neutral - light blue
      { min: 6.5, max: 7.0, color: "#91bfdb" }, // Slightly alkaline - medium blue
      { min: 7.0, max: 7.5, color: "#4575b4" }, // Alkaline - dark blue
      { min: 7.5, max: 14, color: "#313695" } // Very alkaline - very dark blue
    ],
    "P (B1 1_7)": [
      { min: 0, max: 10, color: "#d73027" }, // Very low - red
      { min: 10, max: 20, color: "#fc8d59" }, // Low - orange
      { min: 20, max: 30, color: "#fee090" }, // Medium - yellow
      { min: 30, max: 40, color: "#e0f3f8" }, // High - light blue
      { min: 40, max: 50, color: "#91bfdb" }, // Very high - medium blue
      { min: 50, max: 1000, color: "#4575b4" } // Extremely high - dark blue
    ],
    "K (AA)": [
      { min: 0, max: 100, color: "#d73027" }, // Very low - red
      { min: 100, max: 150, color: "#fc8d59" }, // Low - orange
      { min: 150, max: 200, color: "#fee090" }, // Medium - yellow
      { min: 200, max: 250, color: "#e0f3f8" }, // High - light blue
      { min: 250, max: 300, color: "#91bfdb" }, // Very high - medium blue
      { min: 300, max: 1000, color: "#4575b4" } // Extremely high - dark blue
    ],
    "OM (LOI)": [
      { min: 0, max: 1.5, color: "#d73027" }, // Very low - red
      { min: 1.5, max: 2.0, color: "#fc8d59" }, // Low - orange
      { min: 2.0, max: 2.5, color: "#fee090" }, // Medium - yellow
      { min: 2.5, max: 3.0, color: "#e0f3f8" }, // High - light blue
      { min: 3.0, max: 3.5, color: "#91bfdb" }, // Very high - medium blue
      { min: 3.5, max: 10, color: "#4575b4" } // Extremely high - dark blue
    ],
    "CEC (meq/100g)": [
      { min: 0, max: 5, color: "#d73027" }, // Very low - red
      { min: 5, max: 10, color: "#fc8d59" }, // Low - orange
      { min: 10, max: 15, color: "#fee090" }, // Medium - yellow
      { min: 15, max: 20, color: "#e0f3f8" }, // High - light blue
      { min: 20, max: 25, color: "#91bfdb" }, // Very high - medium blue
      { min: 25, max: 100, color: "#4575b4" } // Extremely high - dark blue
    ]
  };

  // Default color if property not found
  if (!colorRanges[property]) {
    return "#94a3b8"; // gray
  }

  // Find the appropriate color range
  const range = colorRanges[property].find(
    (range: ColorRange) => value >= range.min && value < range.max
  );

  return range ? range.color : "#94a3b8"; // Return gray if no range found
};

// Placeholder data - will be replaced with user's data
const placeholderFieldData: GeoJSONFeatureCollection = {
  type: "FeatureCollection",
  features: [
    {
      type: "Feature",
      properties: {
        name: "Sample Field",
        area: "0 acres",
        farmID: "Placeholder"
      },
      geometry: {
        type: "Polygon",
        coordinates: [
          [
            [-93.5784, 42.0551],
            [-93.5784, 42.0601],
            [-93.5704, 42.0601],
            [-93.5704, 42.0551],
            [-93.5784, 42.0551]
          ]
        ]
      }
    }
  ]
};

// Placeholder sample data - will be replaced with user's data
const placeholderSampleData: GeoJSONFeatureCollection = {
  type: "FeatureCollection",
  features: [
    {
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: [-93.5764, 42.0561]
      },
      properties: {
        ID: 1,
        "pH (1_1)": 6.2,
        "P (B1 1_7)": 24,
        "K (AA)": 185,
        "OM (LOI)": 2.8,
        "CEC (meq/100g)": 14.2,
        Notes: "Placeholder sample"
      }
    }
  ]
};

interface SampleReportProps {
  fieldData?: GeoJSONFeatureCollection;
  sampleData?: GeoJSONFeatureCollection;
}

export default function SampleReport({
  fieldData = placeholderFieldData,
  sampleData = placeholderSampleData
}: SampleReportProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const [selectedProperty, setSelectedProperty] = useState<string>("pH (1_1)");
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Calculate field bounds from the provided field data
  const FIELD_BOUNDS = calculateFieldBounds(
    (fieldData.features[0] as FieldBoundaryFeature).geometry.coordinates
  );

  useEffect(() => {
    // Add custom CSS for better touch controls
    const style = document.createElement("style");
    style.textContent = `
      .leaflet-touch .leaflet-control-zoom a {
        width: 40px !important;
        height: 40px !important;
        line-height: 40px !important;
        font-size: 18px !important;
      }
      .leaflet-control-zoom {
        border: 2px solid rgba(0,0,0,0.2) !important;
        box-shadow: 0 1px 5px rgba(0,0,0,0.4) !important;
      }
    `;
    document.head.appendChild(style);

    return () => {
      document.head.removeChild(style);
    };
  }, []);

  useEffect(() => {
    // Ensure the map is only initialized once and when the div is ready
    if (
      typeof window === "undefined" ||
      !mapRef.current ||
      mapInstanceRef.current
    ) {
      return;
    }

    const initMap = () => {
      try {
        setIsLoading(true);
        const L = (window as any).L;
        if (!L) {
          console.error("Leaflet not loaded");
          return;
        }

        // Determine initial zoom based on screen width
        const isMobile = window.innerWidth < 768;
        const initialZoom = isMobile ? 14 : 16;

        // Initialize the map with the field center
        const map = L.map(mapRef.current, {
          center: FIELD_BOUNDS[0],
          zoom: initialZoom,
          minZoom: 10,
          maxZoom: 19,
          scrollWheelZoom: false,
          tap: true,
          touchZoom: true,
          dragging: true,
          zoomControl: false
        });

        // Add zoom control with larger buttons for better mobile experience
        L.control
          .zoom({
            position: "bottomright",
            zoomInTitle: "Zoom in",
            zoomOutTitle: "Zoom out"
          })
          .addTo(map);

        // Enable touch detection
        if (L.Browser && L.Browser.touch) {
          L.DomUtil.addClass(map._container, "leaflet-touch");
        }

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
          )
        };

        // Add the default base map (Satellite)
        baseMaps["Satellite"].addTo(map);

        // Create field boundary layer
        const fieldLayer = L.geoJSON(fieldData, {
          style: {
            color: "#22c55e",
            fillColor: "#22c55e",
            fillOpacity: 0.2,
            weight: 2,
            dashArray: "5, 5"
          }
        }).addTo(map);

        // Create a feature group for soil sample points
        const sampleLayer = L.featureGroup().addTo(map);

        // Add soil sample points
        (sampleData.features as SampleFeature[]).forEach(
          (point: SampleFeature) => {
            const latlng = [
              point.geometry.coordinates[1],
              point.geometry.coordinates[0]
            ];

            // Use the selected property to determine marker color
            const value =
              (point.properties[
                selectedProperty as keyof SampleProperties
              ] as number) || 0;
            const color = getColorByValue(value, selectedProperty);

            const marker = L.circleMarker(latlng, {
              radius: 10,
              fillColor: color,
              color: "#fff",
              weight: 2,
              opacity: 1,
              fillOpacity: 0.8
            });

            // Create tooltip content
            const tooltipContent = `
            <div class="p-3 bg-white rounded-lg shadow-lg">
              <div class="font-bold text-lg mb-2">Sample ${point.properties.ID}</div>
              <div class="grid grid-cols-2 gap-2">
                <div class="font-semibold">pH:</div>
                <div>${point.properties["pH (1_1)"]}</div>
                <div class="font-semibold">Phosphorus:</div>
                <div>${point.properties["P (B1 1_7)"]} ppm</div>
                <div class="font-semibold">Potassium:</div>
                <div>${point.properties["K (AA)"]} ppm</div>
                <div class="font-semibold">Organic Matter:</div>
                <div>${point.properties["OM (LOI)"]}%</div>
                <div class="font-semibold">CEC:</div>
                <div>${point.properties["CEC (meq/100g)"]} meq/100g</div>
              </div>
            </div>
          `;

            marker.bindTooltip(tooltipContent, {
              permanent: false,
              direction: "top",
              className: "custom-tooltip",
              offset: [0, -10]
            });

            sampleLayer.addLayer(marker);
          }
        );

        // Add layer control
        const overlayMaps = {
          "Field Boundary": fieldLayer,
          "Soil Samples": sampleLayer
        };

        // Add layer control
        L.control
          .layers(baseMaps, overlayMaps, {
            position: "topright",
            collapsed: false
          })
          .addTo(map);

        // Add a legend for soil properties
        const legend = L.control({ position: "bottomleft" });
        legend.onAdd = function () {
          const div = L.DomUtil.create(
            "div",
            "legend bg-white p-3 rounded-lg shadow-lg"
          );

          // Add property selector
          div.innerHTML = `
            <h4 class="font-bold mb-2">Soil Property</h4>
            <select id="property-selector" class="w-full p-1 mb-3 border rounded">
              <option value="pH (1_1)">pH</option>
              <option value="P (B1 1_7)">Phosphorus (ppm)</option>
              <option value="K (AA)">Potassium (ppm)</option>
              <option value="OM (LOI)">Organic Matter (%)</option>
              <option value="CEC (meq/100g)">CEC (meq/100g)</option>
            </select>
            <h4 class="font-bold mb-2">Legend</h4>
          `;

          // Add legend items based on selected property
          const legendColorRanges: ColorRanges = {
            "pH (1_1)": [
              {
                min: 0,
                max: 5.0,
                color: "#d73027",
                label: "< 5.0 (Very Acidic)"
              },
              {
                min: 5.0,
                max: 5.5,
                color: "#fc8d59",
                label: "5.0 - 5.5 (Acidic)"
              },
              {
                min: 5.5,
                max: 6.0,
                color: "#fee090",
                label: "5.5 - 6.0 (Slightly Acidic)"
              },
              {
                min: 6.0,
                max: 6.5,
                color: "#e0f3f8",
                label: "6.0 - 6.5 (Neutral)"
              },
              {
                min: 6.5,
                max: 7.0,
                color: "#91bfdb",
                label: "6.5 - 7.0 (Slightly Alkaline)"
              },
              {
                min: 7.0,
                max: 7.5,
                color: "#4575b4",
                label: "7.0 - 7.5 (Alkaline)"
              },
              {
                min: 7.5,
                max: 14,
                color: "#313695",
                label: "> 7.5 (Very Alkaline)"
              }
            ]
          };

          const ranges = legendColorRanges[selectedProperty] || [];

          let legendItems = '<div class="space-y-2">';
          ranges.forEach((range: ColorRange) => {
            legendItems += `
              <div class="flex items-center">
                <div class="w-4 h-4 rounded-full bg-[${range.color}] mr-2"></div>
                <span>${range.label}</span>
              </div>
            `;
          });
          legendItems += "</div>";

          div.innerHTML += legendItems;

          // Add event listener to property selector
          setTimeout(() => {
            const selector = document.getElementById("property-selector");
            if (selector) {
              selector.addEventListener("change", e => {
                const target = e.target as HTMLSelectElement;
                setSelectedProperty(target.value);
              });
            }
          }, 0);

          return div;
        };
        legend.addTo(map);

        // Store map instance
        mapInstanceRef.current = map;

        // Fit map to field bounds with padding (more padding on mobile)
        const bounds = fieldLayer.getBounds();
        if (bounds.isValid()) {
          const padding = isMobile ? 0.15 : 0.1; // Reduced padding for mobile
          map.fitBounds(bounds.pad(padding), {
            animate: true,
            duration: 0.5
          });
        }

        setIsLoading(false);
      } catch (error) {
        console.error("Error initializing map:", error);
        setIsLoading(false);
      }
    };

    // Initialize the map
    initMap();

    // Cleanup
    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [FIELD_BOUNDS, fieldData, sampleData, selectedProperty]);

  return (
    <section id="sample-report" className="bg-secondary/5">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="space-y-4 mb-8"
        >
          <div className="flex items-center gap-3 mb-1">
            <Map className="w-8 h-8 text-primary" />
            <h3 className="text-2xl font-bold">Interactive Soil Analysis</h3>
          </div>
          <p className="text-muted-foreground max-w-3xl">
            Explore our interactive soil analysis map showing sampling locations
            and results. Click on sample points to view detailed soil test
            results.
          </p>
        </motion.div>

        {/* Interactive Map */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="max-w-6xl mx-auto mb-8"
        >
          <div
            className="relative h-[600px] rounded-2xl overflow-hidden border border-border/50"
            style={{ zIndex: 1 }}
          >
            {isLoading ? (
              <div className="w-full h-full bg-muted/20 flex items-center justify-center">
                <p className="text-muted-foreground">
                  Loading soil sampling map...
                </p>
              </div>
            ) : (
              <div
                ref={mapRef}
                className="w-full h-full"
                style={{ background: "#f0f0f0" }}
              />
            )}
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
          <p className="text-sm text-muted-foreground mt-2 text-center">
            Interactive map showing soil sampling locations and results
          </p>
        </motion.div>
      </div>
    </section>
  );
}
