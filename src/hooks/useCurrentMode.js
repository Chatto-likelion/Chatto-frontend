import { useLocation } from "react-router-dom";

export default function useCurrentMode() {
  const { pathname } = useLocation();

  if (pathname.startsWith("/play")) {
    return "play";
  }
  if (pathname.startsWith("/business")) {
    return "business";
  }
  return null;
}
