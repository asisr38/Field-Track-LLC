"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import fieldData from "../data/Boundary_Demo.json";
import trialData from "../data/Point_Demo.json";

// Define interfaces for trial data
interface TrialProperties {
  ID: number;
  TrialID: string;
  PlotDate: string;
  Treatment: string;
  YieldData: number;
  YieldUnit: string;
  Replicate: number;
  Notes: string;
}

interface TrialFeature {
  type: "Feature";
  geometry: {
    type: "Point";
    coordinates: [number, number];
  };
  properties: TrialProperties;
}

const calculateFieldCenter = (coordinates: number[][]) => {
  if (!coordinates || coordinates.length === 0) return [0, 0];

  const sum = coordinates.reduce(
    (acc, coord) => [acc[0] + coord[0], acc[1] + coord[1]],
    [0, 0]
  );

  return [sum[0] / coordinates.length, sum[1] / coordinates.length];
};

export default function TrialReport() {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);

  useEffect(() => {
    // Ensure the map is only initialized once and when the div is ready
    if (
      typeof window === "undefined" ||
      !mapRef.current ||
      mapInstanceRef.current
    ) {
      return;
    }

    const initMap = () => {
      try {
        const L = (window as any).L;
        if (!L) {
          console.error("Leaflet not loaded");
          return;
        }

        // Initialize the map with the field center
        const fieldCoordinates = fieldData.features[0].geometry.coordinates[0];
        const center = calculateFieldCenter(fieldCoordinates);

        const map = L.map(mapRef.current, {
          center: center.reverse(),
          zoom: 16,
          minZoom: 12,
          maxZoom: 19,
          scrollWheelZoom: false
        });

        // Add zoom control
        L.control
          .zoom({
            position: "bottomright"
          })
          .addTo(map);

        // Define base maps
        const baseMaps = {
          Satellite: L.tileLayer(
            "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
            {
              maxZoom: 19,
              attribution:
                "© Esri — Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community"
            }
          ),
          OpenStreetMap: L.tileLayer(
            "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
            {
              maxZoom: 19,
              attribution: "© OpenStreetMap contributors"
            }
          )
        };

        // Add the default base map (Satellite)
        baseMaps["Satellite"].addTo(map);

        // Create field boundary layer
        const fieldLayer = L.geoJSON(fieldData, {
          style: {
            color: "#2563eb",
            weight: 2,
            opacity: 0.6,
            fillOpacity: 0.1
          }
        }).addTo(map);

        // Create a feature group for trial points
        const trialLayer = L.featureGroup().addTo(map);

        // Add trial points
        trialData.features.forEach(point => {
          const latlng = [
            point.geometry.coordinates[1],
            point.geometry.coordinates[0]
          ];

          const marker = L.circleMarker(latlng, {
            radius: 8,
            fillColor: getColorByTreatment(point.properties.Treatment),
            color: "#000",
            weight: 1,
            opacity: 1,
            fillOpacity: 0.8
          });

          // Create tooltip content with trial data
          const tooltipContent = `
            <div class="p-2">
              <div class="font-bold mb-1">Trial Plot ${
                point.properties.ID
              }</div>
              <div>Treatment: ${point.properties.Treatment}</div>
              <div>Yield: ${point.properties.YieldData} ${
            point.properties.YieldUnit
          }</div>
              <div>Replicate: ${point.properties.Replicate}</div>
              <div>Date: ${new Date(
                point.properties.PlotDate
              ).toLocaleDateString()}</div>
            </div>
          `;

          // Add tooltip to marker
          marker.bindTooltip(tooltipContent, {
            permanent: false,
            direction: "top",
            className: "bg-white shadow-lg rounded-lg border border-gray-200"
          });

          trialLayer.addLayer(marker);
        });

        // Add layer controls
        L.control
          .layers(
            baseMaps,
            {
              "Field Boundary": fieldLayer,
              "Trial Points": trialLayer
            },
            {
              collapsed: false,
              position: "topright"
            }
          )
          .addTo(map);

        // Store map instance
        mapInstanceRef.current = map;

        // Fit map to field bounds with padding
        const bounds = fieldLayer.getBounds();
        if (bounds.isValid()) {
          map.fitBounds(bounds.pad(0.1));
        }
      } catch (error) {
        console.error("Error initializing map:", error);
      }
    };

    // Initialize the map
    initMap();

    // Cleanup
    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  const getColorByTreatment = (treatment: string) => {
    switch (treatment) {
      case "Variable Rate A":
        return "#22c55e"; // green
      case "Variable Rate B":
        return "#3b82f6"; // blue
      case "Control":
        return "#ef4444"; // red
      default:
        return "#94a3b8"; // gray
    }
  };

  return (
    <section className="w-full py-12 md:py-24 lg:py-32 bg-white">
      <div className="container px-4 md:px-6">
        <div className="flex flex-col items-center justify-center space-y-4 text-center">
          <div className="space-y-2">
            <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">
              Field Trial Report
            </h2>
            <p className="max-w-[900px] text-zinc-500 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed dark:text-zinc-400">
              Interactive visualization of our research trial results. Click on
              points to view detailed treatment and yield data.
            </p>
          </div>
        </div>
        <div className="mx-auto grid max-w-5xl items-center gap-6 py-12 lg:grid-cols-2 lg:gap-12">
          <div className="h-[400px] relative" ref={mapRef} />
          <div className="flex flex-col justify-center space-y-4">
            <div className="space-y-2">
              <h3 className="text-2xl font-bold">Trial Information</h3>
              <p className="text-zinc-500 dark:text-zinc-400">
                This trial compares different variable rate applications:
              </p>
              <ul className="list-disc list-inside space-y-1 text-zinc-500">
                <li>Variable Rate A: Standard protocol</li>
                <li>Variable Rate B: Enhanced protocol</li>
                <li>Control: Baseline measurements</li>
              </ul>
            </div>
            <Link
              className="inline-flex items-center justify-center rounded-md bg-zinc-900 px-6 py-2 text-sm font-medium text-zinc-50 shadow transition-colors hover:bg-zinc-900/90 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-zinc-950 disabled:pointer-events-none disabled:opacity-50 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-50/90 dark:focus-visible:ring-zinc-300"
              href="/contact"
            >
              Request Full Report
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
