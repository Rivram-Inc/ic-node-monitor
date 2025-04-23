"use client";
import React from "react";
import { useRouter } from "next/navigation";
import Loader from "@/components/Loader";

const App = () => {
  const router = useRouter();

  router.push("/app/node_providers");

  return (
    <div className="flex w-full max-h-80 justify-center items-center">
      <Loader />
    </div>
  );
};

export default App;
