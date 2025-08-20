// src/components/CreditWall.jsx
import React from "react";

const CreditWall = ({ onClick, cost }) => {
  return (
    <div
      className="absolute inset-0 z-10 p-6 flex items-center justify-center rounded-[10px] backdrop-blur-md"
      style={{
        backgroundColor: "rgba(22, 17, 43, 0.6)", // Overlay color
      }}
    >
      <div className="text-center">
        <div className="text-lg text-white font-bold mb-2">
          크레딧을 소모하고 결과를 확인하세요
        </div>
        <button
          onClick={onClick}
          className="bg-primary-dark hover:bg-primary-dark/80 text-white font-bold py-2 px-4 rounded-full transition-colors"
        >
          {cost}C 소모하고 분석 결과 확인하기
        </button>
      </div>
    </div>
  );
};

export default CreditWall;
