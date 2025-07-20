import { useNavigate } from "react-router-dom";
import {
  NavChemi,
  NavLover,
  NavMBTI,
  NavMore,
  NavSome,
  NavStat,
} from "../assets/svg";

export default function SmallServicesPlay() {
  const navigate = useNavigate();

  const icons = [
    { Component: NavChemi, path: "/play/chemi" },
    { Component: NavSome, path: "/play/some" },
    { Component: NavMBTI, path: "/play/MBTI" },
    { Component: NavLover, path: "/play/lovers" },
    { Component: NavStat, path: "/play/stat" },
    { Component: NavMore, path: "/play/more" },
  ];

  return (
    <div className="w-full flex justify-center">
      <div className="w-37.5 flex flex-col items-center gap-5">
        <div className="text-body1">Chatto Play</div>
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
