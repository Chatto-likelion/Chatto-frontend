import { useAuth } from "../contexts/AuthContext";
import { useNavigate } from "react-router-dom";

export default function Header() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleSignIn = () => {
    navigate("/signin");
  };

  const handleLanding = () => {
    navigate("/");
  };

  const handleMyPage = () => {
    navigate("/mypage");
  };

  const handleCreditPage = () => {
    navigate("/credits");
  };

  return (
    <header className="flex justify-between items-center h-10 px-8 bg-[#eadcff]">
      <div className="flex items-center space-x-2">
        <button
          onClick={handleLanding}
          className="text-[20px] font-bold text-[#000000]"
        >
          Chatto
        </button>
        <span className="text-xs text-primarydark">
          당신의 어떤 대화라도 분석해드릴게요
        </span>
      </div>

      <nav className="flex items-center space-x-2 text-xs text-black">
        <button onClick={handleMyPage}>My page</button>
        <button onClick={handleCreditPage}>300C</button>
        {user ? (
          <button onClick={logout}>Sign out</button>
        ) : (
          <button onClick={handleSignIn}>Sign in</button>
        )}
      </nav>
    </header>
  );
}
