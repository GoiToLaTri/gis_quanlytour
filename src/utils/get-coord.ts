import { LatLngExpression } from "leaflet";

export const getCoords = (
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
