// src/components/DetailForm/DetailFormReadOnly.jsx
import { useMemo } from "react";
import useCurrentMode from "@/hooks/useCurrentMode";
import { useKSTDateFormat } from "@/hooks/useKSTDateFormat";
import * as Icons from "@/assets/svg/index.js";

// 서비스 타입 상수 (원본과 동일)
const TYPE = { CHEMI: 1, SOME: 2, MBTI: 3 };

/** 읽기 전용 DetailForm */
export default function DetailForm_Share({ type, value, isAnalysis = true }) {
  const mode = useCurrentMode();
  const isPlay = mode === "play";
  const formatKST = useKSTDateFormat();

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

  // business 모드에서 type=CHEMI면 ContrForm 레이아웃
  const Form = useMemo(() => {
    if (!isPlay && type === TYPE.CHEMI) return ContrFormRO;
    const map = {
      [TYPE.CHEMI]: ChemiFormRO,
      [TYPE.SOME]: SomeFormRO,
      [TYPE.MBTI]: MbtiFormRO,
    };
    return map[type] || ChemiFormRO;
  }, [isPlay, type]);

  return (
    <>
      <div className="w-full pr-3 flex justify-start items-center mb-2">
        <p className="px-5 w-full text-center text-body1">
          {type == TYPE.MBTI
            ? "MBTI 분석"
            : type == TYPE.SOME
            ? "썸 판독기"
            : isPlay
            ? "케미 분석기"
            : "업무 참여도 분석"}
        </p>
      </div>
      <div className="w-47 h-8.5 px-2 py-1 mb-4 rounded flex justify-start items-center text-body1 text-primary-dark bg-secondary-light">
        <span className="w-36.5">{value.title}</span>
        <div className="flex items-center gap-0.5 text-primary-dark">
          <Icons.Person className="w-5.25 h-5.25 p-0.75" />
          <span>{value.people_num}</span>
        </div>
      </div>
      <Form value={value ?? {}} ui={ui} />
    </>
  );
}

/* ---------------- 공용 뷰 유틸 ---------------- */

/** 레이블/우측영역 레이아웃을 원본 Row와 동일하게 */
function RowView({ label, ui, children, rightWrapClass = "pr-3.25" }) {
  return (
    <div className={`${ui.text} flex flex-col gap-3`}>
      <div className={`w-full ${ui.gap} flex justify-end items-center`}>
        <p>{label}</p>
        <div
          className={`${ui.w} ${rightWrapClass} flex justify-end items-center`}
        >
          {children}
        </div>
      </div>
    </div>
  );
}

/** 일반 텍스트 표시(읽기 전용). placeholder면 흐린색 */
function DisplayText({
  value,
  placeholder = "입력 안 함",
  className = "",
  alignEnd = true,
  isPlay = true,
}) {
  const v = (value ?? "").toString().trim();
  const isPlaceholder = !v || v === placeholder;
  const color = isPlaceholder
    ? isPlay
      ? "text-white/50"
      : "text-primary-dark/50"
    : isPlay
    ? "text-white"
    : "text-primary-dark";

  return (
    <div
      className={[
        className,
        alignEnd ? "text-end" : "",
        "select-text cursor-text",
        color,
      ].join(" ")}
      title={v || placeholder}
    >
      {v || placeholder}
    </div>
  );
}

/** 날짜 표시(읽기 전용). 원본 DateInline의 표시 방식과 동일하게 포맷 */
function DateDisplay({ ui, value, placeholder }) {
  const isPlay = !!ui?.isPlay;
  const textColor = isPlay ? "text-white" : "text-primary-dark";
  const mutedTextColor = isPlay ? "text-white/50" : "text-primary-dark/50";
  const inputBorderLine = isPlay
    ? "border-secondary-light"
    : "border-primary-light";

  const isSpecial = !value || value === "처음부터" || value === "끝까지";

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

  const disp = isSpecial ? value : formatYYMMDD(normalize(value)) || "";

  return (
    <div
      className={[
        ui.text,
        "text-end w-full bg-transparent border-b select-text cursor-text",
        inputBorderLine,
        isSpecial ? mutedTextColor : textColor,
      ].join(" ")}
      title={disp || placeholder}
    >
      {disp || placeholder}
    </div>
  );
}

/* --- 시작/끝을 각각 다른 줄로(원본 PeriodRows와 동일 레이아웃) --- */
function PeriodRowsRO({ ui, start, end }) {
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
            <DateDisplay ui={ui} value={start} placeholder="처음부터" />
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
            <DateDisplay ui={ui} value={end} placeholder="끝까지" />
          </div>
        </div>
      </div>
    </>
  );
}

/* ---------------- 타입별 읽기 전용 서브폼 ---------------- */

function ChemiFormRO({ value, ui }) {
  return (
    <div className={`${ui.ww} ${ui.text} flex flex-col gap-3`}>
      <RowView label="참여자 관계" ui={ui}>
        <DisplayText
          value={value?.relationship}
          className={`${ui.text} text-end w-full bg-transparent border-b border-secondary/50`}
          isPlay={ui.isPlay}
        />
      </RowView>

      <RowView label="대화 상황" ui={ui}>
        <DisplayText
          value={value?.situation}
          className={`${ui.text} text-end w-full bg-transparent border-b border-secondary/50`}
          isPlay={ui.isPlay}
        />
      </RowView>

      <PeriodRowsRO
        ui={ui}
        start={value?.analysis_start}
        end={value?.analysis_end}
      />
    </div>
  );
}

function SomeFormRO({ value, ui }) {
  return (
    <div className={`${ui.ww} ${ui.text} flex flex-col gap-3`}>
      <RowView label="참여자 관계" ui={ui}>
        <DisplayText
          value={value?.relationship}
          className={`${ui.text} text-end w-full bg-transparent border-b border-secondary/50`}
          isPlay={ui.isPlay}
        />
      </RowView>

      <RowView label="연령대" ui={ui}>
        <DisplayText
          value={value?.age ?? "입력 안 함"}
          className={`${ui.text} text-end w-full bg-transparent border-b border-secondary/50`}
          isPlay={ui.isPlay}
        />
      </RowView>

      <PeriodRowsRO
        ui={ui}
        start={value?.analysis_start}
        end={value?.analysis_end}
      />
    </div>
  );
}

function MbtiFormRO({ value, ui }) {
  return (
    <div className={`${ui.ww} ${ui.text} flex flex-col gap-3`}>
      <PeriodRowsRO
        ui={ui}
        start={value?.analysis_start}
        end={value?.analysis_end}
      />
    </div>
  );
}

function ContrFormRO({ value, ui }) {
  return (
    <div className={`${ui.ww} ${ui.text} flex flex-col gap-3`}>
      <RowView label="프로젝트 유형" ui={ui}>
        <DisplayText
          value={value?.project_type}
          className={`${ui.text} text-end w-full bg-transparent border-b border-primary-light`}
          isPlay={ui.isPlay}
        />
      </RowView>

      <RowView label="팀 유형" ui={ui}>
        <DisplayText
          value={value?.team_type ?? "입력 안 함"}
          className={`${ui.text} text-end w-full bg-transparent border-b border-primary-light`}
          isPlay={ui.isPlay}
        />
      </RowView>

      <PeriodRowsRO
        ui={ui}
        start={value?.analysis_start}
        end={value?.analysis_end}
      />
    </div>
  );
}
