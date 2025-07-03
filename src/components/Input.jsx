export default function Input({ type = "text", placeholder, value, onChange, suffix = null }) {
  return (
    <div className="flex w-150 border-b border-gray-6 focus-within:border-primary-dark">
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        className="w-150 h-8 text-body1 focus:outline-none"
      />
      {suffix && <div className="flex-shrink-0 px-4">{suffix}</div>}
    </div>
  );
}
