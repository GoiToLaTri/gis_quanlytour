"use client";
import axios from "axios";
import dynamic from "next/dynamic";
import { Input, Spin } from "antd";
import { LatLngExpression } from "leaflet";
import { useState, useCallback, useEffect } from "react";

// Hàm lấy tất cả địa điểm
const getAllDestination = async () => {
  try {
    const response = await axios.get("http://localhost:3000/api/destination");
    if (response.status === 200) {
      return JSON.parse(response.data);
    }
  } catch (error: any) {
    console.log("Lỗi:", error.message);
  }
};

// Hàm tìm địa điểm có đặc sản
const searchSpecialtyInDestination = async (query: string) => {
  try {
    const response = await axios.post(
      "http://localhost:3000/api/specialty/search-destination",
      { specialtyId: query },
    );
    if (response.status === 200) {
      return response.data;
    }
  } catch (error: any) {
    console.log("Lỗi:", error.message);
  }
};

// Hàm tìm đặc sản theo tên
const findSpecialty = async (query: string) => {
  try {
    const response = await axios.post(
      "http://localhost:3000/api/specialty/search",
      { query },
    );
    if (response.status === 200 && response.data) {
      return response.data;
    }
  } catch (error: any) {
    console.log("Lỗi:", error.message);
  }
};

const DesMap = dynamic(() => import("@/components/des-map"), {
  ssr: false,
  loading: () => <p>Đang tải bản đồ...</p>,
});

export default function Specialty() {
  const [location, setLocation] = useState<LatLngExpression | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // Chứa thông tin đặc sản được tìm thấy
  const [specialty, setSpecialty] = useState<object | null>(null);

  // Giá trị tìm kiếm người dùng nhập vào
  const [query, setQuery] = useState<string>("");

  // Lưu danh sách địa điểm tìm thấy đặc sản
  const [destinations, setDestinations] = useState<Array<object>>([]);

  // Lưu thông tin địa điểm được chọn khi người dùng click vào địa điểm
  const [selectedDestination, setSelectedDestination] = useState<any>(null);

  const handleSetLocation = useCallback((loc: LatLngExpression | null) => {
    setLocation(loc);
  }, []);

  // Hàm tìm tất cả địa điểm
  const fetchDestinations = async () => {
    const destinations = await getAllDestination();
    setDestinations(destinations);
  };

  // Tải tất cả địa điểm khi component được mount
  useEffect(() => {
    if (query === "") {
      fetchDestinations();
      setLoading(false);
    }
  }, [query]);

  // Nhận vào id đặc sản và trả ra danh sách địa điểm có đặc sản đó
  async function fetchDestinationBySpecialty(query: string) {
    try {
      setLoading(true);
      const destinations = await searchSpecialtyInDestination(query);
      if (destinations.length > 0) {
        setDestinations(destinations);
      } else {
        setDestinations([]);
      }
    } catch (error) {
      console.error("Lỗi khi tìm kiếm đặc sản trong địa điểm:", error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex gap-2">
      <div className="w-3/10 flex mr-5 flex-col">
        <Input.Search
          allowClear
          value={query}
          variant="filled"
          onChange={async (event) => {
            // Two way binding
            const value = event.target.value;
            setQuery(value);

            // Lưu thông tin đặc sản được tìm thấy
            const specialty = await findSpecialty(value);
            setSpecialty(specialty);

            // Tìm kiếm địa điểm theo id đặc sản
            await fetchDestinationBySpecialty(specialty?._id);
          }}
          onSearch={async () => {
            // Lưu thông tin đặc sản được tìm thấy
            const specialty = await findSpecialty(query);
            setSpecialty(specialty);

            // Tìm kiếm địa điểm theo id đặc sản
            await fetchDestinationBySpecialty(specialty?._id);
          }}
          enterButton
          size="large"
          onClear={async () => {
            setQuery("");

            // Tải lại tất cả địa điểm
            await fetchDestinations();
          }}
          placeholder="Nhập tên đặc sản"
        />
        <div
          className={`border grow-1 border-gray-300 ${loading || destinations.length === 0 ? "flex flex-col items-center justify-center" : ""} rounded-lg p-4 mt-4 overflow-y-auto h-100`}
        >
          {loading && <Spin size="default" />}
          {destinations.length > 0 && !loading && (
            <span className="text-sm">
              Xuất hiện {destinations.length} kết quả
            </span>
          )}
          {destinations.length > 0 &&
            !loading &&
            destinations.map((destination: any, index) => {
              return (
                <div
                  key={index}
                  onClick={(e) => {
                    setSelectedDestination(destination);
                    handleSetLocation({
                      lat: destination?.vi_do,
                      lng: destination?.kinh_do,
                    });
                  }}
                  className={`cursor-pointer ${selectedDestination?._id === destination?._id && "bg-gray-200"} hover:bg-gray-200 p-2 rounded-md`}
                >
                  <div className="flex items-center justify-between">
                    <div className="w-2/3 mr-5 text-sm">
                      <span className="line-clamp-1">
                        {destination.ten}, {destination.dia_chi}
                      </span>
                    </div>
                    <div className="flex-1">
                      <span className="text-xs">
                        ({destination.kinh_do}, {destination.vi_do})
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          {destinations.length === 0 && !loading && (
            <span className="text-sm">Không tìm thấy kết quả</span>
          )}
        </div>
      </div>
      <div className="grow-1 min-h-150 rounded-lg">
        <DesMap location={location} setLocation={handleSetLocation} locations={location !== null ? [{ position: location, name: selectedDestination.ten, diem_khoi_hanh: false, diem_den: false, dac_san: specialty }] : undefined} />
      </div>
    </div>
  );
}
