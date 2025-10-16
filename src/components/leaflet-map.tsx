"use client";

import {
  MapContainer,
  Marker,
  Popup,
  TileLayer,
  useMapEvents,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { LatLngExpression } from "leaflet";
import * as L from "leaflet";
import { useState } from "react";

// Sửa lỗi icon mặc định không hiển thị trong Next.js
// eslint-disable-next-line @typescript-eslint/no-explicit-any
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

// Component để bắt sự kiện click
function ClickHandler({
  onMapClick,
}: {
  onMapClick: (latlng: L.LatLng) => void;
}) {
  useMapEvents({
    click(e) {
      onMapClick(e.latlng);
    },
  });
  return null;
}

export default function LeafletMap({ position = [10.78, 106.7], zoom = 12 }) {
  const [clickedPos, setClickedPos] = useState<LatLngExpression | null>(null);

  const locations = [
    { name: "Nhà thờ Đức Bà", position: [10.7798, 106.699] },
    { name: "Dinh Độc Lập", position: [10.7769, 106.6953] },
    { name: "Chợ Bến Thành", position: [10.772, 106.6983] },
    { name: "Landmark 81", position: [10.7942, 106.7224] },
    { name: "Bến Bạch Đằng", position: [10.7765, 106.705] },
  ];

  return (
    <MapContainer
      center={position as LatLngExpression}
      zoom={zoom}
      scrollWheelZoom
      style={{ width: "100%", height: "100%" }}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {locations.map((loc, i) => (
        <Marker key={i} position={loc.position as LatLngExpression}>
          <Popup>
            <b>{loc.name}</b>
            <br />
            {loc.position.toString()}
          </Popup>
        </Marker>
      ))}

      {/* Khi click, hiển thị marker mới */}
      {clickedPos && (
        <Marker position={clickedPos}>
          <Popup>
            Tọa độ vừa click:
            <br />
            {Array.isArray(clickedPos)
              ? `${clickedPos[0].toFixed(5)}, ${clickedPos[1].toFixed(5)}`
              : `${clickedPos.lat.toFixed(5)}, ${clickedPos.lng.toFixed(5)}`}
          </Popup>
        </Marker>
      )}

      <ClickHandler onMapClick={(latlng) => setClickedPos(latlng)} />
    </MapContainer>
  );
}
