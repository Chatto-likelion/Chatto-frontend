// src/components/UploadedChatList.jsx

import { useState, useEffect } from "react";
import { getChatList, deleteChat } from "@/apis/api";
import * as Icons from "@/assets/svg";

export default function ChatList({
  onSelect,
  selectedChatId,
  setSelectedChatId,
  onUploaded,
}) {
  const [chats, setChats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadChats = () => {
    setLoading(true);
    getChatList()
      .then((data) => {
        setChats(data);
        setError(null);
      })
      .catch((err) => {
        console.error(err);
        setError("채팅 목록을 불러오는데 실패했습니다.");
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadChats();
  }, []);

  useEffect(() => {
    if (onUploaded) {
      onUploaded.current = loadChats;
    }
  }, [onUploaded]);

  const handleDelete = (chatId) => {
    setLoading(true);
    deleteChat(chatId)
      .then(() => {
        loadChats();
        if (selectedChatId === chatId) {
          setSelectedChatId(null);
        }
      })
      .catch((err) => {
        console.error("채팅 삭제 실패:", err);
        setError("채팅 삭제에 실패했습니다.");
        setLoading(false);
      });
  };

  if (loading) {
    return (
      <div className="p-4 text-gray-300 text-sm">채팅 목록 불러오는 중...</div>
    );
  }

  if (error) {
    return <div className="p-4 text-red-500 text-sm">{error}</div>;
  }

  if (chats.length === 0) {
    return (
      <div className="p-4 text-gray-400 text-sm">업로드된 채팅이 없습니다.</div>
    );
  }

  return (
    <div className="w-53.5 pt-2 pl-3.75 pr-1.75 pb-3 flex flex-col overflow-y-auto border border-secondary-light rounded-lg">
      <div className="w-47.5 gap-3 flex flex-col justify-between items-center">
        <p className="w-full text-st1 text-white text-center">업로드된 채팅</p>
        <div className="w-full gap-0.5 flex flex-col items-center">
          {chats.map((chat) => {
            const isSelected = selectedChatId === chat.chat_id_play_chem;
            const uploadedDate = new Date(chat.uploaded_at);
            const now = new Date();
            const diffTime = now - uploadedDate;
            const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

            return (
              <div
                key={chat.chat_id_play_chem}
                className="w-47.5 flex flex-col justify-center items-center"
              >
                <div className="w-full gap-0.75 flex justify-between items-center">
                  <button
                    onClick={() => onSelect?.(chat.chat_id_play_chem)}
                    className={`w-45 h-7.25 text-body2 flex justify-between items-center px-3 py-2 rounded hover:bg-gray-5  ${
                      isSelected
                        ? "bg-secondary-light text-primary-dark"
                        : "border border-secondary text-secondary-light opacity-80"
                    }`}
                  >
                    <div className="flex items-center gap-0.75">
                      <span>{chat.title}</span>
                      {isSelected && (
                        <Icons.ArrowDown className="w-2 h-2 text-primary-dark" />
                      )}
                    </div>
                    <span>{chat.people_num}명</span>
                  </button>
                  <Icons.X
                    className="w-2 h-2 text-primary-light opacity-10 hover:opacity-100 cursor-pointer"
                    onClick={() => handleDelete(chat.chat_id_play_chem)}
                  />
                </div>
                <div
                  className={`pr-3 w-full text-secondary-dark text-overline text-right ${
                    isSelected ? "opacity-100 mb-3.5" : "opacity-60"
                  }`}
                >
                  {isSelected ? (
                    <>
                      업로드 날짜:{" "}
                      {uploadedDate.toLocaleDateString("ko-KR", {
                        year: "numeric",
                        month: "2-digit",
                        day: "2-digit",
                      })}
                    </>
                  ) : (
                    <>
                      {diffDays === 0
                        ? "오늘 업로드"
                        : `${diffDays}일 전 업로드`}
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
