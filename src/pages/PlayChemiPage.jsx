import { Header, ChatList, FileUpload, BigServices } from "@/components";
import { postChat } from "@/apis/api";
import { useState, useRef } from "react";
import { useAuth } from "../contexts/AuthContext";
import * as Icons from "@/assets/svg/index.js";

export default function PlayChemiPage() {
  const { user } = useAuth();
  const [selectedChatId, setSelectedChatId] = useState(null);
  const chatListReloadRef = useRef();

  const handleChatSelect = (chatId) => {
    setSelectedChatId((prevId) => (prevId === chatId ? null : chatId));
    console.log("선택된 채팅:", chatId === selectedChatId ? "해제됨" : chatId);
  };

  const handleFileUpload = async (file) => {
    const formData = new FormData();
    formData.append("file", file);

    try {
      await postChat(1, formData);
      console.log("파일 업로드 성공");

      if (chatListReloadRef.current) {
        chatListReloadRef.current();
      }
    } catch (error) {
      console.error("파일 업로드 실패:", error);
    }
  };

  return (
    <div className="flex flex-col justify-start items-center min-h-screen bg-primary-dark text-white">
      {/* 상단 헤더 */}
      <Header />

      {/* 메인 레이아웃 */}
      <div className="w-300 pt-23.5 flex flex-col justify-center items-center">
        <div className="w-full mb-16 flex justify-start items-end gap-2 text-primary-light">
          <p className="text-h6">Chatto Play</p>
          <p className="text-body2">케미측정</p>
        </div>
        {/* 왼쪽 사이드 */}
        <div className="w-full flex justify-between items-end gap-2">
          {/* 업로드된 채팅 목록 */}
          <div className="gap-5 pt-22 mr-60.5 flex flex-col items-center justify-center">
            <ChatList
              onSelect={handleChatSelect}
              selectedChatId={selectedChatId}
              setSelectedChatId={setSelectedChatId}
              onUpload={chatListReloadRef}
            />

            {/* 대화 파일 첨부 */}

            <FileUpload onUpload={handleFileUpload} />
          </div>

          {/* 가운데 메인 */}
          <main className="w-100 mr-57 flex flex-col justify-start items-center">
            <Icons.ChemiIconFull className="mb-4" />
            <div className="w-full flex flex-col items-center text-body2 text-center mb-21">
              <p className="">우리의 케미는 얼마나 잘 맞을까?</p>
              <p className="t">
                주고받은 대화를 토대로 대화 참여자 간의 소통 궁합을
                확인해보세요.
                <br />말 속에 숨은 케미 지수를 한눈에 보여드립니다!
              </p>
            </div>

            {/* 세부 정보 폼 */}
            <div className="w-96 py-6.5 pl-11 pr-10 flex flex-col items-center border-2 border-primary-light rounded-lg">
              <div className="mb-8 flex flex-col gap-1">
                <div className="pl-1.5 gap-1 flex justify-center items-end">
                  <span className="bold text-h6 text-white">세부 정보</span>{" "}
                  <span className="text-caption text-gray-5">(Optional)</span>
                </div>
                <p className="text-caption text-white">
                  더 자세한 분석을 위해 추가 정보를 설정합니다.
                </p>
              </div>
              <div className="w-76 flex flex-col gap-3">
                <div className="w-full gap-26 flex justify-end items-center">
                  <p className="text-st1">분석대상 ⓘ</p>
                  <div className="w-30.75 pr-3.25 flex justify-end items-center">
                    <select className="text-end">
                      <option>23명</option>
                      <option>10명</option>
                    </select>
                  </div>
                </div>
                <div className="w-full gap-26 flex justify-end items-center">
                  <p className="text-st1">참여자 관계</p>
                  <div className="w-30.75 pr-3.25 flex justify-end items-center">
                    <select className="text-end">
                      <option>동아리 부원</option>
                      <option>회사 동료</option>
                    </select>
                  </div>
                </div>
                <div className="w-full gap-26 flex justify-end items-center">
                  <p className="text-st1">대화 상황</p>
                  <div className="w-30.75 pr-3.25 flex justify-end items-center">
                    <select className="text-end">
                      <option>일상대화</option>
                      <option>업무대화</option>
                    </select>
                  </div>
                </div>
                <div className="w-full gap-26 flex justify-end items-center">
                  <p className="text-st1">분석 기간</p>
                  <div className="w-30.75 flex justify-end items-center">
                    <select className="text-end">
                      <option>처음부터</option>
                      <option>최근 1개월</option>
                    </select>
                    <p className="w-3.25 text-st2 text-primary-light">~</p>
                  </div>
                </div>
              </div>
            </div>
            <button className="mt-4 px-4 py-2 bg-secondary text-black rounded">
              분석 시작
            </button>
          </main>

          {/* 오른쪽 사이드 */}
          <div className="w-29 h-140 border-2 border-primary-light p-4 bg-primary-dark">
            <BigServices />
          </div>
        </div>
      </div>
    </div>
  );
}
