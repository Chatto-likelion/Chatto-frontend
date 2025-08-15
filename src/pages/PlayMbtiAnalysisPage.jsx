import React, { useState } from "react";
import {
  Header,
  ChatList,
  FileUpload,
  SmallServices,
  DetailForm,
} from "@/components";

import * as Icons from "@/assets/svg/index.js";
import MbtiPieChart from "@/components/MbtiPieChart";
import MbtiReportCard from "@/components/MbtiReportCard";
import { useNavigate } from "react-router-dom";
import { useChat } from "@/contexts/ChatContext";

// -------------------- 더미 데이터 --------------------
const MOCK = {
  message_count: 1342,
  participant_count: 7,
  analysis_date: "처음부터 마지막까지",
  pairName: "MBTI - n명 pair",
  traits: [
    { leftLabel: "I", rightLabel: "E", leftPct: 72, rightPct: 28 },
    { leftLabel: "S", rightLabel: "N", leftPct: 72, rightPct: 28 },
    { leftLabel: "T", rightLabel: "F", leftPct: 72, rightPct: 28 },
    { leftLabel: "J", rightLabel: "P", leftPct: 72, rightPct: 28 },
  ],
  mbti_stats: [
    { type: "INFJ", value: 12 },
    { type: "ENFP", value: 9 },
    { type: "ISTJ", value: 7 },
    { type: "ISFJ", value: 6 },
    { type: "INTJ", value: 6 },
    { type: "INFP", value: 5 },
    { type: "ENTP", value: 5 },
    { type: "ENFJ", value: 5 },
    { type: "ISTP", value: 4 },
    { type: "ISFP", value: 4 },
    { type: "INTP", value: 4 },
    { type: "ESTJ", value: 3 },
    { type: "ESFJ", value: 3 },
    { type: "ESTP", value: 3 },
    { type: "ESFP", value: 2 },
    { type: "ENTJ", value: 2 },
  ],
};

const REPORT_TABS = [
  { key: "jongin", label: "종인", type: "INFJ" },
  { key: "songin", label: "송인", type: "ENFP" },
  { key: "jeongin", label: "정인", type: "ISTJ" },
  { key: "jangin", label: "장인", type: "INTJ" },
  { key: "minji", label: "민지", type: "ISFJ" },
  { key: "minju", label: "민주", type: "ENFJ" },
  { key: "minjae", label: "민재", type: "ENTP" },
];

const specMock = {
  spec_personal_id: 1,
  spec_personal_name: "종인",
  mbti: "INFJ",
  intro: [
    "“말은 없지만, 말보다 더 많은 걸 말하는 사람”",
    "aka 단톡방의 철학가, 감정적 장인, 사라졌다 나타나면 명언 한 줄 톡 남기고 다시 사라지는 유령 마스터.",
    "단톡에서 조용하다고 존재감이 없는 게 아님. 오히려 존재감은 넘치는데, 실체가 없음.",
    "",
    "종인은 단톡방에서 말수는 적지만, 임팩트는 있는 캐릭터예요.",
    "항상 읽고 있지만 말은 거의 안 해요. 근데 이상하게…",
    "누가 갑자기 고민 상담을 시작하면? 종인 등장!",
    "갑자기 공감 + 분석 + 희망의 메시지 3콤보 날리고 다시 사라짐.",
    "",
    "단톡 내 포지션: 대화는 적지만, 핵심 정리 담당",
    "성향: 말 안 해도 다 보고 있음. 그리고 다 기억함.",
  ],
  features: [
    {
      name: "깊은 얘기에만 출몰",
      right: [
        "“배고파” “과제 뭐임” 이런 얘기엔 안 나옴.",
        "근데 “나 요즘 현타왔어” 한 마디 나오면 등장함.",
      ],
    },
    {
      name: "말 줄임은 있어도 뜻 줄임은 없음",
      right: [
        "대화 분량은 적지만, 의미량은 최상급.",
        "단톡 내 유일한 문장 보호 사용자.",
        "“…” “,” “그리고” 쓰는 사람 있으면 그게 종인임.",
      ],
    },
    {
      name: "대화 마무리는 명언 한 줄",
      right: [
        "항상 대화 끝에는 상황을 감싸는 명언 한 줄을 던짐.",
        "무슨 조별과제 톡방에서 나누는 말 맞냐고…",
      ],
    },
  ],
  moments: {
    INFJ: [
      "“그냥… 요즘 너한테 있어서 좀 걱정됐어.”",
      "→ 아무 말 안 했는데… 알아채는 능력.",
      "→ 이 말 한마디에 사람 멘탈 다잡고 졸업까지 달림.",
    ],
    I: [
      "“응 아니야. 그냥 내 생각이었어.”",
      "→ 이게 진짜 ‘그냥’일 리가 없음.",
      "→ 저 안에 수십 번의 자기검열, 시뮬레이션, 감정 확인 과정이 들어있음.",
    ],
    F: [
      "“..… 그런 얘기 듣고 너 힘들었겠다.”",
      "→ 사례 집요 MAX. 근데 그걸 너무 담담하게 말해서",
      "→ 듣는 사람은 감동받고 갑자기 울컥함",
    ],
    N: {
      tag: "N 모먼트",
      lines: [
        "“그 말 뒤에 어떤 의미가 있었던 걸까…?”",
        "→ 대화보다 대화의 맥락을 읽는 사람",
        "→ “뭐 먹을래?”에도 철학적 고민을 곁들임",
      ],
    },
    J: {
      tag: "J 모먼트",
      lines: [
        "“우선 이거부터 정리하자. 그리고 그다음엔 이걸 하자.”",
        "→ 감정적 상담가 같았더니…",
        "→ 알고 보면 조별과제 계획표 최종본도 혼자 다 짜놓는 사람",
      ],
    },
  },
};

// -------------------- 페이지 컴포넌트 --------------------
export default function PlayMbtiAnalysisPage() {
  const [relation, setRelation] = useState("동아리 부원");
  const [situation, setSituation] = useState("일상대화");
  const [startPeriod, setStartPeriod] = useState("처음부터");
  const [endPeriod, setEndPeriod] = useState("끝까지");
  const [activeTab, setActiveTab] = useState(REPORT_TABS[0].key);

  return (
    <div className="min-h-screen bg-primary-dark text-white">
      <Header />
      <div className="mx-auto w-[1352px] mt-[70px] flex gap-6 items-start">
        {/* 왼쪽 */}
        <div className="gap-5 mt-[210px] w-[214px] flex flex-col items-center justify-center">
          <ChatList />
          <FileUpload />
        </div>

        {/* 가운데 */}
        <main className="pt-24 pb-24 w-[722px] flex flex-col gap-6">
          {/* 상단 통계 */}

          <div className="flex flex-col justify-between">
            <div>
              <span className="text-st1 pb-30">MBTI 통계</span>
            </div>
            <div className="text-st2 text-left">
              <p>분석된 메시지 수: {MOCK.message_count.toLocaleString()}개</p>
              <p>분석 대상: {MOCK.participant_count}명</p>
              <p>분석 기간: {MOCK.analysis_date}</p>
            </div>
          </div>

          {/* MBTI 통계(왼쪽 도넛, 오른쪽 페어바) */}
          <Section title="MBTI 통계">
            <div className="grid gap-20 sm:grid-cols-[220px_1fr] items-center w-full">
              <MbtiPieChart data={MOCK.mbti_stats} size={220} />
              <div className="space-y-4">
                {MOCK.traits.map((t, idx) => (
                  <PairBar
                    key={idx}
                    leftLabel={t.leftLabel}
                    rightLabel={t.rightLabel}
                    left={t.leftPct}
                    right={t.rightPct}
                  />
                ))}
              </div>
            </div>
          </Section>

          {/* 탭 바 */}
          <div>
            <TabBar
              tabs={REPORT_TABS}
              active={activeTab}
              onChange={setActiveTab}
            />

            {/* 리포트 카드 */}
            <MbtiReportCard spec={specMock} />
          </div>
        </main>

        {/* 오른쪽 */}
        <div className="w-[214px] mt-52.5 flex flex-col items-center justify-start gap-4">
          <div className="w-full py-4 px-1 border border-secondary-light rounded-lg">
            <DetailForm
              isAnalysis
              relation={relation}
              setRelation={setRelation}
              situation={situation}
              setSituation={setSituation}
              startPeriod={startPeriod}
              setStartPeriod={setStartPeriod}
              endPeriod={endPeriod}
              setEndPeriod={setEndPeriod}
            />
            <button className="mt-6 w-19.75 h-8.5 hover:bg-secondary hover:text-primary-dark px-3 py-2 text-button border border-secondary rounded-lg">
              다시 분석
            </button>
          </div>
          <div className="w-full h-[170px] p-3.75 border border-secondary-light rounded-lg text-primary-light">
            <SmallServices />
          </div>
        </div>
      </div>
      <Icons.Chatto className="w-18.75 h-29.75 text-primary-light fixed bottom-5 right-12" />
    </div>
  );
}

/* -------------------- 하위 UI 컴포넌트 -------------------- */
function Panel({ children, className = "" }) {
  return (
    <section className={`rounded-lg border border-white/10 p-4 ${className}`}>
      {children}
    </section>
  );
}

function Section({ title, children }) {
  return (
    <section className="rounded-lg border border-white/10 p-5 sm:p-6 w-full">
      <h2 className="mb-4 text-base font-semibold tracking-wide">
        <span className="inline-block border-t-2 border-[#F6DE8D] pt-1">
          {title}
        </span>
      </h2>
      {children}
    </section>
  );
}

function TabBar({ tabs, active, onChange }) {
  return (
    <div className="flex flex-wrap justify-center gap-8 overflow-x-auto scrollbar-hide">
      {tabs.map((t) => {
        const isActive = t.key === active;
        return (
          <button
            key={t.key}
            onClick={() => onChange(t.key)}
            className={[
              "h-9 px-4 rounded-md border text-sm transition-colors duration-150",
              isActive
                ? "bg-[#EADFAE] text-primary-dark border-[#EADFAE]"
                : "bg-transparent text-white/90 border-white/30 hover:bg-white/10",
            ].join(" ")}
          >
            {t.label}
          </button>
        );
      })}
    </div>
  );
}

function PairBar({ leftLabel, rightLabel, left, right }) {
  const L = clamp(left);
  const R = 100 - L;
  const CREAM = "#FFF8DE";
  return (
    <div className="grid grid-cols-[18px_1fr_18px] items-center gap-6">
      <span className="text-base">{leftLabel}</span>
      <div className="w-full">
        <div
          className="grid h-[30px]"
          style={{ gridTemplateColumns: `${L}% ${R}%` }}
        >
          <div className="relative" style={{ backgroundColor: CREAM }}>
            <span
              className="absolute inset-0 flex items-center justify-center text-[15px] font-medium"
              style={{ color: "#3A2E59" }}
            >
              {L}%
            </span>
          </div>
          <div
            className="relative"
            style={{
              border: `1px solid ${CREAM}`,
              backgroundColor: "transparent",
            }}
          >
            <span className="absolute inset-0 flex items-center justify-center text-[15px] font-medium">
              {R}%
            </span>
          </div>
        </div>
      </div>
      <span className="text-base text-right">{rightLabel}</span>
    </div>
  );
}

/* utils */
function clamp(n) {
  const x = Number(n) || 0;
  return Math.max(0, Math.min(100, Math.round(x)));
}
