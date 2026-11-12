import { Suspense } from "react";
import AuthForm from "../Components/AuthForm";
export const metadata = { title: "Create account" };
export default function Page() {
  return (
    <Suspense
      fallback={
        <div className="empty-page" role="status">
          Loading account…
        </div>
      }
    >
      <AuthForm mode="signup" />
    </Suspense>
  );
}
