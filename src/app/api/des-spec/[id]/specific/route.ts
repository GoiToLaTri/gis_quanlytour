import { NextResponse } from "next/server";
import connect from "@/lib/mongodb";
import DestinationsSpecialties from "@/models/destinations-specialties";
import Destination from "@/models/destination";

export async function GET(
    req: Request,
    context: { params: Promise<{ id: string }> },
) {
    try {
        const { id } = await context.params;
        await connect();

        // 1. Lấy thông tin Địa điểm TRƯỚC HẾT để đảm bảo luôn có dữ liệu cơ bản
        const des = await Destination.findById(id);

        if (!des) {
            return new Response("Không tìm thấy địa điểm nào", { status: 404 });
        }
        
        // 2. Lấy tất cả mối quan hệ cho ĐỊA ĐIỂM CỤ THỂ
        const desSpec = await DestinationsSpecialties.find({ ma_dia_diem: id })
            .populate("ma_dac_san");

        // 3. Xây dựng mảng Đặc sản
        const dac_san_array = desSpec
            .map((ds: any) => {
                // Đảm bảo ma_dac_san đã được populate thành công
                if (ds.ma_dac_san) {
                    return { ten: ds.ma_dac_san.ten };
                }
                return null;
            })
            .filter((s: any) => s !== null && s.ten); // Lọc bỏ các mục null/undefined

        // 4. Trả về cấu trúc dữ liệu duy nhất
        return NextResponse.json({
            ten_dia_diem: des.ten,
            vi_do: des.vi_do,
            kinh_do: des.kinh_do,
            dac_san: dac_san_array, // Sẽ là mảng rỗng [] nếu desSpec.length === 0
        });

    } catch (error: any) {
        // Log chi tiết lỗi để kiểm tra Schema
        console.error("Lỗi API Des-Spec:", error);
        return new Response("Lỗi server: Không thể tải thông tin địa điểm và đặc sản", { status: 500 });
    }
}