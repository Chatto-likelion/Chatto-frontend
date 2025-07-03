export default function SignUpInput({ type = "text", placeholder, value, onChange, className }) {
  return (
    <div className={`flex border border-primary-light h-9.75 px-2 pb-2 pt-2.5 rounded-sm ${className}`}>
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        className="text-body2 placeholder:text-gray-6 focus:outline-none w-full"
      />
    </div>
  );
}
