"use client";

import { useEffect, useRef, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

interface FieldSamplingMapProps {
  className?: string;
  nutrientType?: string;
}

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

  // Add state for the data
  const [boundaryData, setBoundaryData] =
    useState<GeoJSON.FeatureCollection | null>(null);
  const [pointData, setPointData] = useState<GeoJSON.FeatureCollection | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch the data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Simple approach - just fetch from public directory
        const boundaryResponse = await fetch("/data/Boundary_Demo.json");
        if (!boundaryResponse.ok) {
          throw new Error(
            `Failed to fetch boundary data: ${boundaryResponse.status}`
          );
        }
        const boundaryJson = await boundaryResponse.json();

        const pointResponse = await fetch("/data/Point_Demo.json");
        if (!pointResponse.ok) {
          throw new Error(
            `Failed to fetch point data: ${pointResponse.status}`
          );
        }
        const pointJson = await pointResponse.json();

        // Set the data
        setBoundaryData(boundaryJson);
        setPointData(pointJson);

        setIsLoading(false);
      } catch (err) {
        console.error("Error fetching data:", err);
        setError(err instanceof Error ? err.message : String(err));
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  // Initialize map and update when data changes
  useEffect(() => {
    if (!mapContainerRef.current) return;

    // Initialize map if it doesn't exist
    if (!mapRef.current) {
      // Initialize map
      const map = L.map(mapContainerRef.current, {
        minZoom: 14,
        maxZoom: 20,
        zoomControl: true,
        scrollWheelZoom: false, // Disable scroll wheel zoom on mobile
        doubleClickZoom: true,
        dragging: true,
        maxBoundsViscosity: 1.0 // Completely restrict panning outside bounds
      });

      // Enable scroll wheel zoom only on desktop
      if (window.innerWidth >= 768) {
        map.scrollWheelZoom.enable();
      }

      mapRef.current = map;

      // Add satellite imagery tile layer
      L.tileLayer(
        "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
        {
          attribution:
            "Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community"
        }
      ).addTo(map);

      // Add scale control
      L.control
        .scale({ position: "bottomleft", imperial: true, metric: true })
        .addTo(map);

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
        max-width: 280px;
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
      
      /* Mobile optimizations */
      @media (max-width: 640px) {
        .custom-popup .leaflet-popup-content {
          max-width: 240px;
        }
        
        .field-popup, .sample-popup {
          font-size: 12px;
          padding: 12px;
        }
        
        .field-popup-title, .sample-popup-title {
          font-size: 14px;
          margin-bottom: 8px;
        }
        
        .field-popup-label, .sample-popup-label {
          font-size: 11px;
        }
      }
    `;
      document.head.appendChild(style);

      // Handle window resize to adjust map
      const handleResize = () => {
        map.invalidateSize();
        // Enable/disable scroll wheel zoom based on screen width
        if (window.innerWidth >= 768) {
          map.scrollWheelZoom.enable();
        } else {
          map.scrollWheelZoom.disable();
        }
      };

      window.addEventListener("resize", handleResize);

      // Wait for the map to be fully initialized
      setTimeout(() => {
        // Force a map redraw to ensure it's fully initialized
        map.invalidateSize();

        // If data is already loaded, add it to the map
        if (boundaryData && pointData && !isLoading) {
          addDataToMap(map, boundaryData, pointData, nutrientType);
        }
      }, 500);

      // Cleanup function
      return () => {
        window.removeEventListener("resize", handleResize);
        if (style.parentNode) {
          style.parentNode.removeChild(style);
        }
      };
    }

    // Update map when data is loaded
    if (mapRef.current && boundaryData && pointData && !isLoading) {
      addDataToMap(mapRef.current, boundaryData, pointData, nutrientType);
    }

    // Cleanup on unmount
    return () => {
      if (mapRef.current && !document.body.contains(mapContainerRef.current)) {
        mapRef.current.remove();
        mapRef.current = null;
        layersRef.current = {};
      }
    };
  }, [nutrientType, isLoading, boundaryData, pointData]);

  // Function to add data to the map
  const addDataToMap = (
    map: L.Map,
    boundaryData: GeoJSON.FeatureCollection,
    pointData: GeoJSON.FeatureCollection,
    nutrientType: string
  ) => {
    // Add boundary layer if not already added
    if (!layersRef.current.boundaryLayer) {
      const boundaryLayer = L.geoJSON(boundaryData, {
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
    }

    // Update the map with the selected nutrient type
    updateMapLayers(nutrientType);
  };

  // Function to update map layers based on nutrient type
  const updateMapLayers = (nutrientType: string) => {
    if (!mapRef.current || !boundaryData || !pointData) {
      return;
    }

    const map = mapRef.current;

    // Remove existing layers
    if (layersRef.current.pointsLayer) {
      map.removeLayer(layersRef.current.pointsLayer);
    }

    if (layersRef.current.legend) {
      map.removeControl(layersRef.current.legend);
    }

    // Get the selected nutrient info
    const selectedNutrient =
      nutrientInfo[nutrientType as keyof typeof nutrientInfo];

    // Create a function to get color based on nutrient value
    const getNutrientColor = (value: number) => {
      const { ranges, colors } = selectedNutrient;

      for (let i = 0; i < ranges.length - 1; i++) {
        if (value >= ranges[i] && value < ranges[i + 1]) {
          return colors[i];
        }
      }

      // Return the last color if value is greater than the highest range
      return colors[colors.length - 1];
    };

    // Create a legend control
    const legend = new L.Control({ position: "bottomright" });

    legend.onAdd = () => {
      const div = L.DomUtil.create("div", "info legend sf_layer");

      // Style the legend
      div.style.backgroundColor = "white";
      div.style.padding = "10px";
      div.style.borderRadius = "5px";
      div.style.boxShadow = "0 1px 5px rgba(0,0,0,0.4)";
      div.style.lineHeight = "1.5";
      div.style.color = "#333";
      div.style.maxWidth = "200px";

      // Add title
      const title = document.createElement("div");
      title.innerHTML = `<strong>${selectedNutrient.displayName}</strong>`;
      title.style.marginBottom = "8px";
      title.style.borderBottom = "1px solid #ddd";
      title.style.paddingBottom = "5px";
      div.appendChild(title);

      // Add color scale
      const { ranges, colors, labels } = selectedNutrient;

      for (let i = 0; i < ranges.length - 1; i++) {
        const row = document.createElement("div");
        row.style.display = "flex";
        row.style.alignItems = "center";
        row.style.marginBottom = "3px";

        const colorBox = document.createElement("span");
        colorBox.style.width = "15px";
        colorBox.style.height = "15px";
        colorBox.style.display = "inline-block";
        colorBox.style.marginRight = "5px";
        colorBox.style.backgroundColor = colors[i];
        colorBox.style.opacity = "0.8";

        const label = document.createElement("span");
        label.innerHTML = `${ranges[i]} - ${ranges[i + 1]} ${
          selectedNutrient.unit
        } <small>(${labels[i]})</small>`;

        row.appendChild(colorBox);
        row.appendChild(label);
        div.appendChild(row);
      }

      // Add the last range
      const lastRow = document.createElement("div");
      lastRow.style.display = "flex";
      lastRow.style.alignItems = "center";

      const lastColorBox = document.createElement("span");
      lastColorBox.style.width = "15px";
      lastColorBox.style.height = "15px";
      lastColorBox.style.display = "inline-block";
      lastColorBox.style.marginRight = "5px";
      lastColorBox.style.backgroundColor = colors[colors.length - 1];
      lastColorBox.style.opacity = "0.8";

      const lastLabel = document.createElement("span");
      lastLabel.innerHTML = `> ${ranges[ranges.length - 1]} ${
        selectedNutrient.unit
      } <small>(${labels[labels.length - 1]})</small>`;

      lastRow.appendChild(lastColorBox);
      lastRow.appendChild(lastLabel);
      div.appendChild(lastRow);

      return div;
    };
    legend.addTo(map);
    layersRef.current.legend = legend;

    // Add sampling points to map with the selected nutrient colors
    try {
      const pointsLayer = L.geoJSON(pointData, {
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

            layer.bindPopup(`
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
            `);
          }
        }
      }).addTo(map);

      layersRef.current.pointsLayer = pointsLayer;
    } catch (err) {
      console.error("Error creating points layer:", err);
      setError(`Error creating points layer: ${err}`);
    }
  };

  return (
    <div className="space-y-4">
      <div
        className="relative h-[600px] rounded-2xl overflow-hidden border border-border/50"
        style={{ zIndex: 1 }}
      >
        {isLoading ? (
          <div className="w-full h-full flex items-center justify-center bg-gray-100">
            <div className="text-center">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-primary border-t-transparent mb-2"></div>
              <p className="text-sm text-muted-foreground">
                Loading soil sampling data...
              </p>
            </div>
          </div>
        ) : error ? (
          <div className="w-full h-full flex items-center justify-center bg-gray-100">
            <div className="text-center p-4">
              <p className="text-red-500 mb-2">Error loading data</p>
              <p className="text-sm text-muted-foreground">{error}</p>
            </div>
          </div>
        ) : (
          <div
            ref={mapContainerRef}
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
      <p className="text-sm text-center text-muted-foreground">
        Each point represents a soil sample location in the field.
      </p>
    </div>
  );
};

export default FieldSamplingMap;
