"use client";

import { useEffect, useRef, useCallback } from "react";
import trialData from "../../public/simple-sense/DemoSmallPlot_250130_v6.json";
import { Card } from "@/components/ui/card";

// Since we're using the Leaflet library dynamically
declare global {
  interface Window {
    L: any;
  }
}

// Helper function to get color based on NDVI value
const getNDVIColor = (ndvi: number) => {
  return ndvi > 0.8
    ? "#006837" // Very high NDVI - dark green
    : ndvi > 0.7
    ? "#1a9850" // High NDVI - green
    : ndvi > 0.6
    ? "#66bd63" // Moderate-high NDVI - light green
    : ndvi > 0.5
    ? "#a6d96a" // Moderate NDVI - yellow-green
    : ndvi > 0.4
    ? "#fee08b" // Moderate-low NDVI - yellow
    : ndvi > 0.3
    ? "#fdae61" // Low NDVI - orange
    : ndvi > 0.2
    ? "#f46d43" // Very low NDVI - orange-red
    : "#d73027"; // Extremely low NDVI - red
};

// Calculate bounds of trial area with tighter padding
const calculateTrialBounds = () => {
  let minLat = Infinity;
  let maxLat = -Infinity;
  let minLng = Infinity;
  let maxLng = -Infinity;

  trialData.features.forEach(feature => {
    feature.geometry.coordinates[0].forEach(coord => {
      minLng = Math.min(minLng, coord[0]);
      maxLng = Math.max(maxLng, coord[0]);
      minLat = Math.min(minLat, coord[1]);
      maxLat = Math.max(maxLat, coord[1]);
    });
  });

  // Calculate the size of the bounds
  const latRange = maxLat - minLat;
  const lngRange = maxLng - minLng;

  // Add very small padding (0.5% of the range)
  const latPadding = latRange * 0.005;
  const lngPadding = lngRange * 0.005;

  return [
    [minLat - latPadding, minLng - lngPadding],
    [maxLat + latPadding, maxLng + lngPadding]
  ];
};

// NDVI Color Scale Component
const NDVIColorScale = () => (
  <Card className="absolute bottom-4 right-4 p-4 bg-white/90 rounded-lg shadow-lg z-[1000] max-w-[200px]">
    <h3 className="font-semibold mb-2 text-sm">NDVI Values</h3>
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <div
          className="w-4 h-4 rounded-sm"
          style={{ backgroundColor: "#006837" }}
        ></div>
        <span className="text-xs">≥ 0.8 (High Vigor)</span>
      </div>
      <div className="flex items-center gap-2">
        <div
          className="w-4 h-4 rounded-sm"
          style={{ backgroundColor: "#1a9850" }}
        ></div>
        <span className="text-xs">0.7 - 0.8</span>
      </div>
      <div className="flex items-center gap-2">
        <div
          className="w-4 h-4 rounded-sm"
          style={{ backgroundColor: "#66bd63" }}
        ></div>
        <span className="text-xs">0.6 - 0.7</span>
      </div>
      <div className="flex items-center gap-2">
        <div
          className="w-4 h-4 rounded-sm"
          style={{ backgroundColor: "#a6d96a" }}
        ></div>
        <span className="text-xs">0.5 - 0.6</span>
      </div>
      <div className="flex items-center gap-2">
        <div
          className="w-4 h-4 rounded-sm"
          style={{ backgroundColor: "#fee08b" }}
        ></div>
        <span className="text-xs">0.4 - 0.5</span>
      </div>
      <div className="flex items-center gap-2">
        <div
          className="w-4 h-4 rounded-sm"
          style={{ backgroundColor: "#fdae61" }}
        ></div>
        <span className="text-xs">0.3 - 0.4</span>
      </div>
      <div className="flex items-center gap-2">
        <div
          className="w-4 h-4 rounded-sm"
          style={{ backgroundColor: "#f46d43" }}
        ></div>
        <span className="text-xs">0.2 - 0.3</span>
      </div>
      <div className="flex items-center gap-2">
        <div
          className="w-4 h-4 rounded-sm"
          style={{ backgroundColor: "#d73027" }}
        ></div>
        <span className="text-xs">≤ 0.2 (Low Vigor)</span>
      </div>
    </div>
  </Card>
);

export default function NDVITrialMap() {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const layersRef = useRef<any[]>([]);

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

        // Get trial bounds
        const trialBounds = calculateTrialBounds();

        // Initialize map with restricted bounds and movement
        const map = L.map(mapRef.current, {
          center: [40.3116, -85.1485],
          zoom: 20, // Start with closer zoom
          minZoom: 19, // More restricted minimum zoom
          maxZoom: 21, // Keep max zoom the same
          maxBounds: trialBounds,
          maxBoundsViscosity: 1.0, // Make bounds completely solid
          preferCanvas: true,
          zoomControl: false,
          scrollWheelZoom: "center", // Keep zoom centered
          bounceAtZoomLimits: false, // Prevent bouncing at zoom limits
          keyboard: false, // Disable keyboard navigation
          dragging: true // Keep dragging enabled but it will be restricted by maxBounds
        });

        mapInstanceRef.current = map;

        // Add custom zoom control in a better position
        L.control
          .zoom({
            position: "bottomright"
          })
          .addTo(map);

        // Add satellite imagery base layer
        L.tileLayer(
          "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
          {
            maxZoom: 21,
            attribution: "© Esri"
          }
        ).addTo(map);

        // Create layers for each NDVI measurement
        const ndviLayers: { [key: string]: L.LayerGroup } = {};
        const ndviDates = ["M_1", "M_2", "M_3", "M_4", "M_5", "M_6"];

        ndviDates.forEach(date => {
          ndviLayers[`NDVI ${date}`] = L.layerGroup();
        });

        // Add trial plots to each NDVI layer
        trialData.features.forEach(plot => {
          const coords = plot.geometry.coordinates[0];
          const latlngs = coords.map(coord => [coord[1], coord[0]]);
          const plotCenter = [
            latlngs.reduce((sum, coord) => sum + coord[0], 0) / latlngs.length,
            latlngs.reduce((sum, coord) => sum + coord[1], 0) / latlngs.length
          ];

          ndviDates.forEach(date => {
            const ndviValue = plot.properties[`NDVI_${date}`];
            const plotPolygon = L.polygon(latlngs, {
              color: "#ffffff",
              weight: 1.5,
              opacity: 1,
              fillColor: getNDVIColor(ndviValue),
              fillOpacity: 0.8
            });

            // Create tooltip content with improved styling
            const tooltipContent = `
              <div class="p-4 bg-white rounded-lg shadow-lg" style="min-width: 200px; border: 1px solid #e2e8f0;">
                <div class="font-bold text-lg mb-3 text-gray-900 border-b pb-2">Plot ${
                  plot.properties.Plot
                }</div>
                <div class="grid grid-cols-2 gap-3">
                  <div class="font-semibold text-gray-700">Treatment:</div>
                  <div class="text-gray-900">${plot.properties.Trt}</div>
                  <div class="font-semibold text-gray-700">NDVI:</div>
                  <div class="text-gray-900">${ndviValue.toFixed(3)}</div>
                  <div class="font-semibold text-gray-700">Product:</div>
                  <div class="text-gray-900">${plot.properties.MainPlot1}</div>
                  <div class="font-semibold text-gray-700">Time:</div>
                  <div class="text-gray-900">${plot.properties.SubPlot1}</div>
                </div>
              </div>
            `;

            plotPolygon.bindTooltip(tooltipContent, {
              permanent: false,
              direction: "top",
              className: "custom-tooltip",
              offset: [0, -10],
              opacity: 1
            });

            // Add plot label
            const label = L.divIcon({
              className: "plot-label",
              html: `<div class="bg-white/90 px-1 py-0.5 text-xs font-semibold rounded shadow-sm">
                      ${plot.properties.Plot}
                    </div>`,
              iconSize: [20, 20],
              iconAnchor: [10, 10]
            });

            L.marker(plotCenter, { icon: label }).addTo(
              ndviLayers[`NDVI ${date}`]
            );
            ndviLayers[`NDVI ${date}`].addLayer(plotPolygon);
          });
        });

        // Add the first NDVI layer by default
        ndviLayers["NDVI M_1"].addTo(map);

        // Add layer control with improved styling
        const layerControl = L.control
          .layers(
            {},
            {
              "NDVI Stage 1": ndviLayers["NDVI M_1"],
              "NDVI Stage 2": ndviLayers["NDVI M_2"],
              "NDVI Stage 3": ndviLayers["NDVI M_3"],
              "NDVI Stage 4": ndviLayers["NDVI M_4"],
              "NDVI Stage 5": ndviLayers["NDVI M_5"],
              "NDVI Stage 6": ndviLayers["NDVI M_6"]
            },
            {
              position: "topright",
              collapsed: false
            }
          )
          .addTo(map);

        // Remove the Leaflet legend control since we're using our React component
        // Fit map to trial plot bounds with minimal padding
        const bounds = L.geoJSON(trialData).getBounds();
        map.fitBounds(bounds, {
          padding: [10, 10], // Minimal padding in pixels
          maxZoom: 20, // Ensure we don't zoom in too far when fitting
          animate: true
        });

        // Add custom CSS for tooltips and labels
        const style = document.createElement("style");
        style.textContent = `
          .custom-tooltip .leaflet-tooltip-content {
            max-width: none !important;
          }
          .plot-label {
            background: transparent;
            border: none;
          }
        `;
        document.head.appendChild(style);

        return () => {
          if (mapInstanceRef.current) {
            mapInstanceRef.current.remove();
            mapInstanceRef.current = null;
          }
          document.head.removeChild(style);
        };
      } catch (error) {
        console.error("Error initializing map:", error);
      }
    }
  }, []);

  return (
    <div className="space-y-4">
      <div className="relative h-[600px] rounded-2xl overflow-hidden border border-border/50">
        <div
          ref={mapRef}
          className="w-full h-full"
          style={{ background: "#f0f0f0", position: "relative" }}
        />
        <div className="absolute inset-0 pointer-events-none">
          <NDVIColorScale />
        </div>
      </div>
      <p className="text-sm text-center text-muted-foreground">
        Interactive trial plot map showing NDVI measurements across different
        growth stages. Click on plots to view detailed information.
      </p>
    </div>
  );
}
