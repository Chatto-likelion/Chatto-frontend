export default function Button({ children, onClick, type = "button" }) {
  return (
    <button
      type={type}
      onClick={onClick}
      className="w-[200px] h-10 bg-[#6937b9] text-white text-[14px] rounded-lg hover:bg-[#462c71] transition-colors"
    >
      {children}
    </button>
  );
}
