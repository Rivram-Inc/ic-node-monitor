"use client";

import { redirect } from "next/navigation";

const App = () => {
  // This will redirect immediately during server-side rendering
  redirect("/app/node_providers");
};

export default App;
