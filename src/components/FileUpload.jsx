import { useDropzone } from "react-dropzone";
import * as Icons from "@/assets/svg";
import useCurrentMode from "@/hooks/useCurrentMode";
import { postChat, postChat_Bus } from "@/apis/api";
import { useAuth } from "@/contexts/AuthContext";
import { useChat } from "@/contexts/ChatContext";

export default function FileUpload() {
  const { user } = useAuth();
  const { chatListReloadRef, setSelectedChatId } = useChat();
  const mode = useCurrentMode();
  const isPlay = mode === "play";

  const handleFileUpload = async (file) => {
    const fetchFn = isPlay ? postChat : postChat_Bus;
    try {
      // console.log("보낼 파일:", file);
      // console.log("postChat 요청 시작 - userId:", user?.id || 1);
      const result = await fetchFn(user?.id || 1, file);
      console.log("파일 업로드 성공:", result);

      if (typeof chatListReloadRef?.current === "function") {
        await chatListReloadRef.current();
      }

      // 업로드한 채팅을 선택
      if (result?.chat_id) {
        setSelectedChatId(result.chat_id);
      }
    } catch (error) {
      console.error("파일 업로드 실패:", error);
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: { "text/plain": [".txt"] },
    multiple: false,
    onDrop: (acceptedFiles) => {
      const file = acceptedFiles[0];
      console.log("업로드된 파일:", file);
      handleFileUpload(file);
    },
  });

  // 조건에 따라 색상 분기
  const wrapperBorder = isPlay ? "border-secondary-light" : "border-primary";
  const wrapperText = isPlay ? "text-white" : "text-gray-7";
  const wrapperBg = isDragActive
    ? isPlay
      ? "bg-primary-dark/40"
      : "bg-gray-1"
    : isPlay
    ? "bg-primary-dark"
    : "bg-white";

  const iconColor = isPlay ? "text-secondary" : "text-primary";
  const buttonBorder = isPlay ? "border-secondary-light" : "border-primary";
  const buttonText = isPlay ? "text-secondary-light" : "text-primary";
  const buttonHoverBg = isPlay
    ? "hover:bg-secondary-light"
    : "hover:bg-primary";
  const buttonHoverText = isPlay
    ? "hover:text-primary-dark"
    : "hover:text-white";
  const infoTextColor = isPlay ? "text-gray-4" : "text-gray-7";

  return (
    <div
      {...getRootProps()}
      className={`w-full px-4.25 pt-5.25 pb-8.25 border ${wrapperBorder} ${wrapperText} text-center cursor-pointer transition ${wrapperBg} rounded-lg`}
    >
      <input {...getInputProps()} />
      <div className="text-st1 mb-2">대화 파일 첨부</div>
      <p className="text-caption mb-5">
        PC 카카오톡 대화방에서 Ctrl+S로
        <br />
        대화내용 파일 저장 후, 첨부해주세요
      </p>

      <div className="flex flex-col justify-center items-center mb-4">
        <Icons.FileUpload className={`w-20 h-16.5 my-3 ${iconColor}`} />
        <p className="text-caption">
          {isDragActive
            ? "여기에 파일을 놓아주세요..."
            : "드래그&드롭으로 첨부"}
        </p>
      </div>

      <button
        type="button"
        className={`w-26.5 h-7.5 mb-2.5 border ${buttonBorder} ${buttonText} text-caption px-4 py-1 rounded-lg transition ${buttonHoverBg} ${buttonHoverText}`}
      >
        파일 찾아보기
      </button>

      <p className={`text-overline ${infoTextColor}`}>
        업로드된 파일은 분석 이외의
      </p>
      <p className={`text-overline ${infoTextColor}`}>
        목적으로 수집되지 않습니다.
      </p>
    </div>
  );
}
