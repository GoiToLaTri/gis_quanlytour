"use client";
import {
  MapContainer,
  Marker,
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
  zoom = 5,
  // location,
  // setLocation,
  locations,
  // polyline,
  geoData,
  regionStats,
  selectedRegion,
  onRegionClick,
}: {
  position?: LatLngExpression;
  zoom?: number;
  // location: LatLngExpression | null;
  // setLocation?: (loc: LatLngExpression) => void;
  locations?: Array<{
    position: LatLngExpression;
    name: string;
    dia_chi: string;
  }>;
  // polyline?: boolean;
  geoData: FeatureCollection | null;
  regionStats: Map<string, number>;
  selectedRegion: string | null;
  onRegionClick: (regionName: string) => void;
}) {
  // const [clickedPos, setClickedPos] = useState<LatLngExpression | null>(null);

  // Calculate center and zoom for selected region
  const mapViewSettings = useMemo(() => {
    if (selectedRegion && geoData) {
      const feature = geoData.features.find(
        (f) =>
          ((f.properties as any)?.NAME_1 || (f.properties as any)?.name) ===
          selectedRegion,
      );

      if (feature) {
        const layer = L.geoJSON(feature);
        const bounds = layer.getBounds();
        const center = bounds.getCenter();

        return {
          center: [center.lat, center.lng] as LatLngExpression,
          zoom: 9, // Closer zoom level for selected region
        };
      }
    }

    return {
      center: position,
      zoom: zoom,
    };
  }, [selectedRegion, geoData, position, zoom]);

  // useEffect(() => {
  //   setClickedPos(location);
  // }, [location]);

  // Helper function to check if point is in polygon
  // const isPointInPolygon = (
  //   point: L.LatLng,
  //   feature: Feature<Geometry>,
  // ): boolean => {
  //   const layer = L.geoJSON(feature);
  //   let isInside = false;

  //   layer.eachLayer((l) => {
  //     if (l instanceof L.Polygon) {
  //       const polygon = l as L.Polygon;
  //       const latLngs = polygon.getLatLngs();

  //       // Check for MultiPolygon (array of arrays)
  //       const checkRing = (ring: L.LatLng[]) => {
  //         let inside = false;
  //         for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
  //           const xi = ring[i].lng,
  //             yi = ring[i].lat;
  //           const xj = ring[j].lng,
  //             yj = ring[j].lat;

  //           const intersect =
  //             yi > point.lat !== yj > point.lat &&
  //             point.lng < ((xj - xi) * (point.lat - yi)) / (yj - yi) + xi;
  //           if (intersect) inside = !inside;
  //         }
  //         return inside;
  //       };

  //       if (Array.isArray(latLngs[0])) {
  //         // Polygon with holes or MultiPolygon
  //         for (const ring of latLngs as L.LatLng[][]) {
  //           if (Array.isArray(ring[0])) {
  //             // MultiPolygon
  //             for (const subRing of ring as unknown as L.LatLng[][]) {
  //               if (checkRing(subRing)) {
  //                 isInside = true;
  //                 break;
  //               }
  //             }
  //           } else {
  //             // Polygon with holes
  //             if (checkRing(ring as L.LatLng[])) {
  //               isInside = true;
  //               break;
  //             }
  //           }
  //           if (isInside) break;
  //         }
  //       } else {
  //         // Simple polygon
  //         isInside = checkRing(latLngs as L.LatLng[]);
  //       }
  //     }
  //   });

  //   return isInside;
  // };

  // Color scale based on destination count
  const getColorForCount = (count: number): string => {
    if (count === 0) return "#F7FBFF";
    if (count <= 2) return "#C8DDF0";
    if (count <= 4) return "#73B3D8";
    if (count <= 6) return "#2879B9";
    return "#08306B";
  };

  return (
    <MapContainer
      center={mapViewSettings.center}
      zoom={mapViewSettings.zoom}
      scrollWheelZoom
      style={{ width: "100%", height: "100%" }}
    >
      <TileLayer
        attribution='<a href="https://www.maptiler.com/copyright/" target="_blank">&copy; MapTiler</a> <a href="https://www.openstreetmap.org/copyright" target="_blank">&copy; OpenStreetMap contributors</a>'
        url={`https://api.maptiler.com/maps/hybrid/{z}/{x}/{y}.png?key=${process.env.NEXT_PUBLIC_MAPTILER_API_KEY}`}
      />

      {/* Draw polygons from GeoJSON with dynamic colors */}
      {geoData && (
        <>
          {/* Draw all non-selected regions first */}
          <GeoJSON
            data={geoData}
            style={(feature) => {
              const name =
                (feature?.properties as any)?.NAME_1 ||
                (feature?.properties as any)?.name ||
                "Unknown";
              const count = regionStats.get(name) || 0;
              const isSelected = selectedRegion === name;

              // Don't render selected region in this layer
              if (isSelected) {
                return { stroke: false, fill: false };
              }

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

              layer.on("click", () => {
                onRegionClick(name);
              });
            }}
          />

          {/* Draw selected region on top */}
          {selectedRegion && (
            <GeoJSON
              key={selectedRegion} // Force re-render when selection changes
              data={
                {
                  type: "FeatureCollection",
                  features: geoData.features.filter(
                    (f) =>
                      ((f.properties as any)?.NAME_1 ||
                        (f.properties as any)?.name) === selectedRegion,
                  ),
                } as FeatureCollection
              }
              style={(feature) => {
                const name =
                  (feature?.properties as any)?.NAME_1 ||
                  (feature?.properties as any)?.name ||
                  "Unknown";
                const count = regionStats.get(name) || 0;
                return {
                  color: "#e74c3c",
                  weight: 3,
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

                layer.on("click", () => {
                  onRegionClick(name);
                });
              }}
            />
          )}
        </>
      )}

      {locations &&
        locations.map((loc, i) => (
          <Marker key={i} position={loc.position as LatLngExpression}>
            <Popup>
              <b>{loc.name}</b>
              <br />
              {loc.dia_chi}
            </Popup>
          </Marker>
        ))}

      {/* {clickedPos && (
        <Marker position={clickedPos}>
          <Popup>
            Tọa độ vừa click:
            <br />
            {Array.isArray(clickedPos)
              ? `${clickedPos[0].toFixed(5)}, ${clickedPos[1].toFixed(5)}`
              : `${clickedPos.lat.toFixed(5)}, ${clickedPos.lng.toFixed(5)}`}
          </Popup>
        </Marker>
      )} */}

      {/* <ClickHandler
        onMapClick={(latlng) => {
          setClickedPos(latlng);
          if (setLocation) setLocation(latlng);
        }}
      /> */}

      {/* Add this component to handle view changes */}
      <Recenter latlng={selectedRegion ? mapViewSettings.center : position} />
      {/* <PanTo latlng={clickedPos} /> */}
    </MapContainer>
  );
}
