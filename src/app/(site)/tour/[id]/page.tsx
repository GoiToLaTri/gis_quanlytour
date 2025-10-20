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

export default function TourDetail() {
  const DesMap = dynamic(() => import("@/components/des-map"), {
    ssr: false, // Tắt server-side rendering
    loading: () => <p>Đang tải bản đồ...</p>,
  });
  const [des, setDes] = useState<
    Array<{
      _id: string;
      ten: string;
      link_id: string;
      dia_chi: string;
      kinh_do: number;
      vi_do: number;
      diem_den: boolean;
      diem_khoi_hanh: boolean;
    }>
  >([]);
  const params = useParams<{ id: string }>();
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
        (t: { ma_dia_diem: string }) => t.ma_dia_diem === dest._id
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

  const center =
    !data || data.destinations.length === 0
      ? [10.78, 106.7]
      : getCenterFromLocations(
          data.destinations.map(
            (des: { kinh_do: number; vi_do: number; ten: string }) => [
              des.vi_do,
              des.kinh_do,
            ]
          )
        );
  console.log(data);
  return (
    <div className="flex gap-4 h-full">
      {isLoading && <div className="w-[600px]">Đang lấy thông tin tour...</div>}
      {!isLoading && data && (
        <div className="w-[600px] h-full overflow-y-auto">
          <h2 className="text-2xl font-bold mb-4">Chi tiết tour</h2>
          <Descriptions
            title={null}
            column={1}
            size="default"
            className="!mb-[2rem]"
          >
            <Descriptions.Item label="Mã tour">{data._id}</Descriptions.Item>
            <Descriptions.Item label="Tên">{data.ten}</Descriptions.Item>
            <Descriptions.Item label="Giá vé (người lớn)">
              {new Intl.NumberFormat("vi-VN", {
                style: "currency",
                currency: "VND",
              }).format(Number(data.gia_nguoi_lon))}
            </Descriptions.Item>
            <Descriptions.Item label="Giá vé (trẻ em)">
              {new Intl.NumberFormat("vi-VN", {
                style: "currency",
                currency: "VND",
              }).format(Number(data.gia_tre_em))}
            </Descriptions.Item>
          </Descriptions>
          <h4 className="text-2xl font-bold mb-4">
            Danh sách địa điểm tham quan
          </h4>
          {!isLoading && des && des.length === 0 && (
            <p className="mb-[2rem]">Không có điểm tham quan được hiển thị</p>
          )}
          {!isLoading && des && des.length > 0 && (
            <List
              className="!w-[400px] !mb-[2rem]"
              itemLayout="horizontal"
              dataSource={des}
              renderItem={(des) => (
                <List.Item
                  actions={
                    [
                      // <Button
                      //   type="link"
                      //   key={des.link_id}
                      //   onClick={() => mutation.mutate(des.link_id)}
                      // >
                      //   Xóa
                      // </Button>,
                    ]
                  }
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
          <Link href={`/destination/add/${params.id}`}>
            <Button color="default" variant="solid">
              Thêm địa điểm
            </Button>
          </Link>
        </div>
      )}
      {!isLoading && (
        <div className="w-full">
          {/* <DesMap /> */}
          <DesMap
            polyline
            position={center as LatLngExpression}
            location={null}
            // setLocation={() => {}}
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
      )}
    </div>
  );
}
