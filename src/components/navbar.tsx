"use client";

import Link from "next/link";
import LinkButton from "./link-button";
import { StarFilled, StarOutlined } from "@ant-design/icons";
import { usePathname } from "next/navigation";

export default function Navbar() {
  const pathname = usePathname();
  console.log(pathname);
  return (
    <div className="w-full flex justify-center bg-[#F3EDF7] py-4 gap-4 mb-4">
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
            <StarFilled style={{ fontSize: 24 }} />
          ) : (
            <StarOutlined style={{ fontSize: 24 }} />
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
    </div>
  );
}
