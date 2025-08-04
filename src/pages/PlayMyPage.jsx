import {
  Header,
  ChatList,
  FileUpload,
  BigServices,
  DetailForm,
} from "@/components";
import { postChat, postAnalyze, getAnalysisDetail } from "@/apis/api";
import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import * as Icons from "@/assets/svg/index.js";
import SmallServices from "../components/SmallServices";

export default function PlayMyPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [selectedChatId, setSelectedChatId] = useState(null);
  const chatListReloadRef = useRef();

  const [peopleNum, setPeopleNum] = useState("23명");
  const [relation, setRelation] = useState("동아리 부원");
  const [situation, setSituation] = useState("일상대화");
  const [startPeriod, setStartPeriod] = useState("처음부터");
  const [endPeriod, setEndPeriod] = useState("끝까지");

  const [analysisResult, setAnalysisResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleChatSelect = (chatId) => {
    setSelectedChatId((prevId) => (prevId === chatId ? null : chatId));
    console.log("선택된 채팅:", chatId === selectedChatId ? "해제됨" : chatId);
  };

  const handleFileUpload = async (file) => {
    console.log("handleFileUpload 실행됨!", file);
    try {
      console.log("보낼 파일:", file);
      console.log("postChat 요청 시작 - userId:", user?.id || 1);

      const result = await postChat(user?.id || 1, file);
      console.log("파일 업로드 성공:", result);

      if (chatListReloadRef.current) {
        chatListReloadRef.current();
      }

      // 업로드한 채팅을 선택
      if (result?.chat_id) {
        setSelectedChatId(result.chat_id);
      }
    } catch (error) {
      console.error("파일 업로드 실패:", error);
    }
  };

  const handleAnalyze = async () => {
    if (!selectedChatId) {
      alert("먼저 채팅을 선택하세요.");
      return;
    }

    setLoading(true);
    setError(null);
    setAnalysisResult(null);

    const payload = {
      people_num: parseInt(peopleNum),
      rel: relation,
      situation,
      analysis_start: startPeriod,
      analysis_end: endPeriod,
    };

    try {
      const analyzeResponse = await postAnalyze(selectedChatId, payload);
      const resultId = analyzeResponse.result_id;
      const detailResponse = await getAnalysisDetail(resultId);
      setAnalysisResult(detailResponse);
    } catch (err) {
      console.error(err);
      setError(err.message || "분석에 실패했습니다.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // 선택된 채팅이 바뀌면 결과 초기화
    setAnalysisResult(null);
    setError(null);
  }, [selectedChatId]);

  return (
    <div className="flex flex-col justify-start items-start h-screen bg-primary-dark text-white">
      <Header />
      <div className="flex-1 pl-32.25 mt-12.75 overflow-hidden flex justify-between items-start">
        {/* 왼쪽 */}
        <div className="gap-5 pt-42.5 w-53.5 mr-15 flex flex-col items-center justify-center">
          <ChatList
            onSelect={handleChatSelect}
            selectedChatId={selectedChatId}
            setSelectedChatId={setSelectedChatId}
            onUploaded={chatListReloadRef}
          />
          <FileUpload onUpload={handleFileUpload} />
        </div>

        <main className="flex-1 max-h-240 pt-41.5 w-268.75 pr-18 flex flex-col justify-start items-center">
          <div className="w-full h-55.25 mb-11 pl-6.5 pr-7 rounded-lg border border-primary-light flex flex-col justify-start items-start gap-0.25">
            <div className="mt-11 w-75 flex justify-between items-start gap-8">
              <div className="w-21 flex flex-col gap-1">
                <div className="w-21 h-21 rounded-full bg-gray-4"></div>
                <p className="w-21 text-center text-overline text-gray-5 cursor-pointer">
                  프로필 변경
                </p>
              </div>
              <div className="pt-3 w-46 flex flex-col gap-5.5">
                <p className="w-full text-h6 text-start">{user.username}</p>
                <div className="w-full flex flex-col justify-center items-start gap-0.5">
                  <div className="w-full gap-1.5 flex justify-start items-center">
                    <p className="text-body1 text-secondary">크레딧</p>
                    <p className="text-body1 mr-1.5">{user.point}C</p>
                    <button
                      onClick={() => {
                        navigate("/CreditsPage");
                      }}
                      className="w-7.5 h-4.5 border border-secondary-dark rounded-sm text-gray-3 hover:bg-primary-light hover:text-primary-dark cursor-pointer"
                    >
                      <p className="text-caption">충전</p>
                    </button>
                  </div>
                  <div className="w-full gap-1.5 flex justify-start items-center">
                    <p className="text-body1 text-secondary">연락처</p>
                    <p className="text-body1">{user.phone}</p>
                  </div>
                  <div className="w-full gap-1.5 flex justify-start items-center">
                    <p className="text-body1 text-secondary">이메일</p>
                    <p className="text-body1">{user.email}</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="w-full h-6 flex justify-end items-center">
              <p className="text-caption cursor-pointer">정보수정</p>
            </div>
          </div>
          <div className="w-full mb-24 flex justify-center items-center">
            <p className="text-h6">분석 결과</p>
          </div>
          <div className="w-full overflow-y-auto"></div>
        </main>
      </div>
      <Icons.Chatto className="w-18.75 h-29.75 text-primary-light fixed bottom-5 right-12" />
    </div>
  );
}
