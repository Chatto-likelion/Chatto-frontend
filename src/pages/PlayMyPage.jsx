import { Header, ChatList, FileUpload } from "@/components";
import {
  getAnalysisList,
  deleteChemiAnalysis,
  deleteSomeAnalysis,
  deleteMbtiAnalysis,
  getChatList,
} from "@/apis/api";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { useChat } from "@/contexts/ChatContext";
import * as Icons from "@/assets/svg/index.js";
import { useKSTDateFormat } from "@/hooks/useKSTDateFormat";
import { useKSTDateLabel } from "@/hooks/useKSTDateLabel";

export default function PlayMyPage() {
  const { user } = useAuth();
  const { selectedChatId, setSelectedChatId } = useChat();
  const navigate = useNavigate();
  const [analyses, setAnalyses] = useState([]);
  const [chatMap, setChatMap] = useState({}); // chat_id → { title, people_num }
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const formatKST = useKSTDateFormat();
  const labelKST = useKSTDateLabel();

  const loadAnalyses = () => {
    setLoading(true);
    Promise.all([getAnalysisList(user.id), getChatList(user.id)])
      .then(([analysisData, chatData]) => {
        console.log("📌 analysis:", analysisData);
        console.log("📌 chats:", chatData);
        setAnalyses(analysisData);
        const map = Object.fromEntries(
          (chatData || []).map((c) => [
            c.chat_id,
            { title: c.title, people_num: c.people_num },
          ])
        );
        setChatMap(map);
        setSelectedChatId(null);
        setError(null);
      })
      .catch((err) => {
        console.error(err);
        setError("분석/채팅 목록을 불러오는데 실패했습니다.");
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadAnalyses();
  }, []);

  const handleDeleteAnalysis = (type, resultId) => {
    const deleteFn =
      type == 3
        ? deleteMbtiAnalysis
        : type == 2
        ? deleteSomeAnalysis
        : deleteChemiAnalysis;
    deleteFn(resultId)
      .then(() => {
        setSelectedChatId(null);
        setError(null);
        loadAnalyses();
      })
      .catch((err) => {
        console.error(err);
        setError("분석 목록을 불러오는데 실패했습니다.");
      });
  };

  const filteredAnalyses = [...analyses]
    .filter((it) =>
      selectedChatId != null ? it.chat === selectedChatId : true
    )
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

  return (
    <div className="flex flex-col justify-start items-start h-screen bg-primary-dark text-white">
      <Header />
      <div className="flex-1 pl-25.5 mt-18 overflow-hidden flex justify-between items-start">
        {/* 왼쪽 */}
        <div className="gap-5 pt-36 w-55.5 mr-12.75 flex flex-col items-center justify-center">
          <ChatList />
          <FileUpload />
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
                        navigate("/credit");
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
              {filteredAnalyses.map((item) => (
                <div
                  key={item.created_at}
                  className="w-82.5 h-63 px-2.75 pt-4 pb-3 text-gray-3 relative flex flex-col justify-between items-start rounded-lg border border-primary-light"
                >
                  <div className="w-full flex flex-col justify-start items-center">
                    <div className="w-full pr-3 flex justify-start items-center mb-2">
                      <p className="w-65 mr-5.5 text-h7">
                        {item.type == 3
                          ? "MBTI 분석"
                          : item.type == 2
                          ? "썸 판독기"
                          : "케미 분석기"}
                      </p>
                      <Icons.X
                        onClick={() => {
                          handleDeleteAnalysis(item.type, item.result_id);
                        }}
                        className="w-2.25 h-2.25 text-primary-light cursor-pointer"
                      />
                    </div>
                    <div className="w-full mb-3 pr-3 text-right text-body2 text-secondary-dark">
                      {formatKST(item.created_at)}
                    </div>

                    {(() => {
                      const chatInfo = chatMap[item.chat] || null;
                      const title = chatInfo?.title ?? item.title;
                      const people = chatInfo?.people_num ?? item.people_num;

                      const isSelected =
                        selectedChatId != null && item.chat === selectedChatId;
                      const base =
                        "w-75 h-8.5 px-2 py-1 rounded flex justify-start items-center text-body1";
                      const cls = isSelected
                        ? `${base} text-primary-dark bg-secondary-light`
                        : `${base} border border-secondary`;

                      return (
                        <div className={cls}>
                          <span className="w-36.5">{title}</span>
                          <div className="flex items-center gap-0.5">
                            <Icons.Person
                              className={`w-5.25 h-5.25 p-0.75 ${
                                isSelected ? "text-primary-dark" : "text-gray-2"
                              }`}
                            />
                            <span>{people}</span>
                          </div>
                        </div>
                      );
                    })()}
                  </div>
                  {item.type == 1 && (
                    <div className="w-74.5 px-2 flex flex-col justify-between items-center gap-0.5">
                      <div className="w-full h-6 flex justify-start items-center gap-6.5 text-start">
                        <p className="w-30">참여자 관계</p>
                        <p className="text-body2">{item.relationship}</p>
                      </div>
                      <div className="w-full h-6 flex justify-start items-center gap-6.5 text-start">
                        <p className="w-30">대화 상황</p>
                        <p className="text-body2">{item.situation}</p>
                      </div>
                      <div className="w-full h-6 flex justify-start items-center gap-6.5 text-start">
                        <p className="w-30">분석 기간</p>
                        <p className="text-body2">
                          {labelKST(item.analysis_date_start)} ~{" "}
                          {labelKST(item.analysis_date_end)}
                        </p>
                      </div>
                    </div>
                  )}
                  {item.type == 2 && (
                    <div className="w-74.5 px-2 flex flex-col justify-between items-center gap-0.5">
                      <div className="w-full h-6 flex justify-start items-center gap-6.5 text-start">
                        <p className="w-30">참여자 관계</p>
                        <p className="text-body2">{item.relationship}</p>
                      </div>
                      <div className="w-full h-6 flex justify-start items-center gap-6.5 text-start">
                        <p className="w-30">연령대</p>
                        <p className="text-body2">{item.age}</p>
                      </div>
                      <div className="w-full h-6 flex justify-start items-center gap-6.5 text-start">
                        <p className="w-30">분석 기간</p>
                        <p className="text-body2">
                          {labelKST(item.analysis_date_start)} ~{" "}
                          {labelKST(item.analysis_date_end)}
                        </p>
                      </div>
                    </div>
                  )}
                  {item.type == 3 && (
                    <div className="w-74.5 px-2 flex flex-col justify-between items-center gap-0.5">
                      <div className="w-full h-6 flex justify-start items-center gap-6.5 text-start">
                        <p className="w-30">분석 기간</p>
                        <p className="text-body2">
                          {labelKST(item.analysis_date_start)} ~{" "}
                          {labelKST(item.analysis_date_end)}
                        </p>
                      </div>
                    </div>
                  )}

                  <div className="w-full flex justify-start items-center gap-4 ">
                    <button
                      onClick={() => {
                        const type =
                          item.type == 3
                            ? "mbti"
                            : item.type == 2
                            ? "some"
                            : "chemi";
                        navigate(`/play/${type}/${item.result_id}`);
                      }}
                      className="ml-13 w-17.5 h-6.5 px-1.5 py-0.75 border border-secondary text-secondary text-button rounded hover:bg-primary-light hover:text-primary-dark cursor-pointer"
                    >
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
