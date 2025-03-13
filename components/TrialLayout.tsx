"use client";

import { MapContainer, TileLayer, GeoJSON } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import demoPlotData from "@/public/simple-sense/DemoSmallPlot_250130_v6.json";
import { useCallback } from "react";
import type { FeatureCollection, Feature, GeoJsonProperties } from "geojson";
import { PathOptions } from "leaflet";
import { Card } from "@/components/ui/card";

export type TrialLayoutProps = {
  view: "treatment" | "replication";
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

// MapWrapper component to handle map instance
const MapWrapper = ({ view }: TrialLayoutProps) => {
  const getStyle = useCallback(
    (feature?: Feature<any, GeoJsonProperties>): PathOptions => {
      if (!feature) return {};

      const property =
        view === "treatment"
          ? feature.properties?.Trt || "" // Use Trt for treatment view
          : String(feature.properties?.Rep || ""); // Convert Rep to string for replication view

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
      center={[40.31178, -85.14825]}
      zoom={22}
      style={{ height: "100%", width: "100%" }}
      scrollWheelZoom={false}
      zoomControl={false}
    >
      <TileLayer
        attribution="Tiles &copy; Esri"
        url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
      />
      <GeoJSON
        data={demoPlotData as FeatureCollection}
        style={getStyle}
        eventHandlers={{
          click: e => {
            const props = e.layer.feature.properties;
            console.log("Plot clicked:", props);
          }
        }}
      />
    </MapContainer>
  );
};

export default function TrialLayout({ view }: TrialLayoutProps) {
  return (
    <div className="h-[500px] w-full relative">
      <div key={view} className="h-full w-full">
        <MapWrapper view={view} />
      </div>
      <Legend view={view} />
    </div>
  );
}
