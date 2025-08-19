import { useParams } from "react-router-dom";
import { useEffect, useState, useMemo } from "react";
import {
  getChemiAnalysisDetail,
  getChatList,
  postChemiAnalyze,
  deleteChemiAnalysis,
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

export default function PlayChemiAnalysisPage() {
  const { resultId } = useParams();
  const { setSelectedChatId } = useChat();
  const navigate = useNavigate();
  const [modalOpen, setModalOpen] = useState(false);
  const shareUrl = "https://www.figma.com/file/abc...";
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

  // ───────────────── InteractionMatrix용 그래프 데이터 (tablesize + name_i) ─────────────────
  const graphData = useMemo(() => {
    const spec = resultData?.spec;
    if (!spec) return null;

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
    const links = [];
    for (let i = 0; i < m; i++) {
      const s = idxMap.get(Number(rows[i]));
      const t = idxMap.get(Number(cols[i]));
      const v = Number(vals[i] ?? 1);
      if (s == null || t == null || s === t) continue;
      links.push({
        source: String(s),
        target: String(t),
        value: v > 0 ? v : 1,
      });
    }

    return { nodes, links };
  }, [resultData]);

  // ───────────────── Pie 차트 데이터 (이미지 스타일 그대로) ─────────────────
  // 공통 옵션: 범례 숨김 + 반응형
  const pieOpts = {
    plugins: { legend: { display: false } },
    responsive: true,
    maintainAspectRatio: false,
  };

  // 배경 보라(#2E1A52)와 동일한 보더색을 써서 조각 사이에 "틈"을 만든다.
  const CHART_BG_PURPLE = "#2E1A52";
  const SLICE_FILL = "#FFF6B5";

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
          backgroundColor: SLICE_FILL,
          borderColor: CHART_BG_PURPLE,
          borderWidth: 8, // 두꺼운 갭
          offset: makeOffset(values),
        },
      ],
    };
  }, [resultData]);

  // 톤 한줄 요약(예: "긍정적 표현: 63%  농담/유머: 18%  비판적 의견: 7%")
  const toneLine = useMemo(() => {
    const ds = tonePie.datasets?.[0];
    if (!ds || !ds.data?.length) return "";
    const vals = ds.data.map((v) => Number(v || 0));
    const total = vals.reduce((a, b) => a + b, 0) || 1;
    return tonePie.labels
      .map((label, i) => {
        const p = Math.round((vals[i] / total) * 100);
        // 라벨 약간 다듬기
        const pretty =
          label === "긍정"
            ? "긍정적 표현"
            : label === "비판"
            ? "비판적 의견"
            : label;
        return `${pretty}: ${p}%`;
      })
      .join("  ");
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
          backgroundColor: SLICE_FILL,
          borderColor: CHART_BG_PURPLE,
          borderWidth: 8,
          offset: makeOffset(values),
        },
      ],
    };
  }, [resultData]);

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
        <main className="overflow-y-auto max-h-240 scrollbar-hide pt-28 w-[722px] flex flex-col justify-start items-center">
          <div className="w-full flex flex-col items-center gap-8">
            {/* 종합 케미 점수 */}
            <div className="w-full flex flex-col gap-4 p-6 text-left">
              <div className="flex justify-between">
                <div className="flex flex-col">
                  <span className="text-st1">종합 케미 점수</span>
                  <p>
                    <span className="text-h2 text-secondary">
                      {resultData.spec.score_main}
                    </span>
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
              <div className="text-st2 italic mt-2">
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

            {/* 대화 톤 (이미지 스타일) */}
            <section className="w-full p-6 border border-secondary rounded-lg">
              <h3 className="text-h6 font-bold mb-3">대화 톤</h3>
              <div className="flex items-center gap-8">
                <div className="w-48 h-48">
                  {/* 퍼센트 라벨 플러그인 사용 */}
                  <Pie
                    data={tonePie}
                    options={pieOpts}
                    plugins={[percentLabels]}
                  />
                </div>
                <div className="flex-1 text-st2 leading-7">
                  <p className="mb-2">{toneLine}</p>
                  {/* 아래 예시 문구/분석 문구는 API에 필드가 있다면 연결하세요. */}
                  {/* <p className="font-semibold text-secondary">예시 대화</p>
                  <p>긍정적 표현 → A: ...</p>
                  <p>농담/유머 → B: ...</p>
                  <p>비판적 의견 → C: ...</p> */}
                </div>
              </div>
              {/* <p className="mt-6 text-center text-st1">분석: ...</p> */}
            </section>

            {/* 대화 주제 비율 (같은 스타일) */}
            <section className="w-full p-6 border border-secondary rounded-lg">
              <h3 className="text-h6 font-bold mb-3">대화 주제 비율</h3>
              <div className="w-48 h-48 mb-2">
                <Pie
                  data={topicPie}
                  options={pieOpts}
                  plugins={[percentLabels]}
                />
              </div>
              {/* 필요 시 topicPie로 문장 요약을 만들어서 표시 가능 */}
            </section>

            {/* 기타 출력 */}
            <div className="w-full h-350 mb-20 p-4 gap-5 flex flex-col justify-start items-start border border-secondary-light rounded-lg text-body2 whitespace-pre-line">
              <div>
                <h1>케미 결과 페이지</h1>
                <p>결과 ID: {resultId}</p>
                <p>content: {resultData.result.content}</p>
                <p>is_saved: {resultData.result.is_saved}</p>
                <p>relationship: {resultData.result.relationship}</p>
                <p>situation: {resultData.result.situation}</p>
                <p>
                  analysis_date_start: {resultData.result.analysis_date_start}
                </p>
                <p>analysis_date_end: {resultData.result.analysis_date_end}</p>
                <p>created_at: {resultData.result.created_at}</p>
                <p>chat: {resultData.result.chat}</p>
              </div>
            </div>
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
