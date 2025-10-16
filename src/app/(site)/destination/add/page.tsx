"use client";
import AddDestinationForm from "@/components/add-destination-form";
import { LatLngExpression } from "leaflet";
import dynamic from "next/dynamic";
import { useCallback, useMemo, useState } from "react";

export default function AddDestination() {
  const DesMap = dynamic(() => import("@/components/des-map"), {
    ssr: false, // Tắt server-side rendering
    loading: () => <p>Đang tải bản đồ...</p>,
  });

  const [location, setLocation] = useState<LatLngExpression | null>(null);

  const handleSetLocation = useCallback((loc: LatLngExpression | null) => {
    setLocation(loc);
  }, []);

  const getCoords = (
    loc: LatLngExpression | null
  ): { lat: number; long: number } => {
    if (!loc) return { lat: 0, long: 0 };
    if (Array.isArray(loc)) {
      const [lat, lng] = loc;
      return { lat: Number(lat), long: Number(lng) };
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const l = loc as any;
    if ("lat" in l && ("lng" in l || "lon" in l || "long" in l)) {
      return { lat: Number(l.lat), long: Number(l.lng ?? l.lon ?? l.long) };
    }
    return { lat: 0, long: 0 };
  };

  const { lat, long } = getCoords(location);
  const center = useMemo(() => [10.78, 106.7] as LatLngExpression, []);
  return (
    <div className="flex gap-4">
      <div className="w-[400px]">
        <AddDestinationForm long={long} lat={lat} />
      </div>
      <div className="w-full">
        {/* <DesMap /> */}
        <DesMap
          position={center}
          location={location}
          setLocation={handleSetLocation}
        />
      </div>
    </div>
  );
}
