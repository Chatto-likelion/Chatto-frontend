import { useNavigate } from "react-router-dom";
import { NavChemi, NavLover, NavMBTI, NavMore, NavSome, NavStat } from "../assets/svg";

export default function SmallServices() {
  const navigate = useNavigate();

  const handleClick = (navigateTo) => {
    navigate(navigateTo);
  };

  return (
    <div className="w-full flex justify-center">
      <div className="w-37.5 flex flex-col items-center gap-5">
        <div className="text-body1">Chatto Play</div>
        <div className="grid grid-cols-3 w-full items-center gap-4">
          <NavChemi className="w-9 h-9 cursor-pointer" onClick={() => handleClick('/play/chemi')}/>
          <NavSome className="w-9 h-9 cursor-pointer" onClick={() => handleClick('/play/some')}/>
          <NavMBTI className="w-9 h-9 cursor-pointer" onClick={() => handleClick('/play/MBTI')}/>
          <NavLover className="w-9 h-9 cursor-pointer" onClick={() => handleClick('/play/lovers')}/>
          <NavStat className="w-9 h-9 cursor-pointer" onClick={() => handleClick('/play/stat')}/>
          <NavMore className="w-9 h-9 cursor-pointer" onClick={() => handleClick('/play/more')}/>
        </div>
      </div>
    </div>
  );
}
