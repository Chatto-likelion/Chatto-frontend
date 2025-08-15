// PlaySomeAnalysisPage.jsx
import { useParams, useSearchParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { getSomeAnalysisDetail } from "@/apis/api"; // 실제 연결 시 사용
import {
  Header,
  ChatList,
  FileUpload,
  SmallServices,
  DetailForm,
} from "@/components";
import { useChat } from "@/contexts/ChatContext";
import * as Icons from "@/assets/svg/index.js";

/* -------------------- 작은 UI 컴포넌트 -------------------- */
function Panel({ title, children, className = "" }) {
  return (
    <section
      className={`rounded-lg border border-secondary-light/70 bg-white/5 p-4 ${className}`}
    >
      {title && (
        <h3 className="mb-3 text-sm font-semibold tracking-wide text-white/90">
          {title}
        </h3>
      )}
      {children}
    </section>
  );
}
function Section({ title, children }) {
  return (
    <section className="rounded-lg border border-secondary-light/70 bg-white/5 p-5 sm:p-6 w-full">
      <h2 className="mb-4 text-base font-semibold tracking-wide">{title}</h2>
      {children}
    </section>
  );
}
function Meter({ value = 0 }) {
  const v = Math.max(0, Math.min(100, value));
  return (
    <div className="h-3 w-full rounded-full bg-white/10 overflow-hidden">
      <div
        className="h-full bg-gradient-to-r from-white/70 to-white"
        style={{ width: `${v}%` }}
      />
    </div>
  );
}
function MeterRow({ label, leftLabel, rightLabel, value, example }) {
  return (
    <div className="space-y-2">
      <div className="flex items-end justify-between">
        <p className="text-sm text-white/80">{label}</p>
        <p className="text-xs text-white/60">
          {leftLabel} <span className="mx-2 text-white/40">|</span> {rightLabel}
        </p>
      </div>
      <Meter value={value} />
      {example && (
        <p className="text-sm text-white/70 leading-6">예시: {example}</p>
      )}
    </div>
  );
}
function CompareBar({ title, left, right }) {
  const total = (left?.value ?? 0) + (right?.value ?? 0) || 1;
  const l = Math.round(((left?.value ?? 0) / total) * 100);
  const r = 100 - l;
  return (
    <div className="space-y-2">
      <div className="flex items-end justify-between">
        <p className="text-sm text-white/80">{title}</p>
        <p className="text-xs text-white/60">
          {left?.label} vs {right?.label}
        </p>
      </div>
      <div className="h-3 w-full overflow-hidden rounded-full bg-white/10">
        <div className="flex h-full w-full">
          <div className="h-full bg-white/80" style={{ width: `${l}%` }} />
          <div className="h-full bg-white/30" style={{ width: `${r}%` }} />
        </div>
      </div>
      <div className="flex justify-between text-xs text-white/70">
        <span>{left?.desc}</span>
        <span>{right?.desc}</span>
      </div>
    </div>
  );
}

/* -------------------- 데모 목데이터 -------------------- */
const MOCK = {
  score: 82,
  message_count: 1342,
  participant_count: 23,
  analysis_date: "처음부터 끝까지",
  one_line:
    "웃음과 공감이 늘어난 안정적 호흡! 지금은 ‘다음 약속’ 확정이 먼저입니다.",
  signal_count: 76,
  tone_score: 75,
  emotion_score: 74,
  nickname_score: 76,
  proposal_count_you: 3,
  proposal_count_partner: 1,
  topic_start_ratio_you: 62,
  topic_start_ratio_partner: 38,
  avg_len_you: 38,
  avg_len_partner: 62,
  chat: null,
};

export default function PlaySomeAnalysisPage() {
  const { resultId } = useParams();
  const [searchParams] = useSearchParams();
  const isDemo = searchParams.get("demo") === "1" || !resultId; // resultId 없으면 자동 데모
  const { setSelectedChatId } = useChat();
  const navigate = useNavigate();

  const [relation, setRelation] = useState("동아리 부원");
  const [situation, setSituation] = useState("일상대화");
  const [startPeriod, setStartPeriod] = useState("처음부터");
  const [endPeriod, setEndPeriod] = useState("끝까지");

  const [resultData, setResultData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // 상단 카드에서 쓰는 보조 값
  const score = (resultData && resultData.score) ?? MOCK.score;
  const messageCount =
    (resultData && resultData.message_count) ?? MOCK.message_count;
  const participantCount =
    (resultData && resultData.participant_count) ?? MOCK.participant_count;
  const periodText =
    (resultData &&
    resultData.analysis_date_start &&
    resultData.analysis_date_end
      ? `${resultData.analysis_date_start} ~ ${resultData.analysis_date_end}`
      : resultData && resultData.analysis_date) || MOCK.analysis_date;
  const oneLine = (resultData && resultData.one_line) ?? MOCK.one_line;

  const talkSpeed = {
    left: { label: "철수", value: 65, desc: "2분 45초" },
    right: { label: "상대", value: 35, desc: "4분 10초" },
  };

  useEffect(() => {
    const run = async () => {
      try {
        if (isDemo) {
          setResultData(MOCK);
          return;
        }
        const data = await getSomeAnalysisDetail(resultId);
        const res = (data && (data.result || data)) || {};
        setResultData(res);
        if (res.chat) setSelectedChatId(res.chat);
      } catch (err) {
        setError((err && err.message) || "결과를 불러오지 못했습니다.");
      } finally {
        setLoading(false);
      }
    };
    run();
  }, [resultId, isDemo, setSelectedChatId]);

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

  return (
    <div className="flex flex-col justify-start items-center h-screen text-white bg-primary-dark">
      <Header />
      <div className="relative flex-1 w-[1352px] mt-17.5 overflow-hidden flex justify-between items-start">
        {/* 왼쪽 */}
        <div className="gap-5 mt-52.5 w-53.5 flex flex-col items-center justify-center">
          <ChatList />
          <FileUpload />
        </div>

        {/* 가운데 */}
        <main className="overflow-y-auto max-h-240 scrollbar-hide pt-28 w-[722px] flex flex-col items-center gap-6">
          {/* 헤더 카드 */}
          <Panel className="w-full">
            <div className="flex justify-between">
              <div className="flex flex-col">
                <span className="text-st1">썸 분석 결과</span>
                <div className="flex items-end gap-2">
                  <span className="text-h2">{score}</span>
                  <span className="text-xl">점</span>
                </div>
              </div>
              <div className="flex flex-col text-st2 gap-0.5 mt-1 text-right">
                <p>분석된 메시지 수: {messageCount.toLocaleString()}개</p>
                <p>참여자 수: {participantCount}명</p>
                <p>분석 기간: {periodText}</p>
              </div>
            </div>
            <div className="text-st2 italic mt-3">{oneLine}</div>
          </Panel>

          {/* 섹션 1: 호감 지수 분석 */}
          <Section title="호감 지수 분석">
            <div className="grid gap-6 sm:grid-cols-2">
              <div className="space-y-2">
                <p className="text-sm text-white/70">방향</p>
                <ul className="list-disc list-inside text-sm text-white/90 leading-6">
                  <li>철수 → 영희</li>
                  <li>영희 → 철수</li>
                </ul>
                <p className="text-xs text-white/60">※ 최근 응답 흐름 기준</p>
              </div>
              <div className="space-y-2">
                <p className="text-sm text-white/70">횟수</p>
                <p className="text-xl font-semibold">
                  {(resultData && resultData.signal_count) ?? 76}회
                </p>
                <p className="text-xs text-white/60">대화 패턴 탐지 수</p>
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 mt-6">
              <Panel title="특징">
                <ul className="list-disc list-inside text-sm text-white/90 space-y-1">
                  <li>짧고 잦은 반응 증가</li>
                  <li>감정 표현 빈도 상승</li>
                  <li>약속 제안 멘트 증가</li>
                </ul>
              </Panel>
              <Panel title="주의">
                <ul className="list-disc list-inside text-sm text-white/90 space-y-1">
                  <li>업무/학업 대화로 귀결되는 경향</li>
                  <li>반복되는 주제 패턴</li>
                  <li>질문형 응답 감소</li>
                </ul>
              </Panel>
            </div>
          </Section>

          {/* 섹션 2: 말투 & 감정 */}
          <Section title="말투 & 감정 분석">
            <div className="space-y-6 w-full">
              <MeterRow
                label="말투"
                leftLabel="여유"
                rightLabel="진담"
                value={(resultData && resultData.tone_score) ?? 75}
              />
              <MeterRow
                label="감정 표현"
                leftLabel="직유"
                rightLabel="공유"
                value={(resultData && resultData.emotion_score) ?? 74}
              />
              <MeterRow
                label="호칭"
                leftLabel="따뜻"
                rightLabel="예정"
                value={(resultData && resultData.nickname_score) ?? 76}
              />
            </div>
          </Section>

          {/* 섹션 3: 대화 패턴 */}
          <Section title="대화 패턴 분석">
            <div className="space-y-6">
              <CompareBar
                title="평균 답장 시간"
                left={talkSpeed.left}
                right={talkSpeed.right}
              />
              <CompareBar
                title="약속 제안 횟수"
                left={{
                  label: "철수",
                  value: (resultData && resultData.proposal_count_you) ?? 3,
                  desc: "3회",
                }}
                right={{
                  label: "상대",
                  value: (resultData && resultData.proposal_count_partner) ?? 1,
                  desc: "1회",
                }}
              />
              <CompareBar
                title="주제 시작 비율"
                left={{
                  label: "철수",
                  value: (resultData && resultData.topic_start_ratio_you) ?? 62,
                  desc: "선제적",
                }}
                right={{
                  label: "상대",
                  value:
                    (resultData && resultData.topic_start_ratio_partner) ?? 38,
                  desc: "응답형",
                }}
              />
              <CompareBar
                title="평균 메시지 길이"
                left={{
                  label: "철수",
                  value: (resultData && resultData.avg_len_you) ?? 38,
                  desc: "짧고 굵게",
                }}
                right={{
                  label: "상대",
                  value: (resultData && resultData.avg_len_partner) ?? 62,
                  desc: "서술형",
                }}
              />
              <p className="text-sm text-white/70">
                분석: 당신이 신호를 더 자주 보내고, 상대는 반응형 패턴이
                강합니다. 짧은 호흡으로 주제를 여러 번 나누는 전략이 좋습니다.
              </p>
            </div>
          </Section>

          {/* 섹션 4: 상담 */}
          <Section title="챗또의 연애상담">
            <div className="grid gap-3">
              <Panel title="한 줄 요약">
                <p className="text-sm text-white/80 leading-6">
                  {(resultData && resultData.advice_summary) ??
                    "지금은 ‘고백’보다는 ‘다음 약속’ 확정이 먼저!"}
                </p>
              </Panel>
              <Panel title="Tip">
                <p className="text-sm text-white/80 leading-6">
                  {(resultData && resultData.advice_tip) ??
                    "‘이번 주 금요일 어때?’ 같이 구체적인 제안을 먼저 던지세요. 가벼운 리액션(👍 😀)도 자주."}
                </p>
              </Panel>
            </div>
          </Section>
        </main>

        {/* 오른쪽 */}
        <div className="w-[214px] mt-52.5 flex flex-col items-center justify-start gap-4">
          <div className="w-full py-4 px-1 flex flex-col justify-center items-center border border-secondary-light rounded-lg">
            <DetailForm
              isAnalysis={true}
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
              disabled={loading}
              className="mt-6 w-19.75 h-8.5 hover:bg-secondary hover:text-primary-dark px-3 py-2 text-button border border-secondary rounded-lg"
            >
              다시 분석
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
