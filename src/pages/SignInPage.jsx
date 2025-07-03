import Header from "../components/Header.jsx";
import Input from "../components/Input.jsx";
import Button from "../components/Button.jsx";
import React, { useState } from "react";
import { useAuth } from "../contexts/AuthContext.jsx";
import { useNavigate } from "react-router-dom";
import { EyeClosed, EyeOpened } from "../assets/svg/index.js";
import { login as loginAPI } from "../apis/api.js";

export default function SignInPage() {
  const [id, setId] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const res = await loginAPI({
        username: id,
        password: password,
      });

      login({
        id: res.user.id,
        username: res.user.username,
        email: res.user.email,
        point: res.point,
        phone: res.phone,
      });
      console.log("로그인됨:", res);
      navigate("/");
    } catch (error) {
      alert(error.message);
    }
  };

  const handleSignUp = () => {
    navigate("/signup");
  };

  const PasswordToggle = React.memo(
    ({ isShow, onToggle }) => {
      return (
        <button type="button" onClick={onToggle} className="align-middle">
          {isShow ? <img src={EyeOpened}/> : <img src={EyeClosed}/>}
        </button>
      )
    }
  )

  const handlePasswordToggle = () => {
    setShowPassword((prev) => !prev);
  }

  return (
    <div>
      <Header />
      <main className="flex flex-col items-center justify-center px-4 my-56 w-full">
        <h1 className="text-h2 w-full max-w-150 flex justify-center pb-7.5 border-b-2 border-b-primary">Sign in</h1>

        <form
          onSubmit={handleSubmit}
          className="w-full max-w-150 flex flex-col gap-8 mt-27"
        >
          <Input
            type="text"
            placeholder="아이디"
            value={id}
            onChange={(e) => setId(e.target.value)}
          />
          <Input
            type={showPassword ? "text" : "password"}
            placeholder="비밀번호"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            suffix={
              <PasswordToggle
                isShow={showPassword}
                onToggle={handlePasswordToggle}
              />
            }
          />
          <div className="flex flex-col items-end gap-2.5">
            <Button type="submit">sign in</Button>
            <a href="/forget" className="text-primary hover:text-primary-dark">
              비밀번호를 잊으셨나요?
            </a>
          </div>

          <div className="flex text-body2 mt-2 gap-2">
            처음이신가요?
            <button type="button" onClick={handleSignUp} className="text-primary cursor-pointer hover:text-primary-dark">
              Sign up Now
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}
