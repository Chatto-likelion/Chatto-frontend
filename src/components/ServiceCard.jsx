import { useNavigate } from "react-router-dom";

export default function ServiceCard({
  title,
  description,
  icon,
  bgColor = "bg-gray-2",
  textColor = "text-primary-dark",
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
      className={`flex flex-col justify-center py-9 px-4 rounded-xl w-full h-full ${bgColor} ${textColor} ${border}`}
      onClick={handleClick}
    >
      <div className="flex flex-col w-full items-center gap-6">
        <h5 className="text-h5 font-bold">{title}</h5>
        <img src={icon} alt="플레이 아이콘 항목" className="h-25" />
        <div className="text-h7 font-bold text-center">{description}</div>
      </div>
    </div>
  );
}
