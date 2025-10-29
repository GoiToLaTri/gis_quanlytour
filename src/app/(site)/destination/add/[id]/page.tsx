"use client";
import AddDestinationForm from "@/components/add-destination-form";
import { QueryKeys } from "@/enums";
import { getCenterFromLocations } from "@/utils/center-from-loc";
import { getCoords } from "@/utils/get-coord";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Button, List, message } from "antd";
import axios from "axios";
import { LatLngExpression } from "leaflet";
import dynamic from "next/dynamic";
import { useParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";

export default function AddDestination() {
  const params = useParams<{ id: string }>();
  const queryClient = useQueryClient();
  const [messageApi, contextHolder] = message.useMessage();
  const [des, setDes] = useState([]);

  const { data, isLoading } = useQuery({
    queryKey: [QueryKeys.TOUR_DETAIL],
    queryFn: async () => {
      const res = await axios.get(`/api/tours/${params.id}`);
      return res.data;
    },
  });

  useEffect(() => {
    if (!data) return;
    const des_data = data.destinations.map((dest: { _id: string }) => {
      const link = data.tour_dest_links.find(
        (t: { ma_dia_diem: string }) => t.ma_dia_diem === dest._id,
      );
      return {
        ...dest,
        link_id: link._id,
        diem_den: link?.diem_den ?? false,
        diem_khoi_hanh: link?.diem_khoi_hanh ?? false,
      };
    });

    setDes(des_data);
  }, [data]);

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

  const { lat, long } = getCoords(location);
  const center = useMemo(() => {
    if (!data || data.destinations.length === 0)
      return [10.78, 106.7] as LatLngExpression;
    return getCenterFromLocations(
      data.destinations.map(
        (des: { kinh_do: number; vi_do: number; ten: string }) => [
          des.vi_do,
          des.kinh_do,
        ],
      ),
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

        {!isLoading && des && des.length > 0 && (
          <List
            className="!w-[400px]"
            itemLayout="horizontal"
            dataSource={des}
            renderItem={(des: {
              _id: string;
              ten: string;
              link_id: string;
              dia_chi: string;
              kinh_do: number;
              vi_do: number;
              diem_den: boolean;
              diem_khoi_hanh: boolean;
            }) => (
              <List.Item
                actions={[
                  <Button
                    type="link"
                    key={des.link_id}
                    onClick={() => mutation.mutate(des.link_id)}
                  >
                    Xóa
                  </Button>,
                ]}
              >
                <List.Item.Meta
                  title={`${des.kinh_do} / ${des.vi_do}`}
                  description={`${des.ten} - ${des.dia_chi}`}
                />
                <div>
                  {des.diem_den && "Điểm đến"}
                  {des.diem_khoi_hanh && "Điểm khởi hành"}
                  {!des.diem_den && !des.diem_khoi_hanh && "Điểm tham quan"}
                </div>
              </List.Item>
            )}
          />
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
              }),
            )
          }
        />
      </div>
    </div>
  );
}
