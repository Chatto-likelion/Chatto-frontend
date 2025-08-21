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
        d3Forces={[
          // 노드 간 반발력 조절 (음수 값이 반발력)
          // strength 값을 조절하여 노드 간의 간격을 넓힙니다.
          fgRef.current?.d3Force("charge").strength(-250),
          // 링크를 더 짧게 만들고 싶다면 link force의 distance를 조절할 수 있습니다.
          // fgRef.current?.d3Force('link').distance(40),
        ]}
        onEngineStop={onStop}
        // 링크와 노드 렌더링 순서를 바꿔서 화살표가 항상 위에 오도록 함
        nodeCanvasObjectMode={() => "replace"}
        linkCanvasObjectMode={() => "replace"}
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
        linkCanvasObject={(link, ctx, globalScale) => {
          const s = link.source;
          const t = link.target;
          const style = getLinkStyle(link.value);

          // 역방향 링크가 있는지 확인
          const hasReverse = links.some((l) => {
            const ls = typeof l.source === "object" ? l.source.id : l.source;
            const lt = typeof l.target === "object" ? l.target.id : l.target;
            return ls === t.id && lt === s.id;
          });

          // 링크의 방향과 거리를 계산
          const dx = t.x - s.x;
          const dy = t.y - s.y;
          const angle = Math.atan2(dy, dx);

          // 역방향 링크가 있으면 평행 이동 적용
          const gap = 12; // 평행 간격
          const sign = hasReverse ? (s.id < t.id ? +1 : -1) : 0;
          const offset = sign * gap;

          const offsetX = offset * Math.cos(angle + Math.PI / 2);
          const offsetY = offset * Math.sin(angle + Math.PI / 2);

          const startX_offset = s.x + offsetX;
          const startY_offset = s.y + offsetY;
          const endX_offset = t.x + offsetX;
          const endY_offset = t.y + offsetY;

          // 노드의 크기를 고려하여 화살표가 노드 테두리에서 시작하고 끝나도록 조정
          const nodeRadius = 40;

          const startX = s.x + Math.cos(angle) * (nodeRadius / globalScale);
          const startY = s.y + Math.sin(angle) * (nodeRadius / globalScale);
          const endX = t.x - Math.cos(angle) * (nodeRadius / globalScale);
          const endY = t.y - Math.sin(angle) * (nodeRadius / globalScale);

          // 화살표 머리 길이와 너비
          const headLength = 10;
          const headWidth = 8;

          // 링크 스타일 설정
          ctx.lineWidth = style.width / globalScale;
          ctx.strokeStyle = style.color;
          ctx.beginPath();
          ctx.moveTo(startX, startY);
          ctx.lineTo(endX, endY);
          ctx.stroke();

          // 화살표 머리 그리기 (삼각형)
          ctx.fillStyle = style.color;
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
        }}
        enableNodeDrag={false}
        enableZoomInteraction={false}
        enablePanInteraction={false}
      />
    </div>
  );
};

export default InteractionMatrix;
