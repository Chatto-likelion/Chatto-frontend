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

  const handleAboutPage = () => {
    navigate("/about");
  };

  const handlePlayMyPage = () => {
    navigate("/play/mypage");
  };

  const handleBusinessMyPage = () => {
    navigate("/business/mypage");
  };

  const handleCreditPage = () => {
    navigate("/credit");
  };

  return (
    <header
      className={`fixed top-0 left-0 w-full h-[72px] pt-5 pb-2 px-12 flex justify-between items-end shrink-0 
        ${
          mode === "play"
            ? "border-b-2 border-primary bg-primary-light"
            : mode === "business"
            ? "border-b-2 border-primary bg-primary-dark"
            : "bg-primary-light"
        }
      }`}
    >
      <div
        className={`flex items-end gap-2  ${
          !mode
            ? "text-black"
            : mode === "business"
            ? "text-primary-light"
            : "text-primary-dark"
        }`}
      >
        <button onClick={handleLanding} className="text-h4">
          Chatto
        </button>
        {!mode && (
          <span className="text-st2">당신의 어떤 대화라도 분석해드릴게요</span>
        )}
        <div className="w-32 h-6.5 px-2.5 pt-1 pb-1.5 flex justify-between items-center">
          {/* PLAY 탭 */}
          <p
            onClick={
              mode === "play"
                ? handlePlayPage
                : pathname.includes("mypage")
                ? handlePlayMyPage
                : handlePlayPage
            }
            className={[
              "border-r-1 pr-1.5 text-button cursor-pointer",
              mode === "play" ? " text-primary-dark" : " text-gray-6",
            ].join(" ")}
          >
            PLAY
          </p>

          {/* BUSINESS 탭 */}
          <p
            onClick={
              mode === "play"
                ? pathname.includes("mypage")
                  ? handleBusinessMyPage
                  : handleBusinessPage
                : handleBusinessPage
            }
            className={[
              "pl-1.25 text-button cursor-pointer",
              mode === "play" ? "text-gray-5" : "text-primary-light",
            ].join(" ")}
          >
            BUSINESS
          </p>
        </div>
      </div>

      <nav
        className={`pb-0.5 flex items-start gap-5 ${
          mode === "business" ? "text-gray-3" : "text-gray-7"
        }`}
      >
        {!mode && (
          <p
            onClick={handleAboutPage}
            className={` text-h7 ${
              pathname.includes("about") ? "text-primary" : "text-gray-7"
            }`}
          >
            About
          </p>
        )}
        {user && (
          <p
            className={`text-h7 ${
              mode === "business" ? "text-primary-light" : "text-primary"
            }`}
          >
            {user.username}
          </p>
        )}
        <div
          className="relative"
          onMouseEnter={() => setShowDropdown(true)}
          onMouseLeave={() => setShowDropdown(false)}
        >
          {/* My page 버튼 */}
          <div className="flex items-center">
            {user && (
              <button
                onClick={
                  mode === "play"
                    ? handlePlayMyPage
                    : mode === "business"
                    ? handleBusinessMyPage
                    : () => {}
                }
                className={`text-h7 ${
                  pathname.includes("mypage")
                    ? mode === "business"
                      ? "text-primary-light"
                      : "text-primary"
                    : ""
                }`}
              >
                My page
              </button>
            )}
          </div>

          {showDropdown && mode === null && (
            <>
              {/* 드롭다운 안 닫히게 */}
              <div className="absolute top-full left-[30px] h-3 w-12 z-10" />
              <div className="absolute top-[calc(100%+12px)] left-[30px] w-25 h-12.5 pl-2.5 pr-1.5 py-1.5 flex flex-col gap-0.5 bg-secondary-light rounded-sm shadow-lg z-10">
                {/* 삼각형 */}
                <div className="absolute -top-2.5 left-4 w-0 h-0 border-l-[10px] border-l-transparent border-r-[10px] border-r-transparent border-b-[10px] border-b-secondary-light" />
                <button
                  onClick={handlePlayMyPage}
                  className="w-full px-1.5 pb-0.5 border-b border-b-primary-light border-dashed text-start text-overline rounded-sm hover:bg-gray-2"
                >
                  FOR PLAY
                </button>
                <button
                  onClick={handleBusinessMyPage}
                  className="w-full px-1.5 pb-0.5 border-b border-b-primary-light border-dashed text-start text-overline rounded-sm hover:bg-gray-2"
                >
                  FOR BUSINESS
                </button>
              </div>
            </>
          )}
        </div>

        {user && (
          <button onClick={handleCreditPage} className="text-h7">
            {user.point}C
          </button>
        )}
        {user ? (
          <button onClick={logout} className="w-20 text-start text-h7">
            Sign out
          </button>
        ) : (
          <button
            // onClick={handleTempSignIn}
            onClick={handleSignIn}
            className="w-20 text-start text-h7"
          >
            Sign in
          </button>
        )}
      </nav>
    </header>
  );
}
