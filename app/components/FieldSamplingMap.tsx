"use client";

import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import boundaryData from "../data/Boundary_Demo.json";
import pointData from "../data/Point_Demo.json";

interface FieldSamplingMapProps {
  className?: string;
  nutrientType?: string;
}

// Type assertions for the GeoJSON data
const typedBoundaryData = boundaryData as unknown as GeoJSON.FeatureCollection;
const typedPointData = pointData as unknown as GeoJSON.FeatureCollection;

// Log the data to help with debugging
console.log("Boundary Data:", boundaryData);
console.log("Point Data:", pointData);
console.log("Number of point features:", typedPointData.features.length);

// Define nutrient information with display names, property keys, and color scales
const nutrientInfo = {
  phosphorus: {
    displayName: "Phosphorus (P)",
    property: "P (B1 1_7)",
    unit: "ppm",
    ranges: [0, 20, 40, 60, 80],
    colors: ["#FF5252", "#FF9800", "#FFEB3B", "#8BC34A", "#4CAF50"],
    labels: ["Very Low", "Low", "Medium", "High", "Very High"]
  },
  potassium: {
    displayName: "Potassium (K)",
    property: "K (AA)",
    unit: "ppm",
    ranges: [0, 100, 150, 200, 250],
    colors: ["#F44336", "#FB8C00", "#FFD54F", "#7CB342", "#2E7D32"],
    labels: ["Very Low", "Low", "Medium", "High", "Very High"]
  },
  magnesium: {
    displayName: "Magnesium (Mg)",
    property: "Mg (AA)",
    unit: "ppm",
    ranges: [0, 200, 300, 400, 500],
    colors: ["#E53935", "#F57C00", "#FDD835", "#8BC34A", "#388E3C"],
    labels: ["Very Low", "Low", "Medium", "High", "Very High"]
  },
  calcium: {
    displayName: "Calcium (Ca)",
    property: "Ca (AA)",
    unit: "ppm",
    ranges: [0, 1000, 1500, 2000, 2500],
    colors: ["#D32F2F", "#EF6C00", "#FBC02D", "#7CB342", "#388E3C"],
    labels: ["Very Low", "Low", "Medium", "High", "Very High"]
  },
  ph: {
    displayName: "pH",
    property: "pH (1_1)",
    unit: "",
    ranges: [5.5, 6.0, 6.5, 7.0, 7.5],
    colors: ["#F44336", "#FF9800", "#4CAF50", "#FF9800", "#F44336"],
    labels: ["Very Acidic", "Acidic", "Optimal", "Alkaline", "Very Alkaline"]
  },
  organicMatter: {
    displayName: "Organic Matter",
    property: "OM (WB)",
    unit: "%",
    ranges: [0, 1, 2, 3, 4],
    colors: ["#FFCDD2", "#FFAB91", "#A5D6A7", "#66BB6A", "#388E3C"],
    labels: ["Very Low", "Low", "Medium", "High", "Very High"]
  },
  zinc: {
    displayName: "Zinc (Zn)",
    property: "Zn (HCL)",
    unit: "ppm",
    ranges: [0, 5, 10, 15, 20],
    colors: ["#EF9A9A", "#FFCC80", "#FFF59D", "#A5D6A7", "#81C784"],
    labels: ["Very Low", "Low", "Medium", "High", "Very High"]
  },
  manganese: {
    displayName: "Manganese (Mn)",
    property: "Mn (HCl)",
    unit: "ppm",
    ranges: [0, 20, 40, 60, 80],
    colors: ["#FFCDD2", "#FFAB91", "#FFCC80", "#C5E1A5", "#A5D6A7"],
    labels: ["Very Low", "Low", "Medium", "High", "Very High"]
  }
};

const FieldSamplingMap = ({
  className,
  nutrientType = "phosphorus"
}: FieldSamplingMapProps) => {
  const mapRef = useRef<L.Map | null>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const layersRef = useRef<{
    boundaryLayer?: L.GeoJSON;
    pointsLayer?: L.GeoJSON;
    legend?: L.Control;
  }>({});

  useEffect(() => {
    if (!mapContainerRef.current) return;

    // Initialize map if it doesn't exist
    if (!mapRef.current) {
      console.log("Initializing map...");

      // Initialize map
      const map = L.map(mapContainerRef.current, {
        minZoom: 14,
        maxZoom: 20,
        zoomControl: true,
        scrollWheelZoom: true,
        doubleClickZoom: true,
        dragging: true,
        maxBoundsViscosity: 1.0 // Completely restrict panning outside bounds
      });

      mapRef.current = map;

      // Add satellite imagery tile layer
      L.tileLayer(
        "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
        {
          attribution:
            "Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community"
        }
      ).addTo(map);

      // Add field boundary to map
      const boundaryLayer = L.geoJSON(typedBoundaryData, {
        style: {
          fillColor: "#f8f9fa",
          weight: 3,
          opacity: 1,
          color: "#495057",
          fillOpacity: 0.2,
          dashArray: "5"
        },
        interactive: false // Make boundary not clickable
      }).addTo(map);

      layersRef.current.boundaryLayer = boundaryLayer;

      // Add scale control
      L.control
        .scale({ position: "bottomleft", imperial: true, metric: true })
        .addTo(map);

      // Fit map bounds to field boundary with padding
      const bounds = boundaryLayer.getBounds();
      map.fitBounds(bounds, {
        padding: [20, 20],
        maxZoom: 18
      });

      // Set max bounds with a small buffer around the field boundary to restrict panning
      const southWest = bounds.getSouthWest();
      const northEast = bounds.getNorthEast();
      const bufferLat = 0.002; // Roughly 200m in latitude
      const bufferLng = 0.002; // Roughly 200m in longitude
      const maxBounds = L.latLngBounds(
        L.latLng(southWest.lat - bufferLat, southWest.lng - bufferLng),
        L.latLng(northEast.lat + bufferLat, northEast.lng + bufferLng)
      );
      map.setMaxBounds(maxBounds);

      // Add custom popup styles to the document
      const style = document.createElement("style");
      style.innerHTML = `
      .custom-popup .leaflet-popup-content-wrapper {
        border-radius: 8px;
        padding: 0;
        box-shadow: 0 4px 16px rgba(0,0,0,0.15);
        overflow: hidden;
      }
      
      .custom-popup .leaflet-popup-content {
        margin: 0;
        padding: 0;
        line-height: 1.5;
        width: 100% !important;
      }
      
      .custom-popup .leaflet-popup-tip {
        background-color: var(--popup-bg);
      }
      
      .field-popup, .sample-popup {
        font-family: system-ui, -apple-system, sans-serif;
        font-size: 13px;
        color: var(--popup-text);
        background-color: var(--popup-bg);
        padding: 16px;
        max-height: 400px;
        overflow-y: auto;
        scrollbar-width: thin;
        scrollbar-color: var(--popup-border) transparent;
      }
      
      /* Scrollbar styling for webkit browsers */
      .field-popup::-webkit-scrollbar, .sample-popup::-webkit-scrollbar {
        width: 6px;
      }
      
      .field-popup::-webkit-scrollbar-track, .sample-popup::-webkit-scrollbar-track {
        background: transparent;
      }
      
      .field-popup::-webkit-scrollbar-thumb, .sample-popup::-webkit-scrollbar-thumb {
        background-color: var(--popup-border);
        border-radius: 6px;
      }
      
      .field-popup-title, .sample-popup-title {
        margin: 0 0 12px;
        font-size: 16px;
        font-weight: 600;
        color: var(--popup-title);
        border-bottom: 1px solid var(--popup-border);
        padding-bottom: 8px;
        position: sticky;
        top: 0;
        background-color: var(--popup-bg);
        z-index: 1;
        padding-top: 4px;
      }
      
      .field-popup-grid, .sample-popup-card-grid {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 8px;
      }
      
      .field-popup-label, .sample-popup-label {
        color: var(--popup-label);
        font-size: 12px;
      }
      
      .field-popup-value, .sample-popup-value {
        text-align: right;
        font-weight: 500;
        color: var(--popup-value);
      }
      
      .sample-popup-section {
        margin-bottom: 12px;
      }
      
      .sample-popup-card {
        background-color: var(--popup-card-bg);
        padding: 12px;
        border-radius: 6px;
        margin-bottom: 12px;
      }
      
      .sample-popup-card:last-child {
        margin-bottom: 0;
      }
      
      .sample-popup-card-title {
        font-weight: 600;
        margin-bottom: 8px;
        color: var(--popup-title);
        font-size: 14px;
      }
      
      /* Light mode variables */
      :root {
        --popup-bg: #ffffff;
        --popup-text: #333333;
        --popup-title: #166534;
        --popup-border: rgba(0,0,0,0.1);
        --popup-label: #6b7280;
        --popup-value: #111827;
        --popup-card-bg: #f9fafb;
      }
      
      /* Dark mode variables */
      @media (prefers-color-scheme: dark) {
        :root {
          --popup-bg: #1e1e1e;
          --popup-text: #e0e0e0;
          --popup-title: #4ade80;
          --popup-border: rgba(255,255,255,0.1);
          --popup-label: #9ca3af;
          --popup-value: #f3f4f6;
          --popup-card-bg: #2a2a2a;
        }
      }
    `;
      document.head.appendChild(style);
    }

    // Update the map with the selected nutrient type
    updateMapLayers(nutrientType);

    // Cleanup on unmount
    return () => {
      if (mapRef.current && !document.body.contains(mapContainerRef.current)) {
        mapRef.current.remove();
        mapRef.current = null;
        layersRef.current = {};
      }
    };
  }, [nutrientType]);

  // Function to update map layers based on nutrient type
  const updateMapLayers = (nutrientType: string) => {
    if (!mapRef.current) return;

    const map = mapRef.current;
    const selectedNutrient =
      nutrientInfo[nutrientType as keyof typeof nutrientInfo] ||
      nutrientInfo.phosphorus;

    // Remove existing points layer if it exists
    if (layersRef.current.pointsLayer) {
      map.removeLayer(layersRef.current.pointsLayer);
    }

    // Remove existing legend if it exists
    if (layersRef.current.legend) {
      map.removeControl(layersRef.current.legend);
    }

    // Define color function for the selected nutrient
    const getNutrientColor = (value: number) => {
      const { ranges, colors } = selectedNutrient;

      for (let i = 0; i < ranges.length - 1; i++) {
        if (value < ranges[i + 1]) {
          return colors[i];
        }
      }
      return colors[colors.length - 1]; // Return the last color for values above the highest range
    };

    // Create legend for the selected nutrient
    const legend = new L.Control({ position: "topright" });
    legend.onAdd = () => {
      const div = L.DomUtil.create("div", "info legend sf_layer");
      div.style.backgroundColor = "var(--card-bg, white)";
      div.style.color = "var(--text-color, black)";
      div.style.padding = "10px";
      div.style.borderRadius = "8px";
      div.style.border = "1px solid var(--border-color, rgba(0,0,0,0.1))";
      div.style.boxShadow = "var(--shadow, 0 1px 5px rgba(0,0,0,0.2))";
      div.style.fontSize = "12px";
      div.style.lineHeight = "18px";
      div.style.backdropFilter = "blur(10px)";

      const { ranges, colors, labels, displayName, unit } = selectedNutrient;
      const opacity = 0.8;

      div.innerHTML = `<div style="margin-bottom:6px"><strong>${displayName}</strong></div>`;
      for (let i = 0; i < ranges.length; i++) {
        div.innerHTML += `<i style="background:${
          colors[i]
        };opacity:${opacity}"></i> ${
          i < ranges.length - 1
            ? `${ranges[i]}-${ranges[i + 1]}`
            : `${ranges[i]}+`
        } ${unit} <span style="float:right;font-style:italic;font-size:10px;">${
          labels[i]
        }</span><br>`;
      }

      // Add some custom styling for the legend items
      div.innerHTML += `
        <style>
          .legend i {
            width: 18px;
            height: 18px;
            float: left;
            margin-right: 8px;
            opacity: 0.7;
            border-radius: 50%;
          }
          
          @media (prefers-color-scheme: dark) {
            .legend {
              --card-bg: rgba(30, 30, 30, 0.8);
              --text-color: #e0e0e0;
              --border-color: rgba(255,255,255,0.1);
              --shadow: 0 4px 12px rgba(0,0,0,0.5);
            }
          }
          
          @media (prefers-color-scheme: light) {
            .legend {
              --card-bg: rgba(255, 255, 255, 0.9);
              --text-color: #333;
              --border-color: rgba(0,0,0,0.1);
              --shadow: 0 2px 8px rgba(0,0,0,0.1);
            }
          }
        </style>
      `;

      return div;
    };
    legend.addTo(map);
    layersRef.current.legend = legend;

    // Add sampling points to map with the selected nutrient colors
    const pointsLayer = L.geoJSON(typedPointData, {
      pointToLayer: (feature, latlng) => {
        const value = feature.properties?.[selectedNutrient.property] || 0;
        return L.circleMarker(latlng, {
          radius: 8,
          fillColor: getNutrientColor(value),
          color: "white",
          weight: 2,
          opacity: 1,
          fillOpacity: 0.8
        });
      },
      onEachFeature: (feature, layer) => {
        if (feature.properties) {
          const props = feature.properties;
          const sampleDate = props.SampleDate
            ? new Date(props.SampleDate).toLocaleDateString()
            : "N/A";

          layer.bindPopup(
            `
            <div class="sample-popup">
              <h3 class="sample-popup-title">Sample ${
                props.SampleID || props.ID || "N/A"
              }</h3>
              
              <div class="sample-popup-section">
                <div class="sample-popup-label">Sample Date:</div>
                <div class="sample-popup-value">${sampleDate}</div>
              </div>
              
              <div class="sample-popup-card">
                <div class="sample-popup-card-title">Primary Nutrients (NPK)</div>
                <div class="sample-popup-card-grid">
                  <div class="sample-popup-label">Nitrogen (N):</div>
                  <div class="sample-popup-value">${
                    props["N"] ||
                    props["NO3-N"] ||
                    props["NH4-N"] ||
                    props["TotalN"] ||
                    "Not tested"
                  } ${props["N_Unit"] || props["N_Units"] || "ppm"}</div>
                  
                  <div class="sample-popup-label">Phosphorus (P):</div>
                  <div class="sample-popup-value">${
                    props["P (B1 1_7)"] ||
                    props["P"] ||
                    props["P_Bray"] ||
                    props["P_Olsen"] ||
                    "Not tested"
                  } ${props["P_Unit"] || "ppm"}</div>
                  
                  <div class="sample-popup-label">Potassium (K):</div>
                  <div class="sample-popup-value">${
                    props["K (AA)"] || props["K"] || "Not tested"
                  } ${props["K (AA)U"] || props["K_Unit"] || "ppm"}</div>
                </div>
              </div>
              
              <div class="sample-popup-card">
                <div class="sample-popup-card-title">Soil Properties</div>
                <div class="sample-popup-card-grid">
                  <div class="sample-popup-label">pH:</div>
                  <div class="sample-popup-value">${
                    props["pH (1_1)"] || props["pH"] || "Not tested"
                  }</div>
                  
                  <div class="sample-popup-label">Organic Matter:</div>
                  <div class="sample-popup-value">${
                    props["OM (WB)"] || props["OM"] || "Not tested"
                  }${props["OM (WB)U"] || props["OM_Unit"] || "%"}</div>
                  
                  <div class="sample-popup-label">CEC:</div>
                  <div class="sample-popup-value">${
                    props["CEC (AA)"] || props["CEC"] || "Not tested"
                  } ${props["CEC (AA)U"] || "meq/100g"}</div>
                  
                  <div class="sample-popup-label">Depth:</div>
                  <div class="sample-popup-value">${
                    props.Depth || "Not specified"
                  } ${props.DepthUnits || "in"}</div>
                </div>
              </div>
              
              <div class="sample-popup-card">
                <div class="sample-popup-card-title">Secondary Nutrients</div>
                <div class="sample-popup-card-grid">
                  <div class="sample-popup-label">Calcium (Ca):</div>
                  <div class="sample-popup-value">${
                    props["Ca (AA)"] || props["Ca"] || "Not tested"
                  } ${props["Ca (AA)U"] || props["Ca_Unit"] || "ppm"}</div>
                  
                  <div class="sample-popup-label">Magnesium (Mg):</div>
                  <div class="sample-popup-value">${
                    props["Mg (AA)"] || props["Mg"] || "Not tested"
                  } ${props["Mg (AA)U"] || props["Mg_Unit"] || "ppm"}</div>
                  
                  <div class="sample-popup-label">Sulfur (S):</div>
                  <div class="sample-popup-value">${
                    props["S"] || props["SO4-S"] || "Not tested"
                  } ${props["S_Unit"] || "ppm"}</div>
                </div>
              </div>
            </div>
          `,
            {
              className: "custom-popup",
              closeButton: true,
              maxWidth: 300,
              minWidth: 260,
              maxHeight: 400
            }
          );
        }
      }
    }).addTo(map);

    layersRef.current.pointsLayer = pointsLayer;
  };

  return (
    <div
      ref={mapContainerRef}
      className={`w-full h-[600px] rounded-lg overflow-hidden shadow-lg ${
        className || ""
      }`}
    />
  );
};

export default FieldSamplingMap;
