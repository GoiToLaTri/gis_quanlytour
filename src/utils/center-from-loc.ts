export function getCenterFromLocations(
  locations: [number, number][],
): [number, number] | null {
  if (!locations || locations.length === 0) return null;

  let x = 0,
    y = 0,
    z = 0;

  for (const [lat, lng] of locations) {
    const latRad = (lat * Math.PI) / 180;
    const lngRad = (lng * Math.PI) / 180;

    x += Math.cos(latRad) * Math.cos(lngRad);
    y += Math.cos(latRad) * Math.sin(lngRad);
    z += Math.sin(latRad);
  }

  const total = locations.length;
  x /= total;
  y /= total;
  z /= total;

  const lngRad = Math.atan2(y, x);
  const hyp = Math.sqrt(x * x + y * y);
  const latRad = Math.atan2(z, hyp);

  const lat = (latRad * 180) / Math.PI;
  const lng = (lngRad * 180) / Math.PI;

  return [lat, lng];
}
