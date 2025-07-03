import { useDropzone } from "react-dropzone";
import * as Icons from "@/assets/svg";

export default function FileUpload({ onUpload }) {
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: { "text/plain": [".txt"] },
    multiple: false,
    onDrop: (acceptedFiles) => {
      const file = acceptedFiles[0];
      console.log("업로드된 파일:", file);
      onUpload?.(file);
    },
  });

  return (
    <div
      {...getRootProps()}
      className={`w-53.5 px-4.25 pt-5.25 pb-8.25 border border-secondary-light rounded-lg text-white text-center cursor-pointer transition ${
        isDragActive ? "bg-primary-dark/40" : "bg-primary-dark"
      }`}
    >
      <input {...getInputProps()} />
      <div className="text-st1 mb-2">대화 파일 첨부</div>
      <p className="text-caption mb-5">
        PC 카카오톡 대화방에서 Ctrl+S로
        <br />
        대화내용 파일 저장 후, 첨부해주세요
      </p>

      <div className="flex flex-col justify-center items-center mb-4">
        <Icons.FileUpload className="w-20 h-16.5 my-3 text-secondary" />
        <p className="text-caption">
          {isDragActive
            ? "여기에 파일을 놓아주세요..."
            : "드래그&드롭으로 첨부"}
        </p>
      </div>

      <button
        type="button"
        className="w-26.5 h-7.5 mb-2.5 border border-secondary-light text-caption text-secondary-light px-4 py-1 rounded-lg hover:bg-secondary-light hover:text-primary-dark transition"
      >
        파일 찾아보기
      </button>

      <p className="text-overline text-gray-4">업로드된 파일은 분석 이외의</p>
      <p className="text-overline text-gray-4">목적으로 수집되지 않습니다.</p>
    </div>
  );
}
