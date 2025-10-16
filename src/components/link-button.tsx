import { Button } from "antd";
import { ReactNode } from "react";

export default function LinkButton({
  children,
  action,
}: {
  children: ReactNode;
  action: boolean;
}) {
  return (
    <Button
      type="text"
      className={`!font-semibold ${
        action ? "!bg-[#E8DEF8]" : ""
      } !text-[#4A4459]`}
      shape="round"
      size="large"
    >
      {children}
    </Button>
  );
}
