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
import { useEffect, useState, useMemo } from "react";
import "leaflet-control-geocoder/Control.Geocoder.css";
import "leaflet-control-geocoder/style.css";
import GeoSearch from "./geosearch";

import { GeoJSON } from "react-leaflet";
import { FeatureCollection, Feature, Geometry } from "geojson";

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
  zoom = 6,
  location,
  setLocation,
  locations,
  polyline,
}: {
  position?: LatLngExpression;
  zoom?: number;
  location: LatLngExpression | null;
  setLocation?: (loc: LatLngExpression) => void;
  locations?: Array<{ position: LatLngExpression; name: string }>;
  polyline?: boolean;
}) {
  const [clickedPos, setClickedPos] = useState<LatLngExpression | null>(null);
  const [geoData, setGeoData] = useState<FeatureCollection | null>(null);

  // Load GeoJSON data
  useEffect(() => {
    fetch("/VNM_adm1.json")
      .then((res) => res.json())
      .then((data) => setGeoData(data));
  }, []);

  useEffect(() => {
    setClickedPos(location);
  }, [location]);


    // Helper function to check if point is in polygon
  const isPointInPolygon = (point: L.LatLng, feature: Feature<Geometry>): boolean => {
    const layer = L.geoJSON(feature);
    let isInside = false;

    layer.eachLayer((l) => {
      if (l instanceof L.Polygon) {
        const polygon = l as L.Polygon;
        const latLngs = polygon.getLatLngs();
        
        // Check for MultiPolygon (array of arrays)
        const checkRing = (ring: L.LatLng[]) => {
          let inside = false;
          for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
            const xi = ring[i].lng, yi = ring[i].lat;
            const xj = ring[j].lng, yj = ring[j].lat;
            
            const intersect = ((yi > point.lat) !== (yj > point.lat))
              && (point.lng < (xj - xi) * (point.lat - yi) / (yj - yi) + xi);
            if (intersect) inside = !inside;
          }
          return inside;
        };

        if (Array.isArray(latLngs[0])) {
          // Polygon with holes or MultiPolygon
          for (const ring of latLngs as L.LatLng[][]) {
            if (Array.isArray(ring[0])) {
              // MultiPolygon
              for (const subRing of ring as unknown as L.LatLng[][]) {
                if (checkRing(subRing)) {
                  isInside = true;
                  break;
                }
              }
            } else {
              // Polygon with holes
              if (checkRing(ring as L.LatLng[])) {
                isInside = true;
                break;
              }
            }
            if (isInside) break;
          }
        } else {
          // Simple polygon
          isInside = checkRing(latLngs as L.LatLng[]);
        }
      }
    });

    return isInside;
  };

  
  // Calculate destinations per region
  const regionStats = useMemo(() => {
    if (!geoData || !locations) return new Map<string, number>();

    const stats = new Map<string, number>();

    // Initialize all regions with 0
    geoData.features.forEach((feature) => {
      const name = (feature.properties as any)?.NAME_1 || (feature.properties as any)?.name || "Unknown";
      stats.set(name, 0);
    });

    // Count destinations in each region
    locations.forEach((loc) => {
      const latLng = Array.isArray(loc.position)
        ? L.latLng(loc.position[0], loc.position[1])
        : L.latLng(loc.position as any);

      geoData.features.forEach((feature) => {
        const name = (feature.properties as any)?.NAME_1 || (feature.properties as any)?.name || "Unknown";
        
        // Check if point is inside polygon
        if (feature.geometry.type === "Polygon" || feature.geometry.type === "MultiPolygon") {
          const layer = L.geoJSON(feature as Feature<Geometry>);
          const bounds = layer.getBounds();
          
          if (bounds.contains(latLng)) {
            // More precise check using ray casting algorithm
            if (isPointInPolygon(latLng, feature)) {
              stats.set(name, (stats.get(name) || 0) + 1);
            }
          }
        }
      });
    });

    return stats;
  }, [geoData, locations]);



  // Color scale based on destination count
  const getColorForCount = (count: number): string => {
    if (count === 0) return "#e8f4f8";
    if (count <= 2) return "#b3d9e8";
    if (count <= 5) return "#7ebfd8";
    if (count <= 10) return "#4aa5c8";
    return "#1a8bb8";
  };

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

      {/* Draw polygons from GeoJSON with dynamic colors */}
      {geoData && (
        <GeoJSON
          data={geoData}
          style={(feature) => {
            const name = (feature?.properties as any)?.NAME_1 || (feature?.properties as any)?.name || "Unknown";
            const count = regionStats.get(name) || 0;
            return {
              color: "#2980b9",
              weight: 2,
              fillColor: getColorForCount(count),
              fillOpacity: 0.6,
            };
          }}
          onEachFeature={(feature, layer) => {
            const props = (feature as any).properties || {};
            const name = props.NAME_1 || props.name || "Unknown";
            const count = regionStats.get(name) || 0;
            (layer as any).bindPopup(`
              <strong>${name}</strong><br/>
              Số điểm đến: <strong>${count}</strong>
            `);
          }}
        />
      )}

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

      <ClickHandler
        onMapClick={(latlng) => {
          setClickedPos(latlng);
          if (setLocation) setLocation(latlng);
        }}
      />

      <Recenter latlng={location} />
      <PanTo latlng={clickedPos} />
      {/* {setLocation && <GeoSearch setLocation={setLocation} />} */}
    </MapContainer>
  );
}
