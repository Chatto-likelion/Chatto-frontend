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
    // 1) 세션 확인 중이면 아무 것도 하지 않음
    if (status === "checking") return;

    // 2) 로그인 완료면 아무 것도 하지 않음
    if (status === "authenticated" && user) return;

    // 3) 비로그인 확정 시, 같은 히스토리 엔트리에서 한 번만 프롬프트
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
      // 원래 가려던 곳으로 돌아가기 위해 from을 넘김
      navigate("/signin", { replace: true, state: { from: location } });
    } else {
      if (window.history.length > 1) navigate(-1);
      else navigate("/", { replace: true });
    }
  }, [status, user, location, navigate]);

  // 세션 확인 중에는 로딩 UI, 그 외엔 권한 없으면 null로 비워 깜빡임 방지
  if (status === "checking") {
    return <div style={{ padding: 16 }}>세션 확인 중…</div>;
  }

  return user ? <Outlet /> : null;
}
