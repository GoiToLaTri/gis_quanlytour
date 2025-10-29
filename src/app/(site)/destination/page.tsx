"use client";

import { QueryKeys } from "@/enums";
import { useQuery } from "@tanstack/react-query";
import { List } from "antd";
import axios from "axios";
import { LatLngExpression } from "leaflet";
import dynamic from "next/dynamic";
import Link from "next/link";
<<<<<<< HEAD
import { useCallback, useState } from "react";

export default function Destination() {

  const [location, setLocation] = useState<LatLngExpression | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const handleSetLocation = useCallback((loc: LatLngExpression | null) => {setLocation(loc);}, []);
=======

export default function Destination() {
>>>>>>> e6a744464751e800b49acd5a81f8f5e04fc5ee0e
  const { data: dest, isLoading } = useQuery({
    queryKey: [QueryKeys.DESTINATION],
    queryFn: async () => {
      const res = await axios.get("/api/destination");
      return JSON.parse(res.data);
    },
  });
  const DesMap = dynamic(
    () => import('@/components/des-map'),
    {
      ssr: false,
      loading: () => <p>Đang tải bản đồ...</p>
    }
  );
  if (dest) {
    console.log(dest[0]);
  }
  return (
<<<<<<< HEAD
    <div className="flex gap-6">
      <div className="flex flex-col w-3/10">
        <h2 className="text-3xl font-bold mb-4">Quản lý điểm đến</h2>
        {isLoading && <p>Đang lấy danh sách điểm đến...</p>}
        {!isLoading && dest && dest.length === 0 && <p>Chưa có điểm đến nào</p>}
        {dest && dest.length > 0 && (
          <List
            className=""
            itemLayout="horizontal"
            dataSource={dest}
            renderItem={(dest: { _id: string; ten: string; dia_chi: string; }) => (
              <List.Item
                actions={[
                  <Link key={dest._id} href={`/specialty/add/${dest._id}`}>
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
      <div className="grow-1 min-h-150 rounded-lg">
        <DesMap location={location} setLocation={handleSetLocation} />
      </div>
=======
    <div>
      <h2 className="text-3xl font-bold mb-4">Quản lý điểm đến</h2>

      {isLoading && <p>Đang lấy danh sách điểm đến...</p>}
      {!isLoading && dest && dest.length === 0 && <p>Chưa có điểm đến nào</p>}
      {dest && dest.length > 0 && (
        <List
          className="!w-[600px]"
          itemLayout="horizontal"
          dataSource={dest}
          renderItem={(dest: { _id: string; ten: string; dia_chi: string }) => (
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
      {/* <div>{dest && dest.map((dest: any) => (
        <div key={dest._id}>
          <h3>{dest.ten}</h3>
          <p>{dest.dia_chi}</p>
        </div>
      ))}</div> */}
>>>>>>> e6a744464751e800b49acd5a81f8f5e04fc5ee0e
    </div>

  );
}
