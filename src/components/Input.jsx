export default function Input({ type = "text", placeholder, value, onChange }) {
  return (
    <input
      type={type}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      className="w-[600px] h-8 border-b border-[#8C8C8C] text-[14px] focus:outline-none focus:border-[#6937b9]"
    />
  );
}
