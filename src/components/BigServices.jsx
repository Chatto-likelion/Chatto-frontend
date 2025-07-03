import { useNavigate } from "react-router-dom";
import { NavLover, NavMBTI, NavMore, NavSome, NavStat } from "../assets/svg";

export default function BigServices() {
  const navigate = useNavigate();

  const handleClick = (navigateTo) => {
    navigate(navigateTo);
  };

  return (
    <div className="flex flex-col w-23 items-center gap-5">
      <div className="text-st1">Chatto Play</div>
      <div className="flex flex-col items-center gap-3">
        <div className="flex flex-col items-center gap-1">
          <NavSome className="w-13 h-13 cursor-pointer" onClick={() => handleClick('/play/some')}/>
          <div>썸 판독기</div>
        </div>
        <div className="flex flex-col items-center gap-1">
          <NavMBTI className="w-13 h-13 cursor-pointer" onClick={() => handleClick('/play/MBTI')}/>
          <div>MBTI 분석</div>
        </div>
        <div className="flex flex-col items-center gap-1">
          <NavLover className="w-13 h-13 cursor-pointer" onClick={() => handleClick('/play/lovers')}/>
          <div>연인 유형 분석</div>
        </div>
        <div className="flex flex-col items-center gap-1">
          <NavStat className="w-13 h-13 cursor-pointer" onClick={() => handleClick('/play/stat')}/>
          <div>재밌는 통계</div>
        </div>
        <div className="flex flex-col items-center gap-1">
          <NavMore className="w-13 h-13 cursor-pointer" onClick={() => handleClick('/play/more')}/>
          <div>더 많은 통계</div>
        </div>
      </div>
    </div>
  );
}
