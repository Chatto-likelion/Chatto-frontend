// src/components/InteractionMatrix.jsx
import React, { useEffect, useMemo, useRef, useState } from "react";

/**
 * 사용 예
 * <InteractionMatrix
 *   people={["수빈","민지","지윤","준서","은지"]}
 *   links={[
 *     { source: "수빈", target: "민지", value: 2 },
 *     { source: "민지", target: "수빈", value: 3 },
 *     { source: "수빈", target: "은지", value: 2 },
 *     { source: "지윤", target: "준서", value: 1 },
 *   ]}
 *   arrowStyle="chevron" // 'chevron' | 'triangle'
 *   height={420}
 * />
 */
export default function InteractionMatrix({
  people = [],
  links = [],
  height = 420,
  arrowStyle = "chevron",
}) {
  const wrapRef = useRef(null);
  const [size, setSize] = useState({ w: 640, h: height });

  // ===== 라벨 스타일(외곽선만) =====
  const NODE_STROKE = "#6937B9"; // 보라 외곽선
  const NODE_STROKE_W = 2;
  const NODE_TEXT_COLOR = "#FFFFFF";
  const NODE_TEXT_SIZE = 14; // 폰트 크기
  const NODE_RADIUS = 10; // 라운드 정도
  const PAD_X = 12; // 좌우 패딩
  const BOX_H = 30; // 라벨 높이(텍스트+패딩)

  // 리사이즈
  useEffect(() => {
    if (!wrapRef.current) return;
    const ro = new ResizeObserver(([entry]) => {
      const { width, height: h } = entry.contentRect;
      setSize({
        w: Math.max(320, Math.floor(width)),
        h: Math.max(280, Math.floor(h || height)),
      });
    });
    ro.observe(wrapRef.current);
    return () => ro.disconnect();
  }, [height]);

  // 이름
  const names = useMemo(() => {
    if (people && people.length) {
      return people.map((p) => (typeof p === "string" ? p : p.id));
    }
    return ["수빈", "민지", "지윤", "준서", "은지"];
  }, [people]);

  // 정N각형 배치 (12시→시계)
  const nodes = useMemo(() => {
    const N = Math.max(1, names.length);
    const R = Math.min(size.w, size.h) * 0.34;
    const step = (2 * Math.PI) / N;
    const cx = size.w / 2;
    const cy = size.h / 2;
    return names.map((name, i) => ({
      id: name,
      x: cx + Math.cos(i * step - Math.PI / 2) * R,
      y: cy + Math.sin(i * step - Math.PI / 2) * R,
    }));
  }, [names, size.w, size.h]);

  const nodeMap = useMemo(() => {
    const m = new Map();
    nodes.forEach((n) => m.set(n.id, n));
    return m;
  }, [nodes]);

  // 라벨 박스 근사치(텍스트 폭 추정: 한글 약 0.58em)
  const labelBox = useMemo(() => {
    const charW = NODE_TEXT_SIZE * 0.6; // 14px 기준 ≈ 8.4px
    const map = new Map();
    names.forEach((name) => {
      const w = Math.ceil(name.length * charW) + PAD_X * 2;
      const h = BOX_H;
      map.set(name, { w, h });
    });
    return map;
  }, [names]);

  // 링크 정규화
  const normLinks = useMemo(() => {
    const L =
      links && links.length
        ? links
        : [
            { source: "수빈", target: "민지", value: 2 },
            { source: "민지", target: "수빈", value: 3 },
            { source: "수빈", target: "은지", value: 2 },
            { source: "지윤", target: "준서", value: 1 },
          ];
    return L.map((l) => ({
      source: typeof l.source === "string" ? l.source : l.source.id,
      target: typeof l.target === "string" ? l.target : l.target.id,
      value: l.value ?? 1,
    }));
  }, [links]);

  // 1) 페어(a<b) 기준 고정 방향/법선
  const pairBase = useMemo(() => {
    const base = new Map(); // "a|b" -> {ux,uy,nx,ny}
    const sortNames = [...names].sort();
    sortNames.forEach((a, i) => {
      for (let j = i + 1; j < sortNames.length; j++) {
        const b = sortNames[j];
        const A = nodeMap.get(a);
        const B = nodeMap.get(b);
        if (!A || !B) continue;
        const dx = B.x - A.x;
        const dy = B.y - A.y;
        const len = Math.hypot(dx, dy) || 1;
        const ux = dx / len;
        const uy = dy / len;
        const nx = -uy;
        const ny = ux;
        base.set(`${a}|${b}`, { ux, uy, nx, ny });
      }
    });
    return base;
  }, [names, nodeMap]);

  // 2) 같은 페어 내부에서 a→b(+), b→a(-) 오프셋 확정
  const preparedLinks = useMemo(() => {
    const pairKey = (a, b) => (a < b ? `${a}|${b}` : `${b}|${a}`);
    const buckets = new Map(); // k -> {ab:[], ba:[]}
    normLinks.forEach((l) => {
      const k = pairKey(l.source, l.target);
      if (!buckets.has(k)) buckets.set(k, { ab: [], ba: [] });
      const [a, b] = k.split("|");
      if (l.source === a && l.target === b) buckets.get(k).ab.push(l);
      else buckets.get(k).ba.push(l);
    });

    const STEP = 7; // 동일 방향 다중 간격
    const GAP = 5; // 양방향 중앙선 간격
    const out = [];

    for (const [k, { ab, ba }] of buckets.entries()) {
      const hasBoth = ab.length && ba.length;

      if (ab.length) {
        const c = (ab.length - 1) / 2;
        ab.forEach((l, i) => {
          const delta = (i - c) * STEP;
          const offset = (hasBoth ? GAP : 0) + delta; // +쪽
          out.push({ ...l, _pairKey: k, _dir: "ab", _offset: +offset });
        });
      }
      if (ba.length) {
        const c = (ba.length - 1) / 2;
        ba.forEach((l, i) => {
          const delta = (i - c) * STEP;
          const offset = (hasBoth ? GAP : 0) + delta; // -쪽
          out.push({ ...l, _pairKey: k, _dir: "ba", _offset: -offset });
        });
      }
    }
    return out;
  }, [normLinks]);

  // 3) 렌더 좌표(트리밍 포함)
  const edges = useMemo(() => {
    const START_CLEAR = 14;
    const END_MARGIN = 5;

    // 얇고 선명하게 1.4–2.4px
    const weight = (v = 1) =>
      Math.min(2.4, 1.4 + Math.min(1.0, Math.log1p(v) * 0.6));

    return preparedLinks
      .map((l) => {
        const s = nodeMap.get(l.source);
        const t = nodeMap.get(l.target);
        if (!s || !t) return null;

        const base = pairBase.get(l._pairKey);
        if (!base) return null;
        const { ux, uy, nx, ny } = base;

        // 평행 오프셋
        const sx = s.x + nx * l._offset;
        const sy = s.y + ny * l._offset;
        const tx = t.x + nx * l._offset;
        const ty = t.y + ny * l._offset;

        // 진행 방향
        const forward = l._dir === "ab" ? 1 : -1;
        const dux = ux * forward;
        const duy = uy * forward;

        const { w: sw, h: sh } = labelBox.get(s.id) || { w: 40, h: BOX_H };
        const { w: tw, h: th } = labelBox.get(t.id) || { w: 40, h: BOX_H };

        const sProj = Math.abs(dux) * (sw / 2) + Math.abs(duy) * (sh / 2);
        const tProj = Math.abs(dux) * (tw / 2) + Math.abs(duy) * (th / 2);

        const x1 = sx + dux * (sProj + START_CLEAR);
        const y1 = sy + duy * (sProj + START_CLEAR);
        const x2 = tx - dux * (tProj + END_MARGIN);
        const y2 = ty - duy * (tProj + END_MARGIN);

        return {
          id: `${l.source}->${l.target}`,
          x1,
          y1,
          x2,
          y2,
          width: weight(l.value),
        };
      })
      .filter(Boolean);
  }, [preparedLinks, nodeMap, labelBox, pairBase]);

  const markerId =
    arrowStyle === "triangle" ? "im-arrow-tri-white" : "im-arrow-chevron-white";

  return (
    <div ref={wrapRef} className="w-full" style={{ height }}>
      <svg
        width={size.w}
        height={size.h}
        viewBox={`0 0 ${size.w} ${size.h}`}
        style={{ shapeRendering: "geometricPrecision" }}
      >
        <defs>
          {/* 열린 V (->) : 작고 또렷, 선 굵기와 독립 */}
          <marker
            id="im-arrow-chevron-white"
            viewBox="0 0 9 10"
            refX="8.4"
            refY="5"
            markerWidth="9"
            markerHeight="10"
            markerUnits="userSpaceOnUse"
            orient="auto"
          >
            <polyline
              points="0,0 9,5 0,10"
              fill="none"
              stroke="#FFFFFF"
              strokeWidth="1.6"
              strokeLinecap="round"
              strokeLinejoin="round"
              vectorEffect="non-scaling-stroke"
            />
          </marker>
          {/* 삼각형(옵션) */}
          <marker
            id="im-arrow-tri-white"
            viewBox="0 0 9 10"
            refX="8.4"
            refY="5"
            markerWidth="9"
            markerHeight="10"
            markerUnits="userSpaceOnUse"
            orient="auto"
          >
            <path d="M 0 0 L 9 5 L 0 10 z" fill="#FFFFFF" />
          </marker>
        </defs>

        {/* 링크 */}
        {edges.map((e) => (
          <line
            key={e.id}
            x1={e.x1}
            y1={e.y1}
            x2={e.x2}
            y2={e.y2}
            stroke="#FFFFFF"
            strokeOpacity="0.95"
            strokeWidth={e.width}
            strokeLinecap="round"
            vectorEffect="non-scaling-stroke"
            markerEnd={`url(#${markerId})`}
          />
        ))}

        {/* 노드 라벨: 보라 외곽선 + 투명 */}
        {nodes.map((n) => {
          const box = labelBox.get(n.id) || { w: 40, h: BOX_H };
          const x = n.x - box.w / 2;
          const y = n.y - box.h / 2;
          return (
            <g key={n.id}>
              <path
                d={roundedRectPath(x, y, box.w, box.h, NODE_RADIUS)}
                fill="none"
                stroke={NODE_STROKE}
                strokeWidth={NODE_STROKE_W}
                strokeLinejoin="round"
              />
              <text
                x={n.x}
                y={n.y + 0.5}
                fill={NODE_TEXT_COLOR}
                fontSize={NODE_TEXT_SIZE}
                fontWeight="700"
                textAnchor="middle"
                dominantBaseline="middle"
                style={{ fontFamily: "Pretendard, 'Noto Sans KR', Arial" }}
              >
                {n.id}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}

// SVG 라운드 사각형 path
function roundedRectPath(x, y, w, h, r) {
  const rr = Math.min(r, w / 2, h / 2);
  return [
    `M ${x + rr} ${y}`,
    `H ${x + w - rr}`,
    `Q ${x + w} ${y} ${x + w} ${y + rr}`,
    `V ${y + h - rr}`,
    `Q ${x + w} ${y + h} ${x + w - rr} ${y + h}`,
    `H ${x + rr}`,
    `Q ${x} ${y + h} ${x} ${y + h - rr}`,
    `V ${y + rr}`,
    `Q ${x} ${y} ${x + rr} ${y}`,
    "Z",
  ].join(" ");
}
