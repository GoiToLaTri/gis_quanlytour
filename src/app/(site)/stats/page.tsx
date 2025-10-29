"use client";

import { QueryKeys } from "@/enums";
import { getCenterFromLocations } from "@/utils/center-from-loc";
import { useQuery } from "@tanstack/react-query";
import { Button, Descriptions, List } from "antd";
import axios from "axios";
import { LatLngExpression } from "leaflet";
import dynamic from "next/dynamic";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

export default function StatsPage() {
    const { data: data, isLoading: isLoading } = useQuery({
      queryKey: [QueryKeys.DESTINATION],
      queryFn: async () => {
        const res = await axios.get("/api/destination");
        return JSON.parse(res.data);
      },
    });

      const center =
    !data || data.length === 0
      ? [10.78, 106.7]
      : getCenterFromLocations(
          data.map(
            (des: { kinh_do: number; vi_do: number; ten: string }) => [
              des.vi_do,
              des.kinh_do,
            ],
          ),
        );

    const StatsMap = dynamic(() => import("@/components/stats-map"), {
        ssr: false, // Tắt server-side rendering
        loading: () => <p>Đang tải bản đồ...</p>,
      });

//   const DesMap = dynamic(() => import("@/components/des-map"), {
//     ssr: false, // Tắt server-side rendering
//     loading: () => <p>Đang tải bản đồ...</p>,
//   });
//   const [des, setDes] = useState<
//     Array<{
//       _id: string;
//       ten: string;
//       link_id: string;
//       dia_chi: string;
//       kinh_do: number;
//       vi_do: number;
//       diem_den: boolean;
//       diem_khoi_hanh: boolean;
//     }>
//   >([]);
//   const params = useParams<{ id: string }>();
//   const { data, isLoading } = useQuery({
//     queryKey: [QueryKeys.TOUR_DETAIL],
//     queryFn: async () => {
//       const res = await axios.get(`/api/tours/${params.id}`);
//       return res.data;
//     },
//   });

//   useEffect(() => {
//     if (!data) return;
//     const des_data = data.destinations.map((dest: { _id: string }) => {
//       const link = data.tour_dest_links.find(
//         (t: { ma_dia_diem: string }) => t.ma_dia_diem === dest._id,
//       );
//       return {
//         ...dest,
//         link_id: link._id,
//         diem_den: link?.diem_den ?? false,
//         diem_khoi_hanh: link?.diem_khoi_hanh ?? false,
//       };
//     });

//     setDes(des_data);
//   }, [data]);

//   const center =
//     !data || data.destinations.length === 0
//       ? [10.78, 106.7]
//       : getCenterFromLocations(
//           data.destinations.map(
//             (des: { kinh_do: number; vi_do: number; ten: string }) => [
//               des.vi_do,
//               des.kinh_do,
//             ],
//           ),
//         );
//   console.log(data);



    
  return (
    <div className="flex gap-4 h-full">

        <div className="w-[600px] h-full overflow-y-auto">

<h2 className="text-3xl font-bold mb-4">Danh sách địa điểm</h2>

      {isLoading && <p>Đang lấy danh sách điểm đến...</p>}
      {!isLoading && data && data.length === 0 && <p>Chưa có điểm đến nào</p>}
      {data && data.length > 0 && (
        <List
          className="!w-[600px]"
          itemLayout="horizontal"
          dataSource={data}
          renderItem={(dest: { _id: string; ten: string; dia_chi: string; }) => (
            <List.Item
              actions={[
                <Link key={dest._id} href={`/destination/${dest._id}`}>
                  Chi tiết
                </Link>,
                <Link key={dest._id} href={`/destination/add/${dest._id}`}>
                  Thêm đặc sản
                </Link>,
              ]}
            >
              <List.Item.Meta
                title={<strong>{dest.ten}</strong>}
                description={
                  <>
                    <div>Mã: {dest._id}</div>
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
          {/* <DesMap /> */}
          <StatsMap
            polyline
            position={center as LatLngExpression}
            location={null}
            // setLocation={() => {}}
            locations={
              data &&
              data.map(
                (des: { kinh_do: number; vi_do: number; ten: string }) => ({
                  position: [des.vi_do, des.kinh_do],
                  name: des.ten,
                }),
              )
            }
          />
        </div>
      )}
    </div>
  );
}
