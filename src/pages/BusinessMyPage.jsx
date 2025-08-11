import { Header, ChatList, FileUpload } from "@/components";
import { getAnalysisList_Bus, deleteContrAnalysis } from "@/apis/api";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { useChat } from "@/contexts/ChatContext";
import * as Icons from "@/assets/svg/index.js";

export default function BusinessMyPage() {
  const { user } = useAuth();
  const { setSelectedChatId } = useChat();
  const navigate = useNavigate();
  const [analyses, setAnalyses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadAnalyses = () => {
    setLoading(true);
    getAnalysisList_Bus(user.id)
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

  const handleDeleteAnalysis = (type, resultId) => {
    const deleteFn = type == 2 ? deleteContrAnalysis : deleteContrAnalysis;
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

  return (
    <div className="flex flex-col justify-start items-start h-screen bg-white text-gray-7">
      <Header />
      <div className="flex-1 pl-25.5 mt-18 overflow-hidden flex justify-between items-start">
        {/* 왼쪽 */}
        <div className="gap-5 pt-47 w-55.5 mr-12.75 flex flex-col items-center justify-center">
          <ChatList />
          <FileUpload />
        </div>

        <main className="flex-1 pt-36 w-269.25 flex flex-col justify-start items-center">
          <div className="w-full h-55.75 mb-11 pl-6.5 pr-7 rounded-lg border border-primary flex flex-col justify-start items-start gap-0.25">
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
                    <p className="text-body1 text-secondary-dark">크레딧</p>
                    <p className="text-body1 mr-1.5">{user.point}C</p>
                    <button
                      onClick={() => {
                        navigate("/credit");
                      }}
                      className="w-8 h-5 border border-secondary-dark rounded-sm hover:bg-secondary-dark hover:text-white cursor-pointer"
                    >
                      <p className="text-caption">충전</p>
                    </button>
                  </div>
                  <div className="w-full gap-1.5 flex justify-start items-center">
                    <p className="text-body1 text-secondary-dark">연락처</p>
                    <p className="text-body1">{user.phone}</p>
                  </div>
                  <div className="w-full gap-1.5 flex justify-start items-center">
                    <p className="text-body1 text-secondary-dark">이메일</p>
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
          <div className="w-full pr-1.5 border-r-2 border-primary-dark">
            <div className="w-full h-105 grid grid-cols-3 gap-6 overflow-y-auto custom-scrollbar-bus">
              {[...analyses]
                .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
                .map((item) => (
                  <div
                    key={item.created_at}
                    className="w-82.5 h-63 px-2.75 pt-4 pb-3 text-gray-7 relative flex flex-col justify-between items-center rounded-lg border border-primary-dark"
                  >
                    <div className="w-full flex flex-col justify-start items-center">
                      <div className="w-full pr-3 flex justify-start items-center mb-2">
                        <p className="w-65 mr-5.5 text-h7">
                          {item.type == 1
                            ? "업무 참여도 분석"
                            : "소통 구조 분석"}
                        </p>
                        <Icons.X
                          onClick={() => {
                            handleDeleteAnalysis(item.type, item.result_id);
                          }}
                          className="w-2.25 h-2.25 text-primary-light cursor-pointer"
                        />
                      </div>
                      <div className="w-full mb-3 pr-3 text-right text-body2 text-secondary-dark">
                        {item.created_at}
                      </div>

                      <div className="w-75 h-8.5 px-2 py-1 rounded flex justify-start items-center text-body1 text-primary-dark border border-secondary-dark">
                        <span className="w-36.5">{item.title}</span>
                        <div className="flex items-center gap-0.5">
                          <Icons.Person className="w-5.25 h-5.25 p-0.75" />
                          <span>{item.people_num}</span>
                        </div>
                      </div>
                    </div>

                    {item.type == 1 && (
                      <div className="w-74.5 px-2 flex flex-col justify-between items-center gap-0.5">
                        <div className="w-full h-6 flex justify-start items-center gap-6.5 text-start">
                          <p className="w-30">프로젝트 유형</p>
                          <p className="text-body2">{item.project_type}</p>
                        </div>
                        <div className="w-full h-6 flex justify-start items-center gap-6.5 text-start">
                          <p className="w-30">팀 유형</p>
                          <p className="text-body2">{item.team_type}</p>
                        </div>
                        <div className="w-full h-6 flex justify-start items-center gap-6.5 text-start">
                          <p className="w-30">분석 기간</p>
                          <p className="text-body2">25.04.13. ~ 25.08.03.</p>
                        </div>
                      </div>
                    )}

                    {item.type == 2 && (
                      <div className="w-74.5 px-2 flex flex-col justify-between items-center gap-0.5">
                        <div className="w-full h-6 flex justify-start items-center gap-6.5 text-start">
                          <p className="w-30">프로젝트 유형</p>
                          <p className="text-body2">{item.project_type}</p>
                        </div>
                        <div className="w-full h-6 flex justify-start items-center gap-6.5 text-start">
                          <p className="w-30">팀 유형</p>
                          <p className="text-body2">{item.team_type}</p>
                        </div>
                        <div className="w-full h-6 flex justify-start items-center gap-6.5 text-start">
                          <p className="w-30">분석 기간</p>
                          <p className="text-body2">25.04.13. ~ 25.08.03.</p>
                        </div>
                      </div>
                    )}

                    <div className="w-full flex justify-start items-center gap-4 ">
                      <button
                        onClick={() => {
                          const type = item.type == 1 ? "contr" : "contr";
                          navigate(`/business/${type}/${item.result_id}`);
                        }}
                        className="ml-13 w-17.5 h-6.5 px-1.5 py-0.75 border border-primary-dark text-primary-dark text-button rounded hover:bg-primary-dark hover:text-white cursor-pointer"
                      >
                        분석 보기
                      </button>
                      <button className="w-17.5 h-6.5 px-1.5 py-0.75 border border-primary-dark text-primary-dark text-button rounded hover:bg-primary-dark hover:text-white cursor-pointer">
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
