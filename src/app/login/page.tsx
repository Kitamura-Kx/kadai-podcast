import { Suspense } from "react";
import LoginClient from "@/app/login/LoginClient";

export default function Page() {
  return (
    <Suspense fallback={<div className="p-6">Loading...</div>}>
      <LoginClient />
    </Suspense>
  );
}