// PlayMbtiAnalysisPage.jsx
import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { getMbtiAnalysisDetail } from "@/apis/api";
import {
  Header,
  ChatList,
  FileUpload,
  SmallServices,
  DetailForm,
} from "@/components";
import * as Icons from "@/assets/svg/index.js";
import MbtiPieChart from "@/components/MbtiPieChart";
import { useChat } from "@/contexts/ChatContext";

/* -------------------- 더미 데이터 -------------------- */
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

/* -------------------- 하위 UI 컴포넌트 -------------------- */
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

// -------------------- 페이지 컴포넌트 --------------------
export default function PlayMbtiAnalysisPage() {
  const { resultId } = useParams();
  const { setSelectedChatId } = useChat();

  const [relation, setRelation] = useState("동아리 부원");
  const [situation, setSituation] = useState("일상대화");
  const [startPeriod, setStartPeriod] = useState("처음부터");
  const [endPeriod, setEndPeriod] = useState("끝까지");

  const [resultData, setResultData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  /* 데이터 로딩 */
  useEffect(() => {
    let alive = true;
    const fetchResult = async () => {
      try {
        if (!resultId) {
          // 데모: resultId 없으면 목데이터
          if (!alive) return;
          setResultData(MOCK);
          setSelectedChatId(null);
          return;
        }
        const data = await getMbtiAnalysisDetail(resultId);
        if (!alive) return;
        setResultData(data?.result ?? null);
        setSelectedChatId(data?.result?.chat ?? null);
      } catch (err) {
        if (!alive) return;
        setError(err?.message || "결과를 불러오지 못했습니다.");
      } finally {
        if (alive) setLoading(false);
      }
    };
    fetchResult();
    return () => {
      alive = false;
    };
  }, [resultId, setSelectedChatId]);

  if (loading)
    return (
      <p className="text-white bg-primary-dark min-h-screen flex items-center justify-center">
        결과를 불러오는 중...
      </p>
    );
  if (error)
    return (
      <p className="text-red-400 bg-primary-dark min-h-screen flex items-center justify-center">
        {error}
      </p>
    );

  const stats = resultData || MOCK;

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
              <p>
                분석된 메시지 수: {Number(stats.message_count).toLocaleString()}
                개
              </p>
              <p>분석 대상: {stats.participant_count}명</p>
              <p>분석 기간: {stats.analysis_date}</p>
            </div>
          </div>

          {/* MBTI 통계(왼쪽 도넛, 오른쪽 페어바) */}
          <Section title="MBTI 통계">
            <div className="grid gap-20 sm:grid-cols-[220px_1fr] items-center w-full">
              <MbtiPieChart
                data={stats.mbti_stats ?? MOCK.mbti_stats}
                size={220}
              />
              <div className="space-y-4">
                {(stats.traits ?? MOCK.traits).map((t, idx) => (
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

          {/* 디버그/개발용 블럭: 안전 접근 */}
          <div className="w-full h-350 mb-20 p-4 gap-5 flex flex-col justify-start items-start border border-secondary-light rounded-lg text-body2 whitespace-pre-line">
            <div>
              <h1>MBTI 결과 페이지</h1>
              <p>결과 ID: {resultId || "(demo)"}</p>
              <p>content: {String(resultData?.content ?? "-")}</p>
              <p>is_saved: {String(resultData?.is_saved ?? false)}</p>
              <p>
                analysis_date_start: {resultData?.analysis_date_start ?? "-"}
              </p>
              <p>analysis_date_end: {resultData?.analysis_date_end ?? "-"}</p>
              <p>
                analysis_date:{" "}
                {resultData?.analysis_date ?? stats.analysis_date}
              </p>
              <p>chat: {String(resultData?.chat ?? "-")}</p>
            </div>
          </div>
        </main>

        {/* 오른쪽 */}
        <div className="w-[214px] mt-52.5 flex flex-col items-center justify-start gap-4">
          <div className="w-full py-4 px-1 flex flex-col justify-center items-center border border-secondary-light rounded-lg">
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
            <button
              onClick={() => {}}
              className="mt-6 w-19.75 h-8.5 hover:bg-secondary hover:text-primary-dark px-3 py-2 text-button border border-secondary rounded-lg"
            >
              다시 분석
              <Icons.Search className="w-2.5 h-2.5" />
            </button>
          </div>
          <div className="w-full flex justify-between items-center">
            <button className="w-16 h-8.5 hover:bg-secondary hover:text-primary-dark cursor-pointer px-0.25 py-2 text-button border border-secondary rounded-lg">
              결과 공유
            </button>
            <button className="w-16 h-8.5 hover:bg-secondary hover:text-primary-dark cursor-pointer px-0.25 py-2 text-button border border-secondary rounded-lg">
              결과 저장
            </button>
            <button className="w-16 h-8.5 hover:bg-secondary hover:text-primary-dark cursor-pointer px-0.25 py-2 text-button border border-secondary rounded-lg">
              퀴즈 생성
            </button>
          </div>
          <div className="w-full h-[170px] p-3.75 pb-4.5 border border-secondary-light rounded-lg text-primary-light">
            <SmallServices />
          </div>
        </div>
      </div>
      <Icons.Chatto className="w-18.75 h-29.75 text-primary-light fixed bottom-5 right-12" />
    </div>
  );
}
