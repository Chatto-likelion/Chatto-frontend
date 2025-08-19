import { useParams } from "react-router-dom";
import { useEffect, useState, useMemo } from "react";
import { getMbtiGuestDetail } from "@/apis/api"; // 실제 API 호출 함수
import {
  Header,
  SmallServices,
  DetailForm_Share,
  MbtiPieChart,
  MbtiReportCard,
} from "@/components";
import { useNavigate } from "react-router-dom";
import * as Icons from "@/assets/svg/index.js";

const mbti_stats = [
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
];

export default function PlayMbtiSharePage() {
  const { uuid } = useParams(); // URL 파라미터 추출
  const navigate = useNavigate();
  const [resultData, setResultData] = useState(null);
  const [form, setForm] = useState({
    title: "",
    people_num: 0,
    is_quized: false,
    analysis_start: "처음부터",
    analysis_end: "끝까지",
  });
  const [activeTab, setActiveTab] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [quizLoading, setQuizLoading] = useState(true);
  const [quizAvailable, setQuizAvailable] = useState(false);

  useEffect(() => {
    let alive = true;
    setLoading(true);
    setQuizLoading(true);
    setQuizAvailable(false);

    (async () => {
      try {
        const detail = await getMbtiGuestDetail(uuid);
        if (!alive) return;

        setResultData(detail);
        setForm({
          title: detail.result.title,
          people_num: detail.result.people_num,
          is_quized: detail.result.is_quized,
          analysis_start: detail.result.analysis_date_start,
          analysis_end: detail.result.analysis_date_end,
        });

        setQuizAvailable(form.is_quized);
      } catch (err) {
        if (!alive) return;
        setError(err.message || "결과를 불러오지 못했습니다.");
      } finally {
        if (alive) {
          setLoading(false);
          setQuizLoading(false);
        }
      }
    })();

    return () => {
      alive = false;
    };
  }, [uuid]);

  const REPORT_TABS = useMemo(() => {
    const list = Array.isArray(resultData?.spec_personal)
      ? resultData.spec_personal
      : [];

    return list.filter(Boolean).map(({ specpersonal_id, name, MBTI }) => ({
      key: String(specpersonal_id), // TabBar 키로 사용 (문자열 추천)
      label: name ?? "", // 탭 표시 이름
      type: (MBTI ?? "").toUpperCase(), // 예: "infj"도 "INFJ"로
    }));
  }, [resultData?.spec_personal]);

  useEffect(() => {
    if (!REPORT_TABS.length) return;
    // 현재 activeTab이 목록에 없으면 첫 탭으로 세팅
    if (!REPORT_TABS.some((t) => t.key === activeTab)) {
      setActiveTab(REPORT_TABS[0].key);
    }
  }, [REPORT_TABS, activeTab]);

  const activeSpec = useMemo(() => {
    const list = Array.isArray(resultData?.spec_personal)
      ? resultData.spec_personal
      : [];
    if (!list.length) return null;

    // activeTab과 specpersonal_id 일치하는 항목 찾기 (문자/숫자 안전 비교)
    return (
      list.find((p) => String(p.specpersonal_id) === String(activeTab)) ||
      list[0]
    );
  }, [resultData?.spec_personal, activeTab]);

  const TRAITS = useMemo(() => {
    const s = resultData?.spec;
    if (!s) return [];

    const people = Math.max(1, (s.total_I ?? 0) + (s.total_E ?? 0));

    return [
      {
        leftLabel: "I",
        rightLabel: "E",
        leftPct: (s.total_I / people) * 100,
      },
      {
        leftLabel: "S",
        rightLabel: "N",
        leftPct: (s.total_S / people) * 100,
      },
      {
        leftLabel: "T",
        rightLabel: "F",
        leftPct: (s.total_T / people) * 100,
      },
      {
        leftLabel: "J",
        rightLabel: "P",
        leftPct: (s.total_J / people) * 100,
      },
    ];
  }, [resultData?.spec]);

  if (loading) return <p className="mt-44 text-sm">분석 중입니다...</p>;
  if (error) return <p className="mt-4 text-sm text-red-500">{error}</p>;
  if (!resultData) return null; // 방어: 혹시 모를 케이스

  const quizDisabled = loading || quizLoading || !quizAvailable;

  return (
    <div className="flex flex-col justify-start items-center h-screen text-white bg-primary-dark">
      <Header />
      <div className="relative flex-1 w-[1352px] mt-17.5 overflow-hidden flex justify-between items-start">
        {/* 왼쪽 */}
        <div className="gap-5 mt-52.5 w-53.5 flex flex-col items-center justify-center">
          <div className="w-full py-4 px-1 flex flex-col justify-center items-center border border-secondary-light rounded-lg">
            <DetailForm_Share
              type={2} // 1=chemi, 2=some, 3=mbti
              value={form}
              isAnalysis={true}
            />
          </div>
        </div>

        {/* 가운데 */}
        <main className="overflow-y-auto max-h-240 scrollbar-hide pt-28 w-[722px] flex flex-col justify-start items-center">
          {/* 결과 출력 */}
          {loading && <p className="mt-44 text-sm">분석 중입니다...</p>}
          {error && <p className="mt-4 text-sm text-red-500">{error}</p>}
          {/* 상단 통계 */}

          <div className="w-full mb-15 flex flex-col">
            <div className="text-h6 pb-6.5">
              <span>MBTI 통계</span>
            </div>
            <div className="pl-5 text-body1 text-left">
              <p>분석된 메시지 수: {resultData.result.num_chat}개</p>
              <p>
                분석 대상: {resultData.spec.total_I + resultData.spec.total_E}명
              </p>
              <p>
                분석 기간: {resultData.result.analysis_date_start} ~{" "}
                {resultData.result.analysis_date_end}
              </p>
            </div>
          </div>

          {/* MBTI 통계(왼쪽 도넛, 오른쪽 페어바) */}
          <Section title="MBTI 통계">
            <div className="w-full pl-10 gap-30 flex items-center">
              <MbtiPieChart data={mbti_stats} size={170} />
              <div className="space-y-4">
                {TRAITS.map((t, idx) => (
                  <PairBar
                    key={idx}
                    leftLabel={t.leftLabel}
                    rightLabel={t.rightLabel}
                    left={t.leftPct}
                  />
                ))}
              </div>
            </div>
          </Section>

          {/* 탭 바 */}
          <div className="mt-[51px] w-full">
            <TabBar
              tabs={REPORT_TABS}
              active={activeTab}
              onChange={setActiveTab}
            />

            {/* 리포트 카드 */}
            {activeSpec && <MbtiReportCard spec={activeSpec} />}
          </div>
        </main>

        {/* 오른쪽 */}
        <div className="w-[214px] mt-52.5 flex flex-col items-center justify-start gap-1.5">
          <div className="w-full flex justify-between items-center">
            {/* 퀴즈 버튼 with 비활성화 & 툴팁 */}
            <div className="relative group">
              <button
                onClick={() => navigate(`/play/quiz/${uuid}`)}
                disabled={quizDisabled}
                className={[
                  "w-20 h-8 cursor-pointer px-0.25 py-1 text-button border-2 rounded-lg transition-colors",
                  quizDisabled
                    ? "border-secondary/40 text-secondary/40 cursor-not-allowed"
                    : "border-secondary hover:bg-secondary hover:text-primary-dark",
                ].join(" ")}
              >
                퀴즈 풀기
              </button>
              {quizDisabled && (
                <div className="pointer-events-none absolute left-1/2 -translate-x-1/2 -bottom-6 opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="whitespace-nowrap text-[10px] leading-none px-2 py-1 rounded bg-primary-dark/80 text-secondary-light border border-secondary-light/30 shadow-sm">
                    {quizLoading
                      ? "퀴즈 확인 중…"
                      : "해당 결과에 퀴즈가 없습니다."}
                  </div>
                </div>
              )}
            </div>
            <button
              onClick={() => navigate("/about/")}
              disabled={loading}
              className="w-30 h-8 hover:bg-secondary hover:text-primary-dark cursor-pointer px-0.25 py-1 text-button border-2 border-secondary rounded-lg"
            >
              나도 분석해보기
            </button>
          </div>
          <div className="w-full h-[170px] mt-2 p-3.75 pb-4.5 border border-secondary-light rounded-lg text-primary-light">
            <SmallServices />
          </div>
        </div>
      </div>
      <Icons.Chatto className="w-18.75 h-29.75 text-primary-light fixed bottom-5 right-12" />
    </div>
  );
}

function Section({ title, children }) {
  return (
    <section className="rounded-lg border border-secondary-light pt-5 px-6 pb-10 w-full">
      <div className="mb-10 text-h6">
        <span className="inline-block border-t-2 border-secondary pt-1">
          {title}
        </span>
      </div>
      {children}
    </section>
  );
}

function TabBar({ tabs, active, onChange }) {
  return (
    <div className="w-full px-4 flex flex-wrap justify-between gap-8 overflow-x-auto scrollbar-hide">
      {tabs.map((t) => {
        const isActive = t.key === active;
        return (
          <button
            key={t.key}
            onClick={() => onChange(t.key)}
            className={[
              "h-9 px-4 rounded-t-md border text-sm transition-colors duration-150",
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

function PairBar({ leftLabel, rightLabel, left }) {
  const L = clamp(left);
  const R = 100 - L;
  return (
    <div className="w-[256px] grid grid-cols-[18px_1fr_18px] items-center gap-4">
      <span className="text-body1 text-gray-2">{leftLabel}</span>
      <div className="w-[203px]">
        <div
          className="grid h-[28px]"
          style={{ gridTemplateColumns: `${L}% ${R}%` }}
        >
          <div className="relative bg-secondary-light">
            <span className="absolute inset-0 flex items-center justify-center text-body1 text-primary-dark">
              {L}%
            </span>
          </div>
          <div className="relative border border-secondary-light bg-transparent">
            <span className="absolute inset-0 flex items-center justify-center text-body1">
              {R ? `${R}%` : ""}
            </span>
          </div>
        </div>
      </div>
      <span className="text-body1 text-gray-2">{rightLabel}</span>
    </div>
  );
}

/* utils */
function clamp(n) {
  const x = Number(n) || 0;
  return Math.max(0, Math.min(100, Math.round(x)));
}
