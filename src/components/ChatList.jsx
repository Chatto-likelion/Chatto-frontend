import { useState, useEffect, useCallback } from "react";
import {
  getChatList,
  deleteChat,
  getChatList_Bus,
  deleteChat_Bus,
} from "@/apis/api";
import { useAuth } from "../contexts/AuthContext.jsx";
import { useChat } from "@/contexts/ChatContext";
import * as Icons from "@/assets/svg";
import useCurrentMode from "@/hooks/useCurrentMode";

export default function ChatList() {
  const { user } = useAuth();
  const mode = useCurrentMode();
  const isPlay = mode === "play";

  const { selectedChatId, setSelectedChatId, chatListReloadRef } = useChat();

  const [chats, setChats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadChats = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const fetchFn = isPlay ? getChatList : getChatList_Bus;

      // NOTE: GET /play/chat/ 은 path param 없음 → 인자 없이 호출
      const data = await fetchFn();
      console.log("📌 API에서 받은 원본 chats 데이터:", data);
      setChats(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
      setError("채팅 목록을 불러오는데 실패했습니다.");
    } finally {
      setLoading(false);
    }
  }, [isPlay]);

  // 최초 및 모드 변경시 로드
  useEffect(() => {
    loadChats();
  }, [loadChats]);

  useEffect(() => {
    if (chatListReloadRef) {
      chatListReloadRef.current = loadChats;
      return () => {
        // 언마운트 시 정리
        if (chatListReloadRef.current === loadChats) {
          chatListReloadRef.current = null;
        }
      };
    }
  }, [chatListReloadRef, loadChats]);

  const handleDelete = async (chatId) => {
    try {
      setLoading(true);
      const deleteFn = isPlay ? deleteChat : deleteChat_Bus;
      await deleteFn(chatId);
      await loadChats();
      if (selectedChatId === chatId) setSelectedChatId(null);
    } catch (err) {
      console.error("채팅 삭제 실패:", err);
      setError("채팅 삭제에 실패했습니다.");
    } finally {
      setLoading(false);
    }
  };

  const handleSelect = (chatId) => {
    setSelectedChatId((prevId) => (prevId === chatId ? null : chatId));
  };

  if (loading && chats.length === 0) {
    return (
      <div
        className={`w-full pt-2 pl-3.75 pr-1.75 pb-3 flex flex-col items-center overflow-y-auto border ${
          isPlay ? "border-secondary-light" : "border-primary"
        } rounded-lg`}
      >
        <p className={`${isPlay ? "text-white" : "text-black"}`}>
          불러오는 중...
        </p>
      </div>
    );
  }

  return (
    <div
      className={`w-full pt-2 pl-3.75 pr-1.75 pb-3 flex flex-col items-center overflow-y-auto border ${
        isPlay ? "border-secondary-light" : "border-primary"
      } rounded-lg`}
    >
      <div className="w-47.5 gap-3 flex flex-col justify-between items-center">
        <p
          className={`w-full text-st1 ${
            isPlay ? "text-white" : "text-black"
          } text-center`}
        >
          업로드된 채팅
        </p>
        {/* 업로드된 채팅 리스트 */}
        <div className="w-full h-50 overflow-y-auto scrollbar-hide flex flex-col items-center">
          {(() => {
            const MS_DAY = 1000 * 60 * 60 * 24;

            const atMidnight = (d) => {
              const x = new Date(d);
              x.setHours(0, 0, 0, 0);
              return x;
            };

            const now0 = atMidnight(new Date());

            // 정렬
            const sorted = [...chats].sort(
              (a, b) => new Date(b.uploaded_at) - new Date(a.uploaded_at)
            );

            // 선택된 채팅 분리
            const selected =
              sorted.find((c) => c.chat_id === selectedChatId) || null;
            const rest = selected
              ? sorted.filter((c) => c.chat_id !== selected.chat_id)
              : sorted;

            // 카테고리 분류
            const today = [];
            const recent = []; // 1~7일
            const old = []; // 8일+

            rest.forEach((chat) => {
              const up0 = atMidnight(new Date(chat.uploaded_at));
              const diffDays = Math.floor((now0 - up0) / MS_DAY);
              if (diffDays === 0) today.push(chat);
              else if (diffDays <= 7) recent.push(chat);
              else old.push(chat);
            });

            const toDotYMD_KST = (d) => {
              const parts = new Intl.DateTimeFormat("ko-KR", {
                timeZone: "Asia/Seoul",
                year: "numeric",
                month: "2-digit",
                day: "2-digit",
              }).formatToParts(new Date(d));
              const y = parts.find((p) => p.type === "year").value;
              const m = parts.find((p) => p.type === "month").value;
              const day = parts.find((p) => p.type === "day").value;
              return `${y}.${m}.${day}.`;
            };

            const Item = ({ chat, isSelected }) => (
              <div className="w-47.5 mb-2 flex flex-col justify-center items-center">
                <div className="w-full gap-0.75 flex justify-between items-center">
                  <button
                    onClick={() => handleSelect(chat.chat_id)}
                    className={`w-45 h-7.25 text-body2 flex justify-between items-center px-3 py-2 rounded
              hover:${isPlay ? "bg-gray-5" : "bg-gray-2"} ${
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
                        {chat.title?.slice(0, 12) || "제목 없음"}
                      </span>
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
                    onClick={() => handleDelete(chat.chat_id)}
                  />
                </div>

                {isSelected && (
                  <div className="pr-3 w-full text-secondary-dark text-overline text-right opacity-100">
                    업로드 날짜: {toDotYMD_KST(chat.uploaded_at)}
                  </div>
                )}
              </div>
            );

            const Section = ({ title, items }) =>
              items.length ? (
                <div className="w-full flex flex-col items-center">
                  <div className="w-47.5 text-secondary-dark text-overline text-left mb-1">
                    {title}
                  </div>
                  {items.map((chat) => (
                    <Item key={chat.chat_id} chat={chat} isSelected={false} />
                  ))}
                </div>
              ) : null;

            return (
              <>
                {/* ✅ 선택된 채팅 최상단 */}
                {selected && <Item chat={selected} isSelected />}

                {/* 섹션: 오늘 / 최근 / 오래전 */}
                <Section title="오늘 업로드" items={today} />
                <Section title="최근 업로드" items={recent} />
                <Section title="오래전 업로드" items={old} />
              </>
            );
          })()}
        </div>
      </div>
    </div>
  );
}
