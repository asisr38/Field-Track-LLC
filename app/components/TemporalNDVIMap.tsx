"use client";

import { useEffect, useState, useCallback } from "react";
import dynamic from "next/dynamic";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { Card } from "@/components/ui/card";
import parseGeoraster from "georaster";
import GeoRasterLayer from "georaster-layer-for-leaflet";

interface TemporalNDVIMapProps {
  trialData: any;
  measurementIndex: 1 | 2 | 3 | 4 | 5 | 6; // NDVI_M_1 through NDVI_M_6
}

// Create a dynamic map component that loads only on client side
const Map = dynamic(() => import("./map-components/LeafletMap"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[500px] bg-muted/20 animate-pulse rounded-lg flex items-center justify-center">
      <p className="text-muted-foreground">Loading map...</p>
    </div>
  )
});

// NDVI Color Scale Component
const NDVIColorScale = () => (
  <Card className="absolute bottom-4 right-4 p-4 bg-white rounded-lg shadow-lg z-[1000] max-w-[200px]">
    <h3 className="font-semibold mb-2 text-sm text-black">NDVI Values</h3>
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <div
          className="w-4 h-4 rounded-sm"
          style={{ backgroundColor: "#91cf60" }}
        ></div>
        <span className="text-xs text-black">≥ 0.8 </span>
      </div>
      <div className="flex items-center gap-2">
        <div
          className="w-4 h-4 rounded-sm"
          style={{ backgroundColor: "#d9ef8b" }}
        ></div>
        <span className="text-xs text-black">0.7 - 0.8</span>
      </div>
      <div className="flex items-center gap-2">
        <div
          className="w-4 h-4 rounded-sm"
          style={{ backgroundColor: "#fee08b" }}
        ></div>
        <span className="text-xs text-black">0.5 - 0.7</span>
      </div>
      <div className="flex items-center gap-2">
        <div
          className="w-4 h-4 rounded-sm"
          style={{ backgroundColor: "#fc8d59" }}
        ></div>
        <span className="text-xs text-black">0.3 - 0.5</span>
      </div>
      <div className="flex items-center gap-2">
        <div
          className="w-4 h-4 rounded-sm"
          style={{ backgroundColor: "#d73027" }}
        ></div>
        <span className="text-xs text-black">≤ 0.3</span>
      </div>
    </div>
  </Card>
);

// VARI Color Scale Component (Pre-symbolized)
const VARIColorScale = () => (
  <Card className="absolute bottom-4 right-4 p-4 bg-white rounded-lg shadow-lg z-[1000] max-w-[200px]">
    <h3 className="font-semibold mb-2 text-sm text-black">NDVI Values</h3>
    <div
      className="h-4 w-full rounded-sm mb-2"
      style={{
        background: "linear-gradient(to right, red, yellow, green)"
      }}
    ></div>
    <div className="flex justify-between">
      <span className="text-xs text-black">Low</span>
      <span className="text-xs text-black">High</span>
    </div>
  </Card>
);

// GeoRasterLayer component for pre-symbolized NDVI map
const GeoRasterLayerWrapper = ({ map }: { map: L.Map | null }) => {
  const [variMapRaster, setVariMapRaster] = useState<any>(null);
  const [loadError, setLoadError] = useState<string | null>(null);

  // Load GeoTIFF data for pre-symbolized NDVI map
  useEffect(() => {
    if (!map) return;

    const loadGeoTIFF = async () => {
      try {
        console.log("Starting to load Pre-symbolized NDVI Map...");
        // Try the original variability map as fallback
        const fileOptions = [
          "/simple-sense/NDVI_Symbology_v2.tif",
          "/simple-sense/VegIndex_NoSoil.tif" // Fallback option
        ];

        let loaded = false;
        let lastError = null;

        // Try each file until one loads successfully
        for (const filePath of fileOptions) {
          try {
            console.log(`Attempting to load ${filePath}...`);
            const response = await fetch(filePath);

            if (!response.ok) {
              throw new Error(
                `Failed to fetch: ${response.status} ${response.statusText}`
              );
            }

            const arrayBuffer = await response.arrayBuffer();
            console.log(
              `Successfully got arrayBuffer for ${filePath}, size: ${arrayBuffer.byteLength} bytes`
            );

            const georasterData = await parseGeoraster(arrayBuffer);
            console.log(`Successfully parsed georaster for ${filePath}:`, {
              width: georasterData.width,
              height: georasterData.height,
              bands: georasterData.numberOfRasters,
              noDataValue: georasterData.noDataValue
            });

            setVariMapRaster(georasterData);
            console.log(`Successfully set variMapRaster for ${filePath}`);
            loaded = true;
            setLoadError(null);
            break; // Exit the loop once a file loads successfully
          } catch (err) {
            console.error(`Error loading ${filePath}:`, err);
            lastError = err;
          }
        }

        if (!loaded) {
          const errorMessage = lastError
            ? `All files failed to load. Last error: ${lastError.message}`
            : "All files failed to load without specific error.";
          console.error(errorMessage);
          setLoadError(errorMessage);
        }
      } catch (error) {
        console.error("Error in main loadGeoTIFF function:", error);
        setLoadError(
          `Error loading GeoTIFF: ${
            error instanceof Error ? error.message : String(error)
          }`
        );
      }
    };

    loadGeoTIFF();
  }, [map]);

  useEffect(() => {
    if (!map || !variMapRaster) return;

    try {
      console.log("Creating raster layer...");

      // Create raster pane if it doesn't exist
      if (!map.getPane("raster-pane")) {
        map.createPane("raster-pane");
        map.getPane("raster-pane")!.style.zIndex = "250";
      }

      // Create the layer with better logging
      const layer = new GeoRasterLayer({
        georaster: variMapRaster,
        opacity: 0.9,
        resolution: 256,
        pane: "raster-pane"
      });

      console.log("Adding layer to map...");
      map.addLayer(layer);
      console.log("Layer added successfully");

      // Cleanup
      return () => {
        console.log("Removing layer from map...");
        map.removeLayer(layer);
      };
    } catch (error) {
      console.error("Error creating or adding raster layer:", error);
      setLoadError(
        `Error creating layer: ${
          error instanceof Error ? error.message : String(error)
        }`
      );
    }
  }, [map, variMapRaster]);

  // Display error message if loading fails
  if (loadError && map) {
    return (
      <div className="absolute top-20 left-4 z-[1000] bg-red-50 border border-red-200 text-red-800 p-3 rounded shadow-md max-w-xs">
        <h4 className="font-medium text-sm mb-1">Failed to load NDVI layer</h4>
        <p className="text-xs">{loadError}</p>
      </div>
    );
  }

  return null;
};

const TemporalNDVIMap = ({
  trialData,
  measurementIndex
}: TemporalNDVIMapProps) => {
  const [map, setMap] = useState<L.Map | null>(null);
  const [showNDVI, setShowNDVI] = useState(true);
  const [showVARI, setShowVARI] = useState(false);
  const [, setErrorState] = useState<string | null>(null);

  // Calculate bounds from trial data
  const calculateTrialBounds = () => {
    if (!trialData?.features?.length) return null;
    const bounds = L.latLngBounds([]);
    trialData.features.forEach((feature: any) => {
      const coordinates = feature.geometry.coordinates[0];
      coordinates.forEach((coord: [number, number]) => {
        bounds.extend([coord[1], coord[0]]);
      });
    });
    return bounds.pad(0.005);
  };

  const bounds = calculateTrialBounds();

  // Style function for GeoJSON features
  const getFeatureStyle = useCallback(
    (feature: any) => {
      if (!showNDVI) {
        return {
          fillColor: "transparent",
          weight: 2,
          opacity: 1,
          color: "white",
          fillOpacity: 0
        };
      }

      const ndviString = feature.properties[`NDVI_M_${measurementIndex}`];
      const value = ndviString ? parseFloat(ndviString) : 0;
      const color = getColorForValue(value);
      return {
        fillColor: color,
        weight: 2,
        opacity: 1,
        color: "white",
        fillOpacity: 0.7
      };
    },
    [showNDVI, measurementIndex]
  );

  // Get color based on NDVI value
  const getColorForValue = (value: number) => {
    if (value <= 0.3) return "#d73027";
    if (value <= 0.5) return "#fc8d59";
    if (value <= 0.7) return "#fee08b";
    if (value <= 0.8) return "#d9ef8b";
    return "#91cf60";
  };

  // Popup content
  const onEachFeature = (feature: any, layer: L.Layer) => {
    const value = feature.properties[`NDVI_M_${measurementIndex}`];
    // Convert string value to number for toFixed method
    const ndviValue = value ? parseFloat(value) : null;

    const plotInfo = feature.properties;
    layer.bindTooltip(
      `<div class="bg-white p-3 rounded shadow-md border min-w-[250px] text-black">
        <div class="font-bold mb-2 pb-1 border-b">Plot ${plotInfo.Plot}</div>
        <div>
          <div><span class="font-medium">Treatment:</span> ${
            plotInfo.Trt || "N/A"
          }</div>
          <div><span class="font-medium">Product:</span> ${
            plotInfo.MainPlot1 || "N/A"
          }</div>
          <div><span class="font-medium">Timing:</span> ${
            plotInfo.SubPlot1 || "N/A"
          }</div>
          <div><span class="font-medium">NDVI:</span> ${
            ndviValue !== null ? ndviValue.toFixed(4) : "N/A"
          }</div>
        </div>
      </div>`,
      {
        permanent: false,
        direction: "top",
        className: "custom-tooltip",
        offset: [0, -10],
        opacity: 1
      }
    );
  };

  const handleError = (error: any) => {
    console.error("TemporalNDVIMap error:", error);
    setErrorState(error instanceof Error ? error.message : String(error));
  };

  useEffect(() => {
    if (map && bounds) {
      map.fitBounds(bounds);
      map.setMaxBounds(bounds);
    }
  }, [map, bounds, measurementIndex]);

  if (!bounds) return null;

  return (
    <div className="relative">
      <Map
        bounds={bounds}
        trialData={trialData}
        getFeatureStyle={getFeatureStyle}
        onEachFeature={onEachFeature}
        onMapCreated={setMap}
        useSatelliteLayer={true}
        zoomPosition="topleft"
      />

      {/* Layer Controls */}
      <div className="absolute top-4 right-4 z-[1000]">
        <Card className="p-3 bg-white dark:bg-gray-800 shadow-md">
          <h3 className="font-semibold mb-2 text-sm text-gray-900 dark:text-white">
            Layers
          </h3>
          <div className="flex flex-col gap-2">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={showNDVI}
                onChange={() => setShowNDVI(!showNDVI)}
                className="rounded text-blue-600 border-gray-300 dark:border-gray-600 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-800 dark:text-gray-200">
                Plots
              </span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={showVARI}
                onChange={() => {
                  try {
                    setShowVARI(!showVARI);
                  } catch (error) {
                    handleError(error);
                  }
                }}
                className="rounded text-blue-600 border-gray-300 dark:border-gray-600 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-800 dark:text-gray-200">
                NDVI
              </span>
            </label>
          </div>
        </Card>
      </div>

      {/* Render the VARI layer when checkbox is checked */}
      {showVARI && <GeoRasterLayerWrapper map={map} />}

      <div className="absolute inset-0 pointer-events-none">
        {showVARI ? <VARIColorScale /> : <NDVIColorScale />}
      </div>
    </div>
  );
};

export default TemporalNDVIMap;
