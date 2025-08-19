// src/components/InteractionMatrix.jsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import ForceGraph2D from "react-force-graph-2d";

/**
 * props:
 *  - nodes: Array<{ id: string|number, label?: string, x?: number, y?: number }>
 *  - links: Array<{ source: string|number, target: string|number, value?: number }>
 *
 * note:
 *  - x,y가 없는 노드는 초기 원형 배치로 시드함(물리 off일 때도 보기 좋게).
 *  - 부모 컨테이너 크기를 꽉 채워서 렌더 (부모가 height 지정해야 함).
 */
const InteractionMatrix = ({ nodes = [], links = [] }) => {
  const wrapRef = useRef(null);
  const fgRef = useRef(null);
  const [size, setSize] = useState({ w: 640, h: 420 });

  // 부모 크기 감지
  useEffect(() => {
    if (!wrapRef.current) return;
    const ro = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect;
      setSize({
        w: Math.max(320, Math.floor(width)),
        h: Math.max(240, Math.floor(height)),
      });
    });
    ro.observe(wrapRef.current);
    return () => ro.disconnect();
  }, []);

  // 원형 초기 배치 (x,y 없는 경우에만 적용; 데이터 불변성 유지 위해 사본 생성)
  const normalized = useMemo(() => {
    const ns = (nodes ?? []).map((n, i) => ({
      ...n,
      id: String(n.id ?? i),
      label: n.label ?? String(n.id ?? i),
    }));

    const ls = (links ?? []).map((l) => ({
      ...l,
      source: String(typeof l.source === "object" ? l.source.id : l.source),
      target: String(typeof l.target === "object" ? l.target.id : l.target),
      value: Number(l.value ?? 1),
    }));

    // 좌표 없는 노드만 원형으로 배치
    const needSeed = ns.some(
      (n) => typeof n.x !== "number" || typeof n.y !== "number"
    );
    if (needSeed) {
      const N = ns.length || 1;
      const R = Math.max(80, Math.min(size.w, size.h) * 0.33);
      ns.forEach((n, i) => {
        if (typeof n.x !== "number" || typeof n.y !== "number") {
          const t = (2 * Math.PI * i) / N;
          n.x = Math.cos(t) * R;
          n.y = Math.sin(t) * R;
        }
      });
    }
    return { nodes: ns, links: ls };
    // size도 반영 → 초기 배치 반지름이 컨테이너에 반응
  }, [nodes, links, size.w, size.h]);

  // 시뮬레이션 정지 후 고정 + 화면 맞추기
  const onStop = () => {
    normalized.nodes.forEach((n) => {
      if (typeof n.x === "number" && typeof n.y === "number") {
        n.fx = n.x;
        n.fy = n.y;
      }
    });
    fgRef.current?.zoomToFit(400, 40);
  };

  // ───────── 유틸: 라운드 박스 ─────────
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

  // ───────── 유틸: 화살표 그리기 ─────────
  function drawArrow(ctx, x1, y1, x2, y2, opt) {
    const {
      color = "#FFFFFF",
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
      uy = dy / len; // 방향 단위벡터
    const nx = -uy,
      ny = ux; // 법선

    // 평행 이동 + 노드 박스 겹침 방지 컷
    const sx = x1 + nx * offset + ux * cut;
    const sy = y1 + ny * offset + uy * cut;
    const ex = x2 + nx * offset - ux * cut;
    const ey = y2 + ny * offset - uy * cut;

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

  // 크기/데이터 바뀔 때 맞춰보기
  useEffect(() => {
    fgRef.current?.zoomToFit(400, 40);
  }, [size.w, size.h, normalized.nodes.length, normalized.links.length]);

  return (
    <div ref={wrapRef} style={{ width: "100%", height: "100%" }}>
      <ForceGraph2D
        ref={fgRef}
        width={size.w}
        height={size.h}
        backgroundColor="rgba(0,0,0,0)"
        graphData={normalized}
        // 물리 연산 끈 상태(고정 좌표 기반). 좌표 자동 배치 원하면 50~100으로.
        cooldownTicks={0}
        d3AlphaDecay={1}
        d3VelocityDecay={1}
        onEngineStop={onStop}
        // 링크: 커스텀 화살표(양방향이면 평행 오프셋)
        linkCanvasObjectMode={() => "replace"}
        linkCanvasObject={(link, ctx, globalScale) => {
          const s = typeof link.source === "object" ? link.source : null;
          const t = typeof link.target === "object" ? link.target : null;
          if (!s || !t) return;

          const sid = s.id ?? s;
          const tid = t.id ?? t;

          // 역방향 링크 존재 여부
          const hasReverse = normalized.links.some((l) => {
            const ls = typeof l.source === "object" ? l.source.id : l.source;
            const lt = typeof l.target === "object" ? l.target.id : l.target;
            return String(ls) === String(tid) && String(lt) === String(sid);
          });

          const gap = 12 / globalScale;
          const sign = hasReverse ? (String(sid) < String(tid) ? +1 : -1) : 0;
          const offset = sign * gap;

          const thickness = Math.max(2, 1 + (link.value || 1) * 0.9);
          const headLen = 18 / globalScale + (link.value || 1) * 2.5;
          const headWid = 12 / globalScale + (link.value || 1) * 1.2;

          drawArrow(ctx, s.x, s.y, t.x, t.y, {
            color: "#FFFFFF",
            width: thickness,
            headLength: headLen,
            headWidth: headWid,
            offset,
            cut: 18 / globalScale,
          });
        }}
        // 노드: 라운드 박스 + 중앙 텍스트(자간 흉내)
        nodeCanvasObjectMode={() => "replace"}
        nodeCanvasObject={(node, ctx, globalScale) => {
          const label = String(node.label ?? node.id);

          // Figma-ish spec
          const fontPx = 16 / globalScale;
          const lineH = 24 / globalScale;
          const padX = 8 / globalScale;
          const radius = 6 / globalScale;
          const borderW = 1 / globalScale;
          const letterSpacing = 0.3 / globalScale;

          ctx.font = `400 ${fontPx}px "LINE Seed Sans KR", Pretendard, Noto Sans KR, sans-serif`;
          const baseW = ctx.measureText(label).width;
          const w = baseW + padX * 2 + letterSpacing * (label.length - 1);
          const h = lineH;
          const x = node.x - w / 2;
          const y = node.y - h / 2;

          // 박스
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
        // 인터랙션 잠금 (필요시 true로)
        enableNodeDrag={false}
        enableZoomInteraction={false}
        enablePanInteraction={false}
      />
    </div>
  );
};

export default InteractionMatrix;
