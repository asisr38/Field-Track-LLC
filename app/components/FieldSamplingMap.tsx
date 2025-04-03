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
    property: "P_M3_ppm",
    unit: "ppm",
    ranges: [0, 20, 40, 60, 80], // Based on actual data range: 20-86 ppm
    colors: ["#FF5252", "#FF9800", "#FFEB3B", "#8BC34A", "#4CAF50"]
  },
  potassium: {
    displayName: "Potassium (K)",
    property: "K_M3_ppm",
    unit: "ppm",
    ranges: [0, 30, 40, 50, 60], // Based on actual data range: 30-54 ppm
    colors: ["#F44336", "#FB8C00", "#FFD54F", "#7CB342", "#2E7D32"]
  },
  magnesium: {
    displayName: "Magnesium (Mg)",
    property: "Mg_M3_ppm",
    unit: "ppm",
    ranges: [0, 100, 150, 200, 250], // Based on actual data range: 90-181 ppm
    colors: ["#E53935", "#F57C00", "#FDD835", "#8BC34A", "#388E3C"]
  },
  calcium: {
    displayName: "Calcium (Ca)",
    property: "Ca_M3_ppm",
    unit: "ppm",
    ranges: [0, 800, 1000, 1200, 1400], // Based on actual data range: 789-1299 ppm
    colors: ["#D32F2F", "#EF6C00", "#FBC02D", "#7CB342", "#388E3C"]
  },
  ph: {
    displayName: "pH",
    property: "pH_1_1",
    unit: "",
    ranges: [5.5, 6.0, 6.5, 7.0, 7.5], // Based on actual data range: 6.3-7.5
    colors: ["#F44336", "#FF9800", "#4CAF50", "#FF9800", "#F44336"]
  },
  organicMatter: {
    displayName: "Organic Matter",
    property: "OM_LOI_per",
    unit: "%",
    ranges: [1.5, 1.8, 2.0, 2.2, 2.4], // Based on actual data range: 1.8-2.4%
    colors: ["#FFCDD2", "#FFAB91", "#A5D6A7", "#66BB6A", "#388E3C"]
  },
  cec: {
    displayName: "CEC",
    property: "CEC_M3",
    unit: "meq/100g",
    ranges: [5, 6, 7, 8, 9], // Based on actual data range: 5.0-8.0 meq/100g
    colors: ["#FFCDD2", "#FFAB91", "#A5D6A7", "#66BB6A", "#388E3C"]
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
        const boundaryResponse = await fetch(
          "/field-sampling/data/field-sampling-boundary.geojson"
        );
        if (!boundaryResponse.ok) {
          throw new Error(
            `Failed to fetch boundary data: ${boundaryResponse.status}`
          );
        }
        const boundaryJson = await boundaryResponse.json();

        const pointResponse = await fetch(
          "/field-sampling/data/field-sampling-demo.json"
        );
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

    let isMounted = true;

    // Initialize map if it doesn't exist
    if (!mapRef.current) {
      try {
        // Initialize map
        const map = L.map(mapContainerRef.current, {
          minZoom: 16,
          maxZoom: 18,
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
            attribution: "@Esri"
          }
        ).addTo(map);

        // Add scale control
        L.control
          .scale({ position: "bottomleft", imperial: true, metric: true })
          .addTo(map);

        // Wait for the map to be fully initialized
        setTimeout(() => {
          if (isMounted) {
            map.invalidateSize();
            if (boundaryData && pointData && !isLoading) {
              addDataToMap(map, boundaryData, pointData, nutrientType);
            }
          }
        }, 100);
      } catch (error) {
        console.error("Error initializing map:", error);
        setError("Failed to initialize map");
      }
    }

    // Update map when data is loaded
    if (mapRef.current && boundaryData && pointData && !isLoading) {
      addDataToMap(mapRef.current, boundaryData, pointData, nutrientType);
    }

    // Cleanup function
    return () => {
      isMounted = false;

      // Only attempt cleanup if the map exists and is properly initialized
      if (mapRef.current && mapRef.current.getContainer()) {
        try {
          // Remove layers first
          if (layersRef.current.boundaryLayer) {
            mapRef.current.removeLayer(layersRef.current.boundaryLayer);
          }
          if (layersRef.current.pointsLayer) {
            mapRef.current.removeLayer(layersRef.current.pointsLayer);
          }
          if (layersRef.current.legend) {
            mapRef.current.removeControl(layersRef.current.legend);
          }

          // Remove the map instance
          mapRef.current.remove();
          mapRef.current = null;
          layersRef.current = {};
        } catch (error) {
          console.error("Error cleaning up map:", error);
        }
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

    // Get the selected nutrient info with validation
    const selectedNutrient =
      nutrientInfo[nutrientType as keyof typeof nutrientInfo] ||
      nutrientInfo.phosphorus;

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
      const { ranges, colors } = selectedNutrient;

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
        }`;

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
      } `;

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
            const sampleDate = props.SampleDate ? "October 12, 2024" : "N/A";

            layer.bindPopup(
              `
              <div class="p-3 min-w-[300px]">
                <div class="font-bold text-lg mb-2">Sample ${props.SampleID}</div>
                
                <div class="space-y-3">
                  <div class="bg-gray-50 p-2 rounded">
                    <div class="font-semibold text-sm mb-1">Primary Nutrients</div>
                    <div class="grid grid-cols-2 gap-2 text-sm">
                      <div>P:</div>
                      <div>${props.P_M3_ppm} ppm</div>
                      <div>K:</div>
                      <div>${props.K_M3_ppm} ppm</div>
                    </div>
                  </div>

                  <div class="bg-gray-50 p-2 rounded">
                    <div class="font-semibold text-sm mb-1">Soil Properties</div>
                    <div class="grid grid-cols-2 gap-2 text-sm">
                      <div>pH:</div>
                      <div>${props.pH_1_1}</div>
                      <div>OM:</div>
                      <div>${props.OM_LOI_per}%</div>
                      <div>CEC:</div>
                      <div>${props.CEC_M3} meq/100g</div>
                      <div>Depth:</div>
                      <div>${props.Depth_in} inches</div>
                    </div>
                  </div>

                  <div class="bg-gray-50 p-2 rounded">
                    <div class="font-semibold text-sm mb-1">Secondary Nutrients</div>
                    <div class="grid grid-cols-2 gap-2 text-sm">
                      <div>Ca:</div>
                      <div>${props.Ca_M3_ppm} ppm</div>
                      <div>Mg:</div>
                      <div>${props.Mg_M3_ppm} ppm</div>
                    </div>
                  </div>
                </div>
              </div>
            `,
              {
                className: "custom-popup",
                maxWidth: 350
              }
            );
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
    <div className="space-y-4" key={nutrientType}>
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
          .custom-popup .leaflet-popup-content-wrapper {
            background: white;
            border-radius: 8px;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
          }
          .custom-popup .leaflet-popup-content {
            margin: 0;
            padding: 0;
          }
          .custom-popup .leaflet-popup-tip {
            background: white;
          }
        `}</style>
      </div>
    </div>
  );
};

export default FieldSamplingMap;
