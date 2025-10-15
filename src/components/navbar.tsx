import Link from "next/link";

export default function Navbar() {
  return (
    <div>
      <Link href={"/"}>Quản lý Tour</Link>
      <Link href={"/destination"}>Quản lý địa điểm</Link>
      <Link href={"/speciatly"}>Quản lý đặc sản</Link>
    </div>
  );
}
