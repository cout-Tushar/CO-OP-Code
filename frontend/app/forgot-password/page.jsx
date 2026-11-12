import { Suspense } from "react";
import AuthForm from "../Components/AuthForm";
export const metadata = { title: "Password recovery" };
export default function Page() {
  return (
    <Suspense
      fallback={
        <div className="empty-page" role="status">
          Loading account…
        </div>
      }
    >
      <AuthForm mode="forgot" />
    </Suspense>
  );
}
