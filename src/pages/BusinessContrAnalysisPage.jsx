import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { getContrAnalysisDetail, deleteContrAnalysis } from "@/apis/api"; // 실제 API 호출 함수
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

export default function BusinessContrAnalysisPage() {
  const { resultId } = useParams(); // URL 파라미터 추출
  const { setSelectedChatId } = useChat();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    project_type: "",
    team_type: "입력 안 함",
    analysis_start: "처음부터",
    analysis_end: "끝까지",
  });
  const updateForm = (patch) => setForm((prev) => ({ ...prev, ...patch }));
  const [resultData, setResultData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchResult = async () => {
      try {
        const data = await getContrAnalysisDetail(resultId); // API 호출
        setResultData(data.result);
        setSelectedChatId(data.result.chat);
      } catch (err) {
        setError(err.message || "결과를 불러오지 못했습니다.");
      } finally {
        setLoading(false);
      }
    };

    fetchResult();
  }, [resultId]);

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

  if (loading) return <p>결과를 불러오는 중...</p>;
  if (error) return <p style={{ color: "red" }}>{error}</p>;

  return (
    <div className="flex flex-col justify-start items-center h-screen bg-white text-primary-dark">
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
                <p>content: {resultData.content}</p>
                <p>is_saved: {resultData.is_saved}</p>
                <p>project_type: {resultData.project_type}</p>
                <p>team_type: {resultData.team_type}</p>
                <p>analysis_date_start: {resultData.analysis_date_start}</p>
                <p>analysis_date_end: {resultData.analysis_date_end}</p>
                <p>created_at: {resultData.created_at}</p>
                <p>chat: {resultData.chat}</p>
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
            <button
              onClick={() => {}}
              disabled={loading}
              className="mt-6 w-18.5 h-6.5 px-1.5 py-1 flex justify-center gap-0.5 items-center hover:bg-primary hover:text-white text-caption text-primary border border-primary rounded-lg"
            >
              다시 분석
              <Icons.Search className="w-2.5 h-2.5" />
            </button>
          </div>
          <div className="w-full flex justify-between items-center">
            <button
              onClick={() => {}}
              disabled={loading}
              className="w-25 h-8 hover:bg-primary-dark hover:text-white cursor-pointer px-1.5 py-1 text-button text-primary-dark border-2 border-primary-dark rounded-lg"
            >
              결과 공유
            </button>
            <button
              onClick={() => handleDelete}
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
