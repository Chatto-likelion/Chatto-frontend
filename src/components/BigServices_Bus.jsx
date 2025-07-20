import { useNavigate } from "react-router-dom";
import { NavLover, NavMBTI, NavMore, NavSome, NavStat } from "../assets/svg";

const serviceItems = [
  { icon: NavSome, label: "썸 판독기", path: "/play/some" },
  { icon: NavMBTI, label: "MBTI 분석", path: "/play/MBTI" },
  { icon: NavLover, label: "연인 유형 분석", path: "/play/lovers" },
  { icon: NavStat, label: "재밌는 통계", path: "/play/stat" },
  { icon: NavMore, label: "더 많은 통계", path: "/play/more" },
];

export default function BigServices_Bus() {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col w-23 items-center gap-5">
      <div className="text-st1">Chatto Business</div>
      <div className="text-overline flex flex-col items-center gap-3">
        {serviceItems.map(({ icon: Icon, label, path }) => (
          <div key={label} className="flex flex-col items-center gap-1">
            <Icon
              className="w-13 h-13 cursor-pointer"
              onClick={() => navigate(path)}
            />
            <div>{label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
