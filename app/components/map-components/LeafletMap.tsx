"use client";

import { MapContainer, TileLayer, GeoJSON, ZoomControl } from "react-leaflet";
import { LatLngBounds } from "leaflet";

interface LeafletMapProps {
  bounds: LatLngBounds;
  trialData: any;
  getFeatureStyle: (feature: any) => any;
  onEachFeature: (feature: any, layer: any) => void;
  onMapCreated: (map: any) => void;
}

const LeafletMap = ({
  bounds,
  trialData,
  getFeatureStyle,
  onEachFeature,
  onMapCreated
}: LeafletMapProps) => {
  return (
    <MapContainer
      center={bounds.getCenter()}
      zoom={19}
      style={{ height: "500px", width: "100%" }}
      zoomControl={false}
      maxZoom={21}
      minZoom={18}
      maxBounds={bounds}
      maxBoundsViscosity={1.0}
      whenCreated={onMapCreated}
      className="rounded-lg border border-border"
    >
      <ZoomControl position="bottomright" />
      <TileLayer
        url="https://{s}.google.com/vt/lyrs=s&x={x}&y={y}&z={z}"
        maxZoom={21}
        subdomains={["mt0", "mt1", "mt2", "mt3"]}
        attribution="&copy; Google Maps"
      />
      <GeoJSON
        data={trialData}
        style={getFeatureStyle}
        onEachFeature={onEachFeature}
      />
    </MapContainer>
  );
};

export default LeafletMap;
