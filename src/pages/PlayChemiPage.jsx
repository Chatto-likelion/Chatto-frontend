import { Header, ChatList, FileUpload, BigServices } from "@/components";
import { postChat } from "@/apis/api";
import { useState } from "react";
import { useAuth } from "../contexts/AuthContext";

export default function PlayChemiPage() {
  const { user } = useAuth();
  const [selectedChatId, setSelectedChatId] = useState(null);

  const handleChatSelect = (chatId) => {
    setSelectedChatId((prevId) => (prevId === chatId ? null : chatId));
    console.log("선택된 채팅:", chatId === selectedChatId ? "해제됨" : chatId);
  };

  return (
    <div className="flex flex-col min-h-screen bg-primary-dark text-white">
      {/* 상단 헤더 */}
      <Header />

      {/* 메인 레이아웃 */}
      <div className="flex flex-1">
        {/* 왼쪽 사이드 */}
        <aside className="w-70 p-4 space-y-6 bg-primary-dark border-r border-primary">
          {/* 업로드된 채팅 목록 */}
          <section>
            <h2 className="mb-2 font-semibold">업로드된 채팅</h2>
            <ChatList
              onSelect={handleChatSelect}
              selectedChat={selectedChatId}
            />
          </section>

          {/* 대화 파일 첨부 */}
          <section>
            <FileUpload
              onUpload={(file) => {
                // postChat(user.id, file);
                postChat(1, file);
              }}
            />
          </section>
        </aside>

        {/* 가운데 메인 */}
        <main className="flex-1 p-8 flex flex-col items-center text-center">
          <div className="max-w-lg space-y-6">
            <div>
              <h2 className="text-2xl font-bold mb-2">
                우리의 케미는 얼마나 잘 맞을까?
              </h2>
              <p className="text-sm text-grayscale-2">
                주고받은 대화를 토대로 대화 참여자 간의 소통 궁합을
                확인해보세요.
                <br />말 속에 숨은 케미 지수를 한눈에 보여드립니다!
              </p>
            </div>

            {/* 세부 정보 폼 */}
            <div className="w-full p-4 bg-grayscale-10 rounded-lg space-y-2">
              <h3 className="font-semibold mb-2">세부 정보 (Optional)</h3>
              <div className="grid grid-cols-2 gap-2 text-left text-sm">
                <label>
                  분석 대상
                  <select className="w-full mt-1 p-1 rounded bg-grayscale-9">
                    <option>23명</option>
                    <option>10명</option>
                  </select>
                </label>
                <label>
                  참여자 관계
                  <select className="w-full mt-1 p-1 rounded bg-grayscale-9">
                    <option>동아리 부원</option>
                    <option>회사 동료</option>
                  </select>
                </label>
                <label>
                  대화 상황
                  <select className="w-full mt-1 p-1 rounded bg-grayscale-9">
                    <option>일상대화</option>
                    <option>업무대화</option>
                  </select>
                </label>
                <label>
                  분석 기간
                  <select className="w-full mt-1 p-1 rounded bg-grayscale-9">
                    <option>처음부터</option>
                    <option>최근 1개월</option>
                  </select>
                </label>
              </div>
              <button className="mt-4 px-4 py-2 bg-secondary text-black rounded">
                분석 시작
              </button>
            </div>
          </div>
        </main>

        {/* 오른쪽 사이드 */}
        <aside className="w-64 p-4 bg-primary-dark border-l border-primary">
          <BigServices />
        </aside>
      </div>
    </div>
  );
}
