"use client";

import { QueryKeys } from "@/enums";
import { useQuery } from "@tanstack/react-query";
import { Button, List } from "antd";
import axios from "axios";
import { LatLngExpression } from "leaflet";
import dynamic from "next/dynamic";
import Link from "next/link";
import { useCallback, useState } from "react";

export default function Destination() {
  const [location, setLocation] = useState<LatLngExpression | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const handleSetLocation = useCallback((loc: LatLngExpression | null) => {
    setLocation(loc);
  }, []);
  const { data: dest, isLoading } = useQuery({
    queryKey: [QueryKeys.DESTINATION],
    queryFn: async () => {
      const res = await axios.get("/api/destination");
      return res.data;
    },
  });

  const { data: desSpec, isLoading: isDesSpec } = useQuery({
    queryKey: [QueryKeys.DESTINATION_SPECIALTY],
    queryFn: async () => {
      const res = await axios.get(`/api/des-spec`);
      return res.data;
    },
  });

  const DesMap = dynamic(() => import("@/components/des-map-spec"), {
    ssr: false,
    loading: () => <p>Đang tải bản đồ...</p>,
  });
 // chuyển đặc sản trong object thành array để hiển thị
  const specialtiesMap = desSpec?.reduce((acc: any, item: any) => {
    // Key là tên địa điểm (dia_diem)
    const key = item.dia_diem; 
    
    if (key) {
        // Value là mảng dac_san
        acc[key] = item.dac_san;
    }
    return acc;
    }, {}) || {};


  return (
    <div className="flex h-full gap-6">
      <div className="flex flex-col overflow-y-auto w-3/10 ">
        <h2 className="text-3xl font-bold mb-4">Danh sách địa điểm</h2>
        {isLoading && <p>Đang lấy danh sách điểm đến...</p>}
        {!isLoading && dest && dest.length === 0 && <p>Chưa có điểm đến nào</p>}
        {dest && dest.length > 0 && (
          <List
            itemLayout="horizontal"
            dataSource={dest}
            renderItem={(dest: {
              _id: string;
              ten_dia_diem: string;
              ten_tour: string;
              dia_chi: string;
            }) => (
              <List.Item
                actions={[
                  <Link key={dest._id} href={`/specialty/add/${dest._id}`}>
                   <Button color="default" variant="solid">Thêm đặc sản</Button>
                  </Link>
                ]}
              >
                <List.Item.Meta
                  title={<strong>{dest.ten_dia_diem}</strong>}
                  description={
                    <>
                      <div>Thuộc: {dest.ten_tour}</div>
                      <div>Địa chỉ: {dest.dia_chi}</div>
                    </>
                  }
                />
              </List.Item>
            )}
          />
        )}
      </div>
      <div className="grow-1 rounded-lg">
        <DesMap 
        location={location} 
        setLocation={handleSetLocation}
        locations={
          dest
              ? dest.map((d: any) => ({
                  position: [d.vi_do, d.kinh_do],
                  name: d.ten_dia_diem,
                  diem_khoi_hanh: false,
                  diem_den: false,
                  dac_san: specialtiesMap[d.ten_dia_diem],
                }))
              : []
          }
          />
      </div>
    </div>
  );
}
