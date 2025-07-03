import { useAuth } from "../contexts/AuthContext";
import { useNavigate, useLocation } from "react-router-dom";
import useCurrentMode from "@/hooks/useCurrentMode";
import { useState } from "react";

export default function Header() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const mode = useCurrentMode();
  const { pathname } = useLocation();
  const [showDropdown, setShowDropdown] = useState(false);

  const handleSignIn = () => {
    navigate("/signin");
  };

  const handleLanding = () => {
    navigate("/");
  };

  const handlePlayPage = () => {
    navigate("/play");
  };

  const handleBusinessPage = () => {
    navigate("/business");
  };

  const handlePlayMyPage = () => {
    navigate("/play/mypage");
  };

  const handleBusinessMyPage = () => {
    navigate("/business/mypage");
  };

  const handleCreditPage = () => {
    navigate("/credits");
  };

  return (
    <header
      className={`fixed top-0 left-0 w-full h-[70px] pt-5 pb-2 px-12 flex justify-between items-end shrink-0 bg-primary-light
        ${
          mode === "play"
            ? "border-b-2 border-primary"
            : mode === "business"
            ? "border-b-2 border-primary-light"
            : ""
        }
      }`}
    >
      <div className="flex items-end gap-2">
        <button onClick={handleLanding} className="text-h4 text-primary-dark">
          Chatto
        </button>
        {!mode && (
          <span className="text-st2 text-primary-dark">
            당신의 어떤 대화라도 분석해드릴게요
          </span>
        )}
      </div>

      <nav className="pb-0.5 flex items-start gap-5 text-gray-7">
        <div
          className="relative"
          onMouseEnter={() => setShowDropdown(true)}
          onMouseLeave={() => setShowDropdown(false)}
        >
          <button
            onClick={
              mode === "play"
                ? handlePlayMyPage
                : mode === "business"
                ? handleBusinessMyPage
                : () => {}
            }
            className={`text-h7 ${
              pathname.includes("mypage") ? "text-primary" : ""
            }`}
          >
            My page
          </button>

          {showDropdown && mode === null && (
            <div className="absolute top-full mt-0 left-[-45px] w-40 flex bg-white border border-grayscale-4 rounded shadow-lg z-10">
              <button
                onClick={handlePlayMyPage}
                className="w-full px-3 py-2 text-center text-sm hover:bg-gray-2"
              >
                Play
              </button>
              <button
                onClick={handleBusinessMyPage}
                className="w-full px-3 py-2 text-center text-sm hover:bg-gray-2"
              >
                Business
              </button>
            </div>
          )}
        </div>
        <button onClick={handleCreditPage} className="text-h7">
          300C
        </button>
        {mode && (
          <button
            onClick={mode === "play" ? handleBusinessPage : handlePlayPage}
            className="bold text-h7 text-primary-dark"
          >
            {mode === "play" ? "Business" : "Play"}
          </button>
        )}
        {user ? (
          <button onClick={logout} className="text-h7">
            Sign out
          </button>
        ) : (
          <button onClick={handleSignIn} className="text-h7">
            Sign in
          </button>
        )}
      </nav>
    </header>
  );
}
