// src/components/UploadedChatList.jsx

import { useState, useEffect } from "react";
import { getFiles } from "@/apis/api";

export default function ChatList({ onSelect }) {
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    getFiles()
      .then((data) => {
        setFiles(data);
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

  if (files.length === 0) {
    return (
      <div className="p-4 text-gray-400 text-sm">업로드된 채팅이 없습니다.</div>
    );
  }

  return (
    <div className="space-y-2">
      {files.map((file) => (
        <button
          key={file.id}
          onClick={() => onSelect?.(file)}
          className="w-full flex justify-between items-center px-3 py-2 rounded bg-grayscale-9 hover:bg-grayscale-8 text-white"
        >
          <span className="truncate">{file.title}</span>
          <span className="text-sm text-grayscale-4">
            {file.participant_count}명
          </span>
        </button>
      ))}
    </div>
  );
}
