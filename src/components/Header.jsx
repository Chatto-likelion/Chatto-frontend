import { useAuth } from "../contexts/AuthContext";

export default function Header() {
  const { user, logout } = useAuth();

  return (
    <header className="flex justify-between items-center h-10 px-8 bg-[#eadcff]">
      <div className="flex items-center space-x-2">
        <h1 className="text-[20px] font-bold text-[#000000]">Chatto</h1>
        <span className="text-xs text-primarydark">
          당신의 어떤 대화라도 분석해드릴게요
        </span>
      </div>

      <nav className="flex items-center space-x-2 text-xs text-black">
        <a href="#">My page</a>
        <a href="#">300C</a>
        <a href="#">Business</a>
        {user ? (
          <button onClick={logout}>Sign out</button>
        ) : (
          <a href="#">Sign in</a>
        )}
      </nav>
    </header>
  );
}
