import Navbar from "@/components/navbar";
import { ReactNode } from "react";

export default function SiteLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex flex-col">
      <div>
        <Navbar />
      </div>
      <div className="grow-1 px-[4rem]">{children}</div>
    </div>
  );
}
