export default function FileUpload({ onUpload }) {
  return (
    <div>
      {/* TODO: 파일 업로드 UI 구현 */}
      <input type="file" onChange={onUpload} />
    </div>
  );
}
