"use client";

import Link from "next/link";
import LinkButton from "./link-button";
import { BsFillGeoAltFill, BsPieChartFill, BsSearch, BsGlobeCentralSouthAsia } from "react-icons/bs";
import { usePathname } from "next/navigation";

export default function Navbar() {
  const pathname = usePathname();
  return (
    <div className="w-full flex justify-center bg-white border-b border-b-gray-200 py-4 gap-4 mb-4">
      <Link href={"/"}>
        <LinkButton action={pathname === "/"}>
          {pathname === "/" ? (
            <BsGlobeCentralSouthAsia style={{ fontSize: 24 }} />
          ) : (
            <BsGlobeCentralSouthAsia style={{ fontSize: 24 }} />
          )}
          Quản lý tour
        </LinkButton>
      </Link>
      <Link href={"/destination"}>
        <LinkButton action={pathname === "/destination"}>
          {pathname === "/destination" ? (
            <BsFillGeoAltFill style={{ fontSize: 24 }} />
          ) : (
            <BsFillGeoAltFill style={{ fontSize: 24 }} />
          )}
          Danh sách địa điểm
        </LinkButton>
      </Link>
      <Link href={"/specialty"}>
        <LinkButton action={pathname === "/specialty"}>
          {pathname === "/specialty" ? (
            <BsSearch style={{ fontSize: 24 }} />
          ) : (
            <BsSearch style={{ fontSize: 24 }} />
          )}
          Tìm kiếm đặc sản
        </LinkButton>
      </Link>
      <Link href={"/stats"}>
        <LinkButton action={pathname === "/stats"}>
          {pathname === "/stats" ? (
            <BsPieChartFill style={{ fontSize: 24 }} />
          ) : (
            <BsPieChartFill style={{ fontSize: 24 }} />
          )}
          Thống kê địa điểm
        </LinkButton>
      </Link>
    </div>
  );
}
