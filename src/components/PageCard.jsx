import { useNavigate } from "react-router-dom";

export default function PageCard({
  title,
  boldTitlePart,
  description,
  buttonText,
  icon,
  bgColor = "bg-white",
  textColor = "text-black",
  border = "",
  buttonBorder = "",
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
      className={`flex flex-col justify-center items-center rounded-xl w-108 h-80 px-6 py-7 ${bgColor} ${textColor} ${border}`}
    >
      <div className="flex flex-col gap-5 w-full items-center">
        <h3 className="text-h3 mb-2">
          {title}
          {boldTitlePart && (
            <span className="text-h3 font-bold"> {boldTitlePart}</span>
          )}
        </h3>
        <div className="flex gap-6">
          <img src={icon} alt="랜딩페이지 아이콘" className="h-34" />
          <div className="flex flex-col items-center justify-center">
            <p className="text-body1 text-center">{description}</p>
          </div>
        </div>
        <button
          onClick={handleClick}
          className={`text-button px-3 py-1.5 rounded-lg bg-white text-primary-dark hover:bg-primary-light hover:text-primary-dark transition-colors cursor-pointer ${buttonBorder}`}
        >
          {buttonText}
        </button>
      </div>
    </div>
  );
}
