'use client';

import dynamic from "next/dynamic";

const Map = dynamic(() => import("@/components/leaflet-map"), {
  ssr: false, // Tắt server-side rendering
  loading: () => <p>Đang tải bản đồ...</p>,
});

export default Map;
