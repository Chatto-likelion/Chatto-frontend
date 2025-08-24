import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { getSomeGuestDetail } from "@/apis/api"; // 실제 API 호출 함수
import { Header, SmallServices, DetailForm_Share } from "@/components";
import { useNavigate } from "react-router-dom";
import * as Icons from "@/assets/svg/index.js";

export default function PlaySomeSharePage() {
  const { uuid } = useParams(); // URL 파라미터 추출
  const navigate = useNavigate();
  const [resultData, setResultData] = useState(null);
  const [form, setForm] = useState({
    title: "",
    people_num: 0,
    is_quized: false,
    relationship: "",
    age: "입력 안 함",
    analysis_start: "처음부터",
    analysis_end: "끝까지",
  });
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
        const detail = await getSomeGuestDetail(uuid);
        if (!alive) return;

        setResultData(detail);
        setForm({
          title: detail.result.title,
          people_num: detail.result.people_num,
          is_quized: detail.result.is_quized,
          relationship: detail.result.relationship,
          age: detail.result.age,
          analysis_start: detail.result.analysis_date_start,
          analysis_end: detail.result.analysis_date_end,
        });

        setQuizAvailable(detail.result.is_quized);
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
        <main className="overflow-y-auto max-h-240 scrollbar-hide pt-28 pb-34 w-[722px] flex flex-col justify-start items-center">
          {/* 결과 출력 */}
          {loading && <p className="mt-44 text-sm">분석 중입니다...</p>}
          {error && <p className="mt-4 text-sm text-red-500">{error}</p>}

          {!loading && !error && (
            <div className="w-full flex flex-col items-start gap-8">
              {/* 상단 분석 */}
              <section className="w-full pb-7">
                <div className="w-full">
                  <div className="flex justify-between items-start">
                    {/* 왼쪽: 타이틀 + 점수 */}
                    <div className="flex-1 pr-6">
                      <p className="text-h6 pb-4">
                        {resultData.spec.name_A}와 {resultData.spec.name_B}의 썸
                        지수
                      </p>
                      <div className="flex justify-between items-end">
                        <div className="flex items-end gap-2">
                          <p className="text-st1">
                            <span className="text-h2 text-secondary">
                              {resultData.spec.score_main}
                            </span>{" "}
                            점
                          </p>
                        </div>
                        <div className="flex flex-col text-st2 gap-0.5 mt-1 pb-1">
                          <p>
                            분석된 메시지 수: {resultData.result.num_chat}개
                          </p>
                          <p>
                            분석 기간: {resultData.result.analysis_date_start} ~{" "}
                            {resultData.result.analysis_date_end}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* 하단 카피 */}
                  <div className="mt-6">
                    <p className="text-sm text-primary-light whitespace-pre-line">
                      {resultData.spec.comment_main}
                    </p>
                  </div>
                </div>
              </section>

              {/* 섹션 1: 호감 지수 분석 */}
              <Section title="호감 지수 분석">
                <div className="w-full max-w-[700px] mx-auto space-y-6 text-white px-5 pt-4 pb-2">
                  {/* 방향 */}
                  <div className="flex items-center">
                    <p className="w-24 text-body1">방향</p>
                    <p className="flex-1 text-body2">
                      {resultData.spec.name_A} → {resultData.spec.name_B}
                    </p>
                    <p className="flex-1 text-body2">
                      {resultData.spec.name_B} → {resultData.spec.name_A}
                    </p>
                  </div>

                  {/* 호감점수 */}
                  <div className="flex items-center">
                    <p className="w-24 text-body1">호감점수</p>
                    <p className="flex-1 text-body2 text-secondary">
                      {resultData.spec.score_A}
                    </p>
                    <p className="flex-1 text-body2 text-secondary">
                      {resultData.spec.score_B}
                    </p>
                  </div>

                  {/* 특징 */}
                  <div className="flex items-center">
                    <p className="w-24 text-body1">특징</p>
                    <div className="flex-1 text-body2">
                      <p className="flex-1 text-body2">
                        {resultData.spec.trait_A}
                      </p>
                    </div>
                    <div className="flex-1 text-body2">
                      <p className="flex-1 text-body2">
                        {resultData.spec.trait_B}
                      </p>
                    </div>
                  </div>
                </div>
              </Section>

              {/* 섹션 2: 말투 & 감정 */}
              <Section title="말투 & 감정 분석">
                <p className="text-xs text-primary-light mb-5">
                  가장 활발하게 서로 연결된 멤버 조합
                </p>

                <div className="pt-4 space-y-10 w-full max-w-[700px] mx-auto">
                  <AnalysisGauge
                    title="말투"
                    left="어색"
                    right="편안"
                    value={resultData.spec.tone}
                    desc={resultData.spec.tone_desc}
                    example={resultData.spec.tone_ex}
                  />

                  <AnalysisGauge
                    title="감정 표현"
                    left="적음"
                    right="풍부"
                    value={resultData.spec.emo}
                    desc={resultData.spec.emo_desc}
                    example={resultData.spec.emo_ex}
                  />

                  <AnalysisGauge
                    title="호칭"
                    left="딱딱"
                    right="애정"
                    value={resultData.spec.addr}
                    desc={resultData.spec.addr_desc}
                    example={resultData.spec.addr_ex}
                  />
                </div>
              </Section>

              {/* 섹션 3: 대화 패턴 */}
              <Section title="대화 패턴 분석">
                <div className="relative pt-4 space-y-10 w-full max-w-[700px] mx-auto">
                  <CompareMetric
                    title="평균 답장 시간"
                    leftName={resultData.spec.name_A}
                    rightName={resultData.spec.name_B}
                    leftValue={`${resultData.spec.reply_A}분`}
                    rightValue={`${resultData.spec.reply_B}분`}
                    leftPct={65}
                    leftDesc={resultData.spec.reply_A_desc}
                    rightDesc={resultData.spec.reply_B_desc}
                  />

                  <CompareMetric
                    title="약속 제안 횟수"
                    leftName={resultData.spec.name_A}
                    rightName={resultData.spec.name_B}
                    leftValue={`${resultData.spec.rec_A}회`}
                    rightValue={`${resultData.spec.rec_B}회`}
                    leftPct={
                      (resultData.spec.rec_A /
                        (resultData.spec.rec_A + resultData.spec.rec_B)) *
                      100
                    }
                    leftDesc={resultData.spec.rec_A_desc}
                    rightDesc={resultData.spec.rec_B_desc}
                    leftExample={resultData.spec.rec_A_ex}
                    rightExample={resultData.spec.rec_A_ex}
                  />
                  <CompareMetric
                    title="주제 시작 비율"
                    leftName={resultData.spec.name_A}
                    rightName={resultData.spec.name_B}
                    leftValue={`${resultData.spec.atti_A}%`}
                    rightValue={`${resultData.spec.atti_B}%`}
                    leftPct={resultData.spec.atti_A}
                    leftDesc={resultData.spec.atti_A_desc}
                    rightDesc={resultData.spec.atti_B_desc}
                    leftExample={resultData.spec.atti_A_ex}
                    rightExample={resultData.spec.atti_A_ex}
                  />

                  <CompareMetric
                    title="평균 메시지 길이"
                    leftName={resultData.spec.name_A}
                    rightName={resultData.spec.name_B}
                    leftValue={`${resultData.spec.len_A}자`}
                    rightValue={`${resultData.spec.len_B}자`}
                    leftPct={
                      (resultData.spec.len_A /
                        (resultData.spec.len_A + resultData.len_B)) *
                      100
                    }
                    leftDesc={resultData.spec.len_A_desc}
                    rightDesc={resultData.spec.len_B_desc}
                    leftExample={resultData.spec.len_A_ex}
                    rightExample={resultData.spec.len_A_ex}
                  />

                  <div className="text-sm text-secondary leading-6">
                    <p>분석:</p>
                    {JSON.parse(resultData.spec.pattern_analysis).map(
                      (sentence, idx) => (
                        <p key={idx}>{sentence}</p>
                      )
                    )}
                  </div>
                </div>
              </Section>

              {/* 섹션 4: 상담 (업데이트) */}
              <Section title="챗토의 연애상담">
                <div className="w-full pt-4 max-w-[700px] mx-auto space-y-5">
                  <p className="text-sm text-white leading-7">
                    {resultData.spec.chatto_counsel.replace(/^\[|\]$/g, "")}
                  </p>

                  <div className="mt-2 space-y-3 text-secondary-dark">
                    <p className="text-base font-semibold">Tip</p>
                    <p className="text-sm leading-7 space-y-2">
                      {resultData.spec.chatto_counsel_tips.replace(
                        /^\[|\]$/g,
                        ""
                      )}
                    </p>
                  </div>
                </div>
              </Section>
            </div>
          )}
        </main>

        {/* 오른쪽 */}
        <div className="w-[214px] mt-52.5 flex flex-col items-center justify-start gap-1.5">
          <div className="w-full flex justify-between items-center">
            {/* 퀴즈 버튼 with 비활성화 & 툴팁 */}
            <div className="relative group">
              <button
                onClick={() => navigate(`/play/quiz/solve/${uuid}`)}
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
    <section className="rounded-lg p-5 sm:p-6 w-full border border-secondary-light">
      <h2 className="relative mb-6 inline-block text-primary-light text-2xl font-light tracking-wide">
        <span className="absolute left-0 -top-1 h-0.5 w-full bg-secondary" />
        {title}
      </h2>
      {children}
    </section>
  );
}

function MeterBar({ value = 0 }) {
  const v = Math.max(0, Math.min(100, value));
  return (
    <div className="relative h-5 w-full  overflow-hidden border border-secondary">
      {/* 채워지는 부분 */}
      <div
        className="h-full flex items-center justify-center bg-secondary-light"
        style={{ width: `${v}%` }}
      >
        <span className="text-sm text-primary-dark font-medium">{v}%</span>
      </div>
    </div>
  );
}

function AnalysisGauge({ title, left, right, value, desc, example }) {
  return (
    <div className="space-y-3 w-full pr-10 pl-10">
      <h3 className="text-lg font-semibold text-white/90">{title}</h3>

      <div className="flex items-center gap-3">
        <span className="text-sm text-white/80">{left}</span>
        <div className="flex-1">
          <MeterBar value={value} />
        </div>
        <span className="text-sm text-white/80">{right}</span>
      </div>

      {desc && (
        <p className="text-sm text-white/80 leading-6 whitespace-pre-line">
          {desc}
        </p>
      )}

      {example && (
        <div className="text-sm text-white/80 leading-6">
          <p className="text-white/70">예시 대화 A:</p>
          <p className="mt-1">“{example}”</p>
        </div>
      )}
    </div>
  );
}

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
        <span className="text-sm text-white/70">{leftName}</span>
        <div className="flex-1 mx-3">
          <div className="relative">
            <DualBar leftPct={leftPct} />
            <div className="absolute inset-0 flex items-center justify-between px-3 pointer-events-none">
              <span className="text-sm text-secondary">{leftValue}</span>
              <span className="text-sm text-primary-dark">{rightValue}</span>
            </div>
          </div>
        </div>
        <span className="text-sm text-white/70">{rightName}</span>
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
