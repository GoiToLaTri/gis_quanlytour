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
  const [spct, setspct] = useState([]);

  const {data , isLoading } = useQuery({
    queryKey: [QueryKeys.SPECIALTY  ],
    queryFn: async () => {
      const res = await axios.get(`/api/destination/${params.id}/specialties`);
      // console.log(data)
      return res.data;
    },
    
  });
  const { data: dest, isLoading: isLoadingDest } = useQuery({
    queryKey: [QueryKeys.DESTINATION_SPECIALTY_SPECIFIC],
    queryFn: async () => {
      const res = await axios.get(`/api/des-spec/${params.id}/specific`);
      console.log(res.data)
      return res.data;
    },
    enabled: !!data,
  });

  // useEffect(() => {
  //   if (!isLoadingDest && dest && params.id) {
  //     refetchSpec();
  //   }
  // }, [dest, isLoadingDest, params.id, refetchSpec]);

  // const markers = (dest || []).concat(data || []).map((item: any) => ({
  //   position: [item.vi_do, item.kinh_do],
  //   name: item?.ten_dia_diem || item?.ten, // ưu tiên cái nào có
  //   diem_khoi_hanh: false,
  //   diem_den: false,
  //   dac_san: item.length > 0 ? item.ten : null,
    
  // }));
  // console.log(markers)
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
        queryKey: [QueryKeys.SPECIALTY],
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
  // const currentSpecialties = dest && dest.length > 0 ? dest : null;

  const { lat, long } = getCoords(location);

  return (
    <div className="flex h-full gap-6">
      {contextHolder}
      <div className="flex flex-col overflow-y-auto w-3/10">
        <h2 className="text-2xl font-bold mb-4">Thêm đặc sản mới</h2>
        <AddSpecialtyForm long={long} lat={lat} dia_diem_id={params.id} ten_dia_diem={data?.[0]?.ten_dia_diem} />
        <h4 className="text-2xl font-bold mb-4">Danh sách đặc sản đã thêm</h4>

        {isLoading && <div>Đang lấy danh sách đặc sản...</div>}

        {!isLoading && data && data.length > 0 && (
          <List
            className="!w-[400px]"
            itemLayout="horizontal"
            locale={{ emptyText: "Không có đặc sản nào được thêm" }}
            dataSource={data.filter(
      (item: any) => item.ten && item.link_id // chỉ render khi có cả 2
    )}
            renderItem={(des: { ten: string; link_id: string }) => (
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
                <List.Item.Meta title={des.ten} />
              </List.Item>
            )}
          />
        )}
      </div>
      <div className="grow-1 rounded-lg">
        <DesMap location={location} setLocation={handleSetLocation} 
        locations={
          dest // Nếu dest là một đối tượng (có dữ liệu)
              ? [{ // BỌC dest vào một mảng [] và truy cập thuộc tính trực tiếp
                  position: [dest.vi_do, dest.kinh_do],
                  name: dest.ten_dia_diem,
                  diem_khoi_hanh: false,
                  diem_den: false,
                  dac_san: dest.dac_san,
              }]
              : [] // Ngược lại, trả về mảng rỗng
        } 
        />
      </div>
    </div>
  );
}
