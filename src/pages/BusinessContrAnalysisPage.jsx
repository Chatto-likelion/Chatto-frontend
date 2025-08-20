import { useParams } from "react-router-dom";
import { useEffect, useState, useCallback, useMemo } from "react";
import {
  getContrAnalysisDetail,
  getChatList_Bus,
  postContrAnalyze,
  deleteContrAnalysis,
  postUUID_Bus,
} from "@/apis/api"; // 실제 API 호출 함수
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
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
  Legend,
} from "recharts";

export default function BusinessContrAnalysisPage() {
  const { resultId } = useParams(); // URL 파라미터 추출
  const { setSelectedChatId } = useChat();
  const navigate = useNavigate();
  const [modalOpen, setModalOpen] = useState(false);
  const [shareUrl, setShareUrl] = useState(null);
  const [shareFetching, setShareFetching] = useState(false);
  const [shareError, setShareError] = useState(null);

  const makeShareUrl = (uuid) =>
    `${window.location.origin}/business/contr/share/${uuid}`;

  const handleOpenShare = async () => {
    setModalOpen(true);
    if (shareUrl || shareFetching) return;

    try {
      setShareFetching(true);
      setShareError(null);
      const uuid = await postUUID_Bus("contrib", resultId);
      setShareUrl(makeShareUrl(uuid));
    } catch (e) {
      setShareError(e.message || "공유 링크 발급에 실패했습니다.");
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

  if (loading) return <p className="mt-44 text-sm">분석 중입니다...</p>;
  if (error) return <p className="mt-4 text-sm text-red-500">{error}</p>;
  if (!resultData) return null;

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
        <main className="overflow-y-auto scrollbar-hide pt-28 w-[722px] h-[calc(100vh-72px)] flex flex-col justify-start items-start">
          {/* 종합 케미 점수 */}
          <div className="w-full flex flex-col items-start gap-8">
            <p className="text-h6 text-bold text-primary">업무 분석</p>

            <div className="flex flex-col gap-1.5 mt-1">
              <div>
                <p className="text-h9 text-primary pb-2">
                  "{resultData.result.title}" 참여도 분석
                </p>
                <div className="text-body1 text-[#262626] pl-3">
                  <p>
                    분석 기간 : {resultData.result.analysis_date_start} ~{" "}
                    {resultData.result.analysis_date_end}
                  </p>
                  <p>참여자 : {resultData.result.people_num}</p>
                  <p>대화 총량 : {resultData.spec.total_talks}</p>
                  <p>팀장 : {resultData.spec.leader}</p>
                  <p>평균 응답 속도 : {resultData.spec.avg_resp}</p>
                </div>
              </div>
              <p className="text-caption text-[#8C8C8C] pl-3 mt-2">
                본 분석은 정보 공유, 문제 해결, 협력 태도, 응답 성실도 등 4가지
                지표를 종합하여 산출되었습니다.
              </p>
            </div>
          </div>

          <div className="flex justify-between border-secondary-dark w-full mt-10">
            {["항목별 보기", "개인별 보기", "기간별 보기"].map((tab, idx) => (
              <button
                key={tab}
                onClick={() => setActiveTab(idx)}
                style={{ height: "39px" }}
                className={`w-[128px] h-[39px] text-st1 rounded-t-md border-3 border-primary  
                  ${
                    activeTab === idx
                      ? "bg-primary-dark text-[#FFFFFF] border-primary"
                      : "bg-white text-[#BFBFBF]"
                  }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* 탭별 컨텐츠 */}
          <div className="w-full mb-20 p-4 gap-5 flex flex-col justify-start items-start border border-t-4 border-primary text-body2 text-black">
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
                                  top: 10,
                                  right: 10,
                                  left: 0,
                                  bottom: 30,
                                }} // ✅ bottom 여백 추가
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
                                <Tooltip />
                                <Bar dataKey="participation" fill="#4C1E95" />
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
                                  top: 10,
                                  right: 10,
                                  left: 0,
                                  bottom: 30,
                                }} // ✅ bottom 여백 추가
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
                                <Tooltip />
                                <Bar dataKey="infoshare" fill="#4C1E95" />
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
                                  top: 10,
                                  right: 10,
                                  left: 0,
                                  bottom: 30,
                                }} // ✅ bottom 여백 추가
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
                                <Tooltip />
                                <Bar dataKey="probsolve" fill="#4C1E95D" />
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
                                  top: 10,
                                  right: 10,
                                  left: 0,
                                  bottom: 30,
                                }} // ✅ bottom 여백 추가
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
                                <Tooltip />
                                <Bar dataKey="resptime" fill="#6A0DAD" />
                              </BarChart>
                            </ResponsiveContainer>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </section>
              )}
              <div className="mb-5 mt-10">
                <p className="relative inline-block text-h7 text-primary-dark mb-5">
                  AI 종합 인사이트
                  <span className="absolute left-0 -top-2 h-0.75 w-full bg-secondary-dark"></span>
                </p>
                <p>{resultData.spec.insights}</p>
              </div>
              <div className="mb-40">
                <p className="relative inline-block text-h7 text-primary-dark mb-5">
                  추천 액션
                  <span className="absolute left-0 -top-2 h-0.75 w-full bg-secondary-dark"></span>
                </p>
                <p>{resultData.spec.recommendation}</p>
              </div>

              {activeTab === 1 && (
                <section>
                  <h2 className="text-h6 mb-2">개인별 참여 점수</h2>
                  <p>여기에 개인별 보기 내용을 넣으면 됩니다.</p>
                </section>
              )}

              {activeTab === 2 && (
                <section>
                  <h2 className="text-h6 mb-2">기간별 참여 점수</h2>
                  <p>여기에 기간별 보기 내용을 넣으면 됩니다.</p>
                </section>
              )}
            </div>
          </div>
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
