import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { getMbtiAnalysisDetail } from "@/apis/api"; // 실제 API 호출 함수
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

export default function PlayMbtiAnalysisPage() {
  const { resultId } = useParams(); // URL 파라미터 추출
  const { setSelectedChatId } = useChat();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    startPeriod: "처음부터",
    endPeriod: "끝까지",
  });
  const updateForm = (patch) => setForm((prev) => ({ ...prev, ...patch }));
  const [resultData, setResultData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchResult = async () => {
      try {
        const data = await getMbtiAnalysisDetail(resultId); // API 호출
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
                  <span className="text-st1">MBTI 분석 결과</span>
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
                <h1>MBTI 결과 페이지</h1>
                <p>결과 ID: {resultId}</p>
                <p>content: {resultData.content}</p>
                <p>is_saved: {resultData.is_saved}</p>
                <p>analysis_date_start: {resultData.analysis_date_start}</p>
                <p>analysis_date_end: {resultData.analysis_date_end}</p>
                <p>created_at: {resultData.created_at}</p>
                <p>chat: {resultData.chat}</p>
              </div>
            </div>
          </div>
        </main>

        {/* 오른쪽 */}
        <div className="w-[214px] mt-52.5 flex flex-col items-center justify-start gap-4">
          <div className="w-full py-4 px-1 flex flex-col justify-center items-center border border-secondary-light rounded-lg">
            <DetailForm
              type={3} // 1=chemi, 2=some, 3=mbti
              value={form}
              onChange={updateForm}
              isAnalysis={true}
            />
            <button
              onClick={() => {}}
              disabled={loading}
              className="mt-6 w-19.75 h-8.5 hover:bg-secondary hover:text-primary-dark px-3 py-2 text-button border border-secondary rounded-lg"
            >
              다시 분석
            </button>
          </div>
          <div className="w-full flex justify-between items-center">
            <button
              onClick={() => {}}
              disabled={loading}
              className="w-16 h-8.5 hover:bg-secondary hover:text-primary-dark cursor-pointer px-0.25 py-2 text-button border border-secondary rounded-lg"
            >
              결과 공유
            </button>
            <button
              onClick={() => {}}
              disabled={loading}
              className="w-16 h-8.5 hover:bg-secondary hover:text-primary-dark cursor-pointer px-0.25 py-2 text-button border border-secondary rounded-lg"
            >
              결과 저장
            </button>
            <button
              onClick={() => {}}
              disabled={loading}
              className="w-16 h-8.5 hover:bg-secondary hover:text-primary-dark cursor-pointer px-0.25 py-2 text-button border border-secondary rounded-lg"
            >
              퀴즈 생성
            </button>
          </div>
          <div className="w-full h-[170px] p-3.75 pb-4.5 border border-secondary-light rounded-lg text-primary-light">
            <SmallServices />
          </div>
        </div>
      </div>
      <Icons.Chatto className="w-18.75 h-29.75 text-primary-light fixed bottom-5 right-12" />
    </div>
  );
}
