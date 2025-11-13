"use client";
import AddSpecialtyForm from "@/components/add-specialty-form";
import { QueryKeys } from "@/enums";
import { getCenterFromLocations } from "@/utils/center-from-loc";
import { getCoords } from "@/utils/get-coord";
import {
  QueryClient,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { List, Button, message } from "antd";
import axios from "axios";
import { LatLngExpression } from "leaflet";
import dynamic from "next/dynamic";
import { useParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";

export default function AddSpecialty() {
  const DesMap = dynamic(() => import("@/components/des-map-spec"), {
    ssr: false, // Tắt server-side rendering
    loading: () => <p>Đang tải bản đồ...</p>,
  });
  const params = useParams<{ id: string }>();
  const [location, setLocation] = useState<LatLngExpression | null>(null);
  const queryClient = useQueryClient();

  const [messageApi, contextHolder] = message.useMessage();
  const handleSetLocation = useCallback((loc: LatLngExpression | null) => {
    setLocation(loc);
  }, []);

  const { data: dest, isLoading: isLoadingDest } = useQuery({
    queryKey: [QueryKeys.DESTINATION_SPECIALTY_SPECIFIC],
    queryFn: async () => {
      const res = await axios.get(`/api/des-spec/${params.id}/specific`);
      return res.data;
    },
  });

  const mutation = useMutation({
    mutationFn: async (id: string) => {
      // setIsLoading(true);
      // setIsDisable(true);
      const res = await axios.delete(`/api/specialty/${id}`);
      // console.log(res.data);
      return res.data;
    },
    onSuccess: () => {
      // router.replace("/destination");
      // setIsLoading(false);
      // setIsDisable(false);
      queryClient.refetchQueries({
        queryKey: [QueryKeys.DESTINATION_SPECIALTY_SPECIFIC],
      });
      messageApi.open({
        type: "success",
        content: "Xóa đặc sản thành công",
      });
    },
    onError: (error) => {
      messageApi.open({
        type: "error",
        content: (error as unknown as { response: { data: string } }).response
          .data,
      });
    },
  });
  const specialtiesArray = dest?.dac_san || [];

  const { lat, long } = getCoords(location);
    useEffect(() => {
        // Chỉ chạy khi dữ liệu dest đã tải xong và có đầy đủ tọa độ
        if (!isLoadingDest && dest && dest.vi_do && dest.kinh_do) {
            const initialLoc: LatLngExpression = [dest.vi_do, dest.kinh_do];
            setLocation(initialLoc);
        }
    }, [dest, isLoadingDest]);

  return (
    <div className="flex h-full gap-6">
      {contextHolder}
      <div className="flex flex-col overflow-y-auto w-3/10">
        <h2 className="text-2xl font-bold mb-4">Thêm đặc sản mới</h2>
        <AddSpecialtyForm long={long} lat={lat} dia_diem_id={params.id} ten_dia_diem={dest?.ten_dia_diem} />
        <h4 className="text-2xl font-bold mb-4">Danh sách đặc sản đã thêm</h4>

        {isLoadingDest && <div>Đang lấy danh sách đặc sản...</div>}

        {!isLoadingDest && specialtiesArray && (
          <List
            className="!w-[400px]"
            itemLayout="horizontal"
            locale={{ emptyText: "Không có đặc sản nào được thêm" }}
            dataSource={specialtiesArray}
            renderItem={( de : { ten: string; link_id: string;  }) => (
              <List.Item
                actions={[
                  <Button
                    type="default"
                    key={de.link_id}
                    onClick={() => mutation.mutate(de.link_id)}
                  >
                    Xóa
                  </Button>,
                ]}
              >
                <List.Item.Meta title={de.ten} />
              </List.Item>
            )}
          />
        )}
      </div>
      <div className="grow-1 rounded-lg">
        <DesMap location={location} setLocation={handleSetLocation} 
        locations={
          dest 
              ? [{ // BỌC dest vào một mảng [] và truy cập thuộc tính trực tiếp
                  position: [dest.vi_do, dest.kinh_do],
                  name: dest.ten_dia_diem,
                  diem_khoi_hanh: false,
                  diem_den: false,
                  dac_san: dest.dac_san,
               }]
               : []
        } 
        />
      </div>
    </div>
  );
}
