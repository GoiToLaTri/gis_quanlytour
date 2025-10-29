"use client";
import AddSpecialtyForm from "@/components/add-specialty-form";
import { QueryKeys } from "@/enums";
import { getCenterFromLocations } from "@/utils/center-from-loc";
import { getCoords } from "@/utils/get-coord";
import { QueryClient, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { List, Button, message } from "antd";
import axios from "axios";
import { LatLngExpression } from "leaflet";
import dynamic from "next/dynamic";
import { useParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";


export default function AddSpecialty() {
    const DesMap = dynamic(() => import("@/components/des-map"), {
        ssr: false, // Tắt server-side rendering
        loading: () => <p>Đang tải bản đồ...</p>,
    });
    const params = useParams<{ id: string }>();
    const [location, setLocation] = useState<LatLngExpression | null>(null);
    const queryClient = useQueryClient();

    const [loading, setLoading] = useState<boolean>(false);
    const [messageApi, contextHolder] = message.useMessage();
    const handleSetLocation = useCallback((loc: LatLngExpression | null) => { setLocation(loc); }, []);
    const [spct, setspct] = useState([]);

    const { data, isLoading } = useQuery({
        queryKey: [QueryKeys.SPECIALTY],
        queryFn: async () => {
            const res = await axios.get(`/api/destination/${params.id}/specialties`);
            return JSON.parse(res.data);

        },

    });
    const mutation = useMutation({
        mutationFn: async (id: string) => {
        // setIsLoading(true);
        // setIsDisable(true);
        const res = await axios.delete(`/api/destination/${id}/specialties`);
        return res.data;
        },
        onSuccess: () => {
        // router.replace("/destination");
        // setIsLoading(false);
        // setIsDisable(false);
        queryClient.refetchQueries({
            queryKey: [QueryKeys.SPECIALTY],
        });
        messageApi.open({
            type: "success",
            content: "Xóa đặc sản thành công",
        });
        },
        onError: (error) => {
        messageApi.open({
            type: "error",
            content: (error as unknown as { response: { data: string } }).response
            .data,
        });
        },
    });   

    const { lat, long } = getCoords(location);  

    return (
        <div className="flex gap-6">
            {contextHolder}
            <div className="flex flex-col w-3/10">
                <h2 className="text-2xl font-bold mb-4">Thêm đặc sản mới</h2>
                <AddSpecialtyForm long={long} lat={lat} dia_diem_id={params.id} />
                <h4 className="text-2xl font-bold mb-4">Danh sách đặc sản đã thêm</h4>
                {isLoading && <div>Đang lấy danh sách đặc sản...</div>}

                {!isLoading && data && data.length > 0 && (
                    <List
                        className="!w-[400px]"
                        itemLayout="horizontal"
                        dataSource={data}
                        renderItem={(des: {
                            _id: string;
                            ten: string;
                            link_id: string;

                        }) => (
                            <List.Item
                                actions={[
                                    <Button
                                        type="link"
                                        key={des.link_id}
                                        onClick={() => mutation.mutate(des.link_id)}
                                    >
                                        Xóa
                                    </Button>,
                                ]}
                            >
                                <List.Item.Meta
                                    title={`${des.ten} `}
                                    description={`${des._id} `}
                                />

                            </List.Item>
                        )}
                    />
                )}

            </div>
            <div className="grow-1 rounded-lg">
                <DesMap location={location} setLocation={handleSetLocation} />
            </div>
        </div>
    );
}