// src/routes/RequireAuth.tsx
import { useEffect, useState } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
export default function RequireAuth() {
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [asked, setAsked] = useState(false);

  useEffect(() => {
    if (user) return;

    if (!asked) {
      setAsked(true);
      if (window.confirm("로그인이 필요합니다. 로그인 페이지로 이동할까요?")) {
        navigate("/signin", { replace: true, state: { from: location } });
      } else {
        navigate(-1);
      }
    }
  }, [user, asked, location, navigate]);

  // 로그인 상태면 자식 라우트 렌더
  if (user) return <Outlet />;

  // 비로그인 상태에선 모달만 띄우고 화면은 비워둠
  return null;
}
