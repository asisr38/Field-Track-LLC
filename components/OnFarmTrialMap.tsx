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
  view: "product" | "replication" | "yield";
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
    case "product":
      // Colors for Product values
      const productColorMap: { [key: string]: string } = {
        "Product A": "#e6194B",
        "Product B": "#3cb44b",
        "Product C": "#ffe119",
        Untreated: "#808080"
      };
      return productColorMap[feature.properties.Product] || "#808080";

    case "replication":
      // Colors for Replication values 1-4
      const replicationColors: { [key: number]: string } = {
        1: "#4363d8",
        2: "#3cb44b",
        3: "#f58231",
        4: "#911eb4"
      };
      return replicationColors[feature.properties.Replicatio] || "#808080";

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
      // Add a very small buffer around bounds (roughly 100m)
      const paddedBounds = bounds.pad(0.001);

      // Set max bounds to restrict panning
      map.setMaxBounds(paddedBounds);

      // Use minimal padding to keep view tight
      const padding: PointTuple = isMobile ? [10, 10] : [5, 5];

      map.fitBounds(bounds, {
        padding,
        animate: true,
        maxZoom: isMobile ? 19 : 19.5
      });

      // Set initial zoom level
      map.setZoom(isMobile ? 18 : 19.5);

      // Add custom popup styles
      const style = document.createElement("style");
      style.innerHTML = `
        .custom-popup .leaflet-popup-content-wrapper {
          border-radius: 8px;
          padding: 0;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
          overflow: hidden;
        }
        .custom-popup .leaflet-popup-content {
          margin: 0;
          width: auto !important;
        }
        .custom-popup .leaflet-popup-tip {
          background-color: white;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
        }
        .custom-popup .leaflet-popup-close-button {
          top: 6px;
          right: 10px;
          color: #6b7280;
          font-size: 18px;
          padding: 4px;
          height: 24px;
          width: 24px;
          transition: color 0.2s;
          z-index: 1000;
        }
        .custom-popup .leaflet-popup-close-button:hover {
          color: #111827;
        }
      `;
      document.head.appendChild(style);
    }
  }, [map, isMobile]);

  return null;
};

// Legend component
const Legend = ({ view }: { view: OnFarmTrialMapProps["view"] }) => {
  let items = [];

  switch (view) {
    case "product":
      items = [
        { label: "Product A", color: "#e6194B" },
        { label: "Product B", color: "#3cb44b" },
        { label: "Product C", color: "#ffe119" },
        { label: "Untreated", color: "#808080" }
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
    product: "Products",
    replication: "Replications",
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
      maxZoom={isMobile ? 19 : 19.5}
      minZoom={isMobile ? 16 : 17}
      maxBounds={bounds.pad(0.001)}
      maxBoundsViscosity={1.0}
      zoom={isMobile ? 18 : 19.5}
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
            if (props) {
              const popupContent = `
                <div style="font-family: system-ui, sans-serif; width: auto; font-size: 12px; padding: 0;">
                  
                  <div style="padding: 10px 15px 10px 10px;">
                    <div style="margin-bottom: 10px;">
                      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px; background-color: #f0fdf4; padding: 6px 8px; border-radius: 4px;">
                        <span style="font-weight: 600; color: #166534;">Plot ID</span>
                        <span style="font-weight: 600; color: #047857; font-size: 14px;">${
                          props.id
                        }</span>
                      </div>
                    </div>
                    
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 6px; margin-bottom: 8px;">
                      <div style="background-color: #f3f4f6; padding: 6px 8px; border-radius: 4px;">
                        <div style="color: #4b5563; font-size: 10px; text-transform: uppercase; letter-spacing: 0.05em;">Product</div>
                        <div style="font-weight: 500; color: #111827; margin-top: 2px;">${
                          props.Product
                        }</div>
                      </div>
                      
                      <div style="background-color: #f3f4f6; padding: 6px 8px; border-radius: 4px;">
                        <div style="color: #4b5563; font-size: 10px; text-transform: uppercase; letter-spacing: 0.05em;">Replication</div>
                        <div style="font-weight: 500; color: #111827; margin-top: 2px;">${
                          props.Replicatio
                        }</div>
                      </div>
                    </div>
                    
                    <div style="margin-bottom: 8px; background-color: #f3f4f6; padding: 6px 8px; border-radius: 4px;">
                          <div style="color: #065f46; font-size: 10px; text-transform: uppercase; letter-spacing: 0.05em;">Yield</div>
                        <div style="font-weight: 600; color: #047857; margin-top: 2px;">${
                          props.Product_Yld || props.Yield
                        } bu/ac</div>
                    </div>
                    

                  </div>
                </div>
              `;

              e.layer
                .bindPopup(popupContent, {
                  className: "custom-popup",
                  closeButton: true,
                  maxWidth: 230,
                  minWidth: 210,
                  autoPan: true,
                  autoClose: true
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
