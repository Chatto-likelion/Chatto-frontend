// src/routes/RequireAuth.tsx
import { useEffect } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

// 개발모드/중복 가드 대비: 단일 실행 락
let prompting = false;

export default function RequireAuth() {
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) return;

    // 1) 아직 이 히스토리 엔트리에서 프롬프트 안 띄웠다면, state에 표시만 하고 리턴
    if (!location.state?.authPrompted) {
      navigate(location.pathname + location.search + location.hash, {
        replace: true,
        state: { ...(location.state || {}), authPrompted: true },
      });
      return; // 다음 렌더에서 effect 다시 실행됨
    }

    // 2) 실제 프롬프트는 한 번만
    if (prompting) return;
    prompting = true;

    const ok = window.confirm(
      "로그인이 필요합니다. 로그인 페이지로 이동할까요?"
    );
    prompting = false;

    if (ok) {
      // 원래 가려던 곳으로 돌아오기 위해 from을 넘김
      navigate("/signin", { replace: true, state: { from: location } });
    } else {
      // 뒤로 갈 곳이 없으면 홈으로
      if (window.history.length > 1) navigate(-1);
      else navigate("/", { replace: true });
    }
  }, [user, location, navigate]);

  return user ? <Outlet /> : null;
}
