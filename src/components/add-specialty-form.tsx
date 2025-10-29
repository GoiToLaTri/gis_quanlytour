"use client";
import React, { useEffect, useState } from "react";
import type { FormProps } from "antd";
import { Button, Checkbox, Form, Input, InputNumber, message } from "antd";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { QueryKeys } from "@/enums";
import { useParams } from "next/navigation";

type FieldType = {
  ma_dia_diem?: string;
  ten?: string;

};

export default function AddSpecialtyForm({
  long,
  lat,
  dia_diem_id,
}: {
  long: number;
  lat: number;
  dia_diem_id?: string;
}) {
  // const router = useRouter();
  const params = useParams<{ id: string }>();
  const [messageApi, contextHolder] = message.useMessage();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isDisable, setIsDisable] = useState<boolean>(false);
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async (data: FieldType) => {
      setIsLoading(true);
      setIsDisable(true);
      const res = await axios.post(`/api/destination/${params.id}/specialties`, data);
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
        content: "Thêm đặc sản thành công",
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
    errorInfo,
  ) => {
    console.log("Failed:", errorInfo);
  };

  const [form] = Form.useForm();

  // Cập nhật giá trị khi long/lat thay đổi
  useEffect(() => {
    form.setFieldsValue({
      ma_dia_diem: dia_diem_id,
      kinh_do: long,
      vi_do: lat,
    });
  }, [long, lat, dia_diem_id, form]);

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
        label="Mã địa điểm"
        name="ma_dia_diem"
        rules={[{ required: true, message: "Vui lòng nhập mã địa điểm!" }]}
      >
        <Input disabled />
      </Form.Item>

      <Form.Item<FieldType>
        label="Tên"
        name="ten"
        rules={[{ required: true, message: "Vui lòng nhập tên đặc sản!" }]}
      >
        <Input disabled={isDisable} />
      </Form.Item>

      <Form.Item label={null}>
        <Button
          color="default"
          variant="solid"
          htmlType="submit"
          loading={isLoading}
        >
          Thêm đặc sản
        </Button>
      </Form.Item>
    </Form>
  );
}
