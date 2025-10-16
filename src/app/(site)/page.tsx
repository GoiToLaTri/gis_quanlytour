"use client";

import { QueryKeys } from "@/enums";
import { useQuery } from "@tanstack/react-query";
import { Button } from "antd";
import axios from "axios";
import Link from "next/link";

export default function TourManage() {
  const { data: tours } = useQuery({
    queryKey: [QueryKeys.TOUR],
    queryFn: async () => {
      const res = await axios.get("/api/tours");
      return res.data;
    },
  });
  return (
    <div>
      <div className="flex justify-between">
        <h2 className="text-3xl font-bold mb-4">Quản lý tour</h2>
        <Link href="/tour/add">
          <Button type="primary">Thêm tour</Button>
        </Link>
      </div>
      {tours && tours.length === 0 && <p>Chưa có tour nào</p>}
      <ul>
        {tours?.map((tour: { _id: string; ten: string }) => (
          <li key={tour._id}>{tour._id} - {tour.ten} - <Link href={`/destination/add/`}>Thêm điểm tham quan</Link></li>
        ))}
      </ul>
    </div>
  );
}
