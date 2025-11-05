"use client";

import { QueryKeys } from "@/enums";
import { MenuOutlined } from "@ant-design/icons";
import { useQuery } from "@tanstack/react-query";
import { Button, GetProps, Input, List } from "antd";
import axios from "axios";
import Link from "next/link";
import { useState } from "react";

export default function TourManage() {
  const [query, setQuery] = useState<string>("");

  type SearchProps = GetProps<typeof Input.Search>;

  const { Search } = Input;
  const { data: tours, isLoading } = useQuery({
    queryKey: [QueryKeys.TOUR, query],
    queryFn: async () => {
      const res = await axios.get("/api/tours", { params: { q: query } });
      return res.data;
    },
  });

  const onSearch: SearchProps["onSearch"] = (value) => setQuery(value);

  return (
    <div>
      <div className="mb-4 w-[400px] py-4">
        <Search
          prefix={<MenuOutlined style={{ color: "rgba(0, 0, 0, 0.45)" }} />}
          placeholder="Tìm kiếm tour"
          onSearch={onSearch}
          allowClear
          size="large"
          variant="filled"
        />
      </div>
      <div className="flex justify-between">
        <h2 className="text-3xl font-bold mb-4">Quản lý tour</h2>
        <Link href="/tour/add">
          <Button color="default" variant="solid" size="large">
            Thêm tour
          </Button>
        </Link>
      </div>
      {isLoading && <p>Đang lấy danh sách tour...</p>}
      {!isLoading && tours && tours.length === 0 && <p>Chưa có tour nào</p>}

      {tours && tours.length > 0 && (
        <List
          className="!w-full"
          itemLayout="horizontal"
          dataSource={tours}
          renderItem={(tour: { _id: string; ten: string }) => (
            <List.Item
              actions={[
                <Link key={tour._id} href={`/tour/${tour._id}`}>
                  Chi tiết
                </Link>,
                <Link key={tour._id} href={`/destination/add/${tour._id}`}>
                  Thêm điểm tham quan
                </Link>,
              ]}
            >
              <List.Item.Meta title={tour._id} />
              <div>{tour.ten}</div>
            </List.Item>
          )}
        />
      )}
      {/* <ul>
        {tours?.map((tour: { _id: string; ten: string }) => (
          <li key={tour._id}>
            {tour._id} - {tour.ten} -{" "}
            <Link href={`/destination/add/${tour._id}`}>
              Thêm điểm tham quan
            </Link>
            - <Link href={`/tour/${tour._id}`}>Chi tiết</Link>
          </li>
        ))}
      </ul> */}
    </div>
  );
}
