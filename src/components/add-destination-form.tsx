"use client";
import React, { useEffect, useState } from "react";
import type { FormProps } from "antd";
import { Button, Checkbox, Form, Input, InputNumber, message } from "antd";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { QueryKeys } from "@/enums";

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
  tour_id,
  locationDetails,
}: {
  long: number;
  lat: number;
  tour_id?: string;
  locationDetails: { name: string; address: string } | null;
}) {
  // const router = useRouter();
  const [messageApi, contextHolder] = message.useMessage();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isDisable, setIsDisable] = useState<boolean>(false);
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async (data: FieldType) => {
      setIsLoading(true);
      setIsDisable(true);
      const res = await axios.post("/api/destination", data);
      return res.data;
    },
    onSuccess: () => {
      // router.replace("/destination");
      setIsLoading(false);
      setIsDisable(false);
      queryClient.prefetchQuery({
        queryKey: [QueryKeys.TOUR_DETAIL],
      });
      messageApi.open({
        type: "success",
        content: "Thêm địa điểm thành công",
      });
    },
    onError: (error) => {
      setIsLoading(false);
      setIsDisable(false);
      messageApi.open({
        type: "error",
        content: (error as unknown as { response: { data: string } }).response
          .data,
      });
      // console.error("Error creating tour:", error);
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
      ma_tour: tour_id,
      kinh_do: long,
      vi_do: lat,
      ten: locationDetails?.name || "",
      dia_chi: locationDetails?.address || "",
    });
  }, [long, lat, tour_id, form, locationDetails]);

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
      {contextHolder}
      <Form.Item<FieldType>
        label="Mã tour"
        name="ma_tour"
        rules={[{ required: true, message: "Vui lòng nhập mã tour!" }]}
      >
        <Input disabled />
      </Form.Item>

      <Form.Item<FieldType>
        label="Tên địa điểm"
        name="ten"
        rules={[{ required: true, message: "Vui lòng nhập tên địa điểm!" }]}
      >
        <Input disabled={isDisable} />
      </Form.Item>

      <Form.Item<FieldType>
        label="Địa chỉ"
        name="dia_chi"
        rules={[{ required: true, message: "Vui lòng nhập địa chỉ!" }]}
      >
        <Input disabled={isDisable} />
      </Form.Item>

      <Form.Item<FieldType>
        label="Kinh độ"
        name="kinh_do"
        rules={[{ required: true, message: "Vui lòng nhập kinh độ!" }]}
      >
        <InputNumber className="!w-full" min={0} disabled={isDisable} />
      </Form.Item>

      <Form.Item<FieldType>
        label="Vi độ"
        name="vi_do"
        rules={[{ required: true, message: "Vui lòng nhập vi độ!" }]}
      >
        <InputNumber className="!w-full" min={0} disabled={isDisable} />
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
        <Button
          color="default"
          variant="solid"
          htmlType="submit"
          loading={isLoading}
        >
          Thêm địa điểm
        </Button>
      </Form.Item>
    </Form>
  );
}
