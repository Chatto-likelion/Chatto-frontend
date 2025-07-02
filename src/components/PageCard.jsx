import { useNavigate } from "react-router-dom";

export default function PageCard({
  title,
  boldTitlePart,
  description,
  buttonText,
  bgColor = "bg-white",
  textColor = "text-black",
  border = "",
  navigateTo,
}) {
  const navigate = useNavigate();

  const handleClick = () => {
    if (navigateTo) {
      navigate(navigateTo);
    }
  };

  return (
    <div
      className={`flex flex-col justify-between p-6 rounded-md w-64 h-48 ${bgColor} ${textColor} ${border}`}
    >
      <div>
        <h3 className="text-lg font-bold mb-2">
          {title}
          {boldTitlePart && (
            <span className="font-extrabold"> {boldTitlePart}</span>
          )}
        </h3>
        <p className="text-sm">{description}</p>
      </div>
      <button
        onClick={handleClick}
        className="text-sm px-4 py-1 mt-4 rounded bg-white text-primary-dark self-start"
      >
        {buttonText}
      </button>
    </div>
  );
}
