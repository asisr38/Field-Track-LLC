"use client";

import {
  MapContainer,
  TileLayer,
  GeoJSON,
  ZoomControl,
  useMap
} from "react-leaflet";
import { LatLngBounds, Map } from "leaflet";
import { useEffect } from "react";

interface LeafletMapProps {
  bounds: LatLngBounds;
  trialData: any;
  getFeatureStyle: (feature: any) => any;
  onEachFeature: (feature: any, layer: any) => void;
  onMapCreated: (map: Map) => void;
  useSatelliteLayer?: boolean;
  zoomPosition?: "topleft" | "topright" | "bottomleft" | "bottomright";
  disableZoom?: boolean;
}

// Helper component to get the map instance
const MapInitializer = ({
  onMapCreated,
  disableZoom
}: {
  onMapCreated: (map: Map) => void;
  disableZoom?: boolean;
}) => {
  const map = useMap();

  useEffect(() => {
    onMapCreated(map);

    // Disable scroll wheel zoom and touch zoom if disableZoom is true
    if (disableZoom) {
      map.scrollWheelZoom.disable();
      map.touchZoom.disable();
      map.doubleClickZoom.disable();
      map.boxZoom.disable();
      map.keyboard.disable();
    }
  }, [map, onMapCreated, disableZoom]);

  return null;
};

const LeafletMap = ({
  bounds,
  trialData,
  getFeatureStyle,
  onEachFeature,
  onMapCreated,
  useSatelliteLayer = false,
  zoomPosition = "bottomright",
  disableZoom = false
}: LeafletMapProps) => {
  return (
    <MapContainer
      center={bounds.getCenter()}
      zoom={19}
      style={{ height: "500px", width: "100%" }}
      zoomControl={!disableZoom}
      maxZoom={21}
      minZoom={18}
      maxBounds={bounds}
      maxBoundsViscosity={1.0}
      className="rounded-lg border border-border"
    >
      <MapInitializer onMapCreated={onMapCreated} disableZoom={disableZoom} />
      {!disableZoom && <ZoomControl position={zoomPosition} />}

      {useSatelliteLayer ? (
        <TileLayer
          attribution="© Esri"
          url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
          maxZoom={21}
        />
      ) : (
        <TileLayer
          url="https://{s}.google.com/vt/lyrs=s&x={x}&y={y}&z={z}"
          maxZoom={21}
          subdomains={["mt0", "mt1", "mt2", "mt3"]}
          attribution="&copy; Google Maps"
        />
      )}

      <GeoJSON
        data={trialData}
        style={getFeatureStyle}
        onEachFeature={onEachFeature}
      />
    </MapContainer>
  );
};

export default LeafletMap;
