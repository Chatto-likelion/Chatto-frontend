import { useState, useEffect } from "react";
import {
  getChatList,
  deleteChat,
  getChatList_Bus,
  deleteChat_Bus,
} from "@/apis/api";
import { useAuth } from "../contexts/AuthContext.jsx";
import * as Icons from "@/assets/svg";
import useCurrentMode from "@/hooks/useCurrentMode";

export default function ChatList({
  onSelect,
  selectedChatId,
  setSelectedChatId,
  onUploaded,
}) {
  const { user } = useAuth();
  const mode = useCurrentMode();
  const [chats, setChats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const isPlay = mode === "play";

  const loadChats = () => {
    setLoading(true);
    const fetchFn = isPlay ? getChatList : getChatList_Bus;
    fetchFn(user.id)
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
    const deleteFn = isPlay ? deleteChat : deleteChat_Bus;
    deleteFn(chatId)
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

  // 클래스 스타일 분기
  const containerBorder = isPlay ? "border-secondary-light" : "border-primary";
  const titleColor = isPlay ? "text-white" : "text-black";
  const loadingTextColor = isPlay ? "text-gray-300" : "text-gray-700";

  if (loading) {
    return (
      <div
        className={`w-full h-51.25 pt-2 pl-3.75 pr-1.75 pb-3 flex flex-col overflow-y-auto border ${containerBorder} rounded-lg`}
      >
        <div className="w-47.5 gap-3 flex flex-col justify-between items-center">
          <p className={`w-full text-st1 ${titleColor} text-center`}>
            업로드된 채팅
          </p>
          <div className={`p-4 ${loadingTextColor} text-sm`}>
            채팅 목록 불러오는 중...
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return <div className="p-4 text-red-500 text-sm">{error}</div>;
  }

  if (chats.length === 0) {
    return (
      <div className={`p-4 ${loadingTextColor} text-sm`}>
        업로드된 채팅이 없습니다.
      </div>
    );
  }

  return (
    <div
      className={`w-full pt-2 pl-3.75 pr-1.75 pb-3 flex flex-col items-center overflow-y-auto border ${containerBorder} rounded-lg`}
    >
      <div className="w-47.5 gap-3 flex flex-col justify-between items-center">
        <p className={`w-full text-st1 ${titleColor} text-center`}>
          업로드된 채팅
        </p>
        <div className="w-full gap-0.5 flex flex-col items-center">
          {[...chats]
            .sort((a, b) => new Date(b.uploaded_at) - new Date(a.uploaded_at))
            .slice(0, 3)
            .map((chat) => {
              const isSelected = selectedChatId === chat.id;
              const uploadedDate = new Date(chat.uploaded_at);
              const now = new Date();
              const diffDays = Math.floor(
                (now - uploadedDate) / (1000 * 60 * 60 * 24)
              );

              return (
                <div
                  key={chat.id}
                  className="w-47.5 flex flex-col justify-center items-center"
                >
                  <div className="w-full gap-0.75 flex justify-between items-center">
                    <button
                      onClick={() => onSelect?.(chat.id)}
                      className={`w-45 h-7.25 text-body2 flex justify-between items-center px-3 py-2 rounded hover:bg-${
                        isPlay ? "gray-5" : "gray-2"
                      } ${
                        isSelected
                          ? isPlay
                            ? "bg-secondary-light text-primary-dark"
                            : "bg-primary-light text-primary-dark"
                          : isPlay
                          ? "border border-secondary text-secondary-light opacity-80"
                          : "border border-primary text-gray-6 opacity-80"
                      }`}
                    >
                      <div className="flex items-center gap-0.75">
                        <span className={isPlay ? "" : "text-gray-7"}>
                          {chat.title.slice(0, 12)}
                        </span>
                        {isSelected && (
                          <Icons.ArrowDown className="w-2 h-2 text-primary-dark" />
                        )}
                      </div>
                      <div className="flex items-center gap-0.5">
                        <Icons.Person
                          className={`w-5.25 h-5.25 p-0.75 ${
                            isSelected
                              ? "text-primary-dark"
                              : isPlay
                              ? "text-secondary-light"
                              : "text-gray-6 opacity-80"
                          }`}
                        />
                        <span>{chat.people_num}</span>
                      </div>
                    </button>
                    <Icons.X
                      className={`w-2 h-2 ${
                        isPlay ? "text-primary-light" : "text-primary"
                      } opacity-10 hover:opacity-100 cursor-pointer`}
                      onClick={() => handleDelete(chat.id)}
                    />
                  </div>
                  <div
                    className={`pr-3 w-full ${
                      isPlay ? "text-secondary-dark" : "text-primary"
                    } text-overline text-right ${
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
