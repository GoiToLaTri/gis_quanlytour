import AddTourForm from "@/components/add-tour-form";
import Map from "@/components/map";

export default function AddTour() {
  return (
    <div className="flex gap-4 h-full">
      <div className="w-[400px]">
        <h2 className="text-2xl font-bold mb-4">Thêm tour mới</h2>
        <AddTourForm />
      </div>
      <div className="w-full">
        <Map />
      </div>
    </div>
  );
}
