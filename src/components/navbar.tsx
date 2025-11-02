"use client";

import Link from "next/link";
import LinkButton from "./link-button";
import { StarFilled, StarOutlined } from "@ant-design/icons";
import { BsFillGeoAltFill } from "react-icons/bs";
import { usePathname } from "next/navigation";

export default function Navbar() {
  const pathname = usePathname();
  return (
    <div className="w-full flex justify-center bg-white border-b border-b-gray-200 py-4 gap-4 mb-4">
      <Link href={"/"}>
        <LinkButton action={pathname === "/"}>
          {pathname === "/" ? (
            <StarFilled style={{ fontSize: 24 }} />
          ) : (
            <StarOutlined style={{ fontSize: 24 }} />
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
          Quản lý địa điểm
        </LinkButton>
      </Link>
      <Link href={"/specialty"}>
        <LinkButton action={pathname === "/specialty"}>
          {pathname === "/specialty" ? (
            <StarFilled style={{ fontSize: 24 }} />
          ) : (
            <StarOutlined style={{ fontSize: 24 }} />
          )}
          Quản lý đặc sản
        </LinkButton>
      </Link>
      <Link href={"/stats"}>
        <LinkButton action={pathname === "/stats"}>
          {pathname === "/stas" ? (
            <BsFillGeoAltFill style={{ fontSize: 24 }} />
          ) : (
            <BsFillGeoAltFill style={{ fontSize: 24 }} />
          )}
          Thống kê địa điểm
        </LinkButton>
      </Link>
    </div>
  );
}
