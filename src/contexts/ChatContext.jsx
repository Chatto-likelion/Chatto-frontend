import { createContext, useContext, useState, useRef } from "react";

const ChatContext = createContext();

export const ChatProvider = ({ children }) => {
  const [selectedChatId, setSelectedChatId] = useState(null);
  const chatListReloadRef = useRef(null);

  return (
    <ChatContext.Provider
      value={{ selectedChatId, setSelectedChatId, chatListReloadRef }}
    >
      {children}
    </ChatContext.Provider>
  );
};

export function useChat() {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error("useAuth는 반드시 AuthProvider 안에서 사용해야 합니다.");
  }
  return context;
}
