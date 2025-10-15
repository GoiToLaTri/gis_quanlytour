import AddTourForm from "@/components/add-tour-form";
import Map from "@/components/map";

export default function AddTour() {
  return (
    <div className="flex gap-4">
      <div className="w-[400px] p-4">
        <AddTourForm />
      </div>
      <div className="w-full p-4">
        <Map />
      </div>
    </div>
  );
}
