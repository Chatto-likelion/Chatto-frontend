import { useParams } from "react-router-dom";
import { useEffect, useState, useCallback, useMemo } from "react";
import {
  getMbtiAnalysisDetail,
  getChatList,
  postMbtiAnalyze,
  deleteMbtiAnalysis,
  postQuiz10,
  postUUID,
  getUUID,
  postCreditUsage,
} from "@/apis/api"; // 실제 API 호출 함수
import {
  Header,
  ChatList,
  FileUpload,
  SmallServices,
  DetailForm,
  ShareModal,
  MbtiPieChart,
  MbtiReportCard,
  CreditWall,
} from "@/components";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { useChat } from "@/contexts/ChatContext";
import * as Icons from "@/assets/svg/index.js";

export default function PlayMbtiAnalysisPage() {
  const { resultId } = useParams(); // URL 파라미터 추출
  const { user } = useAuth();
  const { setSelectedChatId } = useChat();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [shareUrl, setShareUrl] = useState(null);
  const [shareFetching, setShareFetching] = useState(false);
  const [shareError, setShareError] = useState(null);
  const [shareUUID, setShareUUID] = useState(null);

  const makeShareUrl = (uuid) =>
    `${window.location.origin}/play/mbti/share/${uuid}`;

  const normalizeUuid = (v) => (typeof v === "string" ? v : v?.uuid ?? null);

  const ensureUuid = useCallback(async () => {
    if (!resultId) return null;
    if (shareUUID) return shareUUID;

    let uuid = null;
    try {
      const got = await getUUID("mbti", resultId);
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
      const created = await postUUID("mbti", resultId);
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
  const [analysisCost, setAnalysisCost] = useState(0);

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
          getMbtiAnalysisDetail(resultId),
          getChatList(),
        ]);

        if (!alive) return;

        const chatId = detail.result.chat;
        setResultData(detail);
        setSelectedChatId(chatId);
        setForm({
          analysis_start: detail.result.analysis_date_start,
          analysis_end: detail.result.analysis_date_end,
        });
        setAnalysisCost(detail.spec.total_I + detail.spec.total_E); // 이 분석 결과를 보는 데 필요한 크레딧

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

  const MBTI_TYPES = [
    "INFJ",
    "ENFP",
    "ISTJ",
    "ISFJ",
    "INTJ",
    "INFP",
    "ENTP",
    "ENFJ",
    "ISTP",
    "ISFP",
    "INTP",
    "ESTJ",
    "ESFJ",
    "ESTP",
    "ESFP",
    "ENTJ",
  ];

  const mbti_stats = useMemo(() => {
    const spec = resultData?.spec || {};
    return MBTI_TYPES.map((t) => ({
      type: t,
      value: Number(spec[`cnt_${t}`]) || 0,
    }));
  }, [resultData?.spec]);

  const isSameNow = useMemo(() => {
    if (!resultData?.result) return false;
    return (
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
      analysis_start: form.analysis_start,
      analysis_end: form.analysis_end,
    };

    try {
      const analyzeResponse = await postMbtiAnalyze(
        resultData.result.chat,
        payload
      );
      const newResultId = analyzeResponse.result_id;
      navigate(`/play/mbti/${newResultId}`);
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
      await deleteMbtiAnalysis(resultId);
      navigate("/play/mbti/");
    } catch (err) {
      setError(err.message || "분석에 실패했습니다.");
    } finally {
      setLoading(false);
    }
  };

  const handleQuiz = async () => {
    setQuizLoading(true);
    try {
      await postQuiz10(3, resultId);
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
  const handleReveal = () => {
    if (user.credit >= analysisCost) {
      postCreditUsage({
        amount: analysisCost,
        usage: "Play MBTI 분석",
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
      <div className="relative flex-1 w-[1352px] mt-17.5 overflow-hidden flex justify-between items-start">
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
            <div className="w-full flex flex-col items-start">
              {/* 상단 통계 */}
              <div className="w-full mb-15 flex flex-col">
                <div className="text-h6 pb-6.5">
                  <span>MBTI 통계</span>
                </div>
                <div className="pl-5 text-body1 text-left">
                  <p>분석된 메시지 수: {resultData.result.num_chat}개</p>
                  <p>
                    분석 대상:{" "}
                    {resultData.spec.total_I + resultData.spec.total_E}명
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
                {activeSpec && (
                  <div className="relative w-full">
                    <MbtiReportCard spec={activeSpec} />
                    {!isRevealed && (
                      <CreditWall onClick={handleReveal} cost={analysisCost} />
                    )}
                  </div>
                )}
              </div>
            </div>
          )}
        </main>

        {/* 오른쪽 */}
        <div className="w-[214px] mt-52.5 flex flex-col items-center justify-start gap-1.5">
          <div className="w-full py-4 px-1 flex flex-col justify-center items-center border border-secondary-light rounded-lg">
            <DetailForm
              type={3} // 1=chemi, 2=some, 3=mbti
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
