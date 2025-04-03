"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { Card } from "@/components/ui/card";

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

const TemporalNDVIMap = ({
  trialData,
  measurementIndex
}: TemporalNDVIMapProps) => {
  const [map, setMap] = useState<L.Map | null>(null);

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
  const getFeatureStyle = (feature: any) => {
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
  };

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
          <div><span class="font-medium">Treatment:</span> ${plotInfo.Trt || "N/A"}</div>
          <div><span class="font-medium">Product:</span> ${plotInfo.MainPlot1 || "N/A"}</div>
          <div><span class="font-medium">Timing:</span> ${plotInfo.SubPlot1 || "N/A"}</div>
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
      <div className="absolute inset-0 pointer-events-none">
        <NDVIColorScale />
      </div>
    </div>
  );
};

export default TemporalNDVIMap;
