// ShareModal.jsx
import { useEffect, useState } from "react";
import useCurrentMode from "@/hooks/useCurrentMode";

export default function ShareModal({ open, onClose, url, loading, error }) {
  const mode = useCurrentMode();
  const isPlay = mode === "play";

  const theme = isPlay
    ? {
        panelBg: "bg-primary-dark",
        panelText: "text-white",
        panelBorder: "border-secondary-light",
        closeBg: "text-primary-light/50 hover:text-primary-light",
        title: "text-white",
        urlLabel: "text-primary-light",
        urlBoxText: "text-gray-7",
        urlBoxBg: "bg-gray-3",
        urlBoxBorder: "border-gray-5",
        copyBtn:
          "border-primary-light hover:bg-primary-light hover:text-primary-dark",
        circleBorder: "border-primary-light",
        circleText: "text-white",
        circleHover: "hover:bg-primary-light hover:text-primary-dark",
        toastBg: "bg-gray-8",
        toastText: "text-white",
      }
    : {
        panelBg: "bg-white",
        panelText: "text-primary-dark",
        panelBorder: "border-primary-light",
        closeBg: "text-primary/30 hover:text-primary",
        title: "text-primary-dark",
        urlLabel: "text-primary",
        urlBoxText: "text-gray-7",
        urlBoxBg: "bg-gray-3",
        urlBoxBorder: "border-gray-5",
        copyBtn: "border-primary hover:bg-primary hover:text-white",
        circleBorder: "border-primary",
        circleText: "text-black",
        circleHover: "hover:bg-primary hover:text-white",
        toastBg: "bg-gray-8",
        toastText: "text-white",
      };

  const [copied, setCopied] = useState(false);
  useEffect(() => {
    if (!open) setCopied(false);
  }, [open]);
  if (!open) return null;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(url);
    } catch {
      const ta = document.createElement("textarea");
      ta.value = url;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
    } finally {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
    >
      <div
        className={`relative w-[460px] rounded-xl border-2 ${theme.panelBorder} ${theme.panelBg} ${theme.panelText} p-6 shadow-lg`}
      >
        {/* close */}
        <button
          onClick={onClose}
          className={`absolute right-3 top-3 h-8 w-8 rounded-full ${theme.closeBg}`}
          aria-label="닫기"
        >
          ✕
        </button>

        {/* title */}
        <h2 className={`text-center text-h6 leading-none mb-8 ${theme.title}`}>
          결과 공유하기
        </h2>

        {/* URL row */}
        {loading ? (
          <p className="w-full text-center text-sm text-gray-500">
            공유 링크를 준비 중입니다…
          </p>
        ) : error ? (
          <p className="w-full text-center text-sm text-red-600">{error}</p>
        ) : url ? (
          <div className="flex items-center gap-3 mb-4">
            <span
              className={`shrink-0 text-body1 tracking-wide ${theme.urlLabel}`}
            >
              URL
            </span>

            <div
              className={`flex-1 truncate uppercase tracking-tight px-3 py-1 text-body1 rounded-lg border ${theme.urlBoxText} ${theme.urlBoxBg} ${theme.urlBoxBorder}`}
            >
              {url}
            </div>

            <button
              onClick={handleCopy}
              className={`shrink-0 text-body1 tracking-wide px-3 py-1 rounded-lg border transition-colors ${theme.copyBtn}`}
            >
              COPY
            </button>
          </div>
        ) : (
          <p className="text-sm text-gray-500">
            공유 링크가 없습니다. 다시 시도해 주세요.
          </p>
        )}

        {/* round buttons */}
        <div className="mt-6 flex items-center justify-center gap-8">
          <CircleBtn
            label="f"
            borderClass={theme.circleBorder}
            textClass={`text-h7 ${theme.circleText}`}
            hoverClass={theme.circleHover}
          />
          <CircleBtn
            label="kakao"
            borderClass={theme.circleBorder}
            textClass={`text-caption tracking-tight ${theme.circleText}`}
            hoverClass={theme.circleHover}
          />
          <CircleBtn
            label="X"
            borderClass={theme.circleBorder}
            textClass={`text-h7 ${theme.circleText}`}
            hoverClass={theme.circleHover}
          />
          <CircleBtn
            label="mail"
            borderClass={theme.circleBorder}
            textClass={`text-caption ${theme.circleText}`}
            hoverClass={theme.circleHover}
          />
        </div>

        {/* copied toast */}
        {copied && (
          <div
            className={`absolute left-1/2 -translate-x-1/2 bottom-16 rounded-full px-4 py-1 text-sm shadow ${theme.toastBg} ${theme.toastText}`}
          >
            링크가 복사되었습니다!
          </div>
        )}
      </div>
    </div>
  );
}

function CircleBtn({
  label,
  textClass = "text-body1",
  borderClass = "border-white/80",
  hoverClass = "hover:bg-white/10",
}) {
  return (
    <div
      className={`cursor-pointer flex items-center justify-center w-10 h-10 rounded-full border-2 select-none transition-colors ${borderClass} ${hoverClass} ${textClass}`}
      title={label}
    >
      {label}
    </div>
  );
}
