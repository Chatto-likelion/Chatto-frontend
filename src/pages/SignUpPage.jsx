import { useState } from "react";
import Header from "../components/Header.jsx";
import SignUpInput from "../components/SignUpInput.jsx";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext.jsx";
import { signup } from "../apis/api.js";

export default function SignUpPage() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // 인증번호 전송
  const handleSendCode = () => {
    alert("인증번호 전송 완료")
    console.log("인증번호 전송:", email);
    // TODO: API 호출
  };

  // 인증번호 확인
  const handleVerifyCode = () => {
    alert("인증번호 확인");
    console.log("인증번호 확인:", verificationCode);
    // TODO: API 호출
  };

  // 회원가입 제출
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      alert("비밀번호가 일치하지 않습니다.");
      return;
    }

    try {
      const res = await signup({
        username: name,
        phone,
        email,
        vef_num: parseInt(verificationCode, 10),
        password,
        password_confirm: confirmPassword,
      });

      login({
        id: res.user.id,
        username: res.user.username,
        email: res.user.email,
        point: res.point,
      });

      navigate("/");
    } catch (error) {
      alert(error.message);
    }
  };

  return (
    <div>
      <Header />
      <main className="flex flex-col items-center justify-center px-4 my-42">
        <h1 className="text-h2 w-full max-w-150 flex justify-center pb-7.5 border-b-2 border-b-primary">Sign up</h1>

        <form
          onSubmit={handleSubmit}
          className="w-full max-w-116.5 mt-27"
        >
          <div className="w-full flex flex-col gap-2 mb-10">
            {/* 이름 */}
            <SignUpInput
              type="text"
              placeholder="아이디"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />

            {/* 전화번호 */}
            <SignUpInput
              type="tel"
              placeholder="전화번호"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              required
            />
          </div>

          <div className="w-full flex flex-col gap-2 mb-10">
            {/* 이메일 + 인증번호 전송 */}
            <div className="flex justify-between items-center mb-2">
              <SignUpInput
                type="email"
                placeholder="이메일"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-78"
                required
              />
              <button
                type="button"
                onClick={handleSendCode}
                className="w-26 h-9.75 cursor-pointer rounded-lg border border-primary-dark hover:bg-primary-light text-primary-dark text-body2"
              >
                인증번호 전송
              </button>
            </div>

            {/* 인증번호 입력 + 확인 */}
            <div className="flex items-center justify-between">
              <SignUpInput
                type="text"
                inputMode="numeric"
                placeholder="인증번호 입력"
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value)}
                className="w-78"
                required
              />
              <button
                type="button"
                onClick={handleVerifyCode}
                className="w-26 h-9.75 rounded-lg cursor-pointer border border-[#E4B546] hover:bg-amber-50 text-[#E4B546] text-body2"
              >
                확인
              </button>
            </div>
          </div>

          <div className="w-full flex flex-col gap-2 mb-14">
            {/* 비밀번호 */}
            <SignUpInput
              type="password"
              placeholder="비밀번호"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />

            {/* 비밀번호 확인 */}
            <SignUpInput
              type="password"
              placeholder="비밀번호 확인"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </div>
          {/* 회원가입 완료 버튼 */}
          <div className="w-full flex justify-center">
            <button type="submit" className="cursor-pointer w-full h-10 bg-primary hover:bg-primary-dark rounded-lg text-white text-body1">회원가입 완료</button>
          </div>
        </form>
      </main>
    </div>
  );
}
