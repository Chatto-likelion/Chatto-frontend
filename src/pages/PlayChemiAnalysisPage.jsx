import { useParams } from "react-router-dom";
import { useEffect, useState, useMemo, useCallback } from "react";
import {
  getChemiAnalysisDetail,
  getChatList,
  postChemiAnalyze,
  deleteChemiAnalysis,
  postQuiz10,
  postUUID,
  getUUID,
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
import InteractionMatrix from "../components/InteractionMatrix.jsx";

// chart.js
import { Pie } from "react-chartjs-2";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
} from "chart.js";

ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler
);

export default function PlayChemiAnalysisPage() {
  const { resultId } = useParams();
  const { setSelectedChatId } = useChat();
  const navigate = useNavigate();
  const [modalOpen, setModalOpen] = useState(false);
  const [shareUrl, setShareUrl] = useState(null);
  const [shareFetching, setShareFetching] = useState(false);
  const [shareError, setShareError] = useState(null);

  const [shareUUID, setShareUUID] = useState(null);

  const makeShareUrl = (uuid) =>
    `${window.location.origin}/play/chemi/share/${uuid}`;

  const normalizeUuid = (v) => (typeof v === "string" ? v : v?.uuid ?? null);

  const ensureUuid = useCallback(async () => {
    if (!resultId) return null;
    if (shareUUID) return shareUUID;

    let uuid = null;
    try {
      const got = await getUUID("chem", resultId);
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
      const created = await postUUID("chem", resultId);
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
    situation: "",
    analysis_start: "처음부터",
    analysis_end: "끝까지",
  });
  const updateForm = (patch) => setForm((prev) => ({ ...prev, ...patch }));
  const [resultData, setResultData] = useState(null);
  const [chatIds, setChatIds] = useState(() => new Set());
  const [hasSourceChat, setHasSourceChat] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let alive = true;
    setLoading(true);

    (async () => {
      try {
        const [detail, chats] = await Promise.all([
          getChemiAnalysisDetail(resultId),
          getChatList(),
        ]);
        if (!alive) return;

        const chatId = detail.result.chat;
        setResultData(detail);
        setSelectedChatId(chatId);
        setForm({
          relationship: detail.result.relationship,
          situation: detail.result.situation,
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
  }, [resultId, setSelectedChatId]);

  const normalize = (s) => (s && s.trim() ? s.trim() : "입력 안 함");

  const handleAnalyze = async () => {
    if (!hasSourceChat) {
      window.alert("원본 채팅이 삭제되어 재분석할 수 없습니다.");
      return;
    }

    const payload = {
      ...form,
      relationship: normalize(form.relationship),
      situation: normalize(form.situation),
    };

    const isSame =
      resultData.result.relationship === payload.relationship &&
      resultData.result.situation === payload.situation &&
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
      const analyzeResponse = await postChemiAnalyze(
        resultData.result.chat,
        payload
      );
      const newResultId = analyzeResponse.result_id;
      navigate(`/play/chemi/${newResultId}`);
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
      await deleteChemiAnalysis(resultId);
      navigate("/play/chemi/");
    } catch (err) {
      setError(err.message || "분석에 실패했습니다.");
    } finally {
      setLoading(false);
    }
  };

  const handleQuiz = async () => {
    try {
      await postQuiz10(1, resultId);
      navigate(`/play/quiz/${resultId}/${shareUUID}`);
    } catch (err) {
      setError(err.message || "퀴즈 생성에 실패했습니다.");
    } finally {
      setLoading(false);
    }
  };

  // ───────────────── InteractionMatrix용 그래프 데이터 (tablesize + name_i) ─────────────────
  const graphData = useMemo(() => {
    const spec = resultData?.spec;
    const specTable = resultData?.spec_table;
    if (!spec || !specTable) return null;

    const size = Number(spec.tablesize ?? 0);
    const named = Array.from({ length: Math.max(0, size) }, (_, i) => {
      const raw = spec[`name_${i}`];
      const name = typeof raw === "string" ? raw.trim() : "";
      return { oldIdx: i, name };
    }).filter((p) => p.name.length > 0);

    if (named.length < 2) return { tooFew: true };
    if (named.length > 5) named.splice(5);

    const idxMap = new Map(named.map((p, i) => [p.oldIdx, i]));
    const n = named.length;
    const R = 150;
    const nodes = named.map((p, i) => {
      const angle = (2 * Math.PI * i) / n - Math.PI / 2;
      const x = R * Math.cos(angle);
      const y = R * Math.sin(angle);
      return { id: String(i), label: p.name, x, y, fx: x, fy: y };
    });

    const rows = spec.row ?? [];
    const cols = spec.column ?? [];
    const vals = spec.interaction ?? [];
    const m = Math.min(rows.length, cols.length, vals.length);
    const links = specTable
      .map((item) => {
        const s = idxMap.get(Number(item.row));
        const t = idxMap.get(Number(item.column));
        const v = Number(item.interaction ?? 1);
        if (s == null || t == null || s === t || v <= 0) {
          return null;
        }
        return {
          source: String(s),
          target: String(t),
          value: v,
        };
      })
      .filter(Boolean); // null 값을 제거하여 유효한 링크만 남깁니다.

    console.log("Generated Links:", links);

    return { nodes, links };
  }, [resultData]);

  // ───────────────── Pie 차트 데이터 (이미지 스타일 그대로) ─────────────────
  // 공통 옵션: 범례 숨김 + 반응형
  const pieOpts = {
    plugins: { legend: { display: false } },
    responsive: true,
    maintainAspectRatio: false,
  };

  // 조각 오프셋(퍼센트가 작은 조각만 살짝 띄움)
  const makeOffset = (vals) => {
    const total = vals.reduce((a, b) => a + b, 0) || 1;
    return (ctx) => {
      const v = Number(ctx.raw || 0);
      const p = (v / total) * 100;
      return p < 12 ? 20 : 8; // 작은 조각 20px, 나머지 8px
    };
  };

  // ── 대화 톤
  const tonePie = useMemo(() => {
    const s = resultData?.spec || {};
    const labels = [];
    const values = [];

    const push = (label, val) => {
      const n = Number(val ?? 0);
      if (n > 0) {
        labels.push(label);
        values.push(n);
      }
    };

    push("긍정", s.tone_pos);
    push("농담/유머", s.tone_humer);
    push("비판", s.tone_crit);
    // 필요 시 기타도 추가: push("기타", s.tone_else);

    return {
      labels,
      datasets: [
        {
          data: values,
          backgroundColor: "#FFF8DE",
          borderColor: "#462C71",
          borderWidth: 8, // 두꺼운 갭
          offset: 0,
        },
      ],
    };
  }, [resultData]);

  // 톤 한줄 요약(예: "긍정적 표현: 63%  농담/유머: 18%  비판적 의견: 7%")
  const toneLines = useMemo(() => {
    const ds = tonePie.datasets?.[0];
    if (!ds || !ds.data?.length) return [];
    const vals = ds.data.map((v) => Number(v || 0));
    const total = vals.reduce((a, b) => a + b, 0) || 1;
    return tonePie.labels.map((label, i) => {
      const p = Math.round((vals[i] / total) * 100);
      const pretty =
        label === "긍정"
          ? "긍정적 표현"
          : label === "비판"
          ? "비판적 의견"
          : label;
      return { label: pretty, percent: p };
    });
  }, [tonePie]);

  // ── 대화 주제
  const topicPie = useMemo(() => {
    const s = resultData?.spec || {};
    const slices = [];
    const push = (nameKey, ratioKey) => {
      const name = (s[nameKey] ?? "").trim();
      const val = Number(s[ratioKey] ?? 0);
      if (name && val > 0) slices.push({ label: name, value: val });
    };
    push("topic1", "topic1_ratio");
    push("topic2", "topic2_ratio");
    push("topic3", "topic3_ratio");
    push("topic4", "topic4_ratio");
    if (Number(s.topicelse_ratio) > 0)
      slices.push({ label: "기타", value: Number(s.topicelse_ratio) });

    const labels = slices.map((x) => x.label);
    const values = slices.map((x) => x.value);

    return {
      labels,
      datasets: [
        {
          data: values,
          backgroundColor: "#FFF8DE",
          borderColor: "#462C71",
          borderWidth: 8,
          offset: 0,
        },
      ],
    };
  }, [resultData]);

  const formatToneExample = (text) => {
    if (!text) return null;
    const match = text.match(/^(.*)\((.*)\)$/);
    // 예: "ㅋㅋㅋㅋ 조심히 출근하십쇼 (권혁준)" → ["ㅋㅋㅋㅋ 조심히 출근하십쇼 (권혁준)", "ㅋㅋㅋㅋ 조심히 출근하십쇼 ", "권혁준"]

    if (match) {
      const sentence = match[1].trim();
      const speaker = match[2].trim();
      return `"${sentence}" - ${speaker}`;
    }
    return text; // 혹시 패턴이 다르면 그대로 출력
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
        <main className="overflow-y-auto scrollbar-hide pt-28 w-[722px] h-[calc(100vh-72px)] flex flex-col justify-start items-start">
          {loading && <p className="mt-44 text-sm">분석 중입니다...</p>}
          {error && <p className="mt-4 text-sm text-red-500">{error}</p>}

          <div className="w-full flex flex-col items-start gap-8">
            {/* 종합 케미 점수 */}
            <div className="w-full flex flex-col gap-4 p-2 text-left">
              <div className="flex justify-between">
                <div className="flex flex-col">
                  <span className="text-st1">종합 케미 점수</span>
                  <p className="text-st1">
                    <span className="text-h2 text-[#F5F5F5]">
                      {resultData.spec.score_main}
                    </span>{" "}
                    점
                  </p>
                </div>
                <div className="flex flex-col text-st2 gap-0.5 mt-1">
                  <p>분석된 메시지 수: {resultData.result.num_chat}개</p>
                  <p>참여자 수: {resultData.result.people_num}</p>
                  <p>
                    분석 기간: {resultData.result.analysis_date_start} ~{" "}
                    {resultData.result.analysis_date_end}
                  </p>
                </div>
              </div>
              <div className="text-body2 text-primary-light mt-2">
                {resultData.spec.summary_main}
              </div>
            </div>

            {/* 상호작용 매트릭스 */}
            <section className="w-full p-6 border border-secondary rounded-lg">
              <h3 className="text-h6 font-bold mb-2">상호작용 매트릭스</h3>
              <p className="text-body2 mb-4">
                ※ 진한 선일수록 대화가 활발합니다! 분석 대상은 대화량 상위
                5명입니다.
              </p>
              <div
                className="rounded-md overflow-hidden"
                style={{ height: 420 }}
              >
                {graphData?.tooFew ? (
                  <div className="h-full flex items-center justify-center text-sm opacity-70">
                    상호작용 매트릭스는 대화상대가 2명 이상일 때만 표시됩니다.
                  </div>
                ) : graphData ? (
                  <InteractionMatrix
                    nodes={graphData.nodes}
                    links={graphData.links}
                  />
                ) : (
                  <div className="h-full flex items-center justify-center text-sm opacity-70">
                    그래프를 표시할 수 없습니다.
                  </div>
                )}
              </div>
            </section>

            {/* TOP3 */}
            <section className="w-full p-6 border border-secondary rounded-lg">
              <div>
                <div className="mb-10 gap-0.5">
                  <p className="relative inline-block text-h6 text-primary-light mb-3">
                    케미 순위 TOP3
                    <span className="absolute left-0 -top-2 h-0.75 w-full bg-secondary"></span>
                  </p>

                  <p className="text-primary-light text-body2">
                    가장 활발하게 서로 연결된 멤버 조합
                  </p>
                </div>
                {resultData?.spec ? (
                  <div className="flex flex-col gap-5 text-st2">
                    {/* TOP1 */}
                    <div className="flex justify-row">
                      <div className="w-40 mr-10">
                        <p className="text-body1 text-secondary-dark">
                          TOP1 – {resultData.spec.top1_score}점
                        </p>
                        <p className="text-body1 text-[#F5F5F5]">
                          {resultData.spec.top1_A} & {resultData.spec.top1_B}
                        </p>
                      </div>
                      <p className="flex-1 text-[#F5F5F5]">
                        {resultData.spec.top1_comment}
                      </p>
                    </div>

                    {/* TOP2 */}
                    <div className="flex justify-row">
                      <div className="w-40 mr-10">
                        <p className="text-body1 text-secondary-dark">
                          TOP1 – {resultData.spec.top2_score}점
                        </p>
                        <p className="text-body1 text-[#F5F5F5]">
                          {resultData.spec.top2_A} & {resultData.spec.top2_B}
                        </p>
                      </div>
                      <p className="flex-1 text-[#F5F5F5]">
                        {resultData.spec.top2_comment}
                      </p>
                    </div>

                    {/* TOP3 */}
                    <div className="flex justify-row">
                      <div className="w-40 mr-10">
                        <p className="text-body1 text-secondary-dark">
                          TOP1 – {resultData.spec.top3_score}점
                        </p>
                        <p className="text-body1 text-[#F5F5F5]">
                          {resultData.spec.top3_A} & {resultData.spec.top3_B}
                        </p>
                      </div>
                      <p className="flex-1 text-[#F5F5F5]">
                        {resultData.spec.top3_comment}
                      </p>
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-gray-400">데이터가 없습니다.</p>
                )}
              </div>

              {/* 대화 톤 (이미지 스타일) */}
              <div className="mb-20">
                <div className="mt-20 mb-3 gap-0.5">
                  <p className="relative inline-block text-h6 text-primary-light mb-3">
                    대화 톤
                    <span className="absolute left-0 -top-2 h-0.75 w-full bg-secondary"></span>
                  </p>
                </div>

                <div className="flex items-center gap-8">
                  <div className="w-48 h-48">
                    {/* 퍼센트 라벨 플러그인 사용 */}
                    <Pie
                      data={tonePie}
                      options={pieOpts}
                      plugins={[percentLabels]}
                    />
                  </div>
                  <div className="mt-2 flex-1 leading-7">
                    <div className="mb-5 ml-5">
                      {toneLines.map((item, idx) => (
                        <p
                          key={idx}
                          className="text-start text-body2 text-[#F5F5F5]"
                        >
                          · {item.label} : {item.percent}%
                        </p>
                      ))}
                    </div>
                    <div>
                      <p className="text-secondary text-st1 mb-2">예시 대화</p>
                      <div className="space-y-2">
                        <p className="pl-5 text-body2 text-[#F5F5F5]">
                          · {formatToneExample(resultData.spec.tone_ex1)}
                        </p>
                        <p className="pl-5 text-body2 text-[#F5F5F5]">
                          · {formatToneExample(resultData.spec.tone_ex2)}
                        </p>
                        <p className="pl-5 text-body2 text-[#F5F5F5]">
                          · {formatToneExample(resultData.spec.tone_ex3)}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* 응답 패턴 */}
              <div className="mb-20">
                <div className="mt-20 mb-3 gap-0.5">
                  <p className="relative inline-block text-h6 text-primary-light mb-3">
                    응답 패턴
                    <span className="absolute left-0 -top-2 h-0.75 w-full bg-secondary"></span>
                  </p>
                </div>
                <div className="ml-10 space-y-4">
                  <div className="space-y-2">
                    <p>· 평균 응답 시간 : {resultData.spec.resp_time}초</p>
                    <p>· 즉각 응답 비율 : {resultData.spec.resp_ratio}%</p>
                    <p>· '읽씹' 발생률 : {resultData.spec.ignore}%</p>
                  </div>
                  <div>
                    <p className="text-secondary">
                      분석 : {resultData.spec.resp_analysis}
                    </p>
                  </div>
                </div>
              </div>

              {/* 대화 주제 비율 */}
              <div className="mb-20">
                <div>
                  <div className="mt-20 mb-3 gap-0.5">
                    <p className="relative inline-block text-h6 text-primary-light mb-3">
                      대화 주제 비율
                      <span className="absolute left-0 -top-2 h-0.75 w-full bg-secondary"></span>
                    </p>
                  </div>
                </div>
                <div className="flex justify-row gap-8 pl-8">
                  <div className="w-48 h-48 mb-2">
                    <Pie
                      data={topicPie}
                      options={pieOpts}
                      plugins={[percentLabels]}
                    />
                  </div>
                  <div className="space-y-1 mt-10 ml-10">
                    <p className="text-start text-body2 text-[#F5F5F5]">
                      · {resultData.spec.topic1} :{" "}
                      {resultData.spec.topic1_ratio}%
                    </p>
                    <p className="text-start text-body2 text-[#F5F5F5]">
                      · {resultData.spec.topic2} :{" "}
                      {resultData.spec.topic2_ratio}%
                    </p>

                    <p className="text-start text-body2 text-[#F5F5F5]">
                      · {resultData.spec.topic3} :{" "}
                      {resultData.spec.topic3_ratio}%
                    </p>
                    <p className="text-start text-body2 text-[#F5F5F5]">
                      · {resultData.spec.topic4} :{" "}
                      {resultData.spec.topic4_ratio}%
                    </p>
                  </div>
                </div>
              </div>

              {/* Chatto의 서비스 분석 */}
              <div className="mb-20">
                <div>
                  <div className="mt-20 mb-3 gap-0.5">
                    <p className="relative inline-block text-h6 text-primary-light mb-3">
                      챗토의 서비스 분석
                      <span className="absolute left-0 -top-2 h-0.75 w-full bg-secondary"></span>
                    </p>
                  </div>
                </div>
                <div>
                  <p className="ml-10">{resultData.spec.chatto_analysis}</p>
                </div>
              </div>

              {/* Chatto의 서비스 분석 */}
              <div className="mb-20">
                <div>
                  <div className="mt-20 mb-3 gap-0.5">
                    <p className="relative inline-block text-h6 text-primary-light mb-3">
                      챗토의 케미 레벨업 가이드
                      <span className="absolute left-0 -top-2 h-0.75 w-full bg-secondary"></span>
                    </p>
                  </div>
                </div>
                <p className="ml-10">{resultData.spec.chatto_levelup}</p>
                <div className="flex flex-col space-y-2 text-secondary-dark mt-5">
                  <p className="mt-2">Tip</p>
                  <p className="text-body2">
                    {resultData.spec.chatto_levelup_tips}
                  </p>
                </div>
              </div>
            </section>
          </div>
        </main>

        {/* 오른쪽 */}
        <div className="w-[214px] mt-52.5 flex flex-col items-center justify-start gap-1.5">
          <div className="w-full py-4 px-1 flex flex-col justify-center items-center border border-secondary-light rounded-lg">
            <DetailForm
              type={1}
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
            {resultData.result.isQuized ? (
              <button
                onClick={handleQuiz}
                disabled={loading}
                className="w-17 h-8 hover:bg-secondary hover:text-primary-dark cursor-pointer px-0.25 py-1 text-button border-2 border-secondary rounded-lg"
              >
                퀴즈 생성
              </button>
            ) : (
              <button
                onClick={() => {
                  navigate(`/play/quiz/${resultId}/${shareUUID}`);
                }}
                disabled={loading}
                className="w-17 h-8 hover:bg-secondary hover:text-primary-dark cursor-pointer px-0.25 py-1 text-button border-2 border-secondary rounded-lg"
              >
                퀴즈 보기
              </button>
            )}

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

// ──────────────────────────────────────────────────────────────
// 조각 안에 퍼센트 라벨을 그려주는 커스텀 플러그인
// (추가 설치 없이 사용 가능)
// ──────────────────────────────────────────────────────────────
const percentLabels = {
  id: "percentLabels",
  afterDatasetsDraw(chart, _args, options) {
    const { ctx, data } = chart;
    const ds = data.datasets?.[0];
    if (!ds) return;
    const meta = chart.getDatasetMeta(0);
    const values = (ds.data ?? []).map((v) => Number(v || 0));
    const total = values.reduce((a, b) => a + b, 0) || 1;

    ctx.save();
    ctx.fillStyle = options?.color || "#2E1A52"; // 보라 텍스트
    ctx.font =
      options?.font && typeof options.font === "string"
        ? options.font
        : "600 14px Pretendard, Noto Sans KR, sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    meta.data.forEach((arc, i) => {
      const v = values[i];
      if (!v) return;
      const p = Math.round((v / total) * 100);
      // 차트 중심에서 약간 안쪽으로 찍히는 내장 좌표 사용
      const pos = arc.tooltipPosition();
      ctx.fillText(`${p}%`, pos.x, pos.y);
    });
    ctx.restore();
  },
};
