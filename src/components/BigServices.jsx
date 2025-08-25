import { useNavigate } from "react-router-dom";
import { NavLover, NavMBTI, NavMore, NavSome, NavStat } from "../assets/svg";
import useCurrentMode from "@/hooks/useCurrentMode";
import { ChattoBusiness } from "../assets/png/LandingIcon";

const ICON_SIZE = "w-13 h-13";

const playServices = [
  { title: "썸 판독기", type: "svg", Icon: NavSome, route: "/play/some" },
  { title: "MBTI 분석", type: "svg", Icon: NavMBTI, route: "/play/MBTI" },
  {
    title: "연인 유형 분석",
    type: "svg",
    Icon: NavLover,
    route: "/more",
  },
  { title: "재밌는 통계", type: "svg", Icon: NavStat, route: "/play/stat" },
  {
    title: "더 많은 분석",
    type: "svg",
    Icon: NavMore,
    route: "/more",
    svgClassName: "text-primary-light",
  },
];

const businessServices = [
  {
    title: "업무 참여도 분석",
    type: "img",
    src: ChattoBusiness,
    alt: "Chatto Business",
    route: "/business/contr",
  },
  {
    title: "소통 구조 분석",
    type: "img",
    src: ChattoBusiness,
    alt: "Chatto Business",
    route: "/more",
  },
  {
    title: "더 많은 분석",
    type: "svg",
    Icon: NavMore,
    route: "/more",
    svgClassName: "text-primary-dark",
  },
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
        {data.map((item) => {
          const href = item.route ?? item.path;
          return (
            <div key={href} className="flex flex-col items-center gap-1">
              <button
                type="button"
                onClick={() => navigate(href)}
                className="flex items-center justify-center"
                aria-label={item.title}
              >
                {item.type === "img" ? (
                  <img
                    src={item.src}
                    alt={item.alt || item.title}
                    className={`${ICON_SIZE} object-contain`}
                    draggable={false}
                  />
                ) : (
                  <item.Icon
                    className={`${ICON_SIZE} cursor-pointer ${
                      item.svgClassName ?? textColor
                    }`}
                  />
                )}
              </button>
              <div className={textColor}>{item.title}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
