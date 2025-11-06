import connect from "@/lib/mongodb";
import DestinationsSpecialties from "@/models/destinations-specialties";
import Destination from "@/models/destination"; // Cần import model Destination

export async function GET(req: Request) {
    try {
        await connect();

        // 1. Lấy tất cả ĐỊA ĐIỂM (đây là danh sách đầy đủ)
        const allDestinations = await Destination.find({}); 

        // 2. Lấy tất cả MỐI QUAN HỆ Địa điểm - Đặc sản và populate
        const allDesSpec = await DestinationsSpecialties.find({})
            .populate("ma_dac_san")
            .populate("ma_dia_diem"); // Vẫn cần populate để lấy ID/Tên đặc sản

        // 3. TẠO MAP CHỨA CÁC ĐẶC SẢN ĐÃ NHÓM THEO ID ĐỊA ĐIỂM
        const specialtiesByDestinationId = new Map();

        allDesSpec.forEach((item: any) => {
            const destinationId = item.ma_dia_diem._id.toString();
            const specialtyName = item.ma_dac_san?.ten || null;

            // Đảm bảo map có một mảng cho ID địa điểm đó
            if (!specialtiesByDestinationId.has(destinationId)) {
                specialtiesByDestinationId.set(destinationId, []);
            }

            // Thêm đặc sản vào mảng
            if (specialtyName) {
                specialtiesByDestinationId.get(destinationId).push({
                    ten: specialtyName,
                });
            }
        });

        // 4. GHÉP NỐI: Lặp qua danh sách Địa điểm đầy đủ và thêm mảng đặc sản
        const result = allDestinations.map((dest: any) => {
            const destId = dest._id.toString();
            const specialtiesArray = specialtiesByDestinationId.get(destId); // Lấy mảng đặc sản

            return {
                dia_diem: dest.ten,
                vi_do: dest.vi_do,
                kinh_do: dest.kinh_do,
                dac_san: specialtiesArray,
            };
        });

        return Response.json(result, { status: 200 });
    } catch (error) {
        console.error(error);
        return new Response("Lấy thông tin địa điểm và đặc sản không thành công", { status: 500 });
    }
}