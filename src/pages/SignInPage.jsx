import Header from "../components/Header.jsx";
import Input from "../components/Input.jsx";
import Button from "../components/Button.jsx";
import { useState } from "react";
import { useAuth } from "../contexts/AuthContext.jsx";

export default function SignInPage() {
  const [id, setId] = useState("");
  const [password, setPassword] = useState("");
  const { login } = useAuth();

  const handleSubmit = (e) => {
    e.preventDefault();

    // 로그인 로직
    const userData = { id }; // 실제로는 API 응답 데이터
    login(userData);

    console.log("로그인됨:", userData);
  };

  return (
    <div>
      <Header />
      <main className="flex flex-col items-center justify-center px-4 py-8">
        <h1 className="text-3xl font-semibold mb-8">Sign in</h1>

        <form
          onSubmit={handleSubmit}
          className="w-full max-w-[600px] space-y-4"
        >
          <Input
            type="text"
            placeholder="아이디"
            value={id}
            onChange={(e) => setId(e.target.value)}
          />
          <Input
            type="password"
            placeholder="비밀번호"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <div className="flex justify-end">
            <Button type="submit">sign in</Button>
          </div>

          <div className="flex justify-between text-sm mt-2">
            처음이신가요?
            <a href="#" className="text-purple-600">
              Signup Now
            </a>
            <a href="#" className="text-purple-600">
              비밀번호를 잊으셨나요?
            </a>
          </div>
        </form>
      </main>
    </div>
  );
}
