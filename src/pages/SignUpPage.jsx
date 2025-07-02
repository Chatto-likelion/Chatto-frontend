import React, { useState } from "react";
import Header from "../components/Header.jsx";
import Button from "../components/Button.jsx";

export default function SignUpPage() {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // 인증번호 전송
  const handleSendCode = () => {
    console.log("인증번호 전송:", email);
    // TODO: API 호출
  };

  // 인증번호 확인
  const handleVerifyCode = () => {
    console.log("인증번호 확인:", verificationCode);
    // TODO: API 호출
  };

  // 회원가입 제출
  const handleSubmit = (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      alert("비밀번호가 일치하지 않습니다.");
      return;
    }
    console.log("회원가입 정보:", { name, phone, email, password });
    // TODO: 회원가입 API 호출
  };

  return (
    <div>
      <Header />
      <main className="flex flex-col items-center justify-center px-4 py-8">
        <h1 className="text-3xl font-semibold mb-8">Sign Up</h1>

        <form
          onSubmit={handleSubmit}
          className="w-full max-w-[600px] space-y-4"
        >
          {/* 이름 */}
          <input
            type="text"
            placeholder="이름"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="border p-2 mb-2 w-full"
            required
          />

          {/* 전화번호 */}
          <input
            type="tel"
            placeholder="전화번호"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="border p-2 mb-2 w-full"
            required
          />

          {/* 이메일 + 인증번호 전송 */}
          <div className="flex items-center mb-2">
            <input
              type="email"
              placeholder="이메일"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="border p-2 flex-1"
              required
            />
            <button
              type="button"
              onClick={handleSendCode}
              className="ml-2 px-4 py-2 border border-purple-400 text-purple-600 rounded"
            >
              인증번호 전송
            </button>
          </div>

          {/* 인증번호 입력 + 확인 */}
          <div className="flex items-center mb-2">
            <input
              type="text"
              inputMode="numeric"
              placeholder="인증번호 입력"
              value={verificationCode}
              onChange={(e) => setVerificationCode(e.target.value)}
              className="border p-2 flex-1"
              required
            />
            <button
              type="button"
              onClick={handleVerifyCode}
              className="ml-2 px-4 py-2 border border-yellow-400 text-yellow-600 rounded"
            >
              확인
            </button>
          </div>

          {/* 비밀번호 */}
          <input
            type="password"
            placeholder="비밀번호"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="border p-2 mb-2 w-full"
            required
          />

          {/* 비밀번호 확인 */}
          <input
            type="password"
            placeholder="비밀번호 확인"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="border p-2 mb-4 w-full"
            required
          />

          {/* 회원가입 완료 버튼 */}
          <Button type="submit">회원가입 완료</Button>
        </form>
      </main>
    </div>
  );
}
