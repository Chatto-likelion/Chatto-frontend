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
    <section
      className="rounded-lg p-5 sm:p-6 w-full border"
      style={{ borderColor: "#FFF8DE" }}
    >
      <h2 className="relative mb-6 inline-block text-base font-semibold tracking-wide">
        {title}
        {/* 제목 '위' 짧은 라인 */}
        <span
          className="absolute left-0 -top-1 h-0.5 w-24"
          style={{ backgroundColor: "#FFF8DE" }}
        />
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
      {/* 퍼센트 중앙 표시 - 헤더 위로 뜨지 않게 z-0 */}
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
    <div className="space-y-3 w-full">
      {/* 소제목(크게) */}
      <h3
        className="text-lg font-semibold text-white/90"
        style={{
          fontFamily: '"LINE Seed Sans KR", sans-serif',
          letterSpacing: "0.3px",
          lineHeight: "28px",
        }}
      >
        {title}
      </h3>

      {/* 좌/우 라벨 + 바 (왼쪽 정렬) */}
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

      {/* 설명 */}
      {desc && (
        <p className="text-sm text-white/80 leading-6 whitespace-pre-line">
          {desc}
        </p>
      )}

      {/* 예시 */}
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
    <div
      className="relative h-5 w-full rounded-sm overflow-hidden border"
      style={{ borderColor: "#FFF8DE" }}
    >
      <div className="flex h-full w-full">
        <div
          className="h-full"
          style={{ width: `${l}%`, backgroundColor: "#FFF8DE" }}
        />
        <div className="h-full" style={{ width: `${r}%` }} />
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
    <div className="space-y-2 w-full">
      {/* 소제목(크게) */}
      <h3
        className="text-lg font-semibold text-white/90"
        style={{
          fontFamily: '"LINE Seed Sans KR", sans-serif',
          letterSpacing: "0.3px",
          lineHeight: "28px",
        }}
      >
        {title}
      </h3>

      {/* 이름/값 + 바 */}
      <div className="flex items-center">
        <span className="text-sm text-white/70" style={body1}>
          {leftName}
        </span>
        <div className="flex-1 mx-3">
          <div className="relative">
            <DualBar leftPct={leftPct} />
            <div className="absolute inset-0 flex items-center justify-between px-3 pointer-events-none">
              <span className="text-sm" style={{ color: "#2d1a52" }}>
                {leftValue}
              </span>
              <span className="text-sm text-white">{rightValue}</span>
            </div>
          </div>
        </div>
        <span className="text-sm text-white/70" style={body1}>
          {rightName}
        </span>
      </div>

      {/* 좌/우 설명 & 예시 */}
      <div className="grid grid-cols-2 gap-8 mt-1">
        <div className="text-sm text-white/80 leading-6 whitespace-pre-line">
          {leftDesc && <p>{leftDesc}</p>}
          {leftExample && (
            <p className="mt-1 text-white/70">예시: “{leftExample}”</p>
          )}
        </div>
        <div className="text-sm text-white/80 leading-6 whitespace-pre-line">
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

  // 히어로 섹션용 타이틀/카피(없으면 데모 문구 사용)
  const pairTitle = resultData?.pair_title || "철수와 영희의 썸 지수";
  const heroCopy =
    resultData?.hero_copy ||
    `이 둘은 아슬아슬한 줄타기 중!
친구보다 더 가까워졌지만, 누군가 한 발만 더 내디디면 연애로 직진 가능!
지금 썸의 온도는… 딱 미지근한 꿀물 같습니다.
달달하긴 한데, 조금 더 뜨거워져야 해요🔥`;

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
    <div className="min-h-screen bg-primary-dark text-white">
      <Header />
      <div className="mx-auto w-[1352px] mt-[70px] flex gap-6 items-start">
        {/* 왼쪽 */}
        <div className="gap-5 mt-52.5 w-53.5 flex flex-col items-center justify-center">
          <ChatList />
          <FileUpload />
        </div>

        {/* 가운데 */}
        <main className="pt-24 pb-24 w-[722px] flex flex-col gap-6">
          {/* 상단 분석 */}
          <section className="w-full">
            <div className="w-full">
              <div className="flex justify-between items-start">
                {/* 왼쪽: 타이틀 + 점수 */}
                <div className="flex-1 pr-6">
                  <p
                    className="mb-3 text-white/90"
                    style={{
                      fontFamily: '"LINE Seed Sans KR", sans-serif',
                      fontSize: "24px",
                      fontWeight: 600,
                      lineHeight: "32px",
                      letterSpacing: "0.3px",
                    }}
                  >
                    {pairTitle}
                  </p>
                  <div className="flex items-end gap-2">
                    {/* 숫자 */}
                    <span
                      style={{
                        fontFamily: '"LINE Seed Sans KR", sans-serif',
                        fontSize: "60px",
                        fontWeight: 400, // Regular
                        lineHeight: "72px",
                        letterSpacing: "0px",
                        color: "#FFE787", // 숫자는 아이보리
                      }}
                    >
                      {score}
                    </span>

                    {/* '점' */}
                    <span
                      style={{
                        fontFamily: '"LINE Seed Sans KR", sans-serif',
                        fontSize: "60px",
                        fontWeight: 400,
                        lineHeight: "72px",
                        letterSpacing: "0px",
                        color: "#FFFFFF",
                      }}
                    >
                      점
                    </span>
                  </div>
                </div>

                {/* 오른쪽: 수치 정보 */}
                <div
                  className="text-right pt-1 space-y-2"
                  style={{
                    fontFamily: '"LINE Seed Sans KR", sans-serif',
                    fontSize: "16px",
                    fontWeight: 400,
                    lineHeight: "24px",
                    letterSpacing: "0.3px",
                  }}
                >
                  <p>분석된 메시지 수: {messageCount.toLocaleString()}개</p>
                  <p>분석 기간: {periodText}</p>
                </div>
              </div>

              {/* 하단 카피 */}
              <div className="mt-6">
                <p
                  className="text-white/80 whitespace-pre-line"
                  style={{
                    fontFamily: '"LINE Seed Sans KR", sans-serif',
                    fontSize: "16px",
                    fontWeight: 400,
                    lineHeight: "24px",
                    letterSpacing: "0.3px",
                  }}
                >
                  {heroCopy}
                </p>
              </div>
            </div>
          </section>

          {/* 섹션 1: 호감 지수 분석 */}
          <Section title="호감 지수 분석">
            <div className="w-full max-w-[700px] mx-auto space-y-6 text-white/90">
              {/* 방향 */}
              <div className="flex items-start">
                <p className="w-24 shrink-0" style={labelStyle}>
                  방향
                </p>
                <p className="flex-1">철수 → 영희</p>
                <p className="flex-1">영희 → 철수</p>
              </div>

              {/* 호감점수 */}
              <div className="flex items-start">
                <p className="w-24 shrink-0" style={labelStyle}>
                  호감점수
                </p>
                <p className="flex-1">89점</p>
                <p className="flex-1">76점</p>
              </div>

              {/* 특징 */}
              <div className="flex items-start">
                <p className="w-24 shrink-0" style={labelStyle}>
                  특징
                </p>
                <div className="flex-1">
                  <p className="mb-2">“관심 가득!”</p>
                  <ul className="list-disc pl-5 space-y-1 text-sm">
                    <li>대화 자주 시작</li>
                    <li>이모지와 웃음 코드 풀가동!</li>
                    <li>약속도 슬쩍 던져보는 적극러</li>
                  </ul>
                </div>
                <div className="flex-1">
                  <p className="mb-2">“좋긴 해요~”</p>
                  <ul className="list-disc pl-5 space-y-1 text-sm">
                    <li>반응 따뜻, 리액션도 굿!</li>
                    <li>근데 먼저 다가오진 않음. 살짝 관망 모드?</li>
                  </ul>
                </div>
              </div>

              {/* 요약(텍스트만) */}
              <div className="mt-6 space-y-1" style={{ color: "#FFF8DE" }}>
                <p className="text-sm">💡 요약:</p>
                <p className="text-sm">
                  철수는 이미 마음을 2/3쯤 열었고,
                  <br />
                  영희는 약간의 밀당 장인일 가능성 농후!!
                </p>
              </div>
            </div>
          </Section>

          {/* 섹션 2: 말투 & 감정 */}
          <Section title="말투 & 감정 분석">
            <p className="text-xs text-white/60 -mt-1 mb-5">
              가장 활발하게 서로 연결된 멤버 조합
            </p>

            <div className="space-y-10 w-full max-w-[700px] mx-auto">
              <AnalysisGauge
                title="말투"
                left="어색"
                right="편안"
                value={resultData?.tone_score ?? 75}
                desc={
                  "말투는 이미 편안한 단계!\n서로 반말에다 장난도 종종 섞여서, 웬만하면 어색한 분위기는 없어요.\n근데 이상하게… 어느 순간부터 너무 친구 같다는 생각, 들지 않나요?"
                }
                example={"~~~~~ → 말한 사람 + 메시지 pair"}
              />

              <AnalysisGauge
                title="감정 표현"
                left="적음"
                right="풍부"
                value={resultData?.emotion_score ?? 74}
                desc={
                  "감정 표현은 꽤 풍부!\n😂 ㅋㅋ, ㅎㅎ, “헐 대박” 같은 리액션은 계속 주고받고 있어요.\n이건 호감의 징조일 수도 있지만… 그냥 말버릇일 수도…?"
                }
                example={"~~~~~"}
              />

              <AnalysisGauge
                title="호칭"
                left="딱딱"
                right="애정"
                value={resultData?.nickname_score ?? 76}
                desc={
                  "호칭은 여전히 ‘ㅇㅇ아’, ‘야’, ‘너’ 수준.\n애정이 느껴지는 호칭은 아직 아닌 것 같아요."
                }
                example={"~~~~~"}
              />
            </div>
          </Section>

          {/* 섹션 3: 대화 패턴 */}
          <Section title="대화 패턴 분석">
            <div className="space-y-10 w-full max-w-[700px] mx-auto">
              <CompareMetric
                title="평균 답장 시간"
                leftValue="2분 45초"
                rightValue="4분 10초"
                leftPct={65}
                leftDesc="굉장히 빠른 답장 속도"
                rightDesc={"살짝 느리긴 함\n밤 11시 이후엔 2배 빨라짐"}
                leftExample="~~~"
                rightExample="~~~"
              />

              <CompareMetric
                title="약속 제안 횟수"
                leftValue={`${resultData?.proposal_count_you ?? 3}회`}
                rightValue={`${resultData?.proposal_count_partner ?? 1}회`}
                leftPct={
                  ((resultData?.proposal_count_you ?? 3) /
                    ((resultData?.proposal_count_you ?? 3) +
                      (resultData?.proposal_count_partner ?? 1))) *
                  100
                }
                leftDesc="2회 성공, 1회 흐지부지"
                rightDesc="1회, 시간 안 맞아서 미뤄짐"
                leftExample="~~~"
                rightExample="~~~"
              />

              <CompareMetric
                title="주제 시작 비율"
                leftValue={`${resultData?.topic_start_ratio_you ?? 62}%`}
                rightValue={`${resultData?.topic_start_ratio_partner ?? 38}%`}
                leftPct={resultData?.topic_start_ratio_you ?? 62}
                leftDesc="적극적으로 말 거는 타입"
                rightDesc={
                  "보통 대답하는 타입\n하지만 종종 주제를 먼저 꺼내기도?"
                }
                leftExample="~~~"
                rightExample="~~~"
              />

              <CompareMetric
                title="평균 메시지 길이"
                leftValue={`${resultData?.avg_len_you ?? 38}자`}
                rightValue={`${resultData?.avg_len_partner ?? 62}자`}
                leftPct={
                  ((resultData?.avg_len_you ?? 38) /
                    ((resultData?.avg_len_you ?? 38) +
                      (resultData?.avg_len_partner ?? 62))) *
                  100
                }
                leftDesc="짧고 굵게"
                rightDesc="서술형"
                leftExample="~~~"
                rightExample="~~~"
              />

              {/* 하단 분석 문단 (아이보리 색상) */}
              <p className="text-sm leading-6" style={{ color: "#FFF8DE" }}>
                분석: 당신이 기획하는 상태라면, 상대는 피드백 위주의 관찰자
                상태예요. 밸런스는 나쁘지 않지만, 1회 정도는 상대가 주제를
                꺼내줘야 썸이 이어질 수 있어요!
              </p>
            </div>
          </Section>

          {/* 섹션 4: 상담 (업데이트) */}
          <Section title="챗토의 연애상담">
            <div className="w-full max-w-[700px] mx-auto space-y-5">
              {/* 요약 문단 */}
              <p className="text-sm text-white/80 leading-7">
                {resultData?.advice_intro ??
                  "썸 지수 83점이면요… 이건 거의 “사귀자”를 기다리는 예열 상태! 하지만,"}
              </p>
              <p className="text-sm text-white/80 leading-7">
                🍯 너무 당신만 믿고 있다면? 상대는 “편하긴 한데, 잘 모르겠어”
                상태일 수도 있어요.
              </p>

              {/* Tip 섹션 */}
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
