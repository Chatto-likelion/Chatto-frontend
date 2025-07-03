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
      className={`border border-secondary-dark rounded-lg p-4 text-center cursor-pointer transition ${
        isDragActive ? "bg-primary-dark/40" : "bg-primary-dark"
      }`}
    >
      <input {...getInputProps()} />
      <h3 className="text-lg font-semibold mb-2">대화 파일 첨부</h3>
      <p className="text-sm mb-4">
        PC 카카오톡 대화방에서 Ctrl+S로
        <br />
        대화내용 파일 저장 후, 첨부해주세요
      </p>

      <div className="flex justify-center my-4">
        <Icons.FileUpload className="h-16 w-16 text-secondary" />
      </div>

      <p className="text-sm mb-4">
        {isDragActive ? "여기에 파일을 놓아주세요..." : "드래그&드롭으로 첨부"}
      </p>

      <button
        type="button"
        className="border border-secondary text-secondary px-4 py-1 rounded hover:bg-secondary hover:text-black transition"
      >
        파일 찾아보기
      </button>

      <p className="text-xs text-grayscale-4 mt-4">
        업로드된 파일은 분석 이외의 목적으로 수집되지 않습니다.
      </p>
    </div>
  );
}
