"use client";
import AddDestinationForm from "@/components/add-destination-form";
import { QueryKeys } from "@/enums";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Button, message } from "antd";
import axios from "axios";
import { LatLngExpression } from "leaflet";
import dynamic from "next/dynamic";
import { useParams } from "next/navigation";
import { useCallback, useMemo, useState } from "react";

export default function AddDestination() {
  const params = useParams<{ id: string }>();
  const queryClient = useQueryClient();
  const [messageApi, contextHolder] = message.useMessage();

  const { data, isLoading } = useQuery({
    queryKey: [QueryKeys.TOUR_DETAIL],
    queryFn: async () => {
      const res = await axios.get(`/api/tours/${params.id}`);
      return res.data;
    },
  });

  const mutation = useMutation({
    mutationFn: async (id: string) => {
      // setIsLoading(true);
      // setIsDisable(true);
      const res = await axios.delete(`/api/destination/${id}`);
      return res.data;
    },
    onSuccess: () => {
      // router.replace("/destination");
      // setIsLoading(false);
      // setIsDisable(false);
      queryClient.refetchQueries({
        queryKey: [QueryKeys.TOUR_DETAIL],
      });
      messageApi.open({
        type: "success",
        content: "Xóa địa điểm thành công",
      });
    },
    onError: (error) => {
      messageApi.open({
        type: "error",
        content: (error as unknown as { response: { data: string } }).response
          .data,
      });
      // console.error("Error creating tour:", error);
    },
  });

  const DesMap = dynamic(() => import("@/components/des-map"), {
    ssr: false, // Tắt server-side rendering
    loading: () => <p>Đang tải bản đồ...</p>,
  });

  const [location, setLocation] = useState<LatLngExpression | null>(null);

  const handleSetLocation = useCallback((loc: LatLngExpression | null) => {
    setLocation(loc);
  }, []);

  const getCoords = (
    loc: LatLngExpression | null,
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

  function getCenterFromLocations(
    locations: [number, number][]
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

  const { lat, long } = getCoords(location);
  const center = useMemo(() => {
    if (!data || data.destinations.length === 0)
      return [10.78, 106.7] as LatLngExpression;
    return getCenterFromLocations(
      data.destinations.map(
        (des: { kinh_do: number; vi_do: number; ten: string }) => [
          des.vi_do,
          des.kinh_do,
        ]
      )
    ) as LatLngExpression;
  }, [data]);
  return (
    <div className="flex gap-4 h-full">
      {contextHolder}
      <div className="w-[600px] h-full overflow-y-auto">
        <h2 className="text-2xl font-bold mb-4">Thêm điểm tham quan</h2>
        <AddDestinationForm long={long} lat={lat} tour_id={params.id} />
        <h4 className="text-2xl font-bold mb-4">Danh sách địa điểm đã thêm</h4>
        {isLoading && <div>Đang lấy danh sách địa điểm...</div>}
        {!isLoading &&
          data.destinations
            .map((dest: { _id: string }) => {
              const link = data.tour_dest_links.find(
                (t: { ma_dia_diem: string }) => t.ma_dia_diem === dest._id
              );
              return {
                ...dest,
                link_id: link._id,
                diem_den: link?.diem_den ?? false,
                diem_khoi_hanh: link?.diem_khoi_hanh ?? false,
              };
            })
            .map(
              (md: {
                _id: string;
                ten: string;
                link_id: string;
                dia_chi: string;
                kinh_do: number;
                vi_do: number;
                diem_den: boolean;
                diem_khoi_hanh: boolean;
              }) => (
                <div key={md.link_id}>
                  {md.ten} - {md.dia_chi} - {md.diem_den && "Điểm đến"}
                  {md.diem_khoi_hanh && "Điểm khởi hành"}
                  {!md.diem_den && !md.diem_khoi_hanh && "Điểm tham quan"}
                  <div>
                    {md.kinh_do} - {md.vi_do}{" "}
                    <Button
                      type="link"
                      onClick={() => mutation.mutate(md.link_id)}
                    >
                      Xóa
                    </Button>
                  </div>
                </div>
              )
            )}
      </div>
      <div className="w-full">
        {/* <DesMap /> */}
        <DesMap
          position={center}
          location={location}
          setLocation={handleSetLocation}
          locations={
            data &&
            data.destinations.map(
              (des: { kinh_do: number; vi_do: number; ten: string }) => ({
                position: [des.vi_do, des.kinh_do],
                name: des.ten,
              })
            )
          }
        />
      </div>
    </div>
  );
}
