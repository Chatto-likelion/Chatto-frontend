// src/pages/AccountEditPage.jsx
import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Header } from "@/components";
import { useAuth } from "@/contexts/AuthContext";
import { putProfile, login as loginAPI } from "@/apis/api";

export default function ProfileEditPage() {
  const { user, login } = useAuth();
  const navigate = useNavigate();

  const [step, setStep] = useState(1);
  const init = useMemo(
    () => ({
      username: user?.user?.username ?? "",
      email: user?.user?.email ?? "",
      phone: user?.phone ?? "",
      password: "",
      password2: "",
    }),
    [user]
  );
  const [form, setForm] = useState(init);
  const patch = (p) => setForm((prev) => ({ ...prev, ...p }));

  const [currentPw, setCurrentPw] = useState("");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState(null);

  async function verifyPassword(password) {
    const username = user?.user?.username?.trim();
    if (!username) {
      throw new Error("사용자 식별자를 찾을 수 없습니다.");
    }
    await loginAPI({ username, password });
  }

  const effectivePassword = (form.password || currentPw || "").trim();

  const validators = {
    email: (v) =>
      v?.trim()
        ? /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) ||
          "유효한 이메일 형식이 아닙니다."
        : "이메일을 입력해 주세요.",
    phone: (v) =>
      v?.trim()
        ? /^0\d{1,2}-?\d{3,4}-?\d{4}$/.test(v) || "유효한 전화번호가 아닙니다."
        : "연락처를 입력해 주세요.",
    // password: (v) =>
    //   v
    //     ? v.length >= 8 || "비밀번호는 8자 이상이어야 합니다."
    //     : "비밀번호를 입력해 주세요.",
    password2: (v, all) =>
      all.password // 새 비번을 입력했을 때만 확인란 강제
        ? v === all.password || "비밀번호 확인이 일치하지 않습니다."
        : true,
  };

  const validateAll = () => {
    // username도 PUT 필수면 여기도 추가
    const checks = [
      ["email", form.email],
      ["phone", form.phone],
      ["password", effectivePassword],
      ["password2", form.password2],
    ];
    for (const [key, v] of checks) {
      const f = validators[key];
      const msg = f?.(v, { ...form, password: effectivePassword });
      if (msg !== true && msg !== undefined) return msg;
    }
    return null;
  };

  const handleVerify = async () => {
    if (!currentPw.trim()) {
      setErr("비밀번호를 입력해 주세요.");
      return;
    }
    setLoading(true);
    setErr(null);
    try {
      await verifyPassword(currentPw.trim());
      setStep(2); // 인증 성공 → 폼 단계
    } catch (e) {
      setErr(
        e?.response?.data
          ? typeof e.response.data === "string"
            ? e.response.data
            : JSON.stringify(e.response.data)
          : "비밀번호가 올바르지 않습니다."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    const vmsg = validateAll();
    if (vmsg) {
      setErr(vmsg);
      return;
    }

    const body = {
      username: form.username.trim(),
      email: form.email.trim(),
      phone: form.phone.trim(),
      password: effectivePassword,
    };

    // 어떤 필드라도 비면 서버에서 400/500 날 수 있으니 프리체크
    for (const [k, v] of Object.entries(body)) {
      if (!v) {
        setErr(`${k} 값을 입력해 주세요.`);
        return;
      }
    }

    try {
      setLoading(true);
      setErr(null);
      const updated = await putProfile(body);
      // 응답으로 받은 값으로 컨텍스트 갱신
      login({
        ...user,
        user: {
          ...(user?.user || {}),
          username: updated.username ?? body.username,
          email: updated.email ?? body.email,
        },
        phone: updated.phone ?? body.phone,
      });
      window.alert("정보가 수정되었습니다.");
      navigate(-1);
    } catch (e) {
      setErr(
        e?.response?.data
          ? typeof e.response.data === "string"
            ? e.response.data
            : JSON.stringify(e.response.data)
          : e?.message || "정보 수정에 실패했습니다."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col justify-start items-center h-screen bg-white text-primary-dark">
      <Header />
      <div className="mt-18 w-full flex justify-center">
        <div className="w-[920px] max-w-[92vw] mt-16 p-8 rounded-lg border border-primary flex flex-col items-center">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-h6">정보 수정</h1>
            {/* <button
              className="px-3 py-1.5 text-button text-primary border border-primary rounded hover:bg-primary hover:text-white"
              onClick={() => navigate(-1)}
            >
              돌아가기
            </button> */}
          </div>

          <div className="mb-4 h-5 text-sm text-red-400">{err}</div>

          {step === 1 ? (
            <div className="w-full flex flex-col items-center">
              <p className="mb-4 text-body2 text-secondary-dark">
                보안을 위해 비밀번호를 한 번 더 입력해 주세요.
              </p>
              <div className="w-full max-w-[560px]">
                <Label>비밀번호</Label>
                <input
                  type="password"
                  className="w-full mt-1 px-3 py-2 bg-transparent border border-primary-light rounded outline-none focus:border-primary"
                  value={currentPw}
                  onChange={(e) => setCurrentPw(e.target.value)}
                  placeholder="현재 비밀번호"
                />
              </div>
              <div className="mt-6 flex gap-3">
                <button
                  onClick={handleVerify}
                  disabled={loading}
                  className="px-4 py-2 border border-primary rounded hover:bg-primary hover:text-white disabled:opacity-50"
                >
                  다음
                </button>
                <button
                  onClick={() => navigate(-1)}
                  className="px-4 py-2 border border-primary rounded hover:bg-gray-5 hover:border-transparent hover:text-white"
                >
                  취소
                </button>
              </div>
            </div>
          ) : (
            <div className="w-full flex flex-col items-center">
              <div className="grid grid-cols-1 gap-5 w-full max-w-[720px]">
                <Field
                  label="사용자명"
                  value={form.username}
                  onChange={(v) => patch({ username: v })}
                  placeholder="표시할 이름"
                />
                <Field
                  label="이메일"
                  value={form.email}
                  onChange={(v) => patch({ email: v })}
                  placeholder="you@example.com"
                />
                <Field
                  label="연락처"
                  value={form.phone}
                  onChange={(v) => patch({ phone: v })}
                  placeholder="010-1234-5678"
                />
                <PasswordField
                  label="새 비밀번호"
                  value={form.password}
                  onChange={(v) => patch({ password: v })}
                  placeholder="변경하지 않으려면 비워두세요"
                />
                <PasswordField
                  label="비밀번호 확인"
                  value={form.password2}
                  onChange={(v) => patch({ password2: v })}
                  placeholder="동일한 비밀번호를 입력"
                />
              </div>

              <div className="mt-8 flex gap-3">
                <button
                  onClick={handleSubmit}
                  disabled={loading}
                  className="px-5 py-2 border border-primary rounded hover:bg-primary hover:text-white disabled:opacity-50"
                >
                  저장
                </button>
                <button
                  onClick={() => navigate(-1)}
                  className="px-5 py-2 border border-primary rounded hover:border-transparent hover:bg-gray-5"
                >
                  취소
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ---------- UI Subcomponents ---------- */

function Label({ children }) {
  return <label className="text-primary-dark">{children}</label>;
}

function Field({ label, value, onChange, placeholder }) {
  return (
    <div>
      <Label>{label}</Label>
      <input
        className="w-full mt-1 px-3 py-2 bg-transparent border border-primary-light rounded outline-none focus:border-primary"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
      />
    </div>
  );
}

function PasswordField({ label, value, onChange, placeholder }) {
  const [show, setShow] = useState(false);
  return (
    <div>
      <Label>{label}</Label>
      <div className="relative">
        <input
          type={show ? "text" : "password"}
          className="w-full mt-1 px-3 py-2 bg-transparent border border-primary-light rounded outline-none focus:border-primary pr-10"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
        />
        <button
          type="button"
          onClick={() => setShow((s) => !s)}
          className="absolute right-2 top-1/2 -translate-y-1/2 text-sm text-primary-light hover:text-primary"
        >
          {show ? "숨김" : "표시"}
        </button>
      </div>
    </div>
  );
}
