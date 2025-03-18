"use client";

import { MapContainer, TileLayer, GeoJSON, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import demoPlotData from "@/public/simple-sense/SmallPlots_Demo_v6_WGS_Plots_ExtractionZones.json";
import { useCallback, useEffect, useState } from "react";
import type { FeatureCollection, Feature, GeoJsonProperties } from "geojson";
import { PathOptions, LatLngBounds, latLng, PointTuple } from "leaflet";
import { Card } from "@/components/ui/card";

export type TrialLayoutProps = {
  view: "treatment" | "replication";
};

// Calculate bounds from the GeoJSON data
const calculateBounds = () => {
  const bounds = new LatLngBounds([]);

  demoPlotData.features.forEach(feature => {
    const coordinates = feature.geometry.coordinates[0];
    coordinates.forEach((coord: number[]) => {
      // Note the order flip: GeoJSON is [lng, lat] but Leaflet uses [lat, lng]
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

const getPlotColor = (property: string, view: "treatment" | "replication") => {
  if (view === "treatment") {
    // Colors for treatments A through L
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
    // Colors for replications 1 through 4
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
      // Add some padding around bounds to make it look nicer
      const paddedBounds = bounds.pad(0.1);

      // Set max bounds to restrict panning
      map.setMaxBounds(paddedBounds);

      // Use negative padding for mobile to zoom in more
      const padding: PointTuple = isMobile ? [-20, -20] : [10, 10];

      map.fitBounds(bounds, {
        padding,
        animate: true,
        maxZoom: isMobile ? 18 : 20
      });
    }
  }, [map, isMobile]);

  return null;
};

const Legend = ({ view }: { view: "treatment" | "replication" }) => {
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
    <Card className="absolute bottom-4 right-4 z-[400] p-4 bg-white">
      <h6 className="font-semibold mb-2 text-black">
        {view === "treatment" ? "Treatments" : "Replications"}
      </h6>
      <div className="grid grid-cols-1 gap-1">
        {items.map((item, index) => (
          <div key={index} className="flex items-center gap-2">
            <div
              className="w-4 h-4 rounded border border-gray-200"
              style={{ backgroundColor: item.color }}
            />
            <span className="text-xs text-black">{item.label}</span>
          </div>
        ))}
      </div>
    </Card>
  );
};

// Update MapContainer props
const MapWrapper = ({ view }: TrialLayoutProps) => {
  const center = getCenter();
  const isMobile = useIsMobile();
  const bounds = calculateBounds();

  const getStyle = useCallback(
    (feature?: Feature<any, GeoJsonProperties>): PathOptions => {
      if (!feature) return {};

      const property =
        view === "treatment"
          ? feature.properties?.Trt || ""
          : String(feature.properties?.Rep || "");

      return {
        fillColor: getPlotColor(property, view),
        weight: 2,
        opacity: 1,
        color: "white",
        fillOpacity: 0.7
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
      minZoom={isMobile ? 17 : 18}
      maxBounds={bounds.pad(0.1)}
      maxBoundsViscosity={1.0}
      zoom={18}
    >
      <TileLayer
        attribution="© Esri"
        url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
        maxZoom={23}
      />
      <GeoJSON
        data={demoPlotData as FeatureCollection}
        style={getStyle}
        eventHandlers={{
          click: e => {
            const props = e.layer.feature.properties;
          }
        }}
      />
      <MapBoundsUpdater />
    </MapContainer>
  );
};

export default function TrialLayout({ view }: TrialLayoutProps) {
  // Use a unique key based on the view to force remount when view changes
  return (
    <div className="h-[600px] w-full relative">
      <div key={`map-${view}`} className="h-full w-full">
        <MapWrapper view={view} />
      </div>
      <Legend view={view} />
    </div>
  );
}
