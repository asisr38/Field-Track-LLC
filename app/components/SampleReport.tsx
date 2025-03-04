"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import fieldData from "../data/Boundary_Demo.json";
import trialData from "../data/Point_Demo.json";

// Add this at the top of the file, after imports:
declare global {
  interface Window {
    L: any;
  }
}

// Define interfaces for trial data
interface TrialProperties {
  ID: number;
  TrialID: string;
  PlotDate: string;
  Treatment: string;
  YieldData: number;
  YieldUnit: string;
  Replicate: number;
  Notes: string;
}

interface TrialFeature {
  type: "Feature";
  geometry: {
    type: "Point";
    coordinates: [number, number];
  };
  properties: TrialProperties;
}

interface DroneImageryLayer {
  name: string;
  type: "ndvi" | "rgb" | "thermal";
  bounds: [[number, number], [number, number]];
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

const FIELD_BOUNDS = calculateFieldBounds(
  fieldData.features[0].geometry.coordinates
);

// Move getColorByTreatment outside of initMap
const getColorByTreatment = (treatment: string) => {
  switch (treatment) {
    case "Variable Rate A":
      return "#22c55e"; // green
    case "Variable Rate B":
      return "#3b82f6"; // blue
    case "Control":
      return "#ef4444"; // red
    default:
      return "#94a3b8"; // gray
  }
};

// Add drone imagery layers configuration
const droneImageryLayers: DroneImageryLayer[] = [
  {
    name: "NDVI Analysis",
    type: "ndvi",
    bounds: FIELD_BOUNDS
  },
  {
    name: "RGB Orthomosaic",
    type: "rgb",
    bounds: FIELD_BOUNDS
  },
  {
    name: "Thermal Imagery",
    type: "thermal",
    bounds: FIELD_BOUNDS
  }
];

export default function SampleReport() {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);

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
        const L = (window as any).L;
        if (!L) {
          console.error("Leaflet not loaded");
          return;
        }

        // Initialize the map with the field center
        const map = L.map(mapRef.current, {
          center: FIELD_BOUNDS[0],
          zoom: 16,
          minZoom: 12,
          maxZoom: 19,
          scrollWheelZoom: false
        });

        // Add zoom control
        L.control
          .zoom({
            position: "bottomright"
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

        // Create a feature group for trial points
        const trialLayer = L.featureGroup().addTo(map);

        // Create drone imagery layers using SVG overlays
        const droneLayers: { [key: string]: L.SVGOverlay } = {};

        droneImageryLayers.forEach(layer => {
          // Create SVG element
          const svgElement = document.createElementNS(
            "http://www.w3.org/2000/svg",
            "svg"
          );
          svgElement.setAttribute("xmlns", "http://www.w3.org/2000/svg");
          svgElement.setAttribute("viewBox", "0 0 100 100");
          svgElement.setAttribute("width", "100%");
          svgElement.setAttribute("height", "100%");

          // Generate pattern based on layer type
          let patternHTML = "";

          if (layer.type === "ndvi") {
            // Create a clipping path using the field boundary
            patternHTML += `<clipPath id="field-clip">
              <path d="${createSVGPathFromCoordinates(
                fieldData.features[0].geometry.coordinates[0]
              )}" />
            </clipPath>`;

            // NDVI visualization with field boundary clipping
            patternHTML += `<g clip-path="url(#field-clip)">`;

            // Create a more realistic NDVI pattern
            for (let i = 0; i < 40; i++) {
              for (let j = 0; j < 40; j++) {
                const x = i * 2.5;
                const y = j * 2.5;
                const width = 2.5;
                const height = 2.5;

                // Create patterns that follow field contours
                const distFromCenter = Math.sqrt(
                  Math.pow((i - 20) / 20, 2) + Math.pow((j - 20) / 20, 2)
                );
                const ndviValue =
                  0.7 -
                  distFromCenter * 0.3 +
                  Math.sin(i / 4) * Math.cos(j / 4) * 0.2;

                // Use a more realistic NDVI color scale
                let color;
                if (ndviValue < 0.2) {
                  color = "rgba(189, 0, 38, 0.8)"; // Very low NDVI - red
                } else if (ndviValue < 0.4) {
                  color = "rgba(240, 59, 32, 0.8)"; // Low NDVI - orange-red
                } else if (ndviValue < 0.6) {
                  color = "rgba(253, 141, 60, 0.8)"; // Medium-low NDVI - orange
                } else if (ndviValue < 0.7) {
                  color = "rgba(254, 204, 92, 0.8)"; // Medium NDVI - yellow
                } else if (ndviValue < 0.8) {
                  color = "rgba(168, 221, 181, 0.8)"; // Medium-high NDVI - light green
                } else {
                  color = "rgba(0, 104, 55, 0.8)"; // High NDVI - dark green
                }

                patternHTML += `<rect x="${x}" y="${y}" width="${width}" height="${height}" fill="${color}" />`;
              }
            }

            patternHTML += `</g>`;
          } else if (layer.type === "rgb") {
            // Create a clipping path using the field boundary
            patternHTML += `<clipPath id="field-clip-rgb">
              <path d="${createSVGPathFromCoordinates(
                fieldData.features[0].geometry.coordinates[0]
              )}" />
            </clipPath>`;

            // RGB orthomosaic with field boundary clipping
            patternHTML += `<g clip-path="url(#field-clip-rgb)">`;

            // Create a more realistic RGB pattern that resembles crop rows
            for (let i = 0; i < 100; i++) {
              // Draw crop rows
              const y = i;
              patternHTML += `<line x1="0" y1="${y}" x2="100" y2="${y}" stroke-width="0.8" stroke="rgba(${
                50 + Math.sin(i / 5) * 30
              }, ${120 + Math.sin(i / 3) * 40}, ${
                30 + Math.sin(i / 7) * 20
              }, 0.9)" />`;

              // Add some variation to simulate field patterns
              if (i % 10 === 0) {
                patternHTML += `<path d="M0,${i} Q50,${
                  i + Math.sin(i) * 5
                } 100,${i}" stroke="rgba(${70 + Math.sin(i / 2) * 30}, ${
                  140 + Math.sin(i / 4) * 30
                }, ${
                  40 + Math.sin(i / 5) * 20
                }, 0.8)" stroke-width="1.5" fill="none" />`;
              }
            }

            // Add some "tractor paths" or field divisions
            patternHTML += `<path d="M25,0 L25,100" stroke="rgba(120, 100, 80, 0.7)" stroke-width="0.8" stroke-dasharray="1,1" />`;
            patternHTML += `<path d="M50,0 L50,100" stroke="rgba(120, 100, 80, 0.7)" stroke-width="0.8" stroke-dasharray="1,1" />`;
            patternHTML += `<path d="M75,0 L75,100" stroke="rgba(120, 100, 80, 0.7)" stroke-width="0.8" stroke-dasharray="1,1" />`;

            patternHTML += `</g>`;
          } else if (layer.type === "thermal") {
            // Create a clipping path using the field boundary
            patternHTML += `<clipPath id="field-clip-thermal">
              <path d="${createSVGPathFromCoordinates(
                fieldData.features[0].geometry.coordinates[0]
              )}" />
            </clipPath>`;

            // Thermal imagery with field boundary clipping
            patternHTML += `<g clip-path="url(#field-clip-thermal)">`;

            // Create a more realistic thermal pattern
            // First, create a gradient background
            patternHTML += `<defs>
              <radialGradient id="thermal-gradient" cx="50%" cy="50%" r="50%" fx="50%" fy="50%">
                <stop offset="0%" style="stop-color:rgba(255,0,0,0.7)" />
                <stop offset="25%" style="stop-color:rgba(255,165,0,0.7)" />
                <stop offset="50%" style="stop-color:rgba(255,255,0,0.7)" />
                <stop offset="75%" style="stop-color:rgba(0,255,255,0.7)" />
                <stop offset="100%" style="stop-color:rgba(0,0,255,0.7)" />
              </radialGradient>
            </defs>`;

            // Add the base thermal layer
            patternHTML += `<rect x="0" y="0" width="100" height="100" fill="url(#thermal-gradient)" />`;

            // Add some "hot spots" and "cold spots"
            for (let i = 0; i < 10; i++) {
              const x = 10 + Math.random() * 80;
              const y = 10 + Math.random() * 80;
              const radius = 3 + Math.random() * 7;

              // Randomly choose between hot and cold spots
              if (Math.random() > 0.5) {
                // Hot spot
                patternHTML += `<circle cx="${x}" cy="${y}" r="${radius}" fill="rgba(255,0,0,0.6)" />`;
              } else {
                // Cold spot
                patternHTML += `<circle cx="${x}" cy="${y}" r="${radius}" fill="rgba(0,0,255,0.6)" />`;
              }
            }

            patternHTML += `</g>`;
          }

          svgElement.innerHTML = patternHTML;

          // Create SVG overlay
          droneLayers[layer.name] = L.svgOverlay(svgElement, layer.bounds, {
            opacity: 0.8,
            interactive: true
          });
        });

        // Add trial points
        trialData.features.forEach(point => {
          const latlng = [
            point.geometry.coordinates[1],
            point.geometry.coordinates[0]
          ];

          const marker = L.circleMarker(latlng, {
            radius: 10,
            fillColor: getColorByTreatment(point.properties.Treatment),
            color: "#fff",
            weight: 2,
            opacity: 1,
            fillOpacity: 0.8
          });

          // Create tooltip content
          const tooltipContent = `
            <div class="p-3 bg-white rounded-lg shadow-lg">
              <div class="font-bold text-lg mb-2">Trial Plot ${
                point.properties.ID
              }</div>
              <div class="grid grid-cols-2 gap-2">
                <div class="font-semibold">Treatment:</div>
                <div>${point.properties.Treatment}</div>
                <div class="font-semibold">Yield:</div>
                <div>${point.properties.YieldData} ${
            point.properties.YieldUnit
          }</div>
                <div class="font-semibold">Replicate:</div>
                <div>${point.properties.Replicate}</div>
                <div class="font-semibold">Date:</div>
                <div>${new Date(
                  point.properties.PlotDate
                ).toLocaleDateString()}</div>
              </div>
            </div>
          `;

          marker.bindTooltip(tooltipContent, {
            permanent: false,
            direction: "top",
            className: "custom-tooltip",
            offset: [0, -10]
          });

          trialLayer.addLayer(marker);
        });

        // Add layer controls
        const overlayMaps = {
          "Field Boundary": fieldLayer,
          "Trial Points": trialLayer,
          ...droneLayers
        };

        L.control
          .layers(baseMaps, overlayMaps, {
            collapsed: false,
            position: "topright"
          })
          .addTo(map);

        // Add a legend for trial treatments
        const legend = L.control({ position: "bottomleft" });
        legend.onAdd = function () {
          const div = L.DomUtil.create(
            "div",
            "legend bg-white p-3 rounded-lg shadow-lg"
          );
          div.innerHTML = `
            <h4 class="font-bold mb-2">Treatments</h4>
            <div class="space-y-2">
              <div class="flex items-center">
                <div class="w-4 h-4 rounded-full bg-[#22c55e] mr-2"></div>
                <span>Variable Rate A</span>
              </div>
              <div class="flex items-center">
                <div class="w-4 h-4 rounded-full bg-[#3b82f6] mr-2"></div>
                <span>Variable Rate B</span>
              </div>
              <div class="flex items-center">
                <div class="w-4 h-4 rounded-full bg-[#ef4444] mr-2"></div>
                <span>Control</span>
              </div>
            </div>
          `;
          return div;
        };
        legend.addTo(map);

        // Store map instance
        mapInstanceRef.current = map;

        // Fit map to field bounds with padding
        const bounds = fieldLayer.getBounds();
        if (bounds.isValid()) {
          map.fitBounds(bounds.pad(0.1));
        }
      } catch (error) {
        console.error("Error initializing map:", error);
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
  }, []);

  return (
    <section id="sample-report" className="py-20 bg-secondary/5">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-primary mb-6">
            Research <span className="text-primary">Results</span>
          </h2>
          <p className="text-body-lg text-muted-foreground max-w-3xl mx-auto">
            Explore real data from our field trials and research projects.
            Interactive maps show sampling points, trial layouts, and detailed
            findings from actual studies.
          </p>
        </motion.div>

        {/* Interactive Map */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="max-w-6xl mx-auto mb-16"
        >
          <div
            className="relative h-[600px] rounded-2xl overflow-hidden border border-border/50"
            style={{ zIndex: 0 }}
          >
            <div
              ref={mapRef}
              className="w-full h-full"
              style={{ background: "#f0f0f0" }}
            />
          </div>
          <p className="text-sm text-muted-foreground mt-2 text-center">
            Interactive map showing trial layout and sampling locations
          </p>
        </motion.div>

        {/* Features List */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto mb-16"
        >
          <div className="text-center">
            <h3 className="text-xl font-semibold mb-2">Clear Visualization</h3>
            <p className="text-muted-foreground">
              See your land's potential with easy-to-understand maps and reports
            </p>
          </div>
          <div className="text-center">
            <h3 className="text-xl font-semibold mb-2">Smart Planning</h3>
            <p className="text-muted-foreground">
              Make informed decisions about your land's resources and usage
            </p>
          </div>
          <div className="text-center">
            <h3 className="text-xl font-semibold mb-2">Practical Guidance</h3>
            <p className="text-muted-foreground">
              Get straightforward advice based on your land's unique
              characteristics
            </p>
          </div>
        </motion.div>

        {/* Call to Action */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center"
        >
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link href="/sample-report">
              <button className="inline-flex items-center gap-2 bg-green-600 text-white font-medium py-3 px-6 rounded-full shadow-md border-2 border-green-600 hover:bg-green-700 hover:border-green-700">
                View Demo Replicated Trial
                <ArrowRight className="w-4 h-4" />
              </button>
            </Link>
            <Link href="/trial-report">
              <button className="inline-flex items-center gap-2 bg-white text-green-600 font-medium py-3 px-6 rounded-full shadow-md border-2 border-green-600 hover:bg-gray-50">
                View Demo On-Farm Trial Report
                <ArrowRight className="w-4 h-4" />
              </button>
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

// Helper function to create SVG path from GeoJSON coordinates
function createSVGPathFromCoordinates(coordinates: number[][]) {
  // Normalize coordinates to fit in 0-100 range for SVG viewBox
  const bounds = calculateFieldBounds([coordinates]);
  const minLat = bounds[0][0];
  const minLng = bounds[0][1];
  const maxLat = bounds[1][0];
  const maxLng = bounds[1][1];

  const latRange = maxLat - minLat;
  const lngRange = maxLng - minLng;

  // Create SVG path
  let path = "";
  coordinates.forEach((coord, index) => {
    // Normalize to 0-100 range
    const x = ((coord[0] - minLng) / lngRange) * 100;
    const y = ((coord[1] - minLat) / latRange) * 100;

    if (index === 0) {
      path += `M ${x} ${y}`;
    } else {
      path += ` L ${x} ${y}`;
    }
  });

  // Close the path
  path += " Z";

  return path;
}
