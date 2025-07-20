import React from "react";
import { EyeClosed, EyeOpened } from "../assets/svg/index.js";

export default function PasswordToggle({ isShow, onToggle }) {
  return (
    <button type="button" onClick={onToggle} className="align-middle">
      {isShow ? <img src={EyeOpened} /> : <img src={EyeClosed} />}
    </button>
  );
}
