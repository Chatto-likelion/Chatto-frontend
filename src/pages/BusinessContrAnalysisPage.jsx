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

export default function BusinessContrAnalysisPage() {
  const { resultId } = useParams(); // URL 파라미터 추출
  const { setSelectedChatId } = useChat();
  const navigate = useNavigate();
  const [modalOpen, setModalOpen] = useState(false);
  const [shareUrl, setShareUrl] = useState(null);
  const [shareFetching, setShareFetching] = useState(false);
  const [shareError, setShareError] = useState(null);
  const makeShareUrl = (uuid) =>
    `${window.location.origin}/business/contr/share/${uuid}`; // 라우팅 규칙에 맞게 수정 가능

  const handleOpenShare = async () => {
    setModalOpen(true); // 모달 먼저 열고 로딩 스피너 보여주고 싶다면
    if (shareUrl || shareFetching) return; // 이미 발급중/발급완료면 재호출 X

    try {
      setShareFetching(true);
      setShareError(null);
      const uuid = await postUUID_Bus("contr", resultId);
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
  const [chatIds, setChatIds] = useState(() => new Set()); // 채팅 id 집합
  const [hasSourceChat, setHasSourceChat] = useState(null); // true/false/null
  const [loading, setLoading] = useState(true);
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

  // 비활성화 조건 및 사유
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
  if (!resultData) return null; // 방어: 혹시 모를 케이스

  return (
    <div className="flex flex-col justify-start items-center h-screen bg-white text-primary-dark">
      <Header />
      <div className="relative flex-1 w-[1352px] mt-17.5 overflow-hidden flex justify-between items-start">
        {/* 왼쪽 */}
        <div className="gap-5 mt-52.5 w-53.5 flex flex-col items-center justify-center">
          <ChatList onDeleted={handleChatDeleted} />
          <FileUpload />
        </div>

        {/* 가운데 */}
        <main className="overflow-y-auto max-h-240 scrollbar-hide pt-28 w-[722px] flex flex-col justify-start items-center">
          {/* 결과 출력 */}
          {loading && (
            <p className="mt-44 text-sm text-primary-dark">분석 중입니다...</p>
          )}
          {error && <p className="mt-4 text-sm text-red-500">{error}</p>}
          <div className="w-full flex flex-col items-center gap-6">
            <div className="w-full flex flex-col gap-4 p-6 text-left">
              <div className="flex justify-between">
                <div className="flex flex-col">
                  <span className="text-st1 text-primary-dark">
                    업무 참여도 분석
                  </span>
                  <span className="text-h2 text-primary-dark">82점</span>
                </div>
                <div className="flex flex-col text-st2 text-black gap-0.5 mt-1">
                  <p>분석된 메시지 수: 1,342개</p>
                  <p>참여자 수: 23명</p>
                  <p>분석 기간: 최근 6개월</p>
                </div>
              </div>
              <div className="text-st2 text-primary-dark italic mt-2">
                한 마디: “웃음과 공감이 폭발하는 안정적 팀워크!”
              </div>
            </div>

            <div className="w-full h-350 mb-20 p-4 gap-5 flex flex-col justify-start items-start border border-primary rounded-lg text-body2 text-black whitespace-pre-line">
              <div>
                <h1>업무 참여도 분석 결과 페이지</h1>
                <p>결과 ID: {resultId}</p>
                <p>content: {resultData.result.content}</p>
                <p>is_saved: {resultData.result.is_saved}</p>
                <p>project_type: {resultData.result.project_type}</p>
                <p>team_type: {resultData.result.team_type}</p>
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
          <div className="w-full py-4 px-1 flex flex-col justify-center items-center border border-primary rounded-lg  bg-white">
            <DetailForm
              type={1} // 1=contr
              value={form}
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
                    ? "border-primary-light text-primary-light cursor-not-allowed"
                    : "border-primary hover:text-white hover:bg-primary text-primary",
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
