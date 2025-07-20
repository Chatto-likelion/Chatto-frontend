import { useNavigate } from "react-router-dom";
import { NavLover, NavMBTI, NavMore, NavSome, NavStat } from "../assets/svg";

const services = [
  { title: "썸 판독기", icon: NavSome, route: "/play/some" },
  { title: "MBTI 분석", icon: NavMBTI, route: "/play/MBTI" },
  { title: "연인 유형 분석", icon: NavLover, route: "/play/lovers" },
  { title: "재밌는 통계", icon: NavStat, route: "/play/stat" },
  { title: "더 많은 통계", icon: NavMore, route: "/play/more" },
];

export default function BigServices() {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col w-23 items-center gap-5">
      <div className="text-st1">Chatto Play</div>
      <div className="text-overline flex flex-col items-center gap-3">
        {services.map(({ title, icon: Icon, route }) => (
          <div key={route} className="flex flex-col items-center gap-1">
            <Icon
              className="w-13 h-13 cursor-pointer"
              onClick={() => navigate(route)}
            />
            <div>{title}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
