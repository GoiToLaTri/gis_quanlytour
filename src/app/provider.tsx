"use client";

import { AntdRegistry } from "@ant-design/nextjs-registry";
import "@ant-design/v5-patch-for-react-19";
import { unstableSetRender } from "antd";
import { createRoot } from "react-dom/client";
type RenderType = NonNullable<Parameters<typeof unstableSetRender>[0]>;
type ContainerType = Parameters<RenderType>[1] & {
  _reactRoot?: ReturnType<typeof createRoot>;
};

unstableSetRender((node, container: ContainerType) => {
  container._reactRoot ||= createRoot(container);
  const root: ReturnType<typeof createRoot> = container._reactRoot;
  root.render(node);

  return () =>
    new Promise<void>((resolve) => {
      setTimeout(() => {
        root.unmount();
        resolve();
      }, 0);
    });
});

export default function AppProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AntdRegistry>{children}</AntdRegistry>;
}
