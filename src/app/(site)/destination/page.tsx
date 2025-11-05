"use client";

import { QueryKeys } from "@/enums";
import { useQuery } from "@tanstack/react-query";
import { List } from "antd";
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
      console.log(res.data)
      return res.data;
    },
  });

  // const { data: specdes, isLoading: isSpecDes } = useQuery({
  //   queryKey: [QueryKeys.SPECIALTY],
  //   queryFn: async () => {
  //     const res = await axios.get(`/api/destination/${dest.id}/specialties`);
  //     console.log(res.data)
  //     return res.data;
  //   },
  //   enabled: !!dest,
  // });

  // const markers = (dest || []).concat(specdes || []);

  const DesMap = dynamic(() => import("@/components/des-map"), {
    ssr: false,
    loading: () => <p>Đang tải bản đồ...</p>,
  });


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
                    Thêm đặc sản
                  </Link>,
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
                }))
              : []
          }
          />
      </div>
    </div>
  );
}
