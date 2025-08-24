export default function Button({ children, onClick, type = "button" }) {
  return (
    <button
      type={type}
      onClick={onClick}
      className="w-[200px] h-10 bg-primary text-white text-[14px] rounded-lg hover:bg-primary-dark transition-colors"
    >
      {children}
    </button>
  );
}
