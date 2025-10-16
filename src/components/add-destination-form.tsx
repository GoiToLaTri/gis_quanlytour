"use client";
import React, { useEffect } from "react";
import type { FormProps } from "antd";
import { Button, Checkbox, Form, Input, InputNumber } from "antd";
import { useMutation } from "@tanstack/react-query";
import axios from "axios";
import { useRouter } from "next/navigation";

type FieldType = {
  ma_tour?: string;
  ten?: string;
  dia_chi?: string;
  kinh_do?: number;
  vi_do?: number;
  diem_den?: boolean;
  diem_khoi_hanh?: boolean;
};

export default function AddDestinationForm({
  long,
  lat,
}: {
  long: number;
  lat: number;
}) {
  const router = useRouter();

  const mutation = useMutation({
    mutationFn: async (data: FieldType) => {
      const res = await axios.post("/api/destination", data);
      return res.data;
    },
    onSuccess: () => {
      router.replace("/destinations");
    },
    onError: (error) => {
      console.error("Error creating tour:", error);
    },
  });

  const onFinish: FormProps<FieldType>["onFinish"] = (values) => {
    console.log("Success:", values);
    mutation.mutate(values);
  };

  const onFinishFailed: FormProps<FieldType>["onFinishFailed"] = (
    errorInfo
  ) => {
    console.log("Failed:", errorInfo);
  };

  const [form] = Form.useForm();

  // Cập nhật giá trị khi long/lat thay đổi
  useEffect(() => {
    form.setFieldsValue({
      kinh_do: long,
      vi_do: lat,
    });
  }, [long, lat, form]);

  return (
    <Form
      name="basic"
      style={{ maxWidth: 400 }}
      form={form}
      onFinish={onFinish}
      onFinishFailed={onFinishFailed}
      autoComplete="off"
      layout="vertical"
    >
      <Form.Item<FieldType>
        label="Mã tour"
        name="ma_tour"
        rules={[{ required: true, message: "Vui lòng nhập mã tour!" }]}
      >
        <Input />
      </Form.Item>

      <Form.Item<FieldType>
        label="Tên địa điểm"
        name="ten"
        rules={[{ required: true, message: "Vui lòng nhập tên địa điểm!" }]}
      >
        <Input />
      </Form.Item>

      <Form.Item<FieldType>
        label="Địa chỉ"
        name="dia_chi"
        rules={[{ required: true, message: "Vui lòng nhập địa chỉ!" }]}
      >
        <Input />
      </Form.Item>

      <Form.Item<FieldType>
        label="Kinh độ"
        name="kinh_do"
        rules={[{ required: true, message: "Vui lòng nhập kinh độ!" }]}
      >
        <InputNumber className="!w-full" min={0} />
      </Form.Item>

      <Form.Item<FieldType>
        label="Vi độ"
        name="vi_do"
        rules={[{ required: true, message: "Vui lòng nhập vi độ!" }]}
      >
        <InputNumber className="!w-full" min={0} />
      </Form.Item>

      <Form.Item label={null}>
        <div style={{ display: "flex", gap: 8 }}>
          <Form.Item<FieldType>
            name="diem_khoi_hanh"
            valuePropName="checked"
            noStyle
          >
            <Checkbox>Điểm khởi hành</Checkbox>
          </Form.Item>
          <Form.Item<FieldType> name="diem_den" valuePropName="checked" noStyle>
            <Checkbox>Điểm đến</Checkbox>
          </Form.Item>
        </div>
      </Form.Item>

      <Form.Item label={null}>
        <Button type="primary" htmlType="submit">
          Thêm địa điểm
        </Button>
      </Form.Item>
    </Form>
  );
}
