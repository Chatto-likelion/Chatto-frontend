import React, { useEffect, useMemo, useRef, useState } from "react";
import ForceGraph2D from "react-force-graph-2d";
import styled from "styled-components";

// 툴팁 스타일을 위한 styled-components
const Tooltip = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  background-color: rgba(30, 30, 30, 0.9);
  color: #fff;
  padding: 8px 12px;
  border-radius: 6px;
  pointer-events: none;
  z-index: 1000;
  font-size: 14px;
  line-height: 1.5;
  white-space: nowrap;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
  transform: translate(3px, 3px);
`;

const TooltipItem = styled.div`
  &:first-child {
    font-weight: bold;
    margin-bottom: 2px;
    font-size: 15px;
  }
`;

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
  const [hoveredLinkInfo, setHoveredLinkInfo] = useState(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

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

    const hasReverse = links.some(
      (l) =>
        (typeof l.source === "object" ? l.source.id : l.source) === t.id &&
        (typeof l.target === "object" ? l.target.id : l.target) === s.id
    );

    const drawArrow = (from, to, offset, color, width) => {
      const dx = to.x - from.x;
      const dy = to.y - from.y;
      const angle = Math.atan2(dy, dx);
      const nodeRadius = 35;

      const perpAngle = angle + Math.PI / 2;
      const perpX = Math.cos(perpAngle);
      const perpY = Math.sin(perpAngle);
      const startX_offset = from.x + perpX * offset;
      const startY_offset = from.y + perpY * offset;
      const endX_offset = to.x + perpX * offset;
      const endY_offset = to.y + perpY * offset;

      const startX =
        startX_offset + Math.cos(angle) * (nodeRadius / globalScale);
      const startY =
        startY_offset + Math.sin(angle) * (nodeRadius / globalScale);
      const endX = endX_offset - Math.cos(angle) * (nodeRadius / globalScale);
      const endY = endY_offset - Math.sin(angle) * (nodeRadius / globalScale);

      ctx.lineWidth = width / globalScale;
      ctx.strokeStyle = color;
      ctx.beginPath();
      ctx.moveTo(startX, startY);
      ctx.lineTo(endX, endY);
      ctx.stroke();

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

    if (hasReverse) {
      const gap = 15;
      drawArrow(s, t, gap / 2, style.color, style.width);
    } else {
      drawArrow(s, t, 0, style.color, style.width);
    }
  };

  const onLinkHover = (link) => {
    if (link) {
      const tooltipContent = [
        {
          source: link.source.label,
          target: link.target.label,
          value: link.value,
        },
      ];

      const reverseLink = links.find(
        (l) =>
          (typeof l.source === "object" ? l.source.id : l.source) ===
            link.target.id &&
          (typeof l.target === "object" ? l.target.id : l.target) ===
            link.source.id
      );

      if (reverseLink) {
        tooltipContent.push({
          source: reverseLink.source.label,
          target: reverseLink.target.label,
          value: reverseLink.value,
        });
      }
      setHoveredLinkInfo(tooltipContent);
    } else {
      setHoveredLinkInfo(null);
    }
  };

  const onMouseMove = (e) => {
    const rect = wrapRef.current?.getBoundingClientRect();
    if (!rect) return;
    setMousePos({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  };

  return (
    <div
      ref={wrapRef}
      style={{ width: "100%", height: 420, position: "relative" }}
      onMouseMove={onMouseMove}
    >
      <ForceGraph2D
        ref={fgRef}
        width={size.w}
        height={size.h}
        backgroundColor="rgba(0,0,0,0)"
        graphData={data}
        cooldownTicks={0}
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
        onLinkHover={onLinkHover}
        enableNodeDrag={false}
        enableZoomInteraction={false}
        enablePanInteraction={false}
      />
      {hoveredLinkInfo && (
        <Tooltip
          style={{
            left: mousePos.x + 8,
            top: mousePos.y + 8,
          }}
        >
          {hoveredLinkInfo.map((info, index) => (
            <TooltipItem key={index}>
              <span style={{ fontWeight: "bold" }}>
                {info.source} → {info.target}
              </span>
              : {info.value}
            </TooltipItem>
          ))}
        </Tooltip>
      )}
    </div>
  );
};

export default InteractionMatrix;
