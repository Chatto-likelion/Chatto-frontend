import { Header, ChatList, FileUpload } from "@/components";
import { postChat, getAnalysisList, getAnalysisList_Bus } from "@/apis/api";
import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import * as Icons from "@/assets/svg/index.js";

export default function PlayMyPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [selectedChatId, setSelectedChatId] = useState(null);
  const chatListReloadRef = useRef();
  const [analyses, setAnalyses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const handleChatSelect = (chatId) => {
    setSelectedChatId((prevId) => (prevId === chatId ? null : chatId));
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

  const loadAnalyses = () => {
    setLoading(true);
    getAnalysisList(user.id)
      .then((data) => {
        console.log("📌 API에서 받은 원본 analysis 데이터:", data); // 원본 데이터 구조 확인
        setAnalyses(data);
        setError(null);
      })
      .catch((err) => {
        console.error(err);
        setError("분석 목록을 불러오는데 실패했습니다.");
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadAnalyses();
  }, []);

  return (
    <div className="flex flex-col justify-start items-start h-screen bg-primary-dark text-white">
      <Header />
      <div className="flex-1 pl-25.5 mt-18 overflow-hidden flex justify-between items-start">
        {/* 왼쪽 */}
        <div className="gap-5 pt-47 w-55.5 mr-12.75 flex flex-col items-center justify-center">
          <ChatList
            onSelect={handleChatSelect}
            selectedChatId={selectedChatId}
            setSelectedChatId={setSelectedChatId}
            onUploaded={chatListReloadRef}
          />
          <FileUpload onUpload={handleFileUpload} />
        </div>

        <main className="flex-1 pt-36 w-269.25 flex flex-col justify-start items-center">
          <div className="w-full h-55.75 mb-11 pl-6.5 pr-7 rounded-lg border border-primary-light flex flex-col justify-start items-start gap-0.25">
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
                      className="w-8 h-5 border border-secondary-dark rounded-sm text-gray-3 hover:bg-primary-light hover:text-primary-dark cursor-pointer"
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
          <div className="w-full mb-5.75 flex justify-center items-center">
            <p className="text-h6">분석 결과</p>
          </div>
          <div className="w-full pr-1.5 border-r-2 border-white">
            <div className="w-full h-105 grid grid-cols-3 gap-6 overflow-y-auto custom-scrollbar">
              {[...analyses]
                .sort(
                  (a, b) =>
                    new Date(b.analysis_date) - new Date(a.analysis_date)
                )
                .map((item) => (
                  <div
                    key={item.result_id}
                    className="w-82.5 h-63 px-2.75 pt-4 pb-3 text-gray-3 relative flex flex-col justify-between items-center rounded-lg border border-primary-light"
                  >
                    <div className="w-full flex flex-col justify-start items-center">
                      <div className="w-full pr-3 flex justify-between items-center mb-2">
                        <p className="text-h7">{item.analysis_type}</p>
                        <Icons.X
                          onClick={() => {}}
                          className="w-2 h-2 text-primary-light cursor-pointer"
                        />
                      </div>
                      <div className="w-full mb-3 pr-3 text-right text-body2  text-secondary-dark">
                        {item.analysis_date}
                      </div>

                      <div className="w-75 h-8.5 px-3 py-2 rounded flex justify-between items-center mb-3 text-body1 border border-secondary">
                        <span>{item.chat}</span>
                        <div className="flex items-center gap-0.5">
                          <Icons.Person className="w-5.25 h-5.25 p-0.75 text-gray-2" />
                          <span>{item.chat}</span>
                        </div>
                      </div>
                    </div>

                    <div className="w-74.5 px-2 flex flex-col justify-between items-center gap-0.5">
                      <div className="w-full h-6 flex justify-start items-center gap-6.5 text-start">
                        <p className="w-30">분석 기간</p>
                        <p className="text-body2">25.04.14 ~ 25.04.14</p>
                      </div>
                      <div className="w-full h-6 flex justify-start items-center gap-6.5 text-start">
                        <p className="w-30">분석 기간</p>
                        <p className="text-body2">25.04.14</p>
                      </div>
                    </div>

                    <div className="w-full flex justify-start items-center gap-4 ">
                      <button className="ml-13 w-17.5 h-6.5 px-1.5 py-0.75 border border-secondary text-secondary text-button rounded hover:bg-primary-light hover:text-primary-dark cursor-pointer">
                        분석 보기
                      </button>
                      <button className="w-17.5 h-6.5 px-1.5 py-0.75 border border-secondary text-secondary text-button rounded hover:bg-primary-light hover:text-primary-dark cursor-pointer">
                        퀴즈 보기
                      </button>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
