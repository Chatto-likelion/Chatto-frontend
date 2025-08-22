// src/components/InteractionMatrix.jsx

import React, { useEffect, useMemo, useRef, useState } from "react";
import ForceGraph2D from "react-force-graph-2d";

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

const InteractionMatrix = ({ nodes, links }) => {
  const wrapRef = useRef(null);
  const fgRef = useRef(null);
  const [size, setSize] = useState({ w: 640, h: 420 });

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

  const data = useMemo(
    () => ({
      nodes: nodes,
      links: links,
    }),
    [nodes, links]
  );

  const onStop = () => {
    fgRef.current?.zoomToFit(400, 40);
  };

  const getLinkStyle = (value) => {
    const color = "#FFFFFF";
    const minWidth = 1.2;
    const maxWidth = 3;
    const width = minWidth + (value / 100) * (maxWidth - minWidth);
    return {
      color: color,
      width: Math.max(1, width),
    };
  };

  const nodeCanvasObjectMode = () => "replace";
  const linkCanvasObjectMode = () => "replace";

  const linkCanvasObject = (link, ctx, globalScale) => {
    const s = link.source;
    const t = link.target;
    const style = getLinkStyle(link.value);

    // 역방향 링크가 있는지 확인
    const hasReverse = links.some(
      (l) =>
        (typeof l.source === "object" ? l.source.id : l.source) === t.id &&
        (typeof l.target === "object" ? l.target.id : l.target) === s.id
    );

    const drawArrow = (from, to, offset, color, width) => {
      const dx = to.x - from.x;
      const dy = to.y - from.y;
      const angle = Math.atan2(dy, dx);
      const nodeRadius = 35; // 노드 반지름

      // 평행 이동 벡터 계산
      const perpAngle = angle + Math.PI / 2;
      const perpX = Math.cos(perpAngle);
      const perpY = Math.sin(perpAngle);
      const startX_offset = from.x + perpX * offset;
      const startY_offset = from.y + perpY * offset;
      const endX_offset = to.x + perpX * offset;
      const endY_offset = to.y + perpY * offset;

      // 노드 경계에서 시작/종료점 조정
      const startX =
        startX_offset + Math.cos(angle) * (nodeRadius / globalScale);
      const startY =
        startY_offset + Math.sin(angle) * (nodeRadius / globalScale);
      const endX = endX_offset - Math.cos(angle) * (nodeRadius / globalScale);
      const endY = endY_offset - Math.sin(angle) * (nodeRadius / globalScale);

      // 링크 그리기
      ctx.lineWidth = width / globalScale;
      ctx.strokeStyle = color;
      ctx.beginPath();
      ctx.moveTo(startX, startY);
      ctx.lineTo(endX, endY);
      ctx.stroke();

      // 화살표 머리 그리기
      const headLength = 10;
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.moveTo(endX, endY);
      ctx.lineTo(
        endX - headLength * Math.cos(angle - Math.PI / 6),
        endY - headLength * Math.sin(angle - Math.PI / 6)
      );
      ctx.lineTo(
        endX - headLength * Math.cos(angle + Math.PI / 6),
        endY - headLength * Math.sin(angle + Math.PI / 6)
      );
      ctx.closePath();
      ctx.fill();
    };

    // 만약 양방향 링크라면
    if (hasReverse) {
      const gap = 15; // 평행 간격

      // A -> B 링크 그리기 (한쪽으로 평행 이동)
      drawArrow(s, t, gap / 2, style.color, style.width);

      // B -> A 링크 그리기 (반대쪽으로 평행 이동)
      drawArrow(t, s, gap / 2, style.color, style.width);
    } else {
      // 단방향 링크라면
      drawArrow(s, t, 0, style.color, style.width);
    }
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
        linkLabel={(link) => `점수: ${link.value}`}
        d3AlphaDecay={1}
        d3VelocityDecay={1}
        d3Forces={[fgRef.current?.d3Force("charge").strength(-250)]}
        onEngineStop={onStop}
        nodeCanvasObjectMode={nodeCanvasObjectMode}
        linkCanvasObjectMode={linkCanvasObjectMode}
        nodeCanvasObject={(node, ctx, globalScale) => {
          const label = node.label;
          if (!label) return;

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

          ctx.fillStyle = "#462C71";
          roundRect(ctx, x, y, w, h, radius);
          ctx.fill();
          ctx.lineWidth = borderW;
          ctx.strokeStyle = "#6937B9";
          ctx.stroke();

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
        linkCanvasObject={linkCanvasObject}
        enableNodeDrag={false}
        enableZoomInteraction={false}
        enablePanInteraction={false}
      />
    </div>
  );
};

export default InteractionMatrix;
