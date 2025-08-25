import { useState, useEffect, useCallback, useRef } from "react";
import {
  getChatList,
  deleteChat,
  putChat,
  getChatList_Bus,
  deleteChat_Bus,
  putChat_Bus,
} from "@/apis/api";
import { useChat } from "@/contexts/ChatContext";
import * as Icons from "@/assets/svg";
import useCurrentMode from "@/hooks/useCurrentMode";

export default function ChatList(onDeleted) {
  const mode = useCurrentMode();
  const isPlay = mode === "play";

  const { selectedChatId, setSelectedChatId, chatListReloadRef } = useChat();

  const [chats, setChats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [editingId, setEditingId] = useState(null);
  const [editingValue, setEditingValue] = useState("");
  const editBoxRef = useRef(null);

  const loadChats = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const fetchFn = isPlay ? getChatList : getChatList_Bus;

      const data = await fetchFn();
      setChats(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
      setError("채팅 목록을 불러오는데 실패했습니다.");
    } finally {
      setLoading(false);
    }
  }, [isPlay]);

  useEffect(() => {
    loadChats();
  }, [loadChats]);

  useEffect(() => {
    if (chatListReloadRef) {
      chatListReloadRef.current = loadChats;
      return () => {
        if (chatListReloadRef.current === loadChats) {
          chatListReloadRef.current = null;
        }
      };
    }
  }, [chatListReloadRef, loadChats]);

  useEffect(() => {
    if (editingId == null) return;

    const handleOutside = (e) => {
      const box = editBoxRef.current;
      if (box && !box.contains(e.target)) {
        cancelEdit();
      }
    };

    document.addEventListener("mousedown", handleOutside, true);
    document.addEventListener("touchstart", handleOutside, true);
    return () => {
      document.removeEventListener("mousedown", handleOutside, true);
      document.removeEventListener("touchstart", handleOutside, true);
    };
  }, [editingId]);

  const handleDelete = async (chatId) => {
    try {
      setLoading(true);
      const deleteFn = isPlay ? deleteChat : deleteChat_Bus;
      await deleteFn(chatId);
      setChats((prev) => prev.filter((c) => c.chat_id !== chatId));
      if (selectedChatId === chatId) setSelectedChatId(null);
      onDeleted?.(chatId);
      await loadChats();
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

  const startEdit = (chat) => {
    setEditingId(chat.chat_id);
    setEditingValue(chat.title || "");
  };
  const cancelEdit = () => {
    setEditingId(null);
    setEditingValue("");
  };
  const saveEdit = async (chat, title) => {
    if (!title) return;
    const prev = chats;
    setChats((old) =>
      old.map((c) => (c.chat_id === chat.chat_id ? { ...c, title } : c))
    );
    try {
      const fn = isPlay ? putChat : putChat_Bus;
      await fn(chat.chat_id, title);
      window.location.reload();
    } catch (e) {
      console.error("제목 수정 실패:", e);
      setChats(prev);
      setError("제목 수정에 실패했습니다.");
    } finally {
      cancelEdit();
    }
  };

  if (loading && chats.length === 0) {
    return (
      <div
        className={`w-full pt-2 pl-3.75 pr-1.75 pb-3 flex flex-col justify-center items-center overflow-y-auto border ${
          isPlay ? "border-secondary-light" : "border-primary"
        } rounded-lg`}
      >
        <span
          className={`inline-block w-5 h-5 rounded-full border-2 ${
            isPlay ? "border-secondary-light" : "border-primary"
          } border-t-transparent animate-spin`}
        />
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

            const Item = ({ chat, isSelected }) => {
              const isEditingThis = editingId === chat.chat_id;
              const [isComposing, setIsComposing] = useState(false);
              const inputRef = useRef(null);

              const onKeyDown = (e) => {
                if (isComposing || e.nativeEvent?.isComposing) return;
                if (e.key === "Enter") {
                  e.preventDefault();
                  const title = (inputRef.current?.value || "").trim();
                  if (!title) return;
                  saveEdit(chat, title);
                }
                if (e.key === "Escape") {
                  e.preventDefault();
                  cancelEdit();
                }
              };

              const CommonInner = (
                <div className="flex justify-center">
                  <div className="flex items-center gap-0.75">
                    {isEditingThis ? (
                      <input
                        ref={inputRef}
                        defaultValue={chat.title || ""}
                        onClick={(e) => e.stopPropagation()}
                        onCompositionStart={() => setIsComposing(true)}
                        onCompositionEnd={() => setIsComposing(false)}
                        onKeyDown={onKeyDown}
                        autoFocus
                        maxLength={10}
                        className="w-30 bg-transparent border-b border-primary-dark focus:outline-none"
                        placeholder="제목 입력"
                      />
                    ) : (
                      <span
                        className={`w-28 mr-2 text-start whitespace-nowrap overflow-hidden
                          ${isPlay ? "cursor-text" : "text-gray-7 cursor-text"}
                        `}
                        onClick={(e) => {
                          e.stopPropagation();
                          startEdit(chat);
                        }}
                        title={chat.title || "제목 없음"}
                      >
                        {chat.title || "제목 없음"}
                      </span>
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
                </div>
              );

              return (
                <div className="w-47.5 mb-2 flex flex-col justify-center items-center">
                  <div className="w-full gap-0.75 flex justify-between items-center">
                    {isEditingThis ? (
                      <div
                        ref={editBoxRef}
                        className={[
                          "w-45 h-7.25 text-body2 flex justify-between items-center px-3 py-2 rounded",
                          isSelected
                            ? isPlay
                              ? "bg-secondary-light text-primary-dark"
                              : "bg-primary-light text-primary-dark"
                            : isPlay
                            ? "border border-secondary text-secondary-light opacity-80"
                            : "border border-primary text-gray-6 opacity-80",
                        ].join(" ")}
                      >
                        {CommonInner}
                      </div>
                    ) : (
                      <button
                        onClick={() => handleSelect(chat.chat_id)}
                        className={[
                          "w-45 h-7.25 text-body2 flex justify-between items-center px-3 py-2 rounded",
                          isPlay ? "hover:bg-gray-6" : "hover:bg-gray-3",
                          isSelected
                            ? isPlay
                              ? "bg-secondary-light text-primary-dark"
                              : "bg-primary-light text-primary-dark"
                            : isPlay
                            ? "border border-secondary text-secondary-light opacity-80"
                            : "border border-primary text-gray-6 opacity-80",
                        ].join(" ")}
                      >
                        {CommonInner}
                      </button>
                    )}

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
            };

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
                {/* 선택된 채팅 최상단 */}
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
