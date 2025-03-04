"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import fieldData from "../data/Boundary_Demo.json";
import soilSampleData from "../data/Point_Demo.json";

// Define interfaces for soil sample data
interface SoilSampleProperties {
  ID: number;
  SampleID: number;
  SampleDate: string;
  CropYear: string;
  Depth: number;
  DepthUnits: string;
  'pH (1_1)': number;
  'pH (1_1)U': string;
  'OM (WB)': number;
  'OM (WB)U': string;
  'CEC (AA)': number;
  'CEC (AA)U': string;
  'P (B1 1_7)': number;
  'P (B1 1__1': string;
  'K (AA)': number;
  'K (AA)U': string;
  'Ca (AA)': number;
  'Ca (AA)U': string;
  'Mg (AA)': number;
  'Mg (AA)U': string;
  'Mg_K': number;
  'Mg_KU': string;
  'Ca_Mg': number;
  'Ca_MgU': string;
  'BS-K': number;
  'BS-KU': string;
  'BS-Mg': number;
  'BS-MgU': string;
  'BS-Ca': number;
  'BS-CaU': string;
  'BS': number;
  'BSU': string;
  'Cu (HCL)': number;
  'Cu (HCL)U': string;
  'S (M3)': number;
  'S (M3)U': string;
  'Zn (HCL)': number;
  'Zn (HCL)U': string;
  'Mn (HCl)': number;
  'Mn (HCl)U': string;
  'B (HW)': number;
  'B (HW)U': string;
}

interface SoilSampleFeature {
  type: "Feature";
  geometry: {
    type: "Point";
    coordinates: [number, number];
  };
  properties: SoilSampleProperties;
}

// Calculate field center from GeoJSON coordinates
const calculateFieldCenter = (coordinates: number[][]) => {
  let sumLat = 0;
  let sumLng = 0;
  const n = coordinates.length;
  
  coordinates.forEach(coord => {
    sumLng += coord[0];
    sumLat += coord[1];
  });
  
  return [sumLat / n, sumLng / n];
};

const FIELD_CENTER = calculateFieldCenter(fieldData.features[0].geometry.coordinates[0]);

export default function SampleReport() {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);

  useEffect(() => {
    // Ensure the map is only initialized once and when the div is ready
    if (typeof window === 'undefined' || !mapRef.current || mapInstanceRef.current) {
      return;
    }

    const initMap = () => {
      try {
        const L = (window as any).L;
        if (!L) {
          console.error('Leaflet not loaded');
          return;
        }

        // Initialize the map with the field center
        const map = L.map(mapRef.current, {
          center: FIELD_CENTER,
          zoom: 16,
          minZoom: 12,
          maxZoom: 19,
          scrollWheelZoom: false // Disable scroll wheel zoom
        });
        
        // Add zoom control with specific position
        L.control.zoom({
          position: 'bottomright'
        }).addTo(map);
        
        // Define base maps
        const baseMaps = {
          "Satellite": L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
            maxZoom: 19,
            attribution: '© Esri — Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
          }),
          "OpenStreetMap": L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            maxZoom: 19,
            attribution: '© OpenStreetMap contributors'
          }),
          "Terrain": L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}', {
            maxZoom: 19,
            attribution: '© Esri — Esri, DeLorme, NAVTEQ, TomTom, Intermap, iPC, USGS, FAO, NPS, NRCAN, GeoBase, Kadaster NL, Ordnance Survey, Esri Japan, METI, and the GIS User Community'
          })
        };

        // Add the default base map (Satellite)
        baseMaps["Satellite"].addTo(map);

        // Create field boundary layer
        const fieldLayer = L.geoJSON(fieldData, {
          style: {
            color: '#22c55e',
            fillColor: '#22c55e',
            fillOpacity: 0.3,
            weight: 2
          }
        }).addTo(map);

        // Create a feature group for sample points
        const samplingLayer = L.featureGroup().addTo(map);

        // Add soil sample points
        soilSampleData.features.forEach((point) => {
          const latlng = [point.geometry.coordinates[1], point.geometry.coordinates[0]];
          
          const marker = L.circleMarker(latlng, {
            radius: 8,
            fillColor: "#3b82f6",
            color: "#fff",
            weight: 1,
            opacity: 1,
            fillOpacity: 0.8
          });

          // Create tooltip content
          const tooltipContent = `
            <div class="p-2">
              <div class="font-bold mb-1">Sample Point ${point.properties.SampleID}</div>
              <div>pH: ${point.properties['pH (1_1)']} ${point.properties['pH (1_1)U']}</div>
              <div>OM: ${point.properties['OM (WB)']} ${point.properties['OM (WB)U']}</div>
              <div>CEC: ${point.properties['CEC (AA)']} ${point.properties['CEC (AA)U']}</div>
              <div>P: ${point.properties['P (B1 1_7)']} ${point.properties['P (B1 1__1']}</div>
              <div>K: ${point.properties['K (AA)']} ${point.properties['K (AA)U']}</div>
            </div>
          `;

          // Add tooltip to marker
          marker.bindTooltip(tooltipContent, {
            permanent: false,
            direction: 'top',
            className: 'bg-white shadow-lg rounded-lg border border-gray-200'
          });

          samplingLayer.addLayer(marker);
        });

        // Add layer controls
        L.control.layers(baseMaps, {
          "Field Boundary": fieldLayer,
          "Sampling Points": samplingLayer
        }, {
          collapsed: false,
          position: 'topright'
        }).addTo(map);

        // Add scale control
        L.control.scale({
          imperial: true,
          metric: true,
          position: 'bottomright'
        }).addTo(map);

        // Store map instance
        mapInstanceRef.current = map;

        // Fit map to field bounds with padding
        const bounds = fieldLayer.getBounds();
        if (bounds.isValid()) {
          map.fitBounds(bounds.pad(0.1));
        }
      } catch (error) {
        console.error('Error initializing map:', error);
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

  return (
    <section id="sample-report" className="py-20 bg-secondary/5">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-6 merriweather-bold">
            Sample <span className="text-primary">Soil Report</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Preview of our detailed soil analysis reports - helping farmers make data-driven decisions
          </p>
        </motion.div>

        {/* Interactive Map */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="max-w-6xl mx-auto mb-16"
        >
          <div className="relative h-[600px] rounded-2xl overflow-hidden border border-border/50" style={{ zIndex: 0 }}>
            <div ref={mapRef} className="w-full h-full" style={{ background: '#f0f0f0' }} />
          </div>
          <p className="text-sm text-muted-foreground mt-2 text-center">
            Click on a sample point to view detailed soil analysis
          </p>
        </motion.div>

        {/* Features List */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto mb-16"
        >
          <div className="text-center">
            <h3 className="text-xl font-semibold mb-2">Field Analysis</h3>
            <p className="text-muted-foreground">Interactive field mapping with sample points</p>
          </div>
          <div className="text-center">
            <h3 className="text-xl font-semibold mb-2">Nutrient Insights</h3>
            <p className="text-muted-foreground">Comprehensive nutrient level assessment</p>
          </div>
          <div className="text-center">
            <h3 className="text-xl font-semibold mb-2">Smart Recommendations</h3>
            <p className="text-muted-foreground">Data-driven application recommendations</p>
          </div>
        </motion.div>

        {/* Call to Action */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center"
        >
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link
              href="/sample-report-content"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
            >
              View Demo Replicated Trial
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/sample-report-content"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-secondary text-secondary-foreground hover:bg-secondary/90 transition-colors"
            >
              View Demo On-Farm Trial Report
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
} 