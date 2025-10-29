import { OpenStreetMapProvider, GeoSearchControl } from "leaflet-geosearch";
import { useEffect } from "react";
import { useMap } from "react-leaflet";
import "leaflet-geosearch/assets/css/leaflet.css";

export default function GeoSearch({
  setLocation,
  setLocationDetails,
}: {
  setLocation: (loc: [number, number]) => void;
  setLocationDetails: (details: { name: string; address: string }) => void;
}) {
  const map = useMap();
  useEffect(() => {
    if (!map) return;
    const provider = new OpenStreetMapProvider();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const searchControl = new (GeoSearchControl as any)({
      provider,
      style: "bar", // hiển thị thanh search trực tiếp trên map
      showMarker: true, // thêm marker tự động
      retainZoomLevel: false, // zoom khi pan
    });
    // Khi chọn kết quả
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    map.on("geosearch/showlocation", function (e: any) {
      console.log(e);
      const { x, y, raw } = e.location;
      setLocation([y, x]); // cập nhật state cha
      setLocationDetails({
        name: raw.name,
        address: raw.display_name,
      });
    });
    map.addControl(searchControl);
    return () => {
      map.removeControl(searchControl);
    };
  }, [map, setLocation, setLocationDetails]);

  return null;
}
