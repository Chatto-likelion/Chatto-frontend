import { useNavigate } from "react-router-dom";
import { NavLover, NavMBTI, NavMore, NavSome, NavStat } from "../assets/svg";
import useCurrentMode from "@/hooks/useCurrentMode";

const playServices = [
  { title: "썸 판독기", icon: NavSome, route: "/play/some" },
  { title: "MBTI 분석", icon: NavMBTI, route: "/play/MBTI" },
  { title: "연인 유형 분석", icon: NavLover, route: "/play/lovers" },
  { title: "재밌는 통계", icon: NavStat, route: "/play/stat" },
  { title: "더 많은 분석", icon: NavMore, route: "/play/more" },
];

const businessServices = [
  { title: "업무 참여도 분석", icon: NavSome, route: "/business/contr" },
  { title: "소통 구조 분석", icon: NavMBTI, route: "/business/contr" },
  { title: "더 많은 분석", icon: NavLover, route: "/business/more" },
];

export default function BigServices() {
  const navigate = useNavigate();
  const mode = useCurrentMode();

  const isPlay = mode === "play";
  const data = isPlay ? playServices : businessServices;
  const title = isPlay ? "Chatto Play" : "Chatto Business";

  const wrapperWidth = isPlay ? "w-23" : "w-31.5";
  const textColor = isPlay ? "text-white" : "text-gray-8";

  return (
    <div className={`flex flex-col ${wrapperWidth} items-center gap-5`}>
      <div className={`w-full text-st1 text-center ${textColor}`}>{title}</div>
      <div
        className={`text-overline flex flex-col items-center gap-3 ${textColor}`}
      >
        {data.map(({ title, label, icon: Icon, route, path }) => (
          <div
            key={route ?? label}
            className="flex flex-col items-center gap-1"
          >
            <Icon
              className={`w-13 h-13 cursor-pointer ${textColor}`}
              onClick={() => navigate(route ?? path)}
            />
            <div className={textColor}>{title ?? label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
