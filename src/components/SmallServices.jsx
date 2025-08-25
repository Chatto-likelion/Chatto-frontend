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
import { ChattoBusiness } from "../assets/png/LandingIcon";

export default function SmallServices() {
  const navigate = useNavigate();
  const mode = useCurrentMode();
  const isPlay = mode === "play";

  const ICON_SIZE = "w-9 h-9";

  const playIcons = [
    { type: "svg", Component: NavChemi, path: "/play/chemi" },
    { type: "svg", Component: NavSome, path: "/play/some" },
    { type: "svg", Component: NavMBTI, path: "/play/MBTI" },
    { type: "svg", Component: NavLover, path: "/more" },
    { type: "svg", Component: NavStat, path: "/more" },
    {
      type: "svg",
      Component: NavMore,
      path: "/more",
      svgClassName: "text-primary-light",
    },
  ];

  const businessIcons = [
    {
      type: "img",
      src: ChattoBusiness,
      alt: "Chatto Business",
      path: "/business/contr",
    }, // PNG
    { type: "img", src: ChattoBusiness, path: "/more" }, // SVG
    {
      type: "svg",
      Component: NavMore,
      path: "/more",
      svgClassName: "text-primary-dark",
    }, // SVG + 색상
  ];

  const icons = isPlay ? playIcons : businessIcons;
  const title = isPlay ? "Chatto Play" : "Chatto Business";

  return (
    <div className="w-full flex justify-center">
      <div className="w-37.5 flex flex-col items-center gap-5">
        <div className="text-body1">{title}</div>

        <div className="grid grid-cols-3 w-full items-center gap-4">
          {icons.map((item, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => navigate(item.path)}
              className="flex items-center justify-center"
              aria-label={item.alt || item.Component?.name || "nav-icon"}
            >
              {item.type === "img" ? (
                <img
                  src={item.src}
                  alt={item.alt || ""}
                  className={`${ICON_SIZE} object-contain cursor-pointer`}
                  draggable={false}
                />
              ) : (
                <item.Component
                  className={`${ICON_SIZE} cursor-pointer ${
                    item.svgClassName || ""
                  }`}
                />
              )}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
