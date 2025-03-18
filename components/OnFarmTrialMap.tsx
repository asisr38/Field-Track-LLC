"use client";

import { MapContainer, TileLayer, GeoJSON, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import plotsData from "@/public/onfarm/Plots_250316_v2.json";
import boundaryData from "@/public/onfarm/Boundary_250316_v1.json";
import { useCallback, useEffect, useState } from "react";
import type { FeatureCollection, Feature, GeoJsonProperties } from "geojson";
import { PathOptions, LatLngBounds, latLng, PointTuple } from "leaflet";
import { Card } from "@/components/ui/card";

export type OnFarmTrialMapProps = {
  view: "treatment" | "replication" | "product" | "yield";
};

// Calculate bounds from the GeoJSON data
const calculateBounds = () => {
  const bounds = new LatLngBounds([]);

  // Include both plots and boundary in the bounds calculation
  const addFeatureCoordinates = (feature: any) => {
    const coordinates = feature.geometry.coordinates[0];
    coordinates.forEach((coord: number[]) => {
      // Note the order flip: GeoJSON is [lng, lat] but Leaflet uses [lat, lng]
      bounds.extend([coord[1], coord[0]]);
    });
  };

  plotsData.features.forEach(addFeatureCoordinates);
  boundaryData.features.forEach(addFeatureCoordinates);

  return bounds;
};

// Function to get center coordinates of the plot area
const getCenter = () => {
  const bounds = calculateBounds();
  return bounds.getCenter();
};

// Get color based on selected view
const getPlotColor = (
  feature: Feature<any, GeoJsonProperties>,
  view: OnFarmTrialMapProps["view"]
) => {
  if (!feature.properties) return "#808080";

  switch (view) {
    case "treatment":
      // Colors for Treatment values
      const treatmentColors: { [key: string]: string } = {
        "Treatment 1": "#e6194B",
        "Treatment 2": "#3cb44b",
        "Treatment 3": "#ffe119",
        "Treatment 4": "#4363d8"
      };
      return treatmentColors[feature.properties.Treatment] || "#808080";

    case "replication":
      // Colors for Replication values 1-4
      const replicationColors: { [key: number]: string } = {
        1: "#4363d8",
        2: "#3cb44b",
        3: "#f58231",
        4: "#911eb4"
      };
      return replicationColors[feature.properties.Replicatio] || "#808080";

    case "product":
      // Colors for different products
      const productColors: { [key: string]: string } = {
        "Product A": "#e6194B",
        "Product B": "#3cb44b",
        "Product C": "#ffe119",
        Untreated: "#808080"
      };
      return productColors[feature.properties.Product] || "#808080";

    case "yield":
      // Color based on yield values - using a green (high) to yellow (medium) to red (low) gradient
      // similar to MyJohnDeere/Climate FieldView
      const yield_value = feature.properties.Yield;
      if (yield_value < 205) return "#D52B1E"; // Lowest yield - deep red
      if (yield_value < 215) return "#F35C38"; // Low yield - lighter red
      if (yield_value < 225) return "#FFCC32"; // Medium yield - yellow
      if (yield_value < 230) return "#8CC631"; // High yield - light green
      return "#00892E"; // Highest yield - deep green

    default:
      return "#808080";
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
      const paddedBounds = bounds.pad(0.3); // Increased padding to show more context

      // Set max bounds to restrict panning
      map.setMaxBounds(paddedBounds);

      // Use positive padding to zoom out more
      const padding: PointTuple = isMobile ? [50, 50] : [30, 30];

      map.fitBounds(bounds, {
        padding,
        animate: true,
        maxZoom: isMobile ? 16 : 17 // Lower max zoom to ensure it's not too zoomed in
      });
    }
  }, [map, isMobile]);

  return null;
};

// Legend component
const Legend = ({ view }: { view: OnFarmTrialMapProps["view"] }) => {
  let items = [];

  switch (view) {
    case "treatment":
      items = [
        { label: "Treatment 1", color: "#e6194B" },
        { label: "Treatment 2", color: "#3cb44b" },
        { label: "Treatment 3", color: "#ffe119" },
        { label: "Treatment 4", color: "#4363d8" }
      ];
      break;
    case "replication":
      items = [
        { label: "Replication 1", color: "#4363d8" },
        { label: "Replication 2", color: "#3cb44b" },
        { label: "Replication 3", color: "#f58231" },
        { label: "Replication 4", color: "#911eb4" }
      ];
      break;
    case "product":
      items = [
        { label: "Product A", color: "#e6194B" },
        { label: "Product B", color: "#3cb44b" },
        { label: "Product C", color: "#ffe119" },
        { label: "Untreated", color: "#808080" }
      ];
      break;
    case "yield":
      items = [
        { label: "> 230 bu/ac", color: "#00892E" }, // Deep green (highest)
        { label: "225-230 bu/ac", color: "#8CC631" }, // Light green (high)
        { label: "215-225 bu/ac", color: "#FFCC32" }, // Yellow (medium)
        { label: "205-215 bu/ac", color: "#F35C38" }, // Light red (low)
        { label: "< 205 bu/ac", color: "#D52B1E" } // Deep red (lowest)
      ];
      break;
  }

  const legendTitle = {
    treatment: "Treatments",
    replication: "Replications",
    product: "Products",
    yield: "Yield (bu/ac)"
  }[view];

  // Add custom CSS to ensure legend doesn't interfere with map controls
  const legendStyle = `
    .legend i {
      width: 18px;
      height: 18px;
      float: left;
      margin-right: 8px;
      opacity: 0.7;
    }
  `;

  return (
    <Card className="absolute bottom-4 right-4 z-[400] p-4 bg-white">
      <style>{legendStyle}</style>
      <h6 className="font-semibold mb-2 text-black">{legendTitle}</h6>
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

// MapWrapper component to handle the map rendering
const MapWrapper = ({ view }: OnFarmTrialMapProps) => {
  const center = getCenter();
  const isMobile = useIsMobile();
  const bounds = calculateBounds();

  // Style for the field boundary
  const getBoundaryStyle = (): PathOptions => {
    return {
      fillColor: "transparent",
      weight: 3,
      opacity: 0.9,
      color: "#495057",
      fillOpacity: 0,
      dashArray: "5"
    };
  };

  // Style for the plots based on the selected view
  const getPlotStyle = useCallback(
    (feature?: Feature<any, GeoJsonProperties>): PathOptions => {
      if (!feature) return {};

      return {
        fillColor: getPlotColor(feature, view),
        weight: 2,
        opacity: 1,
        color: "white",
        fillOpacity: 0.8
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
      maxZoom={isMobile ? 18 : 19}
      minZoom={isMobile ? 14 : 15}
      maxBounds={bounds.pad(0.3)}
      maxBoundsViscosity={1.0}
      zoom={15} // Start at a more zoomed-out level
    >
      <TileLayer
        attribution="© Esri"
        url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
        maxZoom={23}
      />
      {/* Field Boundary Layer */}
      <GeoJSON
        data={boundaryData as FeatureCollection}
        style={getBoundaryStyle}
      />
      {/* Plot Layer */}
      <GeoJSON
        data={plotsData as FeatureCollection}
        style={getPlotStyle}
        eventHandlers={{
          click: e => {
            const props = e.layer.feature.properties;
            // Create a popup with the plot details
            if (props) {
              const popupContent = `
                <div style="font-family: system-ui, -apple-system, sans-serif; width: 180px; font-size: 12px;">
                  <h3 style="margin: 0 0 6px; font-size: 14px; border-bottom: 1px solid #eee; padding-bottom: 4px; color: #166534;">Plot Details</h3>
                  <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 4px; margin-top: 8px;">
                    <div style="color: #6b7280; font-size: 11px;">Plot ID:</div>
                    <div style="text-align: right; font-weight: 500;">${
                      props.id
                    }</div>
                    
                    <div style="color: #6b7280; font-size: 11px;">Treatment:</div>
                    <div style="text-align: right; font-weight: 500;">${
                      props.Treatment
                    }</div>
                    
                    <div style="color: #6b7280; font-size: 11px;">Replication:</div>
                    <div style="text-align: right; font-weight: 500;">${
                      props.Replicatio
                    }</div>
                    
                    <div style="color: #6b7280; font-size: 11px;">Product:</div>
                    <div style="text-align: right; font-weight: 500;">${
                      props.Product
                    }</div>
                    
                    <div style="color: #6b7280; font-size: 11px;">Seed Rate:</div>
                    <div style="text-align: right; font-weight: 500;">${props.SeedRate.toLocaleString()} seeds/ac</div>
                    
                    <div style="color: #6b7280; font-size: 11px;">Yield:</div>
                    <div style="text-align: right; font-weight: 500;">${
                      props.Yield
                    } bu/ac</div>
                  </div>
                </div>
              `;

              e.layer
                .bindPopup(popupContent, {
                  className: "custom-popup",
                  closeButton: true,
                  maxWidth: 220,
                  minWidth: 180
                })
                .openPopup();
            }
          }
        }}
      />
      <MapBoundsUpdater />
    </MapContainer>
  );
};

export default function OnFarmTrialMap({ view }: OnFarmTrialMapProps) {
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
