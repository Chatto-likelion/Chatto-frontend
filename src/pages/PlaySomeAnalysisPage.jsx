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
  ShareModal,
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
    <section className="rounded-lg p-5 sm:p-6 w-full border border-secondary-light">
      <h2 className="relative mb-6 inline-block text-primary-light text-2xl font-light tracking-wide">
        <span className="absolute left-0 -top-1 h-0.5 w-full bg-secondary" />
        {title}
      </h2>
      {children}
    </section>
  );
}

/* -------------------- 타이포/라벨 공통 스타일 -------------------- */
const body1 = {
  fontFamily: '"LINE Seed Sans KR", sans-serif',
  fontSize: "16px",
  fontWeight: 400,
  lineHeight: "24px",
  letterSpacing: "0.3px",
};

const labelStyle = { ...body1 };

/* -------------------- 말투/감정 게이지 -------------------- */
function MeterBar({ value = 0 }) {
  const v = Math.max(0, Math.min(100, value));
  return (
    <div
      className="relative h-5 w-full rounded-sm overflow-hidden border z-0"
      style={{ borderColor: "#FFF8DE" }}
    >
      <div
        className="h-full"
        style={{ width: `${v}%`, backgroundColor: "#FFF8DE" }}
      />
      <div className="absolute inset-0 z-0 flex items-center justify-center pointer-events-none">
        <span className="text-sm" style={{ color: "#2d1a52" }}>
          {v}%
        </span>
      </div>
    </div>
  );
}

function AnalysisGauge({ title, left, right, value, desc, example }) {
  return (
    <div className="space-y-3 w-full pr-10 pl-10">
      <h3 className="text-lg font-semibold text-white/90">{title}</h3>

      <div className="flex items-center gap-3">
        <span className="text-sm text-white/80" style={body1}>
          {left}
        </span>
        <div className="flex-1">
          <MeterBar value={value} />
        </div>
        <span className="text-sm text-white/80" style={body1}>
          {right}
        </span>
      </div>

      {desc && (
        <p className="text-sm text-white/80 leading-6 whitespace-pre-line">
          {desc}
        </p>
      )}

      {example && (
        <div className="text-sm text-white/80 leading-6">
          <p className="text-white/70" style={body1}>
            예시 대화 A:
          </p>
          <p className="mt-1">“{example}”</p>
        </div>
      )}
    </div>
  );
}

/* -------------------- 대화 패턴 비교 표 -------------------- */
function DualBar({ leftPct = 50 }) {
  const l = Math.max(0, Math.min(100, leftPct));
  const r = 100 - l;
  return (
    <div className="relative h-5 w-full   border">
      <div className="flex h-full w-full">
        <div className="h-full" style={{ width: `${l}%` }} />
        <div className="h-full bg-secondary-light" style={{ width: `${r}%` }} />
      </div>
    </div>
  );
}

function CompareMetric({
  title,
  leftName = "철수",
  rightName = "영희",
  leftValue,
  rightValue,
  leftPct, // 0~100
  leftDesc,
  rightDesc,
  leftExample,
  rightExample,
}) {
  return (
    <div className="space-y-2 w-ful pl-5 pr-5">
      <h3 className="text-xl font-normal text-secondary">{title}</h3>

      <div className="flex items-center pl-5 pr-5">
        <span className="text-sm text-white/70" style={body1}>
          {leftName}
        </span>
        <div className="flex-1 mx-3">
          <div className="relative">
            <DualBar leftPct={leftPct} />
            <div className="absolute inset-0 flex items-center justify-between px-3 pointer-events-none">
              <span className="text-sm text-secondary">{leftValue}</span>
              <span className="text-sm text-primary-dark">{rightValue}</span>
            </div>
          </div>
        </div>
        <span className="text-sm text-white/70" style={body1}>
          {rightName}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-8 mt-1 pl-15 pr-15">
        <div className="text-sm text-white/80 leading-6 whitespace-pre-line">
          {leftDesc && <p>{leftDesc}</p>}
          {leftExample && (
            <p className="mt-1 text-white/70">예시: “{leftExample}”</p>
          )}
        </div>
        <div className="text-sm text-right text-white/80 leading-6 whitespace-pre-line">
          {rightDesc && <p>{rightDesc}</p>}
          {rightExample && (
            <p className="mt-1 text-white/70">예시: “{rightExample}”</p>
          )}
        </div>
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
  const isDemo = searchParams.get("demo") === "1" || !resultId;
  const { setSelectedChatId } = useChat();
  const navigate = useNavigate();

  const [relation, setRelation] = useState("동아리 부원");
  const [situation, setSituation] = useState("일상대화");
  const [startPeriod, setStartPeriod] = useState("처음부터");
  const [endPeriod, setEndPeriod] = useState("끝까지");

  const [resultData, setResultData] = useState(null);
  const [chatIds, setChatIds] = useState(() => new Set());
  const [hasSourceChat, setHasSourceChat] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // 우측 패널용 더미 핸들러들 (컴파일 에러 방지)
  const [form, setForm] = useState({});
  const updateForm = (next) => setForm((prev) => ({ ...prev, ...next }));
  const handleAnalyze = () => {
    // TODO: 실제 분석 호출
    console.log("reanalyze clicked");
  };

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

  const pairTitle = resultData?.pair_title || "철수와 영희의 썸 지수";
  const heroCopy =
    resultData?.hero_copy ||
    `이 둘은 아슬아슬한 줄타기 중!
친구보다 더 가까워졌지만, 누군가 한 발만 더 내디디면 연애로 직진 가능!
지금 썸의 온도는… 딱 미지근한 꿀물 같습니다.
달달하긴 한데, 조금 더 뜨거워져야 해요🔥`;

  useEffect(() => {
    let alive = true;

    const run = async () => {
      try {
        if (isDemo) {
          // 데모 모드면 API 호출 없이 목데이터 사용
          if (!alive) return;
          setResultData(MOCK);
          setSelectedChatId(MOCK.chat);
          return;
        }
        const data = await getSomeAnalysisDetail(resultId);
        if (!alive) return;
        setResultData(data.result);
        setSelectedChatId(data.result?.chat ?? null);
      } catch (err) {
        if (!alive) return;
        setError(err?.message || "결과를 불러오지 못했습니다.");
      } finally {
        if (alive) setLoading(false);
      }
    };

    run();
    return () => {
      alive = false;
    };
  }, [isDemo, resultId, setSelectedChatId]);

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
    <div className="min-h-screen bg-primary-dark text-white">
      <Header />
      <div className="mx-auto w-[1352px] mt-[70px] flex gap-6 items-start">
        {/* 왼쪽 */}
        <div className="gap-5 mt-52.5 w-53.5 flex flex-col items-center justify-center">
          <ChatList />
          <FileUpload />
        </div>

        {/* 가운데 */}
        <main className="pt-24 pb-24 pl-15 pr-15 w-[722px] flex flex-col gap-6">
          {/* 상단 분석 */}
          <section className="w-full pb-15">
            <div className="w-full">
              <div className="flex justify-between items-start">
                {/* 왼쪽: 타이틀 + 점수 */}
                <div className="flex-1 pr-6">
                  <p className="text-xl pb-2">
                    {resultData.name_A}와 {resultData.name_B}의 썸 지수
                  </p>
                  <div className="flex justify-between">
                    <div className="flex items-end gap-2">
                      <h2 className="text-6xl">
                        <span className="text-secondary">
                          {resultData.score_main}
                        </span>
                        점
                      </h2>
                    </div>
                    <div className="text-right text-[#F5F5F5] text-base pt-1">
                      <p>분석된 메시지 수: {messageCount.toLocaleString()}개</p>
                      <p>분석 기간: {periodText}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* 하단 카피 */}
              <div className="mt-6">
                <p className="text-sm text-primary-light whitespace-pre-line">
                  {heroCopy}
                </p>
              </div>
            </div>
          </section>

          {/* 섹션 1: 호감 지수 분석 */}
          <Section title="호감 지수 분석">
            <div className="w-full max-w-[700px] mx-auto space-y-6 text-white pl-5 pr-5">
              {/* 방향 */}
              <div className="flex items-start">
                <p className="w-24 text-base">방향</p>
                <p className="flex-1 text-sm">철수 → 영희</p>
                <p className="flex-1 text-sm">영희 → 철수</p>
              </div>

              {/* 호감점수 */}
              <div className="flex items-start">
                <p className="w-24 text-base">호감점수</p>
                <p className="flex-1 text-sm">89점</p>
                <p className="flex-1 text-sm">76점</p>
              </div>

              {/* 특징 */}
              <div className="flex items-start">
                <p className="w-24 text-base">특징</p>
                <div className="flex-1 text-sm">
                  <p className="mb-2">“관심 가득!”</p>
                  <ul className="list-disc pl-5 space-y-1 text-sm">
                    <li>대화 자주 시작</li>
                    <li>이모지와 웃음 코드 풀가동!</li>
                    <li>약속도 슬쩍 던져보는 적극러</li>
                  </ul>
                </div>
                <div className="flex-1 text-sm">
                  <p className="mb-2">“좋긴 해요~”</p>
                  <ul className="list-disc pl-5 space-y-1 text-sm">
                    <li>반응 따뜻, 리액션도 굿!</li>
                    <li>근데 먼저 다가오진 않음. 살짝 관망 모드?</li>
                  </ul>
                </div>
              </div>

              {/* 디버그(선택) : resultData 안전 접근 */}
              <div className="w-full mb-6 p-4 gap-5 flex flex-col justify-start items-start border border-secondary-light rounded-lg text-body2 whitespace-pre-line">
                <div>
                  <h1>썸 결과 페이지</h1>
                  <p>결과 ID: {resultId || "(demo)"}</p>
                  <p>content: {resultData?.content ?? "-"}</p>
                  <p>is_saved: {String(resultData?.is_saved ?? false)}</p>
                  <p>relationship: {resultData?.relationship ?? "-"}</p>
                  <p>age: {resultData?.age ?? "-"}</p>
                  <p>
                    analysis_date_start:{" "}
                    {resultData?.analysis_date_start ?? "-"}
                  </p>
                  <p>
                    analysis_date_end: {resultData?.analysis_date_end ?? "-"}
                  </p>
                  <p>analysis_date: {resultData?.analysis_date ?? "-"}</p>
                  <p>chat: {String(resultData?.chat ?? "-")}</p>
                </div>
              </div>
            </div>
          </Section>

          {/* 섹션 2: 말투 & 감정 */}
          <Section title="말투 & 감정 분석">
            <p className="text-xs text-primary-light mb-5">
              가장 활발하게 서로 연결된 멤버 조합
            </p>

            <div className="space-y-10 w-full max-w-[700px] mx-auto">
              <AnalysisGauge
                title="말투"
                left="어색"
                right="편안"
                value={resultData?.tone_score ?? 75}
                desc={resultData.tone_desc}
                example={resultData.tone_ex}
              />

              <AnalysisGauge
                title="감정 표현"
                left="적음"
                right="풍부"
                value={resultData?.emotion_score ?? 74}
                desc={resultData.tone_desc}
                example={resultData.tone_ex}
              />

              <AnalysisGauge
                title="호칭"
                left="딱딱"
                right="애정"
                value={resultData?.nickname_score ?? 76}
                desc={resultData.tone_desc}
                example={resultData.tone_ex}
              />
            </div>
          </Section>

          {/* 섹션 3: 대화 패턴 */}
          <Section title="대화 패턴 분석">
            <div className="space-y-10 w-full max-w-[700px] mx-auto">
              <CompareMetric
                title="평균 답장 시간"
                leftValue={`${resultData?.reply_A ?? 2}분`}
                rightValue={`${resultData?.reply_B ?? 3}분`}
                leftPct={65}
                leftDesc={resultData?.reply_A_desc ?? "굉장히 빠른 답장 "}
                rightDesc={resultData?.reply_B_desc ?? "살짝 느리긴 함"}
              />

              <CompareMetric
                title="약속 제안 횟수"
                leftValue={`${resultData?.rec_A ?? 3}회`}
                rightValue={`${resultData?.rec_B ?? 1}회`}
                leftPct={
                  ((resultData?.resultData?.rec_A ?? 3) /
                    ((resultData?.resultData?.rec_A ?? 3) +
                      (resultData?.resultData?.rec_B ?? 1))) *
                  100
                }
                leftDesc={resultData?.rec_A_desc ?? "zzz "}
                rightDesc={resultData?.rec_B_desc ?? "zzzz"}
                leftExample={resultData?.rec_A_ex ?? "zzz "}
                rightExample={resultData?.rec_A_ex ?? "zzz "}
              />

              <CompareMetric
                title="주제 시작 비율"
                leftValue={`${resultData?.atti_A ?? 62}%`}
                rightValue={`${resultData?.atti_B ?? 38}%`}
                leftPct={resultData?.atti_A ?? 62}
                leftDesc={resultData?.atti_A_desc ?? "zzz "}
                rightDesc={resultData?.atti_B_desc ?? "zzzz"}
                leftExample={resultData?.atti_A_ex ?? "zzz "}
                rightExample={resultData?.atti_A_ex ?? "zzz "}
              />

              <CompareMetric
                title="평균 메시지 길이"
                leftValue={`${resultData?.len_A ?? 62}%`}
                rightValue={`${resultData?.len_B ?? 38}%`}
                leftPct={
                  ((resultData?.len_A ?? 38) /
                    ((resultData?.len_A ?? 38) + (resultData?.len_B ?? 62))) *
                  100
                }
                leftDesc={resultData?.len_A_desc ?? "zzz "}
                rightDesc={resultData?.len_B_desc ?? "zzzz"}
                leftExample={resultData?.len_A_ex ?? "zzz "}
                rightExample={resultData?.len_A_ex ?? "zzz "}
              />

              <div className="text-sm text-secondary leading-6">
                <p>분석:</p>
                <p>
                  당신이 기획하는 상태라면, 상대는 피드백 위주의 관찰자
                  상태예요. 밸런스는 나쁘지 않지만, 1회 정도는 상대가 주제를
                  꺼내줘야 썸이 이어질 수 있어요!
                </p>
              </div>
            </div>
          </Section>

          {/* 섹션 4: 상담 (업데이트) */}
          <Section title="챗토의 연애상담">
            <div className="w-full max-w-[700px] mx-auto space-y-5">
              <p className="text-sm text-white/80 leading-7">
                {resultData?.advice_intro ??
                  "썸 지수 83점이면요… 이건 거의 “사귀자”를 기다리는 예열 상태! 하지만,"}
              </p>
              <p className="text-sm text-white/80 leading-7">
                🍯 너무 당신만 믿고 있다면? 상대는 “편하긴 한데, 잘 모르겠어”
                상태일 수도 있어요.
              </p>

              <div className="mt-2 space-y-3">
                <p
                  className="text-base font-semibold"
                  style={{ color: "#FFF8DE" }}
                >
                  Tip
                </p>
                <ul className="text-sm text-white/80 leading-7 space-y-2">
                  <li>“이번 주 금요일에 뭐해?” → 지금 시도해보세요.</li>
                  <li>
                    사진이나 링크 공유에 자주 웃는다면 → 다음엔 본인 셀카로
                    공격! 📸
                  </li>
                  <li>
                    읽씹 타이밍이 반복된다면 → “ㅋㅋ”로 말 걸어보고, 답장 속도
                    체크해보세요.
                  </li>
                </ul>
              </div>
            </div>
          </Section>
        </main>

        {/* 오른쪽 */}
        <div className="w-[214px] mt-52.5 flex flex-col items-center justify-start gap-1.5">
          <div className="w-full py-4 px-1 flex flex-col justify-center items-center border border-secondary-light rounded-lg">
            <DetailForm
              type={2} // 1=chemi, 2=some, 3=mbti
              value={form}
              onChange={updateForm}
              isAnalysis={true}
            />
            <button
              onClick={handleAnalyze}
              disabled={loading}
              className="mt-6 w-18.5 h-6.5 px-1.5 py-1 flex justify-center gap-0.5 items-center hover:bg-secondary-light hover:text-primary-dark text-caption border border-secondary-light rounded-lg"
            >
              다시 분석
              <Icons.Search className="w-2.5 h-2.5" />
            </button>
          </div>
          <div className="w-full flex justify-between items-center">
            <button
              onClick={() => {}}
              disabled={loading}
              className="w-16 h-8.5 hover:bg-secondary hover:text-primary-dark cursor-pointer px-0.25 py-2 text-button border border-secondary rounded-lg"
            >
              결과 공유
            </button>
            <button
              onClick={() => {}}
              disabled={loading}
              className="w-16 h-8.5 hover:bg-secondary hover:text-primary-dark cursor-pointer px-0.25 py-2 text-button border border-secondary rounded-lg"
            >
              결과 저장
            </button>
            <button
              onClick={() => {}}
              disabled={loading}
              className="w-16 h-8.5 hover:bg-secondary hover:text-primary-dark cursor-pointer px-0.25 py-2 text-button border border-secondary rounded-lg"
            >
              퀴즈 생성
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
