"use client";

import {
  MapContainer,
  TileLayer,
  GeoJSON,
  useMap,
  LayersControl
} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import demoPlotData from "@/public/simple-sense/ExtractionZones_v3.json";
import { useCallback, useEffect, useState, useRef, useMemo } from "react";
import type { FeatureCollection, Feature, GeoJsonProperties } from "geojson";
import { PathOptions, LatLngBounds, latLng, PointTuple } from "leaflet";
import { Card } from "@/components/ui/card";
import parseGeoraster from "georaster";
import GeoRasterLayer from "georaster-layer-for-leaflet";

export type TrialLayoutProps = {
  view?: "treatment" | "replication";
};

export default function TrialLayout({ view = "treatment" }: TrialLayoutProps) {
  const [plotRaster, setPlotRaster] = useState<any>(null);
  const [variMapRaster, setVariMapRaster] = useState<any>(null);

  // Load GeoTIFF data
  useEffect(() => {
    const loadGeoTIFFs = async () => {
      try {
        console.log("Starting to load Plot Raster...");
        const plotRasterResponse = await fetch("/simple-sense/RGB_NoSoil.tif");
        if (!plotRasterResponse.ok) {
          throw new Error(
            `Failed to fetch plot raster: ${plotRasterResponse.status}`
          );
        }
        const plotRasterArrayBuffer = await plotRasterResponse.arrayBuffer();
        const plotRasterData = await parseGeoraster(plotRasterArrayBuffer);

        setPlotRaster(plotRasterData);

        console.log("Starting to load Variability Map...");
        const variMapResponse = await fetch(
          "/simple-sense/NDVI_Symbology_v2.tif"
        );
        if (!variMapResponse.ok) {
          throw new Error(
            `Failed to fetch variability map: ${variMapResponse.status}`
          );
        }
        const variMapArrayBuffer = await variMapResponse.arrayBuffer();
        const variMapData = await parseGeoraster(variMapArrayBuffer);

        setVariMapRaster(variMapData);
      } catch (error) {
        console.error("Error loading GeoTIFF files:", error);
      }
    };

    loadGeoTIFFs();
  }, []);

  // Calculate bounds from the GeoJSON data
  const calculateBounds = () => {
    const bounds = new LatLngBounds([]);
    demoPlotData.features.forEach(feature => {
      const coordinates = feature.geometry.coordinates[0];
      coordinates.forEach((coord: number[]) => {
        bounds.extend([coord[1], coord[0]]);
      });
    });
    return bounds;
  };

  // Function to get center coordinates of the plot area
  const getCenter = () => {
    const bounds = calculateBounds();
    return bounds.getCenter();
  };

  const getPlotColor = (
    property: string,
    view: "treatment" | "replication"
  ) => {
    if (view === "treatment") {
      const treatmentColors: { [key: string]: string } = {
        A: "#e6194B",
        B: "#3cb44b",
        C: "#ffe119",
        D: "#4363d8",
        E: "#f58231",
        F: "#911eb4",
        G: "#42d4f4",
        H: "#f032e6",
        I: "#bfef45",
        J: "#fabed4",
        K: "#469990",
        L: "#dcbeff"
      };
      return treatmentColors[property] || "#808080";
    } else {
      const replicationColors: { [key: number]: string } = {
        1: "#4363d8",
        2: "#3cb44b",
        3: "#f58231",
        4: "#911eb4"
      };
      return replicationColors[parseInt(property)] || "#808080";
    }
  };

  // Add useIsMobile hook
  const useIsMobile = () => {
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
      const checkMobile = () => {
        setIsMobile(window.innerWidth < 768);
      };

      checkMobile();
      window.addEventListener("resize", checkMobile);

      return () => window.removeEventListener("resize", checkMobile);
    }, []);

    return isMobile;
  };

  // Update MapBoundsUpdater component
  const MapBoundsUpdater = () => {
    const map = useMap();
    const isMobile = useIsMobile();

    useEffect(() => {
      const bounds = calculateBounds();
      if (bounds.isValid()) {
        // Add a very small buffer around bounds (roughly 100m)
        const paddedBounds = bounds.pad(0.001);
        map.setMaxBounds(paddedBounds);
        const padding: PointTuple = isMobile ? [10, 10] : [5, 5];
        map.fitBounds(bounds, {
          padding,
          animate: true,
          maxZoom: isMobile ? 19 : 20
        });

        // Set initial zoom level and minimum zoom
        map.setMinZoom(19);
        map.setZoom(isMobile ? 19 : 20);
      }
    }, [map, isMobile]);

    return null;
  };

  const Legend = ({ view }: { view: "treatment" | "replication" }) => {
    const isMobile = useIsMobile();
    const [isCollapsed, setIsCollapsed] = useState(isMobile);

    // Update collapse state when screen size changes
    useEffect(() => {
      setIsCollapsed(isMobile);
    }, [isMobile]);

    const items =
      view === "treatment"
        ? [
            { label: "A - Product A, Time 1", color: "#e6194B" },
            { label: "B - Product A, Time 2", color: "#3cb44b" },
            { label: "C - Product A, Time 3", color: "#ffe119" },
            { label: "D - Product A, Time 4", color: "#4363d8" },
            { label: "E - Product B, Time 1", color: "#f58231" },
            { label: "F - Product B, Time 2", color: "#911eb4" },
            { label: "G - Product B, Time 3", color: "#42d4f4" },
            { label: "H - Product B, Time 4", color: "#f032e6" },
            { label: "I - Product C, Time 1", color: "#bfef45" },
            { label: "J - Product C, Time 2", color: "#fabed4" },
            { label: "K - Product C, Time 3", color: "#469990" },
            { label: "L - Product C, Time 4", color: "#dcbeff" }
          ]
        : [
            { label: "Replication 1", color: "#4363d8" },
            { label: "Replication 2", color: "#3cb44b" },
            { label: "Replication 3", color: "#f58231" },
            { label: "Replication 4", color: "#911eb4" }
          ];

    return (
      <Card
        className={`absolute bottom-4 right-4 z-[400] bg-white dark:bg-gray-800 shadow-md transition-all duration-200 ${
          isCollapsed ? "w-10 h-10 p-0" : "p-4"
        }`}
      >
        {isCollapsed ? (
          // Collapsed state - just show a toggle button
          <button
            onClick={() => setIsCollapsed(false)}
            className="w-full h-full flex items-center justify-center text-gray-800 dark:text-gray-200 hover:text-primary dark:hover:text-primary"
            aria-label="Show legend"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
              <line x1="9" y1="9" x2="15" y2="9"></line>
              <line x1="9" y1="15" x2="15" y2="15"></line>
              <line x1="9" y1="12" x2="15" y2="12"></line>
            </svg>
          </button>
        ) : (
          // Expanded state - show full legend with collapse button
          <>
            <div className="flex items-center justify-between mb-2">
              <h6 className="font-semibold text-black dark:text-white">
                {view === "treatment" ? "Products" : "Replications"}
              </h6>
              <button
                onClick={() => setIsCollapsed(true)}
                className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 p-1"
                aria-label="Hide legend"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>
            </div>
            <div className="grid grid-cols-1 gap-1 max-h-[300px] overflow-y-auto">
              {items.map((item, index) => (
                <div key={index} className="flex items-center gap-2">
                  <div
                    className="w-4 h-4 rounded border border-gray-200 dark:border-gray-600"
                    style={{ backgroundColor: item.color }}
                  />
                  <span className="text-xs text-black dark:text-gray-200">
                    {item.label}
                  </span>
                </div>
              ))}
            </div>
          </>
        )}
      </Card>
    );
  };

  // Simplify the GeoRasterLayerWrapper - completely rewritten
  const GeoRasterLayer2 = ({
    georaster,
    isVariMap = false
  }: {
    georaster: any;
    isVariMap?: boolean;
  }) => {
    const map = useMap();

    useEffect(() => {
      if (!georaster) return;

      // Create raster pane if it doesn't exist
      if (!map.getPane("raster-pane")) {
        map.createPane("raster-pane");
        map.getPane("raster-pane")!.style.zIndex = "250";
      }

      // Create the layer with appropriate configuration based on layer type
      const layerOptions = {
        georaster,
        opacity: 1.0,
        resolution: 256,
        pane: "raster-pane"
      };

      // If it's not the VARI map (NDVI_Symbology_v2.tif), we can apply custom coloring
      // For the VARI map (isVariMap=true), we'll use the pre-symbolized data as is
      if (!isVariMap) {
        // Only apply custom coloring to the RGB layer
        Object.assign(layerOptions, {
          pixelValuesToColorFn: undefined
        });
      }

      // Create the layer with the appropriate options
      const layer = new GeoRasterLayer(layerOptions);

      // Add the layer to the map
      map.addLayer(layer);

      // Cleanup
      return () => {
        map.removeLayer(layer);
      };
    }, [map, georaster, isVariMap]);

    return null;
  };

  // Create a separate component for vector pane setup
  const VectorPaneSetup = () => {
    const map = useMap();

    useEffect(() => {
      if (!map.getPane("vector-pane")) {
        map.createPane("vector-pane");
        map.getPane("vector-pane")!.style.zIndex = "400";
      }
    }, [map]);

    return null;
  };

  const MapWrapper = ({ view }: TrialLayoutProps) => {
    const center = getCenter();
    const isMobile = useIsMobile();
    const bounds = calculateBounds();
    const [showPlots, setShowPlots] = useState(true);
    const [showPlotRaster, setShowPlotRaster] = useState(true);
    const [showVariMap, setShowVariMap] = useState(false);

    const getStyle = useCallback(
      (feature?: Feature<any, GeoJsonProperties>): PathOptions => {
        if (!feature) return {};

        const property =
          view === "treatment"
            ? feature.properties?.Trt || ""
            : String(feature.properties?.Rep || "");

        return {
          fillColor: "transparent",
          weight: 3,
          color: getPlotColor(property, view as "treatment" | "replication"),
          fillOpacity: 0,
          opacity: 0.8
        };
      },
      [view]
    );

    return (
      <MapContainer
        center={center}
        style={{ height: "100%", width: "100%" }}
        scrollWheelZoom={false}
        zoomControl={true}
        doubleClickZoom={false}
        dragging={true}
        touchZoom={isMobile}
        boxZoom={false}
        keyboard={false}
        maxZoom={isMobile ? 19 : 20}
        minZoom={19}
        maxBounds={bounds.pad(0.001)}
        maxBoundsViscosity={1.0}
        zoom={isMobile ? 19 : 20}
      >
        <VectorPaneSetup />

        {/* Base layer */}
        <TileLayer
          attribution="© Esri"
          url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
          maxZoom={23}
        />

        {/* Plot outlines - conditionally rendered */}
        {showPlots && (
          <GeoJSON
            data={demoPlotData as FeatureCollection}
            style={getStyle}
            eventHandlers={{
              click: e => {
                const props = e.layer.feature.properties;
              }
            }}
            pane="vector-pane"
          />
        )}

        {/* Conditional raster layers */}
        {showPlotRaster && plotRaster && (
          <GeoRasterLayer2 georaster={plotRaster} />
        )}
        {showVariMap && variMapRaster && (
          <GeoRasterLayer2 georaster={variMapRaster} isVariMap={true} />
        )}

        {/* Custom layer control - dark mode compatible */}
        <div className="leaflet-top leaflet-right">
          <div className="leaflet-control leaflet-bar bg-white dark:bg-gray-800 p-2 rounded shadow-md z-[1000] border border-gray-200 dark:border-gray-700">
            <h3 className="font-semibold mb-2 text-sm text-gray-900 dark:text-white">
              Layers
            </h3>
            <div className="flex flex-col gap-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={showPlots}
                  onChange={() => setShowPlots(!showPlots)}
                  className="rounded text-blue-600 border-gray-300 dark:border-gray-600 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-800 dark:text-gray-200">
                  Plots
                </span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={showPlotRaster}
                  onChange={() => setShowPlotRaster(!showPlotRaster)}
                  className="rounded text-blue-600 border-gray-300 dark:border-gray-600 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-800 dark:text-gray-200">
                  RGB
                </span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={showVariMap}
                  onChange={() => setShowVariMap(!showVariMap)}
                  className="rounded text-blue-600 border-gray-300 dark:border-gray-600 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-800 dark:text-gray-200">
                  NDVI
                </span>
              </label>
            </div>
          </div>
        </div>

        <MapBoundsUpdater />
      </MapContainer>
    );
  };

  return (
    <div className="h-[600px] w-full relative">
      <div key={`map-${view}`} className="h-full w-full">
        <MapWrapper view={view} />
      </div>
      <Legend view={view} />
    </div>
  );
}
