// src/contexts/AuthContext.jsx
import { createContext, useContext, useState, useEffect } from "react";
import { instanceWithToken } from "@/apis/axios"; // 네 axios 인스턴스 import
import { getCookie } from "@/utils/cookie"; // access_token 읽을 함수

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [status, setStatus] = useState("checking");
  // "checking" | "authenticated" | "unauthenticated"

  // 앱 시작 시 세션 확인
  useEffect(() => {
    const checkSession = async () => {
      try {
        const token = getCookie("access_token");
        if (!token) {
          setUser(null);
          setStatus("unauthenticated");
          return;
        }
        const res = await instanceWithToken.get("/account/profile/");
        setUser(res.data);
        setStatus("authenticated");
      } catch (err) {
        console.error("세션 확인 실패:", err);
        setUser(null);
        setStatus("unauthenticated");
      }
    };

    checkSession();
  }, []);

  const login = (userData) => {
    setUser(userData);
    setStatus("authenticated");
  };

  const logout = () => {
    setUser(null);
    setStatus("unauthenticated");
  };

  return (
    <AuthContext.Provider value={{ user, status, login, logout }}>
      {status === "checking" ? (
        <div style={{ padding: 16 }}>세션 확인 중…</div>
      ) : (
        children
      )}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth는 반드시 AuthProvider 안에서 사용해야 합니다.");
  }
  return context;
}
