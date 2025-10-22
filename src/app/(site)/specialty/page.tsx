"use client";
import axios from "axios";
import { useState, useCallback } from "react";
import dynamic from 'next/dynamic';
import { LatLngExpression } from "leaflet";
import type { AutoCompleteProps } from "antd";
import { AutoComplete, Input, Spin } from "antd";

const searchSpecialties = async (query: string) => {
  try {
    const response = await axios.post(
      "http://localhost:3000/api/search-specialty",
      { query },
    );
    if (response.status === 200) {
      return response.data;
    }
  } catch (error: any) {
    console.log("Lỗi:", error.message);
  }
};

const searchSpecialtyInDestination = async (query: string) => {
  console.log(query);
  try {
    const response = await axios.post(
      "http://localhost:3000/api/search-specialty-in-destination",
      { specialtyId: query },
    );
    if (response.status === 200) {
      return response.data;
    }
  } catch (error: any) {
    console.log("Lỗi:", error.message);
  }
};

const DesMap = dynamic(
  () => import('@/components/des-map'),
  {
    ssr: false,
    loading: () => <p>Đang tải bản đồ...</p>
  }
);

export default function Specialty() {
  const [location, setLocation] = useState<LatLngExpression | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [specialties, setSpecialties] = useState<Array<object>>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [destinations, setDestinations] = useState<Array<object>>([]);
  const [options, setOptions] = useState<AutoCompleteProps["options"]>([]);
  const [selectedDestination, setSelectedDestination] = useState<any>(null);
  const [selectedSpecialty, setSelectedSpecialty] = useState<any>(null);
  const handleSetLocation = useCallback((loc: LatLngExpression | null) => {
    setLocation(loc);
  }, []);

  const handleSearch = async (value: string) => {
    const specialties = await searchSpecialties(value);
    setSpecialties(specialties);
    const options = specialties.map((specialty: any) => ({
      label: specialty.ten,
      value: specialty.ten,
    }));
    setOptions(options);
  };

  const onSelect = async (value: string) => {
    setLoading(true);
    const selectedSpecialty: any = specialties.find(
      (specialty: any) => specialty.ten === value,
    );
    setSelectedSpecialty(selectedSpecialty);
    setSelectedId(selectedSpecialty._id);
    const destinations = await searchSpecialtyInDestination(
      selectedSpecialty._id,
    );
    setDestinations(destinations);
    setLoading(false);
  };

  return (
    <div className="flex gap-2">
      <div className="w-3/10 flex flex-col">
        <AutoComplete
          options={options}
          onSelect={onSelect}
          className="w-full"
          onSearch={handleSearch}
        >
          <Input.Search
            allowClear
            enterButton
            size="large"
            onClear={() => {
              setSelectedId(null);
              setDestinations([]);
              setSelectedDestination(null);
            }}
            placeholder="Nhập tên đặc sản"
          />
        </AutoComplete>
        <div
          className={`border grow-1 border-gray-300 rounded-lg p-4 ${(!selectedId || loading) && "flex items-center justify-center"} mt-4`}
        >
          {loading && <Spin size="default" />}
          {destinations.length > 0 && (
            <span className="text-sm">
              {selectedSpecialty?.ten} được tìm thấy ở {destinations.length} địa
              điểm
            </span>
          )}
          {destinations.length > 0 &&
            destinations.map((destination: any, index) => {
              return (
                <div
                  key={index}
                  onClick={(e) => {
                    setSelectedDestination(destination);
                    handleSetLocation({
                      lat: destination?.kinh_do,
                      lng: destination?.vi_do,
                    });
                  }}
                  className={`cursor-pointer ${selectedDestination?._id === destination?._id && "bg-gray-200"} hover:bg-gray-200 p-2 rounded-md`}
                >
                  <div className="flex items-center justify-between">
                    <span>
                      {destination.ten}, {destination.dia_chi}
                    </span>
                    <span className="text-xs">
                      ({destination.kinh_do}, {destination.vi_do})
                    </span>
                  </div>
                </div>
              );
            })}
          {!selectedId && "Kết quả sẽ được hiển thị ở đây"}
        </div>
      </div>
      <div className="grow-1 min-h-150 rounded-lg">
        <DesMap location={location} setLocation={handleSetLocation} />
      </div>
    </div>
  );
}
