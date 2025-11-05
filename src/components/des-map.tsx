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
import L from "leaflet";
import { useEffect, useRef, useState } from "react";
import "leaflet-control-geocoder/Control.Geocoder.css";
import "leaflet-control-geocoder/style.css";
import GeoSearch from "./geosearch";
import "leaflet-routing-machine/dist/leaflet-routing-machine.css";
import "leaflet-routing-machine";
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

const start_icon = new L.Icon({
  iconUrl: "https://cdn-icons-png.flaticon.com/512/684/684908.png",
  iconSize: [25, 41],
});

const end_icon = new L.Icon({
  iconUrl: "https://cdn-icons-png.flaticon.com/512/684/684908.png",
  iconSize: [25, 41],
});

const default_icon = new L.Icon({
  iconUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  iconSize: [25, 41],
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

// Component vẽ tuyến đường
function RoutingMachine({
  locations,
}: {
  locations: Array<{
    position: [number, number];
    name: string;
    diem_khoi_hanh: boolean;
    diem_den: boolean;
  }>;
}) {
  const map = useMap();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const routingRef = useRef<any>(null);

  useEffect(() => {
    if (!map || !locations?.length) return;

    // Xác định điểm đầu & điểm cuối
    const start = locations.find((l) => l.diem_khoi_hanh);
    const end = locations.find((l) => l.diem_den);
    const waypoints = [];

    if (start) waypoints.push(L.latLng(start.position[0], start.position[1]));

    // Các điểm trung gian
    locations
      .filter((l) => !l.diem_khoi_hanh && !l.diem_den)
      .forEach((l) => {
        waypoints.push(L.latLng(l.position[0], l.position[1]));
      });

    if (end) waypoints.push(L.latLng(end.position[0], end.position[1]));

    if (waypoints.length < 2) return;

    // Nếu đã có route cũ thì xóa trước
    // if (routingRef.current) {
    //   try {
    //     map.removeControl(routingRef.current);
    //   } catch (err) {
    //     console.warn("Không thể xóa routing cũ:", err);
    //   }
    // }

    // Tạo tuyến đường mới
    const control = L.Routing.control({
      waypoints,
      routeWhileDragging: true,
      addWaypoints: false,
      fitSelectedRoutes: true,
      show: false,
      lineOptions: {
        styles: [{ color: "#e84393", weight: 4 }],
        extendToWaypoints: false,
        missingRouteTolerance: 20,
      },
      createMarker: () => null,
    } as L.Routing.RoutingControlOptions & { createMarker: () => null }).addTo(
      map,
    );

    routingRef.current = control;

    // return () => {
    //   if (map && routingRef.current) {
    //     try {
    //       map.removeControl(routingRef.current);
    //     } catch {}
    //   }
    // };
  }, [map, locations]);

  return null;
}

export default function DesMap({
  position = [10.78, 106.7] as LatLngExpression,
  zoom = 12,
  location,
  setLocation,
  setLocationDetails,
  locations,
  polyline,
}: //   location,
{
  position?: LatLngExpression;
  zoom?: number;
  location: LatLngExpression | null;
  setLocation?: (loc: LatLngExpression) => void;
  setLocationDetails?: (details: { name: string; address: string }) => void;
  locations?: Array<{
    position: LatLngExpression;
    name: string;
    diem_khoi_hanh: boolean;
    diem_den: boolean;
    dac_san?: Array<object> | null;
  }>;
  polyline?: boolean;
}) {
  const [clickedPos, setClickedPos] = useState<LatLngExpression | null>(null);
  // Đồng bộ marker với location prop từ cha

  useEffect(() => {
    setClickedPos(location);
  }, [location]);
  // console.log(locations);
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
        locations.map((loc, i) => {
          const icon = loc.diem_khoi_hanh
            ? start_icon
            : loc.diem_den
              ? end_icon
              : default_icon;
          return (
            <Marker key={i} position={loc.position} icon={icon}>
              <Popup>
                <h2>{loc.name}</h2>
                {loc.dac_san ? (
                  <span>
                    Đặc sản: {loc.dac_san.map((ds: any) => ds.ten).join(", ")}
                  </span>
                ) : (
                  "Không có đặc sản"
                )}
                <br />
                {loc.diem_khoi_hanh && <strong>Điểm khởi hành</strong>}
                {loc.diem_den && <strong>Điểm đến</strong>}
              </Popup>
            </Marker>
          );
        })}

      {/* Khi click, hiển thị marker mới */}
      {!locations && clickedPos && (
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

      {/* {polyline && locations && locations.length > 1 && (
        <Polyline
          positions={locations
            .filter((loc) => !loc.diem_khoi_hanh && !loc.diem_den)
            .map((loc) => loc.position)}
          pathOptions={{ color: "#e84393", dashArray: "12,0" }}
        />
      )} */}

      <ClickHandler
        onMapClick={(latlng) => {
          setClickedPos(latlng);
          if (setLocation) setLocation(latlng);
        }}
      />

      <Recenter latlng={location} />
      <PanTo latlng={clickedPos} />
      {setLocation && setLocationDetails && (
        <GeoSearch
          setLocation={setLocation}
          setLocationDetails={setLocationDetails}
        />
      )}

      <RoutingMachine
        locations={
          (locations as Array<{
            position: [number, number];
            name: string;
            diem_khoi_hanh: boolean;
            diem_den: boolean;
          }>) || []
        }
      />
    </MapContainer>
  );
}
