import { useParams } from "react-router-dom";
import { useEffect, useState, useCallback, useMemo } from "react";
import {
  getSomeAnalysisDetail,
  getChatList,
  postSomeAnalyze,
  deleteSomeAnalysis,
  postQuiz10,
  postUUID,
  getUUID,
  postCreditUsage,
} from "@/apis/api";
import {
  Header,
  ChatList,
  FileUpload,
  SmallServices,
  DetailForm,
  ShareModal,
  CreditWall,
} from "@/components";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useChat } from "@/contexts/ChatContext";
import * as Icons from "@/assets/svg/index.js";

export default function PlaySomeAnalysisPage() {
  const { resultId } = useParams(); // URL 파라미터 추출
  const { user } = useAuth();
  const { setSelectedChatId } = useChat();
  const navigate = useNavigate();
  const [modalOpen, setModalOpen] = useState(false);
  const [shareUrl, setShareUrl] = useState(null);
  const [shareFetching, setShareFetching] = useState(false);
  const [shareError, setShareError] = useState(null);

  const [shareUUID, setShareUUID] = useState(null);

  const makeShareUrl = (uuid) =>
    `${window.location.origin}/play/some/share/${uuid}`;

  const normalizeUuid = (v) => (typeof v === "string" ? v : v?.uuid ?? null);

  const ensureUuid = useCallback(async () => {
    if (!resultId) return null;
    if (shareUUID) return shareUUID;

    let uuid = null;
    try {
      const got = await getUUID("some", resultId);
      uuid = normalizeUuid(got);
    } catch (err) {
      const msg = err?.message ?? "";
      const status = err?.status ?? err?.response?.status;
      // 404만 무시하고 나머지는 그대로 throw
      if (!(status === 404 || /404/.test(msg))) {
        throw err;
      }
    }
    if (!uuid) {
      const created = await postUUID("some", resultId);
      uuid = normalizeUuid(created);
    }
    if (!uuid) throw new Error("UUID를 생성/확인하지 못했습니다.");

    setShareUUID(uuid);
    return uuid;
  }, [resultId, shareUUID]);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const uuid = await ensureUuid();
        if (alive) setShareUUID(uuid);
      } catch {
        // uuid 확보 실패는 공유/퀴즈 이동에만 영향, 화면은 계속 보여줌
      }
    })();
    return () => {
      alive = false;
    };
  }, [ensureUuid]);

  const handleOpenShare = async () => {
    setModalOpen(true); // 모달 먼저 오픈 (스피너 등 표시용)
    if (shareUrl || shareFetching) return; // 중복호출 방지

    try {
      setShareFetching(true);
      setShareError(null);

      const uuid = (await ensureUuid()) || shareUUID;
      setShareUrl(makeShareUrl(uuid));
    } catch (e) {
      setShareError(e?.message || "공유 링크 발급에 실패했습니다.");
    } finally {
      setShareFetching(false);
    }
  };

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
  const [quizLoading, setQuizLoading] = useState(false);
  const [error, setError] = useState(null);

  const sourceChatId = resultData?.result?.chat ?? null;
  const handleChatDeleted = useCallback(
    (deletedId) => {
      setChatIds((prev) => {
        const next = new Set(prev);
        next.delete(deletedId);
        // next를 이용해 hasSourceChat을 정확히 재계산
        setHasSourceChat(sourceChatId ? next.has(sourceChatId) : null);
        // 소스 채팅 자체가 지워졌다면 선택도 해제
        if (deletedId === sourceChatId) setSelectedChatId(null);
        return next;
      });
    },
    [sourceChatId, setSelectedChatId]
  );

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
  const isSameNow = useMemo(() => {
    if (!resultData?.result) return false;
    return (
      resultData.result.relationship === normalize(form.relationship) &&
      resultData.result.age === form.age &&
      resultData.result.analysis_date_start === form.analysis_start &&
      resultData.result.analysis_date_end === form.analysis_end
    );
  }, [resultData?.result, form]);

  // 비활성화 조건 및 사유
  const disableAnalyze =
    loading || quizLoading || hasSourceChat === false || isSameNow;

  const disableReason = useMemo(() => {
    if (loading) return "분석 중입니다...";
    if (hasSourceChat === false)
      return "원본 채팅이 삭제되어 재분석할 수 없습니다.";
    if (isSameNow)
      return "이전 분석과 동일한 조건입니다. 변경 후 다시 시도해 주세요.";
    return "";
  }, [loading, hasSourceChat, isSameNow]);

  const handleAnalyze = async () => {
    if (!hasSourceChat) return;
    if (isSameNow) return;

    setLoading(true);
    setError(null);

    const payload = {
      relationship: normalize(form.relationship),
      age: form.age,
      analysis_start: form.analysis_start,
      analysis_end: form.analysis_end,
    };

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

  const handleQuiz = async () => {
    setQuizLoading(true);
    try {
      await postQuiz10(2, resultId);
      const uuid = await ensureUuid();
      navigate(`/play/quiz/${resultId}/${encodeURIComponent(uuid)}`);
    } catch (err) {
      setError(err.message || "퀴즈 생성에 실패했습니다.");
    } finally {
      setQuizLoading(false);
    }
  };

  const handleGoQuiz = async () => {
    try {
      const uuid = await ensureUuid();
      navigate(`/play/quiz/${resultId}/${encodeURIComponent(uuid)}`);
    } catch (err) {
      setError(err.message || "퀴즈로 이동할 수 없습니다.");
    }
  };

  const [isRevealed, setIsRevealed] = useState(false);
  const analysisCost = 1;
  const handleReveal = () => {
    if (user.credit >= analysisCost) {
      postCreditUsage({
        amount: analysisCost,
        usage: "Play 썸 판독기",
        purpose: "분석 결과 보기",
      })
        .then(() => {
          setIsRevealed(true);
        })
        .catch((error) => {
          alert("크레딧 소모에 실패했습니다.");
        });
    } else {
      alert("크레딧이 부족합니다. 크레딧 충전 후 이용해주세요.");
    }
  };

  return (
    <div className="flex flex-col justify-start items-center h-screen text-white bg-primary-dark">
      <Header />
      <div className="relative flex-1 w-[1352px] overflow-hidden mt-17.5 flex justify-between items-start">
        {/* 왼쪽 */}
        <div className="gap-5 mt-52.5 w-53.5 flex flex-col items-center justify-center">
          <ChatList onDeleted={handleChatDeleted} />
          <FileUpload />
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
                {!isRevealed && (
                  <CreditWall onClick={handleReveal} cost={analysisCost} />
                )}
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
                    rightExample={resultData.spec.rec_B_ex}
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
                    rightExample={resultData.spec.atti_B_ex}
                  />

                  <CompareMetric
                    title="평균 메시지 길이"
                    leftName={resultData.spec.name_A}
                    rightName={resultData.spec.name_B}
                    leftValue={`${resultData.spec.len_A}자`}
                    rightValue={`${resultData.spec.len_B}자`}
                    leftPct={
                      (resultData.spec.len_A /
                        (resultData.spec.len_A + resultData.spec.len_B)) *
                      100
                    }
                    leftDesc={resultData.spec.len_A_desc}
                    rightDesc={resultData.spec.len_B_desc}
                    leftExample={resultData.spec.len_A_ex}
                    rightExample={resultData.spec.len_B_ex}
                  />

                  <div className="text-sm text-secondary leading-6">
                    <p>분석:</p>
                    {resultData.spec.pattern_analysis}
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
          <div className="w-full py-4 px-1 flex flex-col justify-center items-center border border-secondary-light rounded-lg">
            <DetailForm
              type={2} // 1=chemi, 2=some, 3=mbti
              value={form}
              loading={quizLoading}
              onChange={updateForm}
              isAnalysis={true}
            />
            {/* 다시 분석 버튼 */}
            <div className="relative group mt-6">
              <button
                onClick={handleAnalyze}
                disabled={disableAnalyze}
                className={[
                  "w-18.5 h-6.5 px-1.5 py-1 flex justify-center gap-0.5 items-center text-caption rounded-lg border transition-colors duration-150",
                  disableAnalyze
                    ? "border-secondary-light/40 text-secondary-light/40 cursor-not-allowed"
                    : "border-secondary-light hover:bg-secondary-light hover:text-primary-dark text-secondary-light",
                ].join(" ")}
              >
                다시 분석
                <Icons.Search className="w-2.5 h-2.5" />
              </button>

              {/* 비활성화 사유 툴팁: 래퍼(div)에 hover 걸어서 disabled여도 보이도록 */}
              {disableAnalyze && disableReason && (
                <div className="pointer-events-none absolute left-1/2 -translate-x-1/2 bottom-7 opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="whitespace-nowrap text-[10px] leading-none px-2 py-1 rounded bg-primary-dark/80 text-secondary-light border border-secondary-light/30 shadow-sm">
                    {disableReason}
                  </div>
                </div>
              )}
            </div>
          </div>
          <div className="w-full flex justify-between items-center">
            <button
              onClick={handleOpenShare}
              disabled={loading || quizLoading}
              className="w-17 h-8 hover:bg-secondary hover:text-primary-dark cursor-pointer px-0.25 py-1 text-button border-2 border-secondary rounded-lg"
            >
              결과 공유
            </button>
            <ShareModal
              open={modalOpen}
              onClose={() => setModalOpen(false)}
              url={shareUrl}
              loading={shareFetching}
              error={shareError}
            />
            {!loading && !resultData.result.is_quized ? (
              <button
                onClick={handleQuiz}
                disabled={quizLoading}
                className="w-17 h-8 hover:bg-secondary hover:text-primary-dark cursor-pointer px-0.25 py-1 text-button border-2 border-secondary rounded-lg"
              >
                퀴즈 생성
              </button>
            ) : (
              <button
                onClick={handleGoQuiz}
                disabled={quizLoading}
                className="w-17 h-8 hover:bg-secondary hover:text-primary-dark cursor-pointer px-0.25 py-1 text-button border-2 border-secondary rounded-lg"
              >
                퀴즈 보기
              </button>
            )}
            <button
              onClick={() => handleDelete()}
              disabled={quizLoading}
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

function Section({ title, children }) {
  return (
    <section className="relative rounded-lg p-5 sm:p-6 w-full border border-secondary-light">
      <h2 className="relative mb-2 inline-block text-primary-light text-2xl font-light tracking-wide">
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
      <div className="flex h-full w-full">
        <div className="h-full" style={{ width: `${100 - v}%` }} />
        <div className="h-full bg-secondary-light" style={{ width: `${v}%` }} />
      </div>
      <div className="absolute inset-0 flex items-center justify-between px-3 pointer-events-none">
        <span className="text-sm text-white">{100 - v}%</span>
        <span className="text-sm text-primary-dark">{v}%</span>
      </div>
    </div>
  );
}

function AnalysisGauge({ title, left, right, value, desc, example }) {
  return (
    <div className="space-y-3 w-full pr-10 pl-10">
      <h3 className="text-lg font-semibold text-white/90">{title}</h3>

      <div className="flex items-center gap-3">
        <span className="text-sm text-secondary">{left}</span>
        <div className="flex-1">
          <MeterBar value={value} />
        </div>
        <span className="text-sm text-secondary">{right}</span>
      </div>

      {desc && (
        <p className="text-sm text-white/80 leading-6 whitespace-pre-line">
          {desc}
        </p>
      )}
      {example && (
        <div className="text-sm text-secondary-dark leading-6">
          <p className="mb-1">예시 대화:</p>
          {(example.includes('", "') ? example.split('", "') : [example]).map(
            (str, i) => (
              <p key={i} className="">
                "{str}"
              </p>
            )
          )}
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
    <div className="space-y-2 w-full pl-5 pr-5">
      <h3 className="text-xl font-normal text-secondary">{title}</h3>

      <div className="flex items-center pl-5 pr-5">
        <span className="text-sm text-secondary-light">{leftName}</span>
        <div className="flex-1 mx-3">
          <div className="relative w-full">
            <DualBar leftPct={leftPct} />
            <div className="absolute inset-0 flex items-center justify-between px-3 pointer-events-none">
              <span className="text-sm text-white">{leftValue}</span>
              <span className="text-sm text-primary-dark">{rightValue}</span>
            </div>
          </div>
        </div>
        <span className="text-sm text-secondary-light">{rightName}</span>
      </div>

      <div className="grid grid-cols-2 gap-8 mt-1 px-18">
        <div className="text-sm text-secondary-dark leading-6 whitespace-pre-line">
          {leftDesc && <p className="text-white/80">{leftDesc}</p>}
          {leftExample && <p className="mt-2">예시: </p>}
          {leftExample &&
            (leftExample.includes('", "')
              ? leftExample.split('", "')
              : [leftExample]
            ).map((str, i) => (
              <p key={i} className="">
                "{str}"
              </p>
            ))}
        </div>
        <div className="text-sm text-right text-secondary-dark leading-6 whitespace-pre-line">
          {rightDesc && <p className="text-white/80">{rightDesc}</p>}
          {rightExample && <p className="mt-2">예시: </p>}
          {rightExample &&
            (rightExample.includes('", "')
              ? rightExample.split('", "')
              : [rightExample]
            ).map((str, i) => (
              <p key={i} className="">
                "{str}"
              </p>
            ))}
        </div>
      </div>
    </div>
  );
}
