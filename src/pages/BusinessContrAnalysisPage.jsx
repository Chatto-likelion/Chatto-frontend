import { useParams } from "react-router-dom";
import { useEffect, useState, useCallback, useMemo } from "react";
import {
  getContrAnalysisDetail,
  getChatList_Bus,
  postContrAnalyze,
  deleteContrAnalysis,
  postUUID_Bus,
  getUUID_Bus,
  postCreditUsage,
} from "@/apis/api"; // 실제 API 호출 함수
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
import { useAuth } from "../contexts/AuthContext";
import { useChat } from "@/contexts/ChatContext";
import * as Icons from "@/assets/svg/index.js";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
  Legend,
  LineChart,
  Line,
} from "recharts";

export default function BusinessContrAnalysisPage() {
  const { resultId } = useParams();
  const { user } = useAuth();
  const { setSelectedChatId } = useChat();
  const navigate = useNavigate();
  const [modalOpen, setModalOpen] = useState(false);
  const [shareUrl, setShareUrl] = useState(null);
  const [shareFetching, setShareFetching] = useState(false);
  const [shareError, setShareError] = useState(null);
  const [shareUUID, setShareUUID] = useState(null);

  const makeShareUrl = (uuid) =>
    `${window.location.origin}/business/contr/share/${uuid}`;

  const normalizeUuid = (v) => (typeof v === "string" ? v : v?.uuid ?? null);

  const ensureUuid = useCallback(async () => {
    if (!resultId) return null;
    if (shareUUID) return shareUUID;

    let uuid = null;
    try {
      const got = await getUUID_Bus(resultId);
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
      const created = await postUUID_Bus(resultId);
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
    project_type: "",
    team_type: "입력 안 함",
    analysis_start: "처음부터",
    analysis_end: "끝까지",
  });
  const updateForm = (patch) => setForm((prev) => ({ ...prev, ...patch }));

  const [resultData, setResultData] = useState(null);
  const [chatIds, setChatIds] = useState(() => new Set());
  const [hasSourceChat, setHasSourceChat] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState(0);

  const sourceChatId = resultData?.result?.chat ?? null;

  const handleChatDeleted = useCallback(
    (deletedId) => {
      setChatIds((prev) => {
        const next = new Set(prev);
        next.delete(deletedId);
        setHasSourceChat(sourceChatId ? next.has(sourceChatId) : null);
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
          getContrAnalysisDetail(resultId),
          getChatList_Bus(),
        ]);
        if (!alive) return;

        const chatId = detail.result.chat;
        setResultData(detail);
        setSelectedChatId(chatId);
        setForm({
          project_type: detail.result.project_type,
          team_type: detail.result.team_type,
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
      resultData.result.project_type === normalize(form.project_type) &&
      resultData.result.team_type === form.team_type &&
      resultData.result.analysis_date_start === form.analysis_start &&
      resultData.result.analysis_date_end === form.analysis_end
    );
  }, [resultData?.result, form]);

  const disableAnalyze = loading || hasSourceChat === false || isSameNow;

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
      project_type: normalize(form.project_type),
      team_type: form.team_type,
      analysis_start: form.analysis_start,
      analysis_end: form.analysis_end,
    };

    try {
      const analyzeResponse = await postContrAnalyze(
        resultData.result.chat,
        payload
      );
      const newResultId = analyzeResponse.result_id;
      navigate(`/business/contr/${newResultId}`);
    } catch (err) {
      setError(err.message || "분석에 실패했습니다.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    try {
      await deleteContrAnalysis(resultId);
      navigate("/business/contr/");
    } catch (err) {
      setError(err.message || "분석에 실패했습니다.");
    } finally {
      setLoading(false);
    }
  };

  const [isRevealed, setIsRevealed] = useState(false);
  const handleReveal = () => {
    if (user.credit >= 2) {
      postCreditUsage({
        amount: 2,
        usage: "Business 업무 참여도 분석",
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

  // ✅ 툴팁 커스터마이징 (항목 별 보기)
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div
          className="custom-tooltip"
          style={{
            backgroundColor: "#fff",
            padding: "10px",
            border: "1px solid #ccc",
          }}
        >
          <p className="intro">{`${payload[0].value}`}</p>
        </div>
      );
    }
    return null;
  };

  // ✅ 툴팁 커스터마이징 (기간별 보기)
  const CustomLineTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div
          className="custom-tooltip"
          style={{
            backgroundColor: "#fff",
            padding: "10px",
            border: "1px solid #ccc",
          }}
        >
          {/* 이 부분을 제거하거나 주석 처리하여 기간 명을 숨깁니다. */}
          {/* <p className="label">{`기간: ${label}`}</p> */}
          {payload.map((entry, index) => (
            <p key={index} style={{ color: entry.color }}>
              {`${entry.name}: ${entry.value}`}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  // ✅ 데이터 가공 훅 수정 (map 후 filter)
  const allItemChartsData = useMemo(() => {
    if (!resultData?.spec_period || resultData.spec_period.length === 0) {
      return [];
    }

    const periods = [
      "period_1",
      "period_2",
      "period_3",
      "period_4",
      "period_5",
      "period_6",
    ];
    const analysisMap = new Map();

    resultData.spec_period.forEach((entry) => {
      const { analysis, name, ...periodData } = entry;
      if (!analysisMap.has(analysis)) {
        analysisMap.set(analysis, []);
      }
      analysisMap.get(analysis).push({ name, periodData });
    });

    // 최종 차트 데이터 구조로 변환
    const transformedData = [];
    analysisMap.forEach((peopleData, analysisTitle) => {
      const chartData = periods.map((period) => {
        const periodObj = { name: `기간 ${period.slice(-1)}` };
        peopleData.forEach((person) => {
          periodObj[person.name] = person.periodData[period];
        });
        return periodObj;
      });
      transformedData.push({ title: analysisTitle, data: chartData });
    });

    return transformedData;
  }, [resultData]);

  const CustomXAxisTick = ({ x, y, payload }) => {
    // payload.value는 '기간 1', '기간 2' 같은 값입니다.
    // 이 값에 따라 원하는 텍스트를 반환합니다.
    if (payload.value === "기간 1") {
      return (
        <text x={x} y={y} dy={16} textAnchor="middle" fill="#666">
          {resultData.result.analysis_date_start}
        </text>
      );
    }
    if (payload.value === "기간 6") {
      return (
        <text x={x} y={y} dy={16} textAnchor="middle" fill="#666">
          {resultData.result.analysis_date_end}
        </text>
      );
    }
    return null; // 그 외의 틱은 숨깁니다.
  };

  return (
    <div className="flex flex-col justify-start items-center h-screen bg-white text-primary-dark ">
      <Header />
      <div className="relative flex-1 w-[1352px] flex justify-between items-start pt-[72px]">
        {/* 왼쪽 */}
        <div className="gap-5 mt-52.5 w-53.5 flex flex-col items-center justify-center">
          <ChatList onDeleted={handleChatDeleted} />
          <FileUpload />
        </div>

        {/* 가운데 */}
        <main className="overflow-y-auto scrollbar-hide pt-28 pb-28 w-[722px] h-[calc(100vh-72px)] flex flex-col justify-start items-start">
          {loading && <p className="mt-44 text-sm">분석 중입니다...</p>}
          {error && <p className="mt-4 text-sm text-red-500">{error}</p>}

          {!loading && !error && (
            <div className="w-full flex flex-col items-start">
              {/* 종합 케미 점수 */}
              <div className="w-full flex flex-col items-start gap-8">
                <p className="text-h6 text-primary">업무 참여도 분석</p>

                <div className="flex flex-col gap-1.5 mt-1">
                  <div>
                    <p className="text-h7 text-primary pb-2">
                      "{resultData.result.title}" 참여도 분석
                    </p>
                    <div className="text-body1 text-[#262626] pl-3">
                      <p>
                        분석 기간 : {resultData.result.analysis_date_start} ~{" "}
                        {resultData.result.analysis_date_end}
                      </p>
                      <p>참여자 : {resultData.result.people_num}</p>
                      <p>분석된 메세지 수 : {resultData.spec.total_talks}</p>
                      <p>팀장 : {resultData.spec.leader}</p>
                    </div>
                  </div>
                  <p className="text-caption text-[#8C8C8C] pl-3 mt-2">
                    본 분석은 정보 공유, 문제 해결, 협력 태도, 응답 성실도 등
                    4가지 지표를 종합하여 산출되었습니다.
                  </p>
                </div>
              </div>

              <div className="flex justify-between border-secondary-dark w-full mt-10">
                {["항목별 보기", "개인별 보기", "기간별 보기"].map(
                  (tab, idx) => (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(idx)}
                      style={{ height: "39px" }}
                      className={`w-[128px] h-[39px] text-st1 rounded-t-md border-2 border-b-0 border-primary  
                  ${
                    activeTab === idx
                      ? "bg-primary-dark text-[#FFFFFF] border-primary"
                      : "bg-white text-[#BFBFBF]"
                  }`}
                    >
                      {tab}
                    </button>
                  )
                )}
              </div>

              {/* 탭별 컨텐츠 */}
              <div className="w-full p-4 gap-5 flex flex-col justify-start items-start border-2 rounded-b-lg border-primary text-body2 text-black">
                <div className="w-full mt-6">
                  {/* 항목별 보기 */}
                  {activeTab === 0 && (
                    <section className="w-full bg-white p-4">
                      {!resultData?.spec_personal ||
                      resultData.spec_personal.length <= 1 ? (
                        <div className="w-full flex justify-center items-center h-40">
                          <p className="text-sm text-gray-500">
                            분석은 2명 이상의 참여자가 있을 때 제공됩니다.
                          </p>
                        </div>
                      ) : (
                        <div className="flex flex-col gap-20 w-full">
                          {/* 참여도 */}
                          <div>
                            <p className="relative inline-block text-h7 text-primary-dark mb-5">
                              종합 참여 점수
                              <span className="absolute left-0 -top-2 h-0.75 w-full bg-secondary-dark"></span>
                            </p>
                            <div className="w-full overflow-x-auto border-3 border-primary rounded-lg">
                              <div
                                style={{
                                  minWidth: `${
                                    resultData.spec_personal.length * 80
                                  }px`,
                                  height: "240px",
                                }}
                              >
                                <ResponsiveContainer width="100%" height="100%">
                                  <BarChart
                                    data={[...resultData.spec_personal].sort(
                                      (a, b) => a.rank - b.rank
                                    )}
                                    margin={{
                                      top: 30,
                                      right: 10,
                                      left: 0,
                                      bottom: 10,
                                    }}
                                  >
                                    <CartesianGrid
                                      vertical={false}
                                      horizontal={false}
                                    />
                                    <XAxis
                                      dataKey="name"
                                      axisLine
                                      tickLine={false}
                                    />
                                    <YAxis hide />
                                    <Tooltip content={<CustomTooltip />} />
                                    <Bar
                                      dataKey="participation"
                                      fill="#4C1E95"
                                      barSize={40}
                                    />
                                  </BarChart>
                                </ResponsiveContainer>
                              </div>
                            </div>
                          </div>

                          {/* 정보 공유 */}
                          <div>
                            <p className="relative inline-block text-h7 text-primary-dark mb-5">
                              정보 공유
                              <span className="absolute left-0 -top-2 h-0.75 w-full bg-secondary-dark"></span>
                            </p>
                            <div className="w-full overflow-x-auto border-3 border-primary rounded-lg">
                              <div
                                style={{
                                  minWidth: `${
                                    resultData.spec_personal.length * 80
                                  }px`,
                                  height: "240px",
                                }}
                              >
                                <ResponsiveContainer width="100%" height="100%">
                                  <BarChart
                                    data={[...resultData.spec_personal].sort(
                                      (a, b) => a.rank - b.rank
                                    )}
                                    margin={{
                                      top: 30,
                                      right: 10,
                                      left: 0,
                                      bottom: 10,
                                    }}
                                  >
                                    <CartesianGrid
                                      vertical={false}
                                      horizontal={false}
                                    />
                                    <XAxis
                                      dataKey="name"
                                      axisLine
                                      tickLine={false}
                                    />
                                    <YAxis hide />
                                    <Tooltip content={<CustomTooltip />} />
                                    <Bar
                                      dataKey="infoshare"
                                      fill="#4C1E95"
                                      barSize={40}
                                    />
                                  </BarChart>
                                </ResponsiveContainer>
                              </div>
                            </div>
                          </div>

                          {/* 문제 해결 */}
                          <div>
                            <p className="relative inline-block text-h7 text-primary-dark mb-5">
                              문제 해결 참여
                              <span className="absolute left-0 -top-2 h-0.75 w-full bg-secondary-dark"></span>
                            </p>
                            <div className="w-full overflow-x-auto border-3 border-primary rounded-lg">
                              <div
                                style={{
                                  minWidth: `${
                                    resultData.spec_personal.length * 80
                                  }px`,
                                  height: "240px",
                                }}
                              >
                                <ResponsiveContainer width="100%" height="100%">
                                  <BarChart
                                    data={[...resultData.spec_personal].sort(
                                      (a, b) => a.rank - b.rank
                                    )}
                                    margin={{
                                      top: 30,
                                      right: 10,
                                      left: 0,
                                      bottom: 10,
                                    }}
                                  >
                                    <CartesianGrid
                                      vertical={false}
                                      horizontal={false}
                                    />
                                    <XAxis
                                      dataKey="name"
                                      axisLine
                                      tickLine={false}
                                    />
                                    <YAxis hide />
                                    <Tooltip content={<CustomTooltip />} />
                                    <Bar
                                      dataKey="probsolve"
                                      fill="#4C1E95"
                                      barSize={40}
                                    />
                                  </BarChart>
                                </ResponsiveContainer>
                              </div>
                            </div>
                          </div>

                          {/* 주도적 제안 */}
                          <div>
                            <p className="relative inline-block text-h7 text-primary-dark mb-5">
                              주도적 제안
                              <span className="absolute left-0 -top-2 h-0.75 w-full bg-secondary-dark"></span>
                            </p>
                            <div className="w-full overflow-x-auto border-3 border-primary rounded-lg">
                              <div
                                style={{
                                  minWidth: `${
                                    resultData.spec_personal.length * 80
                                  }px`,
                                  height: "240px",
                                }}
                              >
                                <ResponsiveContainer width="100%" height="100%">
                                  <BarChart
                                    data={[...resultData.spec_personal].sort(
                                      (a, b) => a.rank - b.rank
                                    )}
                                    margin={{
                                      top: 30,
                                      right: 10,
                                      left: 0,
                                      bottom: 10,
                                    }}
                                  >
                                    <CartesianGrid
                                      vertical={false}
                                      horizontal={false}
                                    />
                                    <XAxis
                                      dataKey="name"
                                      axisLine
                                      tickLine={false}
                                    />
                                    <YAxis hide />
                                    <Tooltip content={<CustomTooltip />} />
                                    <Bar
                                      dataKey="proposal"
                                      fill="#4C1E95"
                                      barSize={40}
                                    />
                                  </BarChart>
                                </ResponsiveContainer>
                              </div>
                            </div>
                          </div>

                          {/* 응답 속도 */}
                          <div>
                            <p className="relative inline-block text-h7 text-primary-dark mb-5">
                              응답 속도
                              <span className="absolute left-0 -top-2 h-0.75 w-full bg-secondary-dark"></span>
                            </p>
                            <div className="w-full overflow-x-auto border-3 border-primary rounded-lg">
                              <div
                                style={{
                                  minWidth: `${
                                    resultData.spec_personal.length * 80
                                  }px`,
                                  height: "240px",
                                }}
                              >
                                <ResponsiveContainer width="100%" height="100%">
                                  <BarChart
                                    data={[...resultData.spec_personal].sort(
                                      (a, b) => a.rank - b.rank
                                    )}
                                    margin={{
                                      top: 30,
                                      right: 10,
                                      left: 0,
                                      bottom: 10,
                                    }}
                                  >
                                    <CartesianGrid
                                      vertical={false}
                                      horizontal={false}
                                    />
                                    <XAxis
                                      dataKey="name"
                                      axisLine
                                      tickLine={false}
                                    />
                                    <YAxis hide />
                                    <Tooltip content={<CustomTooltip />} />
                                    <Bar
                                      dataKey="resptime"
                                      fill="#4C1E95"
                                      barSize={40}
                                    />
                                  </BarChart>
                                </ResponsiveContainer>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </section>
                  )}

                  {activeTab === 1 && (
                    <section>
                      <div className="p-4 ">
                        <p className="relative inline-block text-h7 text-primary-dark mb-5">
                          개인별 참여도 프로파일
                          <span className="absolute left-0 -top-2 h-0.75 w-full bg-secondary-dark"></span>
                        </p>
                        {/* `spec_personal` 배열을 map 함수로 순회하여 각 사람의 프로필을 렌더링 */}
                        {resultData.spec_personal.map((person) => (
                          <div
                            key={person.specpersonal_id}
                            className="mb-10 p-4"
                          >
                            <div className="mb-8">
                              <div className="flex justify-between items-center text-primary">
                                <div className="text-h7 mb-1">
                                  {person.name}
                                  {person.name === resultData.spec.leader && (
                                    <span className=""> (팀장)</span>
                                  )}
                                </div>
                                <div className="text-body1 text-primary">
                                  {person.type}
                                </div>
                              </div>

                              <p className="text-gray-7 pl-0.25">
                                총 참여 점수:{" "}
                                <span className="text-secondary-dark">
                                  {person.participation}
                                </span>
                                점
                              </p>
                            </div>

                            <div className="flex items-start">
                              {/* 세부 지표 목록 */}
                              <div className="w-40 ml-20 mr-30 flex flex-col gap-2 text-[#595959]">
                                <p>정보 공유</p>
                                <p>문제 해결 참여</p>
                                <p>주도적 제안</p>
                                <p>응답 속도</p>
                              </div>

                              {/* 세부 지표 점수 (텍스트) */}
                              <div className="mr-46 flex flex-col gap-2">
                                <p className="font-bold text-[#262626]">
                                  {getMetricText(person.infoshare)}
                                </p>
                                <p className="font-bold text-[#262626]">
                                  {getMetricText(person.probsolve)}
                                </p>
                                <p className="font-bold text-[#262626]">
                                  {getMetricText(person.proposal)}{" "}
                                </p>
                                <p className="font-bold text-[#262626]">
                                  {getMetricText(person.resptime)}
                                </p>
                              </div>
                            </div>

                            {/* AI 분석 */}
                            <div className="mt-4 pt-4 ml-4">
                              <p className="text-body2 text-primary">
                                <span className="font-bold">분석:</span>{" "}
                                {person.analysis}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </section>
                  )}

                  {activeTab === 2 && (
                    <section className="relative">
                      {!isRevealed && (
                        <CreditWall onClick={handleReveal} cost={2} />
                      )}
                      <section className="mb-20">
                        {/* 5개의 항목별 기간 추이 차트를 동적으로 렌더링 */}
                        {allItemChartsData.map((chart, index) => (
                          <div key={index} className="w-full mb-15">
                            <p className="relative inline-block text-h7 text-primary-dark mb-5">
                              {chart.title}
                              <span className="absolute left-0 -top-2 h-0.75 w-full bg-secondary-dark"></span>
                            </p>
                            <div className="flex justify-center pr-3 py-5 border-2 border-primary rounded-lg">
                              <div className="relative w-full h-">
                                <ResponsiveContainer width="90%" height={270}>
                                  <LineChart data={chart.data}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis
                                      dataKey="name"
                                      tick={<CustomXAxisTick />}
                                      axisLine={false}
                                      tickLine={false}
                                    />
                                    <YAxis
                                      domain={[0, 100]}
                                      tick={false}
                                      axisLine={false}
                                      tickLine={false}
                                    />
                                    <Tooltip content={<CustomLineTooltip />} />

                                    <Legend
                                      verticalAlign="bottom"
                                      align="center"
                                      layout="horizontal"
                                      wrapperStyle={{ marginTop: "1rem" }}
                                    />

                                    {/* API에서 가져온 유저 이름으로 Line을 동적으로 생성 */}
                                    {resultData?.spec_personal?.map((p) => (
                                      <Line
                                        key={p.name}
                                        type="monotone" // 부드러운 곡선 차트
                                        dataKey={p.name}
                                        stroke={`#${(
                                          (Math.random() * 0xffffff) <<
                                          0
                                        )
                                          .toString(16)
                                          .padStart(6, "0")}`}
                                      />
                                    ))}
                                  </LineChart>
                                </ResponsiveContainer>
                              </div>
                            </div>
                          </div>
                        ))}
                      </section>
                    </section>
                  )}
                  <div className="mb-5 mt-10 px-4">
                    <p className="relative inline-block text-h7 text-primary-dark mb-5">
                      AI 종합 인사이트
                      <span className="absolute left-0 -top-2 h-0.75 w-full bg-secondary-dark"></span>
                    </p>
                    <p className="mb-20">{resultData.spec.insights}</p>
                  </div>
                  <div className="mb-10 px-4">
                    <p className="relative inline-block text-h7 text-primary-dark mb-5">
                      추천 액션
                      <span className="absolute left-0 -top-2 h-0.75 w-full bg-secondary-dark"></span>
                    </p>
                    <p>{resultData.spec.recommendation}</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>

        {/* 오른쪽 */}
        <div className="w-[214px] mt-52.5 flex flex-col items-center justify-start gap-1.5">
          <div className="w-full py-4 px-1 flex flex-col justify-center items-center border border-primary rounded-lg  bg-white">
            <DetailForm
              type={1}
              value={form}
              onChange={updateForm}
              isAnalysis={true}
            />
            <div className="relative group mt-6">
              <button
                onClick={handleAnalyze}
                disabled={disableAnalyze}
                className={[
                  "w-18.5 h-6.5 px-1.5 py-1 flex justify-center gap-0.5 items-center text-caption rounded-lg border transition-colors duration-150",
                  disableAnalyze
                    ? "border-primary-light text-primary-light cursor-not-allowed"
                    : "border-primary hover:text-white hover:bg-primary text-primary",
                ].join(" ")}
              >
                다시 분석
                <Icons.Search className="w-2.5 h-2.5" />
              </button>
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
              disabled={loading}
              className="w-25 h-8 hover:bg-primary-dark hover:text-white cursor-pointer px-1.5 py-1 text-button text-primary-dark border-2 border-primary-dark rounded-lg"
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
            <button
              onClick={() => handleDelete()}
              disabled={loading}
              className="w-25 h-8 hover:bg-primary-dark hover:text-white cursor-pointer px-1.5 py-1 text-button text-primary-dark border-2 border-primary-dark rounded-lg"
            >
              결과 삭제
            </button>
          </div>
          <div className="w-full h-[116px] mt-2 p-3.75 pb-4.5 border border-primary bg-white rounded-lg text-primary-dark">
            <SmallServices />
          </div>
        </div>
      </div>
      <Icons.Chatto className="w-18.75 h-29.75 text-primary-dark fixed bottom-5 right-12" />
    </div>
  );
}

// 점수를 텍스트로 변환하는 헬퍼 함수
const getMetricText = (score) => {
  if (score === null || score === undefined) return "분석 불가";
  if (score >= 90) {
    return "매우 높음";
  }
  if (score >= 70) {
    return "매우 적극적";
  }
  if (score >= 50) {
    return "적극적";
  }
  if (score >= 30) {
    return "평균 수준";
  }
  if (score >= 1) {
    return "노력 필요";
  }
  return "데이터 없음";
};
