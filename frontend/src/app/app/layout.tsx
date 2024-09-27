import React from "react";
import DashboardHeader from "@/components/DashboardHeader";

export default function Layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="w-full flex flex-col">
      <DashboardHeader />
      <div className="px-0 md:px-8 py-2 md:pt-8">{children}</div>
    </div>
  );
}
