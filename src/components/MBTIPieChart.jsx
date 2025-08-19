// src/components/MbtiPieChart.jsx
import React, { useMemo, useState, useRef } from "react";

const MBTI_COLORS = {
  ISTJ: "#F4BFBF",
  ISFJ: "#F7D9C4",
  INFJ: "#EBD8FF",
  INTJ: "#C3B1E1",
  ISTP: "#B8E1FF",
  ISFP: "#A7ECEE",
  INFP: "#9AD0C2",
  INTP: "#B1E3FF",
  ESTP: "#FCE694",
  ESFP: "#FFD6A5",
  ENFP: "#FFB5A7",
  ENTP: "#FFCAD4",
  ESTJ: "#B6CCFE",
  ESFJ: "#D2DAFF",
  ENFJ: "#C8FFD4",
  ENTJ: "#A1C2F1",
};

/** 부모가 data를 안 주면 이 더미로 렌더링(이름까지 포함) */
const DUMMY_DATA = [
  {
    type: "INFJ",
    value: 12,
    names: [
      "지민",
      "서연",
      "도윤",
      "민서",
      "하준",
      "수아",
      "예준",
      "하린",
      "윤서",
      "시우",
      "지우",
      "서연2",
    ],
  },
  {
    type: "ENFP",
    value: 9,
    names: [
      "민준",
      "서윤",
      "유준",
      "가은",
      "연우",
      "아라",
      "현우",
      "예나",
      "하율",
    ],
  },
  {
    type: "ISTJ",
    value: 7,
    names: ["지호", "민지", "준우", "유나", "하준2", "나윤", "유진"],
  },
  {
    type: "ISFJ",
    value: 6,
    names: ["은우", "지안", "채원", "하은", "윤아", "은호"],
  },
  {
    type: "INTJ",
    value: 6,
    names: ["주원", "나연", "도현", "보민", "하린2", "시윤"],
  },
  { type: "INFP", value: 5, names: ["수빈", "현서", "윤후", "다인", "하빈"] },
  { type: "ENTP", value: 5, names: ["태윤", "서현", "유나2", "이안", "예림"] },
  { type: "ENFJ", value: 5, names: ["준호", "수민", "가현", "지후", "라온"] },
  { type: "ISTP", value: 4, names: ["유찬", "윤슬", "지안2", "민혁"] },
  { type: "ISFP", value: 4, names: ["한별", "예준2", "다현", "수현"] },
  { type: "INTP", value: 4, names: ["윤호", "소윤", "하람", "주아"] },
  { type: "ESTJ", value: 3, names: ["도윤2", "다온", "수호"] },
  { type: "ESFJ", value: 3, names: ["유리", "예서", "하윤"] },
  { type: "ESTP", value: 3, names: ["지온", "서후", "윤지"] },
  { type: "ESFP", value: 2, names: ["유정", "나린"] },
  { type: "ENTJ", value: 2, names: ["연재", "선우"] },
];

/**
 * 꽉 찬 파이차트 (라벨 + 커스텀 호버 툴팁)
 * props:
 *  - data: [{ type, value, names?: string[] }, ...]
 *  - size: 전체 크기(px)
 *  - gapAngle: 조각 사이 아주 얇은 틈(도 값)
 *  - showLabels: 조각 가운데 타입 라벨 표시 여부
 */
export default function MbtiPieChart({
  data = DUMMY_DATA,
  size = 220,
  gapAngle = 0.5, // degrees
  showLabels = true,
}) {
  const wrapRef = useRef(null);
  const [hover, setHover] = useState(null); // { x, y, slice }

  const { paths, labels } = usePie(data, size, gapAngle);

  const handleMove = (e, slice) => {
    const rect = wrapRef.current?.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    setHover({ x, y, slice });
  };
  const handleLeave = () => setHover(null);

  return (
    <div
      ref={wrapRef}
      className="relative inline-block select-none"
      style={{ width: size, height: size }}
    >
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        {/* 조각들 */}
        {paths.map((p, i) => (
          <g
            key={i}
            className="cursor-pointer"
            onMouseMove={(e) => handleMove(e, p)}
            onMouseLeave={handleLeave}
          >
            <path d={p.d} fill={p.color} opacity={0.95} />
            {/* 라벨 */}
            {showLabels && (
              <text
                x={labels[i].x}
                y={labels[i].y}
                textAnchor="middle"
                dominantBaseline="middle"
                fill="rgba(18, 11, 40, .95)"
                fontSize={Math.max(10, Math.floor(size / 16))}
                style={{ pointerEvents: "none", fontWeight: 700 }}
              >
                {p.type}
              </text>
            )}
          </g>
        ))}
      </svg>

      {/* 커스텀 툴팁 */}
      {hover && (
        <div
          className="absolute w-20 text-center z-10 pointer-events-none rounded-md border border-white/25 bg-primary-dark/95 px-2 py-2 text-xs leading-5 shadow-lg"
          style={{
            left: clampPx(hover.x + 10, 8, size - 8),
            top: clampPx(hover.y + 10, 8, size - 8),
            maxWidth: size + 160, // 이름이 길어도 줄바꿈
            color: "white",
          }}
        >
          <div className="font-semibold">
            {hover.slice.type} · {hover.slice.value}명
          </div>
          {hover.slice.names?.length ? (
            <div className="opacity-90">{hover.slice.names.join(", ")}</div>
          ) : null}
        </div>
      )}
    </div>
  );
}

/* -------------------- helpers -------------------- */

function usePie(raw, size, gapDeg) {
  const cx = size / 2;
  const cy = size / 2;
  const R = size / 2; // 꽉 찬 파이

  return useMemo(() => {
    const total = Math.max(
      1,
      raw.reduce((s, d) => s + (Number(d.value) || 0), 0)
    );
    const gap = (gapDeg * Math.PI) / 180; // 라디안
    let angle = -Math.PI / 2; // 12시 방향부터 시작

    const paths = [];
    const labels = [];

    raw.forEach((d) => {
      const val = Number(d.value) || 0;
      const frac = val / total;
      const sweep = frac * Math.PI * 2;

      const start = angle + gap / 2;
      const end = angle + sweep - gap / 2;
      angle += sweep;
      if (end <= start) return;

      const p0 = polarToCartesian(cx, cy, R, start);
      const p1 = polarToCartesian(cx, cy, R, end);
      const largeArcFlag = end - start > Math.PI ? 1 : 0;

      const dPath = [
        `M ${cx} ${cy}`,
        `L ${p0.x} ${p0.y}`,
        `A ${R} ${R} 0 ${largeArcFlag} 1 ${p1.x} ${p1.y}`,
        "Z",
      ].join(" ");

      // 라벨 위치(중앙 60%)
      const mid = (start + end) / 2;
      const L = polarToCartesian(cx, cy, R * 0.6, mid);

      paths.push({
        d: dPath,
        color: MBTI_COLORS[d.type] || "#FFFFFF",
        type: d.type,
        value: val,
        names: d.names || [],
      });
      labels.push({ x: L.x, y: L.y });
    });

    return { paths, labels };
  }, [raw, size, gapDeg, cx, cy, R]);
}

function polarToCartesian(cx, cy, r, angle) {
  return {
    x: cx + r * Math.cos(angle),
    y: cy + r * Math.sin(angle),
  };
}

function clampPx(v, min, max) {
  return Math.max(min, Math.min(max, v));
}
