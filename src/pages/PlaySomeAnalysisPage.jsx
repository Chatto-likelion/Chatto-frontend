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
} from "@/components";
import { useNavigate } from "react-router-dom";
import { useChat } from "@/contexts/ChatContext";
import * as Icons from "@/assets/svg/index.js";

export default function PlaySomeAnalysisPage() {
  const { resultId } = useParams(); // URL 파라미터 추출
  const { setSelectedChatId } = useChat();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    relationship: "",
    age: "",
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
      age: normalize(form.age),
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
        <main className="overflow-y-auto max-h-240 scrollbar-hide pt-28 w-[722px] flex flex-col justify-start items-center">
          {/* 결과 출력 */}
          {loading && <p className="mt-44 text-sm">분석 중입니다...</p>}
          {error && <p className="mt-4 text-sm text-red-500">{error}</p>}
          <div className="w-full flex flex-col items-center gap-6">
            <div className="w-full flex flex-col gap-4 p-6 text-left">
              <div className="flex justify-between">
                <div className="flex flex-col">
                  <span className="text-st1">썸 분석기 결과</span>
                  <span className="text-h2">82점</span>
                </div>
                <div className="flex flex-col text-st2 gap-0.5 mt-1">
                  <p>분석된 메시지 수: 1,342개</p>
                  <p>참여자 수: 23명</p>
                  <p>분석 기간: 최근 6개월</p>
                </div>
              </div>
              <div className="text-st2 italic mt-2">
                한 마디: “웃음과 공감이 폭발하는 안정적 팀워크!”
              </div>
            </div>

            <div className="w-full h-350 mb-20 p-4 gap-5 flex flex-col justify-start items-start border border-secondary-light rounded-lg text-body2 whitespace-pre-line">
              <div>
                <h1>썸 결과 페이지</h1>
                <p>결과 ID: {resultId}</p>
                <p>content: {resultData.result.content}</p>
                <p>is_saved: {resultData.result.is_saved}</p>
                <p>relationship: {resultData.result.relationship}</p>
                <p>age: {resultData.result.age}</p>
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
              onClick={() => {}}
              disabled={loading}
              className="w-17 h-8 hover:bg-secondary hover:text-primary-dark cursor-pointer px-0.25 py-1 text-button border-2 border-secondary rounded-lg"
            >
              결과 공유
            </button>
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
