"use client";
import {
  MapContainer,
  Marker,
  Polyline,
  Popup,
  TileLayer,
  useMap,
  useMapEvents,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { LatLngExpression } from "leaflet";
import * as L from "leaflet";
import { useEffect, useState } from "react";
import "leaflet-control-geocoder/Control.Geocoder.css";
import "leaflet-control-geocoder/style.css";
import GeoSearch from "./geosearch";

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

function Recenter({ latlng }: { latlng: LatLngExpression | null }) {
  const map = useMap();
  useEffect(() => {
    if (latlng) map.setView(latlng, map.getZoom());
  }, [latlng, map]);
  return null;
}

function PanTo({ latlng }: { latlng: LatLngExpression | null }) {
  const map = useMap();
  useEffect(() => {
    if (latlng) {
      map.setView(latlng, map.getZoom(), { animate: true });
    }
  }, [latlng, map]);
  return null;
}

export default function DesMap({
  position = [10.78, 106.7] as LatLngExpression,
  zoom = 12,
  location,
  setLocation,
  locations,
  polyline,
}: //   location,
{
  position?: LatLngExpression;
  zoom?: number;
  location: LatLngExpression | null;
  setLocation?: (loc: LatLngExpression) => void;
  locations?: Array<{ position: LatLngExpression; name: string }>;
  polyline?: boolean;
}) {
  const [clickedPos, setClickedPos] = useState<LatLngExpression | null>(null);
  // Đồng bộ marker với location prop từ cha

  useEffect(() => {
    setClickedPos(location);
  }, [location]);
  
  return (
    <MapContainer
      center={position as LatLngExpression}
      zoom={zoom}
      scrollWheelZoom
      style={{ width: "100%", height: "100%" }}
    >
      <TileLayer
        attribution='<a href="https://www.maptiler.com/copyright/" target="_blank">&copy; MapTiler</a> <a href="https://www.openstreetmap.org/copyright" target="_blank">&copy; OpenStreetMap contributors</a>'
        url={`https://api.maptiler.com/maps/hybrid/{z}/{x}/{y}.png?key=${process.env.NEXT_PUBLIC_MAPTILER_API_KEY}`}
      />
      {locations &&
        locations.map((loc, i) => (
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

      {polyline && locations && locations.length > 1 && (
        <Polyline
          positions={locations.map((loc) => loc.position)}
          pathOptions={{ color: "#e84393", dashArray: "12,0" }}
        />
      )}

      <ClickHandler
        onMapClick={(latlng) => {
          setClickedPos(latlng);
          if (setLocation) setLocation(latlng);
        }}
      />

      <Recenter latlng={location} />
      <PanTo latlng={clickedPos} />
      {setLocation && <GeoSearch setLocation={setLocation} />}
    </MapContainer>
  );
}
