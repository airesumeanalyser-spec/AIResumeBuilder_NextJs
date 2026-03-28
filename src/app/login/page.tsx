import { Suspense } from "react";
import { LoginForm } from "./login-form";

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <main className="min-h-screen flex items-center justify-center">
          <p className="text-gray-600">Loading…</p>
        </main>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
