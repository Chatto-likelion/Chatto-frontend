// src/components/UploadedChatList.jsx

import { useState, useEffect } from "react";
import { getChatList } from "@/apis/api";
import { Button } from "@/components";
import * as Icons from "@/assets/svg";

export default function ChatList({ onSelect, selectedChat }) {
  const [chats, setChats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    getChatList()
      .then((data) => {
        setChats(data);
      })
      .catch((err) => {
        console.error(err);
        setError(err);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="p-4 text-gray-300 text-sm">채팅 목록 불러오는 중...</div>
    );
  }

  if (error) {
    return (
      <div className="p-4 text-red-500 text-sm">
        채팅 목록을 불러오는데 실패했습니다.
      </div>
    );
  }

  if (chats.length === 0) {
    return (
      <div className="p-4 text-gray-400 text-sm">업로드된 채팅이 없습니다.</div>
    );
  }

  return (
    <div className="space-y-2">
      {chats.map((chat) => {
        const isSelected = selectedChat === chat.chat_id_play_chem;
        const uploadedDate = new Date(chat.uploaded_at);
        const now = new Date();
        const diffTime = now - uploadedDate;
        const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

        return (
          <div
            key={chat.chat_id_play_chem}
            className="w-full flex justify-between items-center gap-1"
          >
            <div className="w-50 flex flex-col justify-center items-end">
              <button
                onClick={() => onSelect?.(chat.chat_id_play_chem)}
                className={`w-full flex justify-between items-center px-3 py-2 rounded hover:bg-grayscale-8 text-black ${
                  isSelected ? "bg-primary" : "bg-gray-2"
                }`}
              >
                <span className="truncate">{chat.title}</span>
                <span className="text-sm text-grayscale-4">
                  {chat.people_num}명
                </span>
              </button>
              <div
                className={`w-full text-secondary-dark text-overline text-right
              ${isSelected ? "opacity-100" : "opacity-60"}`}
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
                    {diffDays === 0 ? "오늘 업로드" : `${diffDays}일 전 업로드`}
                  </>
                )}
              </div>
            </div>
            <Icons.X className="w-6 h-6 pb-3 text-primary-light opacity-10 hover:opacity-100" />
          </div>
        );
      })}
    </div>
  );
}
