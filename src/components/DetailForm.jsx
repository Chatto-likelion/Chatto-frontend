// src/components/DetailForm/index.jsx
import {
  useEffect,
  useMemo,
  useRef,
  useState,
  Children,
  cloneElement,
  isValidElement,
} from "react";
import useCurrentMode from "@/hooks/useCurrentMode";

// 서비스 타입 상수
const TYPE = { CHEMI: 1, SOME: 2, MBTI: 3 };

export default function DetailForm({
  type,
  value,
  onChange,
  isAnalysis = false,
  loading = false,
}) {
  const mode = useCurrentMode();
  const isPlay = mode === "play";

  const ui = useMemo(
    () => ({
      ww: isAnalysis ? "" : "w-76",
      w: isAnalysis ? "w-20" : "w-30.75",
      gap: isAnalysis ? "gap-5" : "gap-23",
      text: isAnalysis ? "text-body2" : "text-st1",
      isPlay,
    }),
    [isAnalysis, isPlay]
  );

  const Form = useMemo(() => {
    // business 모드(= !isPlay)에서 type=1이면 ContrForm 사용
    if (!isPlay && type === TYPE.CHEMI) return ContrForm;

    const map = {
      [TYPE.CHEMI]: ChemiForm,
      [TYPE.SOME]: SomeForm,
      [TYPE.MBTI]: MbtiForm,
    };
    return map[type] || ChemiForm;
  }, [isPlay, type]);

  if (loading) {
    return (
      <div
        className={`${ui.ww} ${ui.text} flex items-center justify-center gap-2 py-6`}
      >
        <span
          className={`inline-block w-5 h-5 rounded-full border-2 ${
            isPlay ? "border-secondary-light" : "border-primary"
          } border-t-transparent animate-spin`}
        />
        <span className={ui.text}>
          {isAnalysis ? "퀴즈 생성 중..." : "분석 중..."}
        </span>
      </div>
    );
  }

  return (
    <Form value={value} onChange={onChange} ui={ui} isAnalysis={isAnalysis} />
  );
}

/* ---------------- 공용 UI 유틸 ---------------- */

function Row({
  label,
  ui,
  children,
  rightWrapClass = "pr-3.25",
  narrow = false,
}) {
  const mode = useCurrentMode();
  const isPlay = mode === "play";
  const enhancedChildren = Children.map(children, (child) => {
    if (!isValidElement(child)) return child;

    const value = child.props?.value;
    const placeholderText = child.props?.placeholder ?? "입력 안 함";

    const isPlaceholder =
      value === placeholderText ||
      (typeof value === "string" && value.trim() === placeholderText);

    if (!isPlaceholder) return child;

    const mergedClassName = [
      child.props.className,
      isPlay ? "text-white/50" : "text-primary-dark/50",
    ]
      .filter(Boolean)
      .join(" ");

    return cloneElement(child, { className: mergedClassName });
  });

  return (
    <div className={`${ui.text} flex flex-col gap-3`}>
      <div className={`w-full ${ui.gap} flex justify-end items-center`}>
        <p className={narrow ? "tracking-tight" : ""}>{label}</p>
        <div
          className={`${ui.w} ${rightWrapClass} flex justify-end items-center`}
        >
          {enhancedChildren}
        </div>
      </div>
    </div>
  );
}

function OptionSelect({
  value,
  onChange,
  options,
  className = "",
  placeholderValue = "입력 안 함",
}) {
  const mode = useCurrentMode();
  const isPlay = mode === "play";
  const selected = options.includes(value) ? value : options[0] ?? "";
  const isPlaceholder = selected === placeholderValue;

  return (
    <select
      className={`${className} ${
        isPlaceholder && (isPlay ? "text-white/50" : "text-primary-dark/50")
      }`}
      value={selected}
      onChange={(e) => onChange(e.target.value)}
    >
      {options.map((opt) => (
        <option key={opt} value={opt}>
          {opt}
        </option>
      ))}
    </select>
  );
}

/** 한글 조합 지원 + Enter=커밋, Esc=되돌리기, Blur=커밋 */
function TextInput({
  value,
  onCommit,
  className = "",
  placeholder = "입력 안 함",
}) {
  const [draft, setDraft] = useState(value ?? "");
  const [prev, setPrev] = useState(value ?? "");
  const [composing, setComposing] = useState(false);
  const ref = useRef(null);

  // 외부 value 변경 동기화
  useEffect(() => {
    setDraft(value ?? "");
    setPrev(value ?? "");
  }, [value]);

  const handleKeyDown = (e) => {
    if (composing) return; // 조합 중 Enter 무시
    if (e.key === "Enter") {
      onCommit(draft.trim());
      e.currentTarget.blur();
    } else if (e.key === "Escape") {
      setDraft(prev);
      e.currentTarget.blur();
    }
  };

  const handleBlur = () => {
    // 변경이 있으면 커밋
    if ((draft ?? "") !== (prev ?? "")) {
      onCommit(draft.trim());
    }
  };

  return (
    <input
      ref={ref}
      type="text"
      className={className}
      value={draft}
      placeholder={placeholder}
      onChange={(e) => setDraft(e.target.value)}
      onKeyDown={handleKeyDown}
      onBlur={handleBlur}
      onCompositionStart={() => setComposing(true)}
      onCompositionEnd={() => setComposing(false)}
    />
  );
}

// DateInline: YY.MM.DD 포맷 + 수동입력(YY.MM.DD) + 캘린더 버튼 + 바깥클릭 닫기
function DateInline({ ui, value, onChange, placeholder, quick }) {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState("");
  const wrapRef = useRef(null);

  const isSpecial = value === "처음부터" || value === "끝까지";
  const isPlay = !!ui?.isPlay;

  const textColor = isPlay ? "text-white" : "text-primary-dark";
  const mutedTextColor = isPlay ? "text-white/50" : "text-primary-dark/50";
  const modalBgColor = isPlay ? "bg-primary-dark" : "bg-white";
  const modalTextColor = isPlay ? "text-white" : "text-primary-dark";
  const borderColor = isPlay
    ? "border-secondary-light focus:border-secondary"
    : "border-primary-light focus:border-primary";
  const inputBorderLine = isPlay
    ? "border-secondary-light focus:border-secondary"
    : "border-primary-light focus:border-primary";
  const buttonHover = isPlay
    ? "hover:bg-secondary hover:text-primary-dark"
    : "hover:bg-primary-dark hover:text-white";

  const normalize = (val) => {
    if (!val || val === "처음부터" || val === "끝까지") return "";
    if (/^\d{4}-\d{2}-\d{2}$/.test(val)) return val;
    const d = new Date(val);
    if (!isNaN(d.getTime())) {
      const y = d.getFullYear();
      const m = String(d.getMonth() + 1).padStart(2, "0");
      const day = String(d.getDate()).padStart(2, "0");
      return `${y}-${m}-${day}`;
    }
    return "";
  };

  const formatYYMMDD = (ymd) => {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(ymd)) return "";
    const [Y, M, D] = ymd.split("-");
    const yy = Y.slice(2);
    return `${yy}.${M}.${D}`;
  };

  const display = isSpecial ? value : formatYYMMDD(normalize(value));

  useEffect(() => {
    if (open) setDraft(normalize(value));
  }, [open, value]);

  const apply = (val) => {
    onChange(val);
    setOpen(false);
  };
  const cancel = () => {
    setDraft(normalize(value));
    setOpen(false);
  };

  useEffect(() => {
    if (!open) return;
    const onOutside = (e) => {
      if (!wrapRef.current?.contains(e.target)) apply(draft || "");
    };
    document.addEventListener("pointerdown", onOutside);
    return () => document.removeEventListener("pointerdown", onOutside);
  }, [open, draft]);

  return (
    <div className="w-full relative" ref={wrapRef}>
      <input
        className={`${
          ui.text
        } text-end w-full bg-transparent outline-none border-b ${inputBorderLine} ${
          isSpecial ? mutedTextColor : textColor
        }`}
        value={display || ""}
        readOnly
        onKeyDown={(e) => {
          if (e.key === "ArrowDown") setOpen(true);
          if (e.key === "Escape") cancel();
        }}
        onClick={() => setOpen(true)}
        placeholder={placeholder}
      />
      {open && (
        <div
          className={`absolute z-20 right-0 mt-2 p-3 rounded-lg border ${borderColor} ${modalBgColor} ${modalTextColor} shadow-lg`}
          onPointerDown={(e) => e.stopPropagation()}
        >
          <div className="flex justify-between items-center gap-2">
            {/* 네이티브 캘린더 */}
            <input
              type="date"
              className={`bg-transparent rounded px-2 py-1 border ${inputBorderLine} ${textColor}`}
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") apply(draft || "");
                if (e.key === "Escape") cancel();
              }}
            />
            {quick === "start" && (
              <button
                className={`w-17 px-2 py-1 text-button border ${borderColor} rounded ${buttonHover}`}
                onClick={() => apply("처음부터")}
              >
                처음부터
              </button>
            )}
            {quick === "end" && (
              <button
                className={`w-15 px-2 py-1 text-button border ${borderColor} rounded ${buttonHover}`}
                onClick={() => apply("끝까지")}
              >
                끝까지
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

/* --- 교체: 시작/끝을 각각 다른 줄로 --- */
function PeriodRows({ ui, start, end, onChangeStart, onChangeEnd }) {
  const isPlay = !!ui?.isPlay;
  const textColor = isPlay ? "text-white" : "text-primary-dark";
  const mutedTextColor = isPlay ? "text-white/50" : "text-primary-dark/50";

  const isSpecial =
    (typeof start === "string" && start !== "처음부터") ||
    (typeof end === "string" && end !== "끝까지");

  return (
    <>
      {/* 1줄: '분석기간' + 시작 */}
      <div className={`${ui.text} flex flex-col gap-3`}>
        <div className={`w-full ${ui.gap} flex justify-end items-center`}>
          <p className={`${textColor}`}>분석기간</p>
          <div className={`${ui.w} flex justify-end items-center`}>
            <DateInline
              ui={ui}
              value={start}
              onChange={onChangeStart}
              placeholder="처음부터"
              quick="start"
            />
            <p className={`ml-1 ${isSpecial ? textColor : mutedTextColor}`}>
              ~
            </p>
          </div>
        </div>
      </div>
      {/* 2줄: 라벨 공간 비우고 끝 */}
      <div className={`${ui.text} flex flex-col gap-3`}>
        <div className={`w-full ${ui.gap} flex justify-end items-center`}>
          <p className={`opacity-0 select-none ${textColor}`}>분석기간</p>
          <div className={`${ui.w} flex justify-end items-center pr-3.25`}>
            <DateInline
              ui={ui}
              value={end}
              onChange={onChangeEnd}
              placeholder="끝까지"
              quick="end"
            />
          </div>
        </div>
      </div>
    </>
  );
}

/* ---------------- 타입별 서브폼들 (같은 파일 내) ---------------- */

function ChemiForm({ value, onChange, ui }) {
  return (
    <div className={`${ui.ww} ${ui.text} flex flex-col gap-3`}>
      <Row label="참여자 관계" ui={ui}>
        <TextInput
          className={`${ui.text} text-end w-full bg-transparent outline-none border-b border-secondary/50 focus:border-secondary`}
          value={value.relationship}
          onCommit={(v) => onChange({ relationship: v })}
          placeholder="입력 안 함"
        />
      </Row>

      <Row label="대화 상황" ui={ui}>
        <TextInput
          className={`${ui.text} text-end w-full bg-transparent outline-none border-b border-secondary/50 focus:border-secondary`}
          value={value.situation}
          onCommit={(v) => onChange({ situation: v })}
          placeholder="입력 안 함"
        />
      </Row>

      <PeriodRows
        ui={ui}
        start={value.analysis_start}
        end={value.analysis_end}
        onChangeStart={(v) => onChange({ analysis_start: v })}
        onChangeEnd={(v) => onChange({ analysis_end: v })}
      />
    </div>
  );
}

function SomeForm({ value, onChange, ui }) {
  return (
    <div className={`${ui.ww} ${ui.text} flex flex-col gap-3`}>
      <Row label="참여자 관계" ui={ui}>
        <TextInput
          className={`${ui.text} text-end w-full bg-transparent outline-none border-b border-secondary/50 focus:border-secondary`}
          value={value.relationship}
          onCommit={(v) => onChange({ relationship: v })}
          placeholder="입력 안 함"
        />
      </Row>

      <Row label="연령대" ui={ui}>
        <OptionSelect
          className={`${ui.text} text-end w-full bg-transparent outline-none border-b border-secondary/50 focus:border-secondary appearance-none`}
          value={value.age}
          onChange={(v) => onChange({ age: v })}
          options={[
            "입력 안 함",
            "10대",
            "20대 초반",
            "20대 중반",
            "20대 후반",
            "30대 초반",
            "그 외",
          ]}
        />
      </Row>

      <PeriodRows
        ui={ui}
        start={value.analysis_start}
        end={value.analysis_end}
        onChangeStart={(v) => onChange({ analysis_start: v })}
        onChangeEnd={(v) => onChange({ analysis_end: v })}
      />
    </div>
  );
}

function MbtiForm({ value, onChange, ui }) {
  return (
    <div className={`${ui.ww} ${ui.text} flex flex-col gap-3`}>
      <PeriodRows
        ui={ui}
        start={value.analysis_start}
        end={value.analysis_end}
        onChangeStart={(v) => onChange({ analysis_start: v })}
        onChangeEnd={(v) => onChange({ analysis_end: v })}
      />
    </div>
  );
}

function ContrForm({ value, onChange, ui }) {
  return (
    <div className={`${ui.ww} ${ui.text} flex flex-col gap-3`}>
      <Row label="프로젝트 유형" ui={ui} narrow={true}>
        <TextInput
          className={`${ui.text} text-end w-full bg-transparent outline-none border-b border-primary-light focus:border-primary`}
          value={value.project_type}
          onCommit={(v) => onChange({ project_type: v })}
          placeholder="입력 안 함"
        />
      </Row>

      <Row label="팀 유형" ui={ui}>
        <OptionSelect
          className={`${ui.text} text-end w-full bg-transparent outline-none border-b border-primary-light focus:border-primary appearance-none`}
          value={value.team_type}
          onChange={(v) => onChange({ team_type: v })}
          options={[
            "입력 안 함",
            "수평적 팀원들",
            "팀장과 팀원들",
            "멘토들과 멘티들",
            "여러 직급",
          ]}
        />
      </Row>

      <PeriodRows
        ui={ui}
        start={value.analysis_start}
        end={value.analysis_end}
        onChangeStart={(v) => onChange({ analysis_start: v })}
        onChangeEnd={(v) => onChange({ analysis_end: v })}
      />
    </div>
  );
}
