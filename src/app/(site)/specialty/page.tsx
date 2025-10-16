"use client";
import { useState } from "react";
import axios from "axios";
import { AutoComplete, Input } from "antd";
import type { AutoCompleteProps } from "antd";

const getRandomInt = (max: number, min = 0) =>
  Math.floor(Math.random() * (max - min + 1)) + min;

const searchResult = (query: string) =>
  Array.from({ length: getRandomInt(5) })
    .join(".")
    .split(".")
    .map((_, idx) => {
      const category = `${query}${idx}`;
      return {
        value: category,
        label: (
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
            }}
          >
            <span>
              Found {query} on{" "}
              <a
                href={`https://s.taobao.com/search?q=${query}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                {category}
              </a>
            </span>
            <span>{getRandomInt(200, 100)} results</span>
          </div>
        ),
      };
    });

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

export default function Specialty() {
  const [options, setOptions] = useState<AutoCompleteProps["options"]>([]);
  const [specialties, setSpecialties] = useState<object>([]);

  const handleSearch = async (value: string) => {
    const specialties = await searchSpecialties(value);
    
    setOptions(value ? options : []);
  };

  const onSelect = (value: string) => {
    
  };

  return (
    <div>
      <AutoComplete
        options={options}
        onSelect={onSelect}
        style={{ width: 300 }}
        onSearch={handleSearch}
        popupMatchSelectWidth={252}
      >
        <Input.Search
          allowClear
          enterButton
          size="large"
          placeholder="input here"
        />
      </AutoComplete>
    </div>
  );
}
