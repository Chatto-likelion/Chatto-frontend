import { useNavigate } from "react-router-dom";
import {
  NavChemi,
  NavLover,
  NavMBTI,
  NavMore,
  NavSome,
  NavStat,
} from "../assets/svg";
import useCurrentMode from "@/hooks/useCurrentMode";

export default function SmallServices() {
  const navigate = useNavigate();
  const mode = useCurrentMode();
  const isPlay = mode === "play";

  const playIcons = [
    { Component: NavChemi, path: "/play/chemi" },
    { Component: NavSome, path: "/play/some" },
    { Component: NavMBTI, path: "/play/MBTI" },
    { Component: NavLover, path: "/play/lovers" },
    { Component: NavStat, path: "/play/stat" },
    { Component: NavMore, path: "/play/more" },
  ];

  const businessIcons = [
    { Component: NavChemi, path: "/business/contr" },
    { Component: NavSome, path: "/business/contr" },
    { Component: NavMore, path: "/business/more" },
  ];

  const icons = isPlay ? playIcons : businessIcons;
  const title = isPlay ? "Chatto Play" : "Chatto Business";

  return (
    <div className="w-full flex justify-center">
      <div className="w-37.5 flex flex-col items-center gap-5">
        <div className="text-body1">{title}</div>
        <div className="grid grid-cols-3 w-full items-center gap-4">
          {icons.map(({ Component, path }, index) => (
            <Component
              key={index}
              className="w-9 h-9 cursor-pointer"
              onClick={() => navigate(path)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
