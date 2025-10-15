"use client";
import React from "react";
import type { FormProps } from "antd";
import { Button, Form, Input, InputNumber } from "antd";

type FieldType = {
  ten?: string;
  gia_nguoi_lon?: string;
  gia_tre_em?: string;
  so_ngay?: number;
};

const onFinish: FormProps<FieldType>["onFinish"] = (values) => {
  console.log("Success:", values);
};

const onFinishFailed: FormProps<FieldType>["onFinishFailed"] = (errorInfo) => {
  console.log("Failed:", errorInfo);
};

export default function AddTourForm() {
  return (
    <Form
      name="basic"
      style={{ maxWidth: 400 }}
      initialValues={{}}
      onFinish={onFinish}
      onFinishFailed={onFinishFailed}
      autoComplete="off"
      layout="vertical"
    >
      <Form.Item<FieldType>
        label="Tên tour"
        name="ten"
        rules={[{ required: true, message: "Vui lòng nhập tên tour!" }]}
      >
        <Input />
      </Form.Item>

      <Form.Item<FieldType>
        label="Giá người lớn"
        name="gia_nguoi_lon"
        rules={[{ required: true, message: "Vui lòng nhập giá người lớn!" }]}
      >
        <InputNumber className="!w-full" min={0} />
      </Form.Item>

      <Form.Item<FieldType>
        label="Giá trẻ em"
        name="gia_tre_em"
        rules={[{ required: true, message: "Vui lòng nhập giá trẻ em!" }]}
      >
        <InputNumber className="!w-full" min={0} />
      </Form.Item>

      <Form.Item<FieldType>
        label="Số ngày"
        name="so_ngay"
        rules={[{ required: true, message: "Vui lòng nhập số ngày!" }]}
      >
        <InputNumber className="!w-full" min={0} />
      </Form.Item>

      <Form.Item label={null}>
        <Button type="primary" htmlType="submit">
          Tạo tour
        </Button>
      </Form.Item>
    </Form>
  );
}
