import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import {
  getSomeAnalysisDetail,
  getChatList,
  postSomeAnalyze,
  deleteSomeAnalysis,
} from "@/apis/api";
import {
  Header,
  ChatList,
  FileUpload,
  SmallServices,
  DetailForm,
  ShareModal,
} from "@/components";
import { useNavigate } from "react-router-dom";
import { useChat } from "@/contexts/ChatContext";
import * as Icons from "@/assets/svg/index.js";

/* -------------------- 작은 UI 컴포넌트 -------------------- */
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

export default function PlaySomeAnalysisPage() {
  const { resultId } = useParams(); // URL 파라미터 추출
  const { setSelectedChatId } = useChat();
  const navigate = useNavigate();
  const [modalOpen, setModalOpen] = useState(false);
  const shareUrl = "https://www.figma.com/file/abc...";
  const [form, setForm] = useState({
    relationship: "",
    age: "입력 안 함",
    analysis_start: "처음부터",
    analysis_end: "끝까지",
  });
  const updateForm = (patch) => setForm((prev) => ({ ...prev, ...patch }));
  const [resultData, setResultData] = useState(null);
  const [chatIds, setChatIds] = useState(() => new Set()); // 채팅 id 집합
  const [hasSourceChat, setHasSourceChat] = useState(null); // true/false/null
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let alive = true;
    setLoading(true);

    (async () => {
      try {
        const [detail, chats] = await Promise.all([
          getSomeAnalysisDetail(resultId),
          getChatList(),
        ]);

        if (!alive) return;

        const chatId = detail.result.chat;
        setResultData(detail);
        setSelectedChatId(chatId);
        setForm({
          relationship: detail.result.relationship,
          age: detail.result.age,
          analysis_start: detail.result.analysis_date_start,
          analysis_end: detail.result.analysis_date_end,
        });

        const ids = new Set((chats || []).map((c) => c.chat_id));
        setChatIds(ids);

        setHasSourceChat(ids.has(chatId));
      } catch (err) {
        if (!alive) return;
        setError(err.message || "결과/채팅 목록을 불러오지 못했습니다.");
      } finally {
        if (alive) setLoading(false);
      }
    })();

    return () => {
      alive = false;
    };
  }, [resultId]);

  const normalize = (s) => (s && s.trim() ? s.trim() : "입력 안 함");
  const handleAnalyze = async () => {
    if (!hasSourceChat) {
      window.alert("원본 채팅이 삭제되어 재분석할 수 없습니다.");
      return;
    }

    const payload = {
      ...form,
      relationship: normalize(form.relationship),
    };
    console.log(resultData.result, payload);
    const isSame =
      resultData.result.relationship === payload.relationship &&
      resultData.result.age === payload.age &&
      resultData.result.analysis_date_start === payload.analysis_start &&
      resultData.result.analysis_date_end === payload.analysis_end;

    if (isSame) {
      window.alert(
        "이전 분석과 동일한 조건입니다. 변경 후 다시 시도해 주세요."
      );
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const analyzeResponse = await postSomeAnalyze(
        resultData.result.chat,
        payload
      );
      const newResultId = analyzeResponse.result_id;
      navigate(`/play/some/${newResultId}`);
    } catch (err) {
      const status = err.response?.status;
      const data = err.response?.data;
      console.error("analyze failed:", status, data);
      setError(
        data
          ? typeof data === "string"
            ? data
            : JSON.stringify(data)
          : err.message || "분석에 실패했습니다."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    try {
      await deleteSomeAnalysis(resultId);
      navigate("/play/some/");
    } catch (err) {
      setError(err.message || "분석에 실패했습니다.");
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <p>결과를 불러오는 중...</p>;
  if (error) return <p style={{ color: "red" }}>{error}</p>;

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
        <main className="pt-24 pb-24 pl-15 pr-15 w-[722px] flex flex-col gap-6">
          {/* 상단 분석 */}
          <section className="w-full pb-15">
            <div className="w-full">
              <div className="flex justify-between items-start">
                {/* 왼쪽: 타이틀 + 점수 */}
                <div className="flex-1 pr-6">
                  <p className="text-xl pb-2">
                    {resultData.spec.name_A}와 {resultData.spec.name_B}의 썸
                    지수
                  </p>
                  <div className="flex justify-between">
                    <div className="flex items-end gap-2">
                      <h2 className="text-6xl">
                        <span className="text-secondary">
                          {resultData.spec.score_main}
                        </span>
                        점
                      </h2>
                    </div>
                    <div className="text-right text-[#F5F5F5] text-base pt-1">
                      <p>분석된 메시지 수: {resultData.result.num_chat}개</p>
                      <p>
                        분석 기간: {resultData.result.analysis_date_start}부터
                        {resultData.result.analysis_date_end}까지
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
            <div className="w-full max-w-[700px] mx-auto space-y-6 text-white pl-5 pr-5">
              {/* 방향 */}
              <div className="flex items-start">
                <p className="w-24 text-base">방향</p>
                <p className="flex-1 text-sm">
                  {resultData.spec.name_A} → {resultData.spec.name_B}
                </p>
                <p className="flex-1 text-sm">
                  {resultData.spec.name_B} → {resultData.spec.name_A}
                </p>
              </div>

              {/* 호감점수 */}
              <div className="flex items-start">
                <p className="w-24 text-base">호감점수</p>
                <p className="flex-1 text-sm">{resultData.spec.score_A}</p>
                <p className="flex-1 text-sm">{resultData.spec.score_B}</p>
              </div>

              {/* 특징 */}
              <div className="flex items-start">
                <p className="w-24 text-base">특징</p>
                <div className="flex-1 text-sm">
                  <p className="flex-1 text-sm">{resultData.spec.trait_A}</p>
                </div>
                <div className="flex-1 text-sm">
                  <p className="flex-1 text-sm">{resultData.spec.trait_B}</p>
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
            <div className="space-y-10 w-full max-w-[700px] mx-auto">
              <CompareMetric
                title="평균 답장 시간"
                leftValue={`${resultData?.spec.reply_A ?? 2}분`}
                rightValue={`${resultData?.spec.reply_B ?? 3}분`}
                leftPct={65}
                leftDesc={resultData?.spec.reply_A_desc ?? "굉장히 빠른 답장 "}
                rightDesc={resultData?.spec.reply_B_desc ?? "살짝 느리긴 함"}
              />

              <CompareMetric
                title="약속 제안 횟수"
                leftValue={`${resultData?.spec.rec_A ?? 3}회`}
                rightValue={`${resultData?.spec.rec_B ?? 1}회`}
                leftPct={
                  ((resultData?.spec.rec_A ?? 3) /
                    ((resultData?.spec.rec_A ?? 3) +
                      (resultData?.spec.rec_B ?? 1))) *
                  100
                }
                leftDesc={resultData?.spec.rec_A_desc ?? "zzz "}
                rightDesc={resultData?.spec.rec_B_desc ?? "zzzz"}
                leftExample={resultData?.spec.rec_A_ex ?? "zzz "}
                rightExample={resultData?.spec.rec_A_ex ?? "zzz "}
              />

              <CompareMetric
                title="주제 시작 비율"
                leftValue={`${resultData?.spec.atti_A ?? 62}%`}
                rightValue={`${resultData?.spec.atti_B ?? 38}%`}
                leftPct={resultData?.spec.atti_A ?? 62}
                leftDesc={resultData?.spec.atti_A_desc ?? "zzz "}
                rightDesc={resultData?.spec.atti_B_desc ?? "zzzz"}
                leftExample={resultData?.spec.atti_A_ex ?? "zzz "}
                rightExample={resultData?.spec.atti_A_ex ?? "zzz "}
              />

              <CompareMetric
                title="평균 메시지 길이"
                leftValue={`${resultData?.spec.len_A ?? 62}%`}
                rightValue={`${resultData?.spec.len_B ?? 38}%`}
                leftPct={
                  ((resultData?.spec.len_A ?? 38) /
                    ((resultData?.spec.len_A ?? 38) +
                      (resultData?.len_B ?? 62))) *
                  100
                }
                leftDesc={resultData?.spec.len_A_desc ?? "zzz "}
                rightDesc={resultData?.spec.len_B_desc ?? "zzzz"}
                leftExample={resultData?.spec.len_A_ex ?? "zzz "}
                rightExample={resultData?.spec.len_A_ex ?? "zzz "}
              />

              <div className="text-sm text-secondary leading-6">
                <p>분석:</p>
                <p>{resultData.spec.pattern_analysis}</p>
              </div>
            </div>
          </Section>

          {/* 섹션 4: 상담 (업데이트) */}
          <Section title="챗토의 연애상담">
            <div className="w-full max-w-[700px] mx-auto space-y-5">
              <p className="text-sm text-white/80 leading-7">
                {resultData.spec.chatto_counsel}
              </p>
              <p className="text-sm text-white/80 leading-7">
                {resultData.spec.chatto_counsel_tips}
              </p>

              <div className="mt-2 space-y-3">
                <p className="text-base font-semibold text-secondary">Tip</p>
                <p className="text-sm text-white/80 leading-7 space-y-2">
                  {resultData.spec.result}
                </p>
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
              onClick={() => handleAnalyze()}
              disabled={loading}
              className="mt-6 w-18.5 h-6.5 px-1.5 py-1 flex justify-center gap-0.5 items-center hover:bg-secondary-light hover:text-primary-dark text-caption border border-secondary-light rounded-lg"
            >
              다시 분석
              <Icons.Search className="w-2.5 h-2.5" />
            </button>
          </div>
          <div className="w-full flex justify-between items-center">
            <button
              onClick={() => setModalOpen(true)}
              disabled={loading}
              className="w-17 h-8 hover:bg-secondary hover:text-primary-dark cursor-pointer px-0.25 py-1 text-button border-2 border-secondary rounded-lg"
            >
              결과 공유
            </button>
            <ShareModal
              open={modalOpen}
              onClose={() => setModalOpen(false)}
              url={shareUrl}
            />
            <button
              onClick={() => {}}
              disabled={loading}
              className="w-17 h-8 hover:bg-secondary hover:text-primary-dark cursor-pointer px-0.25 py-1 text-button border-2 border-secondary rounded-lg"
            >
              퀴즈 생성
            </button>
            <button
              onClick={() => handleDelete()}
              disabled={loading}
              className="w-17 h-8 hover:bg-secondary hover:text-primary-dark cursor-pointer px-0.25 py-1 text-button border-2 border-secondary rounded-lg"
            >
              결과 삭제
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
