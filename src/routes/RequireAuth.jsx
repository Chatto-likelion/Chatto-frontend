// src/routes/RequireAuth.jsx
import { useEffect, useRef } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

export default function RequireAuth() {
  const { user, status } = useAuth(); // status: "checking" | "authenticated" | "unauthenticated"
  const location = useLocation();
  const navigate = useNavigate();
  const promptedRef = useRef(false);

  useEffect(() => {
    if (status === "checking") return;

    if (status === "authenticated" && user) return;

    if (!location.state?.authPrompted) {
      navigate(location.pathname + location.search + location.hash, {
        replace: true,
        state: { ...(location.state || {}), authPrompted: true },
      });
      return;
    }

    if (promptedRef.current) return;
    promptedRef.current = true;

    const ok = window.confirm(
      "로그인이 필요합니다. 로그인 페이지로 이동할까요?"
    );
    if (ok) {
      navigate("/signin", { replace: true, state: { from: location } });
    } else {
      if (window.history.length > 1) navigate(-1);
      else navigate("/", { replace: true });
    }
  }, [status, user, location, navigate]);

  if (status === "checking") {
    return <div style={{ padding: 16 }}>세션 확인 중…</div>;
  }

  return user ? <Outlet /> : null;
}
