"use client";

import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import trialData from "@/public/onfarm/TrialDesign_OnFarm_250428_v1.json";

interface OnFarmMapProps {
  className?: string;
}

// Type assertion for the trial data
const typedTrialData = trialData as unknown as GeoJSON.FeatureCollection;

const OnFarmMap = ({ className }: OnFarmMapProps) => {
  const mapRef = useRef<L.Map | null>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    // Initialize map with a higher zoom level and restricted bounds
    const map = L.map(mapContainerRef.current, {
      minZoom: 16,
      maxZoom: 19.5,
      zoomControl: true,
      scrollWheelZoom: true,
      doubleClickZoom: true,
      dragging: true,
      maxBoundsViscosity: 1.0 // Completely restrict panning outside bounds
    }).setView([40.61351, -88.64342], 19.5);

    mapRef.current = map;

    // Add satellite imagery tile layer
    L.tileLayer(
      "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
      {
        attribution: "@Esri"
      }
    ).addTo(map);

    // Define color scale for seed rates
    const getColor = (seedRate: number) => {
      if (seedRate <= 26000) return "#FEE4D8"; // Lightest red
      if (seedRate <= 28000) return "#FCB195"; // Light red
      if (seedRate <= 30000) return "#FB795A"; // Medium red
      if (seedRate <= 32000) return "#EF3C2D"; // Dark red
      return "#BB1419"; // Darkest red
    };

    // Create legend
    const legend = new L.Control({ position: "topright" });
    legend.onAdd = () => {
      const div = L.DomUtil.create("div", "info legend sf_layer");
      div.style.backgroundColor = "white";
      div.style.padding = "8px";
      div.style.borderRadius = "4px";
      div.style.border = "1px solid rgba(0,0,0,0.2)";
      div.style.boxShadow = "0 1px 5px rgba(0,0,0,0.4)";
      div.style.fontSize = "12px";
      div.style.lineHeight = "18px";

      const seedRates = [26000, 28000, 30000, 32000, 34000];
      const colors = ["#FEE4D8", "#FCB195", "#FB795A", "#EF3C2D", "#BB1419"];
      const opacity = 0.698;

      div.innerHTML = `<div style="margin-bottom:3px"><strong>Seed Rate</strong></div>`;
      for (let i = 0; i < seedRates.length; i++) {
        // Format with comma separators for thousands
        const formattedRate = seedRates[i].toLocaleString();
        div.innerHTML += `<i style="background:${colors[i]};opacity:${opacity}"></i> ${formattedRate}<br>`;
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
          }
        </style>
      `;

      return div;
    };
    legend.addTo(map);

    // Add trial plots to map with improved styling for better visibility on satellite imagery
    const plotsLayer = L.geoJSON(typedTrialData, {
      style: feature => ({
        fillColor: getColor(Number(feature?.properties?.SeedRate)),
        weight: 2,
        opacity: 1,
        color: "black",
        fillOpacity: 0.698, // Match the legend opacity
        dashArray: "3"
      }),
      onEachFeature: (feature, layer) => {
        if (feature.properties) {
          layer.bindPopup(
            `
            <div style="font-family: system-ui, sans-serif; width: auto; font-size: 12px; padding: 0;">
              <div style="padding: 10px 15px 10px 10px;">
                
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 6px;">
                  <div style="background-color: #f3f4f6; padding: 6px 8px; border-radius: 4px;">
                    <div style="color: #4b5563; font-size: 10px; text-transform: uppercase; letter-spacing: 0.05em;">Seed Rate</div>
                                        <span style="font-weight: 600; color: #047857; font-size: 14px;">${feature.properties.SeedRate}</span>

                  </div>
                  
                  <div style="background-color: #ecfdf5; padding: 6px 8px; border-radius: 4px;">
                    <div style="color: #065f46; font-size: 10px; text-transform: uppercase; letter-spacing: 0.05em;">Yield</div>
                    <div style="font-weight: 600; color: #047857; margin-top: 2px;">${feature.properties.Yield} bu/ac</div>
                  </div>
                </div>
              </div>
            </div>
            `,
            {
              className: "custom-popup",
              closeButton: true,
              maxWidth: 230,
              minWidth: 210,
              autoPan: true,
              autoClose: true
            }
          );
        }
      }
    }).addTo(map);

    // Add custom popup styles to the document
    const style = document.createElement("style");
    style.innerHTML = `
      .custom-popup .leaflet-popup-content-wrapper {
        border-radius: 8px;
        padding: 0;
        box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -1px rgba(0,0,0,0.06);
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

    // Fit map bounds to trial plots with padding
    const bounds = plotsLayer.getBounds();
    map.fitBounds(bounds, {
      padding: [5, 5],
      maxZoom: 19.5
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

export default OnFarmMap;
