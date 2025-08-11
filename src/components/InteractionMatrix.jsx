// src/components/InteractionMatrix.jsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import ForceGraph2D from "react-force-graph-2d";

const InteractionMatrix = () => {
  const wrapRef = useRef(null);
  const fgRef = useRef(null);
  const [size, setSize] = useState({ w: 640, h: 420 });

  // 컨테이너 리사이즈 대응
  useEffect(() => {
    if (!wrapRef.current) return;
    const ro = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect;
      setSize({
        w: Math.max(320, Math.floor(width)),
        h: Math.max(280, Math.floor(height)),
      });
    });
    ro.observe(wrapRef.current);
    return () => ro.disconnect();
  }, []);

  // 더미 데이터 (좌표 고정)
  const data = useMemo(
    () => ({
      nodes: [
        { id: "수빈", x: -120, y: -10 },
        { id: "민지", x: 120, y: -10 },
        { id: "지윤", x: 0, y: -130 },
        { id: "준서", x: 70, y: 110 },
        { id: "은지", x: -70, y: 110 },
      ],
      links: [
        { source: "수빈", target: "민지", value: 2 },
        { source: "민지", target: "수빈", value: 5 }, // 양방향 예시
        { source: "민지", target: "준서", value: 2 },
        { source: "준서", target: "지윤", value: 3.2 },
        { source: "지윤", target: "은지", value: 2 },
        { source: "은지", target: "수빈", value: 2 },
      ],
    }),
    []
  );

  // 렌더 후 프레이밍 + 좌표 고정
  const onStop = () => {
    data.nodes.forEach((n) => {
      n.fx = n.x;
      n.fy = n.y;
    });
    fgRef.current?.zoomToFit(400, 40);
  };

  // ───────── 화살표 그리기 유틸 (직선 + 화살촉) ─────────
  function drawArrow(ctx, x1, y1, x2, y2, opt) {
    const {
      color = "#fff",
      width = 2,
      headLength = 18,
      headWidth = 12,
      offset = 0,
      cut = 18,
    } = opt;

    const dx = x2 - x1,
      dy = y2 - y1;
    const len = Math.hypot(dx, dy) || 1;
    const ux = dx / len,
      uy = dy / len; // 단위 방향
    const nx = -uy,
      ny = ux; // 노멀(좌우)

    // 평행 이동 + 박스 겹침 방지(시작/끝 트리밍)
    const sx = x1 + nx * offset + ux * cut;
    const sy = y1 + ny * offset + uy * cut;
    const ex = x2 + nx * offset - ux * cut;
    const ey = y2 + ny * offset - uy * cut;

    // 선
    ctx.lineCap = "round";
    ctx.strokeStyle = color;
    ctx.lineWidth = width;
    ctx.beginPath();
    ctx.moveTo(sx, sy);
    ctx.lineTo(ex, ey);
    ctx.stroke();

    // 화살촉
    const hx = ex - ux * headLength;
    const hy = ey - uy * headLength;
    ctx.beginPath();
    ctx.moveTo(ex, ey);
    ctx.lineTo(hx + ny * (headWidth / 2), hy - nx * (headWidth / 2));
    ctx.lineTo(hx - ny * (headWidth / 2), hy + nx * (headWidth / 2));
    ctx.closePath();
    ctx.fillStyle = color;
    ctx.fill();
  }

  // 라운드 박스 유틸
  const roundRect = (ctx, x, y, w, h, r) => {
    const rr = Math.min(r, w / 2, h / 2);
    ctx.beginPath();
    ctx.moveTo(x + rr, y);
    ctx.arcTo(x + w, y, x + w, y + h, rr);
    ctx.arcTo(x + w, y + h, x, y + h, rr);
    ctx.arcTo(x, y + h, x, y, rr);
    ctx.arcTo(x, y, x + w, y, rr);
    ctx.closePath();
  };

  return (
    <div ref={wrapRef} style={{ width: "100%", height: 420 }}>
      <ForceGraph2D
        ref={fgRef}
        width={size.w}
        height={size.h}
        backgroundColor="rgba(0,0,0,0)"
        graphData={data}
        cooldownTicks={0}
        d3AlphaDecay={1}
        d3VelocityDecay={1}
        onEngineStop={onStop}
        // 기본 링크 대신 커스텀(평행 직선 화살표)
        linkCanvasObjectMode={() => "replace"}
        linkCanvasObject={(link, ctx, globalScale) => {
          const s = typeof link.source === "object" ? link.source : null;
          const t = typeof link.target === "object" ? link.target : null;
          if (!s || !t) return;

          const sid = s.id ?? s;
          const tid = t.id ?? t;

          // 역방향 존재 여부를 즉석에서 검사
          const hasReverse = data.links.some((l) => {
            const ls = typeof l.source === "object" ? l.source.id : l.source;
            const lt = typeof l.target === "object" ? l.target.id : l.target;
            return ls === tid && lt === sid;
          });

          // 평행 간격/방향 (항상 2개라고 가정 → ±gap)
          const gap = 12 / globalScale; // 간격
          const sign = hasReverse ? (sid < tid ? +1 : -1) : 0;
          const offset = sign * gap;

          // 두께/화살촉 크기
          const w = Math.max(2, 1 + (link.value || 1) * 0.9);
          const headLen = 18 / globalScale + (link.value || 1) * 2.5;
          const headWid = 12 / globalScale + (link.value || 1) * 1.2;

          drawArrow(ctx, s.x, s.y, t.x, t.y, {
            color: "#FFFFFF",
            width: w,
            headLength: headLen,
            headWidth: headWid,
            offset,
            cut: 18 / globalScale,
          });
        }}
        // 노드(피그마 스타일 라운드 박스)
        nodeCanvasObjectMode={() => "replace"}
        nodeCanvasObject={(node, ctx, globalScale) => {
          const label = node.id;

          // Figma spec
          const fontPx = 16 / globalScale;
          const lineH = 24 / globalScale;
          const padX = 8 / globalScale;
          const padY = 2 / globalScale;
          const radius = 6 / globalScale;
          const borderW = 1 / globalScale;
          const letterSpacing = 0.3 / globalScale;

          ctx.font = `400 ${fontPx}px "LINE Seed Sans KR", Pretendard, Noto Sans KR, sans-serif`;
          const baseW = ctx.measureText(label).width;
          const w = baseW + padX * 2 + letterSpacing * (label.length - 1);
          const h = lineH;
          const x = node.x - w / 2;
          const y = node.y - h / 2;

          ctx.fillStyle = "#462C71"; // Primary Dark
          roundRect(ctx, x, y, w, h, radius);
          ctx.fill();
          ctx.lineWidth = borderW;
          ctx.strokeStyle = "#6937B9"; // Primary
          ctx.stroke();

          // 텍스트(자간 흉내)
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          ctx.fillStyle = "#FFFFFF";
          let cursor = x + padX;
          const cy = y + h / 2;
          for (let i = 0; i < label.length; i++) {
            const ch = label[i];
            const cw = ctx.measureText(ch).width;
            ctx.fillText(ch, cursor + cw / 2, cy);
            cursor += cw + letterSpacing;
          }
        }}
        // 인터랙션 잠금
        enableNodeDrag={false}
        enableZoomInteraction={false}
        enablePanInteraction={false}
      />
    </div>
  );
};

export default InteractionMatrix;
