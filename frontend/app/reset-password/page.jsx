import { Suspense } from "react";
import AuthForm from "../Components/AuthForm";
export const metadata = { title: "Reset password" };
export default function Page() {
  return (
    <Suspense
      fallback={
        <div className="empty-page" role="status">
          Loading account…
        </div>
      }
    >
      <AuthForm mode="reset" />
    </Suspense>
  );
}
