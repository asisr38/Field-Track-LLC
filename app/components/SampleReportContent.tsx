"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { ArrowRight } from "lucide-react";
import Link from "next/link";
import React, { useEffect, useRef, useState, useCallback, useMemo } from "react";
import fieldData from "../data/Boundary_Demo.json";
import soilSampleData from "../data/Point_Demo.json";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
// Using leaflet types explicitly where needed

// Since we're using the Leaflet library dynamically, we need to declare it for TypeScript
declare global {
  interface Window {
    L: any; // Using any to simplify type issues
  }
}

// Custom control type for our legend
interface LegendControl {
  onAdd(map: any): HTMLElement;
  addTo(map: any): any; // Using any to avoid strict return type checking
}

// Define interface for soil sample properties
interface SampleProperties {
  SampleID: number;
  'pH (1_1)': number;
  'P (B1 1_7)': number;
  'K (AA)': number;
  [key: string]: any; // Allow for dynamic property access with string keys
}

interface FieldFeature {
  type: "Feature";
  properties: {
    name: string;
  };
  geometry: {
    type: "Polygon";
    coordinates: number[][][];
  };
}

// Soil analysis data
const soilData = [
  { id: 1, ph: 7.0, cec: 8.6, om: 2.2, p: 27, k: 136, ca_ppm: 1347, mg_ppm: 183, ca_pct: 78.2, k_pct: 4.1, mg_pct: 17.7, h: "NA" },
  { id: 2, ph: 5.1, cec: 7.8, om: 1.9, p: 32, k: 80, ca_ppm: 636, mg_ppm: 93, ca_pct: 41.0, k_pct: 2.6, mg_pct: 10.0, h: 46.4 },
  { id: 3, ph: 6.8, cec: 8.7, om: 2.6, p: 12, k: 115, ca_ppm: 1347, mg_ppm: 172, ca_pct: 77.6, k_pct: 3.4, mg_pct: 16.5, h: 2.4 },
  { id: 4, ph: 7.2, cec: 8.8, om: 2.2, p: 33, k: 82, ca_ppm: 1459, mg_ppm: 161, ca_pct: 82.5, k_pct: 2.4, mg_pct: 15.2, h: "NA" },
  { id: 5, ph: 6.8, cec: 8.4, om: 2.0, p: 35, k: 97, ca_ppm: 1312, mg_ppm: 161, ca_pct: 78.5, k_pct: 3.0, mg_pct: 16.1, h: 2.5 },
  { id: 6, ph: 5.8, cec: 6.7, om: 1.9, p: 63, k: 104, ca_ppm: 860, mg_ppm: 112, ca_pct: 64.2, k_pct: 4.0, mg_pct: 13.9, h: 17.9 },
  { id: 7, ph: 4.9, cec: 11.4, om: 2.1, p: 76, k: 143, ca_ppm: 566, mg_ppm: 119, ca_pct: 24.9, k_pct: 3.2, mg_pct: 8.7, h: 63.2 },
  { id: 8, ph: 5.7, cec: 5.2, om: 1.7, p: 19, k: 60, ca_ppm: 580, mg_ppm: 111, ca_pct: 56.0, k_pct: 3.0, mg_pct: 17.9, h: 23.2 },
  { id: 9, ph: 7.0, cec: 9.8, om: 3.0, p: 36, k: 255, ca_ppm: 1497, mg_ppm: 196, ca_pct: 76.6, k_pct: 6.7, mg_pct: 16.7, h: "NA" },
  { id: 10, ph: 6.4, cec: 9.6, om: 2.6, p: 42, k: 183, ca_ppm: 1310, mg_ppm: 170, ca_pct: 68.0, k_pct: 4.9, mg_pct: 14.7, h: 12.5 },
  { id: 11, ph: 4.9, cec: 11.9, om: 2.1, p: 35, k: 121, ca_ppm: 712, mg_ppm: 103, ca_pct: 29.8, k_pct: 2.6, mg_pct: 7.2, h: 60.4 },
  { id: 12, ph: 4.6, cec: 24.4, om: 2.1, p: 29, k: 102, ca_ppm: 769, mg_ppm: 131, ca_pct: 15.8, k_pct: 1.1, mg_pct: 4.5, h: 78.7 },
  { id: 13, ph: 5.0, cec: 8.0, om: 2.6, p: 32, k: 194, ca_ppm: 633, mg_ppm: 90, ca_pct: 39.5, k_pct: 6.2, mg_pct: 9.4, h: 44.9 },
  { id: 14, ph: 6.0, cec: 7.6, om: 2.3, p: 18, k: 103, ca_ppm: 1011, mg_ppm: 135, ca_pct: 66.1, k_pct: 3.5, mg_pct: 14.7, h: 15.7 }
];

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

// Calculate field center once outside of component to avoid recalculation
const FIELD_CENTER = calculateFieldCenter(fieldData.features[0].geometry.coordinates[0]);

// Field Overview Map Component
function FieldMap() {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const [selectedSample, setSelectedSample] = useState<any>(null);
  
  // Use lazy initialization to avoid unnecessary renders
  const tooltipContentMemo = useRef(new Map()).current;

  useEffect(() => {
    if (typeof window !== 'undefined' && mapRef.current && !mapInstanceRef.current) {
      try {
        const L = (window as any).L;
        if (!L) {
          console.error('Leaflet not loaded');
          return;
        }

        // Initialize the map with performance optimizations
        const map = L.map(mapRef.current, {
          center: FIELD_CENTER,
          zoom: 16,
          minZoom: 12,
          maxZoom: 19,
          zoomControl: false,  // Disable default zoom control, we'll add our own
          scrollWheelZoom: false,  // Disable scroll wheel zoom
          preferCanvas: true,      // Use canvas renderer for better performance
          renderer: L.canvas(),     // Force canvas renderer
          tap: true,               // Enable tap for mobile
          touchZoom: true          // Enable pinch zoom on mobile
        });
        
        mapInstanceRef.current = map;
        
        // Add custom zoom control
        L.control.zoom({
          position: 'bottomright',
          zoomInTitle: 'Zoom in',
          zoomOutTitle: 'Zoom out'
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

          // Only create tooltip content if it hasn't been created already
          if (!tooltipContentMemo.has((point.properties as unknown as SampleProperties).SampleID)) {
            const tooltipContent = `
              <div class="p-2">
                <div class="font-bold">Sample ID: ${(point.properties as unknown as SampleProperties).SampleID}</div>
                <div>pH: ${(point.properties as unknown as SampleProperties)['pH (1_1)']}</div>
                <div>P: ${(point.properties as unknown as SampleProperties)['P (B1 1_7)']} ppm</div>
                <div>K: ${(point.properties as unknown as SampleProperties)['K (AA)']} ppm</div>
              </div>
            `;
            tooltipContentMemo.set((point.properties as unknown as SampleProperties).SampleID, tooltipContent);
          }
          
          // Use the cached tooltip content
          marker.bindTooltip(tooltipContentMemo.get((point.properties as unknown as SampleProperties).SampleID), { 
            direction: 'top',
            offset: [0, -10]
          });

          marker.on('click', () => {
            setSelectedSample(point.properties);
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

        // Fit map to field bounds with padding
        const bounds = fieldLayer.getBounds();
        if (bounds.isValid()) {
          map.fitBounds(bounds.pad(0.1));
        }

        // Clean up on unmount
        return () => {
          // Only attempt to remove the map if it was created
          if (mapInstanceRef.current) {
            mapInstanceRef.current.remove();
            mapInstanceRef.current = null;
          }
        };
      } catch (error) {
        console.error('Error initializing map:', error);
      }
    }
  }, []);

  return (
    <div className="space-y-4">
      <div className="relative h-[400px] rounded-2xl overflow-hidden border border-border/50">
        <div ref={mapRef} className="w-full h-full" style={{ background: '#f0f0f0' }} />
      </div>
      {selectedSample && (
        <div className="bg-white p-4 rounded-lg shadow-lg max-w-2xl mx-auto">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-semibold text-primary">
              Sample Point {(selectedSample as unknown as SampleProperties).SampleID}
            </h3>
          </div>
          <div className="space-y-4">
            <div className="bg-gray-50 p-3 rounded-lg">
              <p className="mb-1"><span className="font-semibold text-gray-700">Date:</span> {new Date(selectedSample.SampleDate).toLocaleDateString()}</p>
              <p className="mb-1"><span className="font-semibold text-gray-700">Crop Year:</span> {selectedSample.CropYear}</p>
              <p><span className="font-semibold text-gray-700">Depth:</span> {selectedSample.Depth} {selectedSample.DepthUnits}</p>
            </div>

            <div className="bg-gray-50 p-3 rounded-lg">
              <p className="font-semibold text-primary text-lg mb-2">Primary Nutrients</p>
              <div className="grid grid-cols-2 gap-3">
                <p><span className="font-semibold text-gray-700">pH:</span> {selectedSample['pH (1_1)']}</p>
                <p><span className="font-semibold text-gray-700">OM:</span> {selectedSample['OM (WB)']} {selectedSample['OM (WB)U']}</p>
                <p><span className="font-semibold text-gray-700">P:</span> {selectedSample['P (B1 1_7)']} {selectedSample['P (B1 1__1']}</p>
                <p><span className="font-semibold text-gray-700">K:</span> {selectedSample['K (AA)']} {selectedSample['K (AA)U']}</p>
              </div>
            </div>

            <div className="bg-gray-50 p-3 rounded-lg">
              <p className="font-semibold text-primary text-lg mb-2">Secondary Nutrients</p>
              <div className="grid grid-cols-2 gap-3">
                <p><span className="font-semibold text-gray-700">Ca:</span> {selectedSample['Ca (AA)']} {selectedSample['Ca (AA)U']}</p>
                <p><span className="font-semibold text-gray-700">Mg:</span> {selectedSample['Mg (AA)']} {selectedSample['Mg (AA)U']}</p>
                <p><span className="font-semibold text-gray-700">S:</span> {selectedSample['S (M3)']} {selectedSample['S (M3)U']}</p>
                <p><span className="font-semibold text-gray-700">CEC:</span> {selectedSample['CEC (AA)']} {selectedSample['CEC (AA)U']}</p>
              </div>
            </div>

            <div className="bg-gray-50 p-3 rounded-lg">
              <p className="font-semibold text-primary text-lg mb-2">Base Saturation</p>
              <div className="grid grid-cols-2 gap-3">
                <p><span className="font-semibold text-gray-700">K:</span> {selectedSample['BS-K']}{selectedSample['BS-KU']}</p>
                <p><span className="font-semibold text-gray-700">Mg:</span> {selectedSample['BS-Mg']}{selectedSample['BS-MgU']}</p>
                <p><span className="font-semibold text-gray-700">Ca:</span> {selectedSample['BS-Ca']}{selectedSample['BS-CaU']}</p>
                <p><span className="font-semibold text-gray-700">Total:</span> {selectedSample['BS']}{selectedSample['BSU']}</p>
              </div>
            </div>

            <div className="bg-gray-50 p-3 rounded-lg">
              <p className="font-semibold text-primary text-lg mb-2">Ratios</p>
              <div className="grid grid-cols-2 gap-3">
                <p><span className="font-semibold text-gray-700">Mg/K:</span> {selectedSample['Mg_K']}</p>
                <p><span className="font-semibold text-gray-700">Ca/Mg:</span> {selectedSample['Ca_Mg']}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function PhosphorusMap() {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  
  // Memoize the color function to avoid recalculation
  const getColor = useCallback((value: number) => {
    return value > 180 ? '#67000d' :
           value > 160 ? '#a50f15' :
           value > 140 ? '#cb181d' :
           value > 120 ? '#ef3b2c' :
           value > 100 ? '#fb6a4a' :
           value > 80  ? '#fc9272' :
           value > 60  ? '#fcbba1' :
           value > 40  ? '#fee0d2' :
           value > 20  ? '#fff5f0' :
                       '#ffffff';
  }, []);

  useEffect(() => {
    if (typeof window !== 'undefined' && mapRef.current && !mapInstanceRef.current) {
      try {
        const L = (window as any).L;
        if (!L) {
          console.error('Leaflet not loaded');
          return;
        }

        // Initialize the map with performance optimizations
        const map = L.map(mapRef.current, {
          center: FIELD_CENTER,
          zoom: 16,
          minZoom: 12,
          maxZoom: 19,
          zoomControl: false,  // Disable default zoom control, we'll add our own
          scrollWheelZoom: false,  // Disable scroll wheel zoom
          preferCanvas: true,      // Use canvas renderer for better performance
          renderer: L.canvas(),     // Force canvas renderer
          tap: true,               // Enable tap for mobile
          touchZoom: true          // Enable pinch zoom on mobile
        });
        
        mapInstanceRef.current = map;

        // Add custom zoom control
        L.control.zoom({
          position: 'bottomright',
          zoomInTitle: 'Zoom in',
          zoomOutTitle: 'Zoom out'
        }).addTo(map);

        // Add satellite imagery base layer
        L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
          maxZoom: 19,
          attribution: '© Esri'
        }).addTo(map);

        // Create field boundary layer with styling
        const fieldLayer = L.geoJSON(fieldData, {
          style: {
            color: '#000',
            weight: 2,
            opacity: 1,
            fillColor: '#cb181d', // Phosphorus level color
            fillOpacity: 0.8
          }
        }).addTo(map);

        // Add legend with optimized HTML generation
        const legend = L.control({ position: 'topright' }) as LegendControl;
        legend.onAdd = function(map: L.Map): HTMLElement {
          const div = L.DomUtil.create('div', 'info legend bg-white p-2 rounded-lg shadow-lg');
          const grades = [0, 20, 40, 60, 80, 100, 120, 140, 160, 180];
          
          // Build HTML string directly instead of array concatenation
          let html = '<div class="text-sm font-semibold mb-2">P Rate (lb/ac)</div>';
          
          for (let i = 0; i < grades.length; i++) {
            const from = grades[i];
            const to = grades[i + 1];
            html += `<div class="flex items-center gap-2 my-1"><i style="background:${getColor(from + 1)}; width: 18px; height: 18px; display: inline-block;"></i>${from}${to ? '&ndash;' + to : '+'}</div>`;
          }
          
          div.innerHTML = html;
          return div;
        };
        legend.addTo(map);

        // Fit map to field bounds with padding
        const bounds = fieldLayer.getBounds();
        if (bounds.isValid()) {
          map.fitBounds(bounds.pad(0.1));
        }
        
        // Clean up on unmount
        return () => {
          if (mapInstanceRef.current) {
            mapInstanceRef.current.remove();
            mapInstanceRef.current = null;
          }
        };
      } catch (error) {
        console.error('Error initializing map:', error);
      }
    }
  }, [getColor]); // Only getColor as dependency since it's memoized

  return (
    <div className="space-y-4">
      <div className="relative h-[400px] rounded-2xl overflow-hidden border border-border/50" style={{ zIndex: 1 }}>
        <div ref={mapRef} className="w-full h-full" style={{ background: '#f0f0f0' }} />
        <style jsx global>{`
          .leaflet-control-container {
            pointer-events: auto;
          }
          .leaflet-control-zoom {
            pointer-events: auto;
          }
          .leaflet-control-zoom a {
            pointer-events: auto;
          }
        `}</style>
      </div>
    </div>
  );
}

function PotassiumMap() {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  
  // Memoize the color function to avoid recalculation
  const getColor = useCallback((value: number) => {
    return value > 180 ? '#08306b' :
           value > 160 ? '#08519c' :
           value > 140 ? '#2171b5' :
           value > 120 ? '#4292c6' :
           value > 100 ? '#6baed6' :
           value > 80  ? '#9ecae1' :
           value > 60  ? '#c6dbef' :
           value > 40  ? '#deebf7' :
           value > 20  ? '#f7fbff' :
                       '#ffffff';
  }, []);

  useEffect(() => {
    if (typeof window !== 'undefined' && mapRef.current && !mapInstanceRef.current) {
      try {
        const L = (window as any).L;
        if (!L) {
          console.error('Leaflet not loaded');
          return;
        }

        // Initialize the map with performance optimizations
        const map = L.map(mapRef.current, {
          center: FIELD_CENTER,
          zoom: 16,
          minZoom: 12,
          maxZoom: 19,
          zoomControl: false,  // Disable default zoom control, we'll add our own
          scrollWheelZoom: false,  // Disable scroll wheel zoom
          preferCanvas: true,      // Use canvas renderer for better performance
          renderer: L.canvas(),     // Force canvas renderer
          tap: true,               // Enable tap for mobile
          touchZoom: true          // Enable pinch zoom on mobile
        });
        
        mapInstanceRef.current = map;

        // Add custom zoom control
        L.control.zoom({
          position: 'bottomright',
          zoomInTitle: 'Zoom in',
          zoomOutTitle: 'Zoom out'
        }).addTo(map);

        // Add satellite imagery base layer
        L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
          maxZoom: 19,
          attribution: '© Esri'
        }).addTo(map);

        // Create field boundary layer with styling
        const fieldLayer = L.geoJSON(fieldData, {
          style: {
            color: '#000',
            weight: 2,
            opacity: 1,
            fillColor: '#08519c', // Potassium level color
            fillOpacity: 0.8
          }
        }).addTo(map);

        // Add legend with optimized HTML generation
        const legend = L.control({ position: 'topright' }) as LegendControl;
        legend.onAdd = function(map: L.Map): HTMLElement {
          const div = L.DomUtil.create('div', 'info legend bg-white p-2 rounded-lg shadow-lg');
          const grades = [0, 20, 40, 60, 80, 100, 120, 140, 160, 180];
          
          // Build HTML string directly instead of array concatenation
          let html = '<div class="text-sm font-semibold mb-2">K Rate (lb/ac)</div>';
          
          for (let i = 0; i < grades.length; i++) {
            const from = grades[i];
            const to = grades[i + 1];
            html += `<div class="flex items-center gap-2 my-1"><i style="background:${getColor(from + 1)}; width: 18px; height: 18px; display: inline-block;"></i>${from}${to ? '&ndash;' + to : '+'}</div>`;
          }
          
          div.innerHTML = html;
          return div;
        };
        legend.addTo(map);

        // Fit map to field bounds with padding
        const bounds = fieldLayer.getBounds();
        if (bounds.isValid()) {
          map.fitBounds(bounds.pad(0.1));
        }
        
        // Clean up on unmount
        return () => {
          if (mapInstanceRef.current) {
            mapInstanceRef.current.remove();
            mapInstanceRef.current = null;
          }
        };
      } catch (error) {
        console.error('Error initializing map:', error);
      }
    }
  }, [getColor]); // Only getColor as dependency since it's memoized

  return (
    <div className="space-y-4">
      <div className="relative h-[400px] rounded-2xl overflow-hidden border border-border/50" style={{ zIndex: 1 }}>
        <div ref={mapRef} className="w-full h-full" style={{ background: '#f0f0f0' }} />
        <style jsx global>{`
          .leaflet-control-container {
            pointer-events: auto;
          }
          .leaflet-control-zoom {
            pointer-events: auto;
          }
          .leaflet-control-zoom a {
            pointer-events: auto;
          }
        `}</style>
      </div>
    </div>
  );
}

function SampleDistributionMap() {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);

  useEffect(() => {
    if (typeof window !== 'undefined' && mapRef.current && !mapInstanceRef.current) {
      try {
        const L = (window as any).L;
        if (!L) {
          console.error('Leaflet not loaded');
          return;
        }

        // Initialize the map with performance optimizations
        const map = L.map(mapRef.current, {
          center: FIELD_CENTER,
          zoom: 16,
          minZoom: 12,
          maxZoom: 19,
          zoomControl: false,  // Disable default zoom control, we'll add our own
          scrollWheelZoom: false,  // Disable scroll wheel zoom
          preferCanvas: true,      // Use canvas renderer for better performance
          renderer: L.canvas(),     // Force canvas renderer
          tap: true,               // Enable tap for mobile
          touchZoom: true          // Enable pinch zoom on mobile
        });
        
        mapInstanceRef.current = map;

        // Add custom zoom control
        L.control.zoom({
          position: 'bottomright',
          zoomInTitle: 'Zoom in',
          zoomOutTitle: 'Zoom out'
        }).addTo(map);

        // Add satellite imagery base layer
        L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
          maxZoom: 19,
          attribution: '© Esri'
        }).addTo(map);

        // Create field boundary layer with styling
        const fieldLayer = L.geoJSON(fieldData, {
          style: {
            color: '#475569',
            weight: 2,
            opacity: 0.8,
            fillColor: '#64748b',
            fillOpacity: 0.05
          }
        }).addTo(map);

        // Create sample points layer group
        const samplesLayer = L.featureGroup().addTo(map);
        
        // Batch process markers to improve performance
        const markerBatch: L.CircleMarker[] = [];
        soilSampleData.features.forEach((point) => {
          const latlng = [point.geometry.coordinates[1], point.geometry.coordinates[0]];
          
          const marker = L.circleMarker(latlng, {
            radius: 6,
            fillColor: "#3b82f6",
            color: "#ffffff",
            weight: 1,
            opacity: 1,
            fillOpacity: 0.8
          });
          
          // Keep simple tooltip without complex HTML
          marker.bindTooltip(`Sample ${(point.properties as unknown as SampleProperties).SampleID}`, {
            direction: 'top',
            offset: [0, -8]
          });
          
          markerBatch.push(marker);
          markersRef.current.push(marker);
        });
        
        // Add all markers at once
        const samplesGroup = L.featureGroup(markerBatch).addTo(map);
        
        // Add layer controls with simplified options
        L.control.layers({}, {
          "Sample Points": samplesGroup
        }, {
          collapsed: false,
          position: 'bottomright'
        }).addTo(map);

        // Fit map to field bounds with padding
        const bounds = fieldLayer.getBounds();
        if (bounds.isValid()) {
          map.fitBounds(bounds.pad(0.1));
        }
        
        // Clean up on unmount
        return () => {
          if (mapInstanceRef.current) {
            // Clear marker references
            markersRef.current = [];
            mapInstanceRef.current.remove();
            mapInstanceRef.current = null;
          }
        };
      } catch (error) {
        console.error('Error initializing map:', error);
      }
    }
  }, []);

  return (
    <div className="space-y-4">
      <div className="relative h-[400px] rounded-2xl overflow-hidden border border-border/50" style={{ zIndex: 1 }}>
        <div ref={mapRef} className="w-full h-full" style={{ background: '#f0f0f0' }} />
        <style jsx global>{`
          .leaflet-control-container {
            pointer-events: auto;
          }
          .leaflet-control-zoom {
            pointer-events: auto;
          }
          .leaflet-control-zoom a {
            pointer-events: auto;
          }
        `}</style>
      </div>
      <p className="text-sm text-center text-muted-foreground">
        Each point represents a soil sample location in the field.
      </p>
    </div>
  );
}

export default function SampleReportContent() {
  const animationConfig = {
    once: true,
    margin: '-100px',
  };
  
  // Memoize the report sections to prevent recreating on every render
  const reportSections = useMemo(() => [
    {
      title: "Field Overview & Sampling Grid",
      description: "Our detailed field analysis begins with strategic soil sampling across your entire field to ensure comprehensive coverage.",
      highlights: [
        "GPS-guided soil sampling ensures accurate, consistent data collection",
        "Optimized sampling grid based on field size and topography",
        "Complete field boundary mapping with precision GPS coordinates"
      ],
      component: <SampleDistributionMap />
    },
    {
      title: "Phosphorus Analysis Map",
      description: "Visualize phosphorus concentration levels across your field to identify areas needing specific nutrient management.",
      highlights: [
        "Color-coded visualization of phosphorus concentration levels",
        "Identify zones requiring targeted fertilizer application",
        "Compare against recommended levels for your specific crops"
      ],
      component: <PhosphorusMap />
    },
    {
      title: "Potassium Distribution Analysis",
      description: "Our potassium analysis helps you understand K availability throughout your field for optimized fertilizer application.",
      highlights: [
        "Detailed potassium level mapping across your entire field",
        "Identify deficiency patterns that may affect crop yields",
        "Develop targeted potassium application strategies by zone"
      ],
      component: <PotassiumMap />
    },
    {
      title: "Detailed Soil Composition",
      description: "Beyond NPK, we analyze complete soil composition to give you a comprehensive understanding of your soil health.",
      highlights: [
        "Complete soil texture analysis (sand, silt, clay percentages)",
        "Organic matter content assessment",
        "Soil pH levels and micronutrient availability"
      ],
      image: "/images/soil-analysis-chart.jpg"
    },
    {
      title: "Custom Fertilizer Recommendations",
      description: "Receive tailored fertilizer recommendations based on your soil analysis and specific crop requirements.",
      highlights: [
        "Customized application rates for nitrogen, phosphorus, and potassium",
        "Zone-specific recommendations to maximize efficiency",
        "Seasonal application timing guidance for optimal nutrient uptake"
      ],
      image: "/images/fertilizer-recommendation.jpg"
    },
  ], []);
  
  // Memoize the field map component to prevent unnecessary re-renders
  const FieldMapComponent = useMemo(() => <SampleDistributionMap />, []);
  const PhosphorusMapComponent = useMemo(() => <PhosphorusMap />, []);
  const PotassiumMapComponent = useMemo(() => <PotassiumMap />, []);

  // Use optimized versions of the map components
  const optimizedReportSections = useMemo(() => {
    return reportSections.map(section => {
      if (section.title === "Field Overview & Sampling Grid") {
        return { ...section, component: FieldMapComponent };
      } else if (section.title === "Phosphorus Analysis Map") {
        return { ...section, component: PhosphorusMapComponent };
      } else if (section.title === "Potassium Distribution Analysis") {
        return { ...section, component: PotassiumMapComponent };
      }
      return section;
    });
  }, [reportSections, FieldMapComponent, PhosphorusMapComponent, PotassiumMapComponent]);

  return (
    <section id="sample-report" className="flex min-h-screen flex-col pt-32 scroll-mt-16">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={animationConfig}
          transition={{ duration: 0.3 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Sample <span className="text-primary">Soil Report</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Explore our comprehensive soil analysis report - providing detailed insights for data-driven agricultural decisions
          </p>
        </motion.div>

        <div className="space-y-16">
          {optimizedReportSections.map((section, index) => (
            <motion.div
              key={section.title}
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={animationConfig}
              transition={{ duration: 0.3 }}
              className={`grid lg:grid-cols-2 gap-8 items-center ${
                index % 2 === 1 ? 'lg:grid-flow-dense' : ''
              }`}
            >
              {/* Content Side */}
              <div className={`space-y-6 ${index % 2 === 1 ? 'lg:col-start-2' : ''}`}>
                <h3 className="text-3xl font-bold text-foreground">
                  {section.title}
                </h3>
                <p className="text-lg text-muted-foreground">
                  {section.description}
                </p>
                <div className="space-y-3">
                  {section.highlights.map((highlight, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <ArrowRight className="w-5 h-5 text-primary" />
                      <span className="text-muted-foreground">{highlight}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Image/Component Side */}
              <div className={index % 2 === 1 ? 'lg:col-start-1' : ''}>
                {section.component ? (
                  section.component
                ) : (
                  <div className="relative h-[400px] rounded-2xl overflow-hidden border border-border/50">
                    <Image
                      src={section.image}
                      alt={section.title}
                      fill
                      priority={index < 2}
                      sizes="(max-width: 768px) 100vw, 50vw"
                      loading={index < 2 ? "eager" : "lazy"}
                      className="object-contain bg-white"
                    />
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </div>

        {/* Call to Action */}
        <motion.div 
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={animationConfig}
          transition={{ duration: 0.3 }}
          className="max-w-3xl mx-auto bg-background/50 backdrop-blur-sm border border-muted rounded-xl p-8 shadow-sm mt-20"
        >
          <h3 className="text-xl font-medium text-primary mb-3">Ready for Data-Driven Results?</h3>
          <p className="text-base text-muted-foreground mb-6">
            Optimize your field's productivity with custom soil analysis and actionable insights tailored to your operation.
          </p>
          <Link
            href="/#contact"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-primary text-primary-foreground hover:bg-primary/90 transition-colors font-medium"
          >
            Get Your Soil Report
            <ArrowRight className="w-4 h-4" />
          </Link>
        </motion.div>
      </div>
    </section>
  );
} 