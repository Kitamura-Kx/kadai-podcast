import { Suspense } from "react";
import SignupClient from "@/app/signup/SignupClient";

export default function SignupPage() {
  return (
    <Suspense fallback={<div className="p-6">Loading...</div>}>
      <SignupClient />
    </Suspense>
  );
}
