"use client";

import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import trialData from "@/public/onfarm/trial-design-seed-2025_v2.json";

interface TrialLayoutProps {
  className?: string;
}

// Type assertion for the trial data
const typedTrialData = trialData as unknown as GeoJSON.FeatureCollection;

const TrialLayout = ({ className }: TrialLayoutProps) => {
  const mapRef = useRef<L.Map | null>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    // Initialize map with a higher zoom level and restricted bounds
    const map = L.map(mapContainerRef.current, {
      minZoom: 16,
      maxZoom: 20,
      zoomControl: true,
      scrollWheelZoom: true,
      doubleClickZoom: true,
      dragging: true,
      maxBoundsViscosity: 1.0 // Completely restrict panning outside bounds
    }).setView([40.61351, -88.64342], 18);

    mapRef.current = map;

    // Add satellite imagery tile layer
    L.tileLayer(
      "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
      {
        attribution:
          "Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community"
      }
    ).addTo(map);

    // Define color scale for seed rates
    const getColor = (seedRate: number) => {
      if (seedRate <= 26000) return "#2c7bb6";
      if (seedRate <= 28000) return "#abd9e9";
      if (seedRate <= 30000) return "#ffffbf";
      if (seedRate <= 32000) return "#fdae61";
      return "#d7191c";
    };

    // Create legend
    const legend = new L.Control({ position: "bottomright" });
    legend.onAdd = () => {
      const div = L.DomUtil.create("div", "legend");
      div.style.backgroundColor = "white";
      div.style.padding = "10px";
      div.style.borderRadius = "5px";
      div.style.border = "2px solid rgba(0,0,0,0.2)";

      const seedRates = [26000, 28000, 30000, 32000, 34000];
      const labels = ["≤ 26K", "26K-28K", "28K-30K", "30K-32K", "> 32K"];

      div.innerHTML = "<h4>Seed Rate</h4>";
      for (let i = 0; i < seedRates.length; i++) {
        div.innerHTML += `<i style="background:${getColor(
          seedRates[i]
        )}"></i> ${labels[i]}<br>`;
      }

      // Add some custom styling for the legend items
      div.innerHTML += `
        <style>
          .legend i {
            width: 18px;
            height: 18px;
            float: left;
            margin-right: 8px;
            opacity: 0.7;
            border-radius: 3px;
          }
          .legend h4 {
            margin: 0 0 10px;
            font-size: 14px;
            font-weight: bold;
          }
        </style>
      `;

      return div;
    };
    legend.addTo(map);

    // Add trial plots to map with improved styling for better visibility on satellite imagery
    const plotsLayer = L.geoJSON(typedTrialData, {
      style: feature => ({
        fillColor: getColor(Number(feature?.properties?.tgt_seed)),
        weight: 2,
        opacity: 1,
        color: "black",
        fillOpacity: 0.6,
        dashArray: "3"
      }),
      onEachFeature: (feature, layer) => {
        if (feature.properties) {
          layer.bindPopup(
            `
            <div style="font-family: system-ui, -apple-system, sans-serif; width: 180px; font-size: 12px;">
              <h3 style="margin: 0 0 6px; font-size: 14px; border-bottom: 1px solid #eee; padding-bottom: 4px; color: #166534;">Plot Details</h3>
              <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 4px; margin-top: 8px;">
                <div style="color: #6b7280; font-size: 11px;">Plot ID:</div>
                <div style="text-align: right; font-weight: 500;">${feature.properties.ID_1}</div>
                <div style="color: #6b7280; font-size: 11px;">Seed Rate:</div>
                <div style="text-align: right; font-weight: 500;">${feature.properties.tgt_seed} seeds/ac</div>
                <div style="color: #6b7280; font-size: 11px;">Yield:</div>
                <div style="text-align: right; font-weight: 500;">${feature.properties.Yield} bu/ac</div>
              </div>
            </div>
          `,
            {
              className: "custom-popup",
              closeButton: true,
              maxWidth: 220,
              minWidth: 180
            }
          );
        }
      }
    }).addTo(map);

    // Add custom popup styles to the document
    const style = document.createElement("style");
    style.innerHTML = `
      .custom-popup .leaflet-popup-content-wrapper {
        border-radius: 6px;
        padding: 0;
        box-shadow: 0 2px 8px rgba(0,0,0,0.15);
      }
      .custom-popup .leaflet-popup-content {
        margin: 10px;
        line-height: 1.4;
      }
      .custom-popup .leaflet-popup-tip {
        background-color: white;
      }
    `;
    document.head.appendChild(style);

    // Fit map bounds to trial plots with padding
    const bounds = plotsLayer.getBounds();
    map.fitBounds(bounds, {
      padding: [20, 20],
      maxZoom: 19
    });

    // Set max bounds with a small buffer around the trial plots to restrict panning
    // Add a buffer of approximately 100 meters around the bounds
    const southWest = bounds.getSouthWest();
    const northEast = bounds.getNorthEast();
    const bufferLat = 0.001; // Roughly 100m in latitude
    const bufferLng = 0.001; // Roughly 100m in longitude
    const maxBounds = L.latLngBounds(
      L.latLng(southWest.lat - bufferLat, southWest.lng - bufferLng),
      L.latLng(northEast.lat + bufferLat, northEast.lng + bufferLng)
    );
    map.setMaxBounds(maxBounds);

    // Add scale control
    L.control
      .scale({ position: "bottomleft", imperial: true, metric: true })
      .addTo(map);

    // Cleanup on unmount
    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  return (
    <div
      ref={mapContainerRef}
      className={`w-full h-[600px] rounded-lg overflow-hidden shadow-lg ${
        className || ""
      }`}
    />
  );
};

export default TrialLayout;
