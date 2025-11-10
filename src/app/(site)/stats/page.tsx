"use client";

import { QueryKeys } from "@/enums";
import { getCenterFromLocations } from "@/utils/center-from-loc";
import { useQuery } from "@tanstack/react-query";
import { Button, List } from "antd";
import axios from "axios";
import { LatLngExpression } from "leaflet";
import * as L from "leaflet";
import dynamic from "next/dynamic";
import { useEffect, useState, useMemo } from "react";
import { FeatureCollection, Feature, Geometry } from "geojson";

export default function StatsPage() {
  const [geoData, setGeoData] = useState<FeatureCollection | null>(null);
  const [selectedRegion, setSelectedRegion] = useState<string | null>(null);

  // Load GeoJSON data
  useEffect(() => {
    fetch("/VNM_adm1.json")
      .then((res) => res.json())
      .then((data) => setGeoData(data));
  }, []);

  const { data: data, isLoading: isLoading } = useQuery({
    queryKey: [QueryKeys.DESTINATION],
    queryFn: async () => {
      const res = await axios.get("/api/stat_des");
      return JSON.parse(res.data);
    },
  });

  // Helper function to check if point is in polygon
  const isPointInPolygon = (
    point: L.LatLng,
    feature: Feature<Geometry>,
  ): boolean => {
    const layer = L.geoJSON(feature);
    let isInside = false;

    layer.eachLayer((l) => {
      if (l instanceof L.Polygon) {
        const polygon = l as L.Polygon;
        const latLngs = polygon.getLatLngs();

        const checkRing = (ring: L.LatLng[]) => {
          let inside = false;
          for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
            const xi = ring[i].lng,
              yi = ring[i].lat;
            const xj = ring[j].lng,
              yj = ring[j].lat;

            const intersect =
              yi > point.lat !== yj > point.lat &&
              point.lng < ((xj - xi) * (point.lat - yi)) / (yj - yi) + xi;
            if (intersect) inside = !inside;
          }
          return inside;
        };

        if (Array.isArray(latLngs[0])) {
          for (const ring of latLngs as L.LatLng[][]) {
            if (Array.isArray(ring[0])) {
              for (const subRing of ring as unknown as L.LatLng[][]) {
                if (checkRing(subRing)) {
                  isInside = true;
                  break;
                }
              }
            } else {
              if (checkRing(ring as L.LatLng[])) {
                isInside = true;
                break;
              }
            }
            if (isInside) break;
          }
        } else {
          isInside = checkRing(latLngs as L.LatLng[]);
        }
      }
    });

    return isInside;
  };

  // Calculate destinations per region
  const regionStats = useMemo(() => {
    if (!geoData || !data) return new Map<string, number>();

    const stats = new Map<string, number>();

    geoData.features.forEach((feature) => {
      const name =
        (feature.properties as any)?.NAME_1 ||
        (feature.properties as any)?.name ||
        "Unknown";
      stats.set(name, 0);
    });

    data.forEach((loc: { kinh_do: number; vi_do: number; ten: string }) => {
      const latLng = L.latLng(loc.vi_do, loc.kinh_do);

      geoData.features.forEach((feature) => {
        const name =
          (feature.properties as any)?.NAME_1 ||
          (feature.properties as any)?.name ||
          "Unknown";

        if (
          feature.geometry.type === "Polygon" ||
          feature.geometry.type === "MultiPolygon"
        ) {
          const layer = L.geoJSON(feature as Feature<Geometry>);
          const bounds = layer.getBounds();

          if (bounds.contains(latLng)) {
            if (isPointInPolygon(latLng, feature)) {
              stats.set(name, (stats.get(name) || 0) + 1);
            }
          }
        }
      });
    });

    return stats;
  }, [geoData, data]);

  // Filter locations by selected region
  const filteredLocations = useMemo(() => {
    if (!selectedRegion || !data || !geoData) return data;

    const selectedFeature = geoData.features.find((feature) => {
      const name =
        (feature.properties as any)?.NAME_1 ||
        (feature.properties as any)?.name;
      return name === selectedRegion;
    });

    if (!selectedFeature) return data;

    return data.filter(
      (loc: { kinh_do: number; vi_do: number; ten: string }) => {
        const latLng = L.latLng(loc.vi_do, loc.kinh_do);
        return isPointInPolygon(latLng, selectedFeature);
      },
    );
  }, [selectedRegion, data, geoData]);

  const center =
    !data || data.length === 0
      ? [10.78, 106.7]
      : getCenterFromLocations(
          data.map((des: { kinh_do: number; vi_do: number; ten: string }) => [
            des.vi_do,
            des.kinh_do,
          ]),
        );

  const StatsMap = dynamic(() => import("@/components/stats-map"), {
    ssr: false,
    loading: () => <p>Đang tải bản đồ...</p>,
  });

  const handleRegionClick = (regionName: string) => {
    setSelectedRegion(selectedRegion === regionName ? null : regionName);
  };

  const displayData = selectedRegion ? filteredLocations : [];

  return (
    <div className="flex h-full gap-6">
      <div className="overflow-y-auto w-3/10">
        <h2 className="text-2xl font-bold mb-2">Danh sách địa điểm</h2>

        {selectedRegion && (
          <Button className="mb-4" onClick={() => setSelectedRegion(null)} color="default" variant="solid" size="large"> 
            Trở về
          </Button>
        )}

        <div className="mb-0 mt-4">
          {selectedRegion && (
            <span>
              {selectedRegion} ({regionStats.get(selectedRegion) || 0} địa điểm)
            </span>
          )}
        </div>



        {isLoading && <p>Đang lấy danh sách điểm đến...</p>}
        {!isLoading &&
          selectedRegion &&
          displayData &&
          displayData.length === 0 && <p>Chưa có điểm đến nào</p>}
        {!isLoading &&
          !selectedRegion &&
          displayData &&
          displayData.length === 0 && <p className="text-gray-400">Chọn tỉnh thành để xem thống kê.</p>}
        {displayData && displayData.length > 0 && (
          <List
            // className="!w-[600px]"
            itemLayout="horizontal"
            dataSource={displayData}
            renderItem={(dest: {
              _id: string;
              ten: string;
              dia_chi: string;
            }) => (
              <List.Item>
                <List.Item.Meta
                  title={<strong>{dest.ten}</strong>}
                  description={
                    <>
                      <div>Địa chỉ: {dest.dia_chi}</div>
                    </>
                  }
                />
              </List.Item>
            )}
          />
        )}
      </div>

      {!isLoading && (
        <div className="w-full">
          <StatsMap
            // polyline
            position={center as LatLngExpression}
            // location={null}
            locations={
              displayData &&
              displayData.map(
                (des: {
                  kinh_do: number;
                  vi_do: number;
                  ten: string;
                  dia_chi: string;
                }) => ({
                  position: [des.vi_do, des.kinh_do],
                  name: des.ten,
                  dia_chi: des.dia_chi,
                }),
              )
            }
            geoData={geoData}
            regionStats={regionStats}
            selectedRegion={selectedRegion}
            onRegionClick={handleRegionClick}
          />
        </div>
      )}
    </div>
  );
}
