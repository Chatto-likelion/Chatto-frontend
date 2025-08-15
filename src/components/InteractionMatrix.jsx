import React, { useEffect, useMemo, useRef, useState } from "react";
import ForceGraph2D from "react-force-graph-2d";

// 사용 예)
// <InteractionMatrix
//   people={["수빈","민지","지윤","준서","은지"]}
//   links={[{source:"수빈",target:"민지",value:2},{source:"민지",target:"수빈",value:5}]}
// />
export default function InteractionMatrix({ people = [], links = [] }) {
  const wrapRef = useRef(null);
  const fgRef = useRef(null);
  const [size, setSize] = useState({ w: 640, h: 420 });

  // 컨테이너 리사이즈
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

  // 좌표 없으면 원형 배치
  function circleLayout(names) {
    const N = Math.max(1, names.length);
    const R = Math.min(size.w, size.h) * 0.35;
    const step = (2 * Math.PI) / N;
    return names.map((name, i) => ({
      id: typeof name === "string" ? name : name.id,
      x: Math.cos(i * step - Math.PI / 2) * R,
      y: Math.sin(i * step - Math.PI / 2) * R,
      val: 4, // 기본 노드 크기
    }));
  }

  // 데이터 정규화 + 곡률(평행 효과) 미리 계산
  const data = useMemo(() => {
    const names = people.length
      ? people.map((p) => (typeof p === "string" ? p : p.id))
      : ["A", "B", "C"];
    const nodes = circleLayout(names);

    // 링크 정규화
    const L = (links || []).map((l) => ({
      source: typeof l.source === "object" ? l.source.id : l.source,
      target: typeof l.target === "object" ? l.target.id : l.target,
      value: l.value ?? 1,
    }));

    // 방향쌍 버킷(같은 방향 다중 링크 분산용)
    const dirKey = (s, t) => `${s}→${t}`;
    const dirBuckets = new Map();
    L.forEach((lnk) => {
      const k = dirKey(lnk.source, lnk.target);
      if (!dirBuckets.has(k)) dirBuckets.set(k, []);
      dirBuckets.get(k).push(lnk);
    });

    // 역방향 존재 체크용
    const linkSet = new Set(L.map((l) => dirKey(l.source, l.target)));

    // 안정적인 부호 판단용 해시(양방향일 때 한쪽 +, 한쪽 -)
    const hashPair = (a, b) => {
      const str = `${a}|${b}`;
      let h = 0;
      for (let i = 0; i < str.length; i++) h = (h * 31 + str.charCodeAt(i)) | 0;
      return h;
    };

    // 곡률 부여 (겹침 방지)
    // - 같은 방향에 링크가 여러 개면: -0.25, 0, +0.25 … 식으로 분산
    // - 반대 방향이 있으면: +0.2 / -0.2 로 살짝 굽혀 분리
    const withCurve = [];
    for (const l of L) {
      const arr = dirBuckets.get(dirKey(l.source, l.target)) || [l];
      let curve = 0;

      if (arr.length > 1) {
        const idx = arr.indexOf(l);
        const center = (arr.length - 1) / 2;
        curve = (idx - center) * 0.25; // 같은 방향 다중 링크 간격
      } else {
        const hasReverse = linkSet.has(dirKey(l.target, l.source));
        if (hasReverse) {
          const sign = hashPair(l.source, l.target) % 2 === 0 ? 1 : -1;
          curve = 0.2 * sign; // 양방향 분리
        }
      }
      withCurve.push({ ...l, curvature: curve });
    }

    return { nodes, links: withCurve };
  }, [people, links, size.w, size.h]);

  // 멈추면 위치 고정 + 화면 맞춤
  const onStop = () => {
    requestAnimationFrame(() => {
      data.nodes.forEach((n) => {
        n.fx = n.x;
        n.fy = n.y;
      });
      fgRef.current?.zoomToFit(400, 40);
    });
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
        // ── 여기서 전부 해결됩니다 ──
        nodeLabel="id"
        nodeAutoColorBy="id"
        linkColor={() => "#FFFFFF"}
        linkWidth={(l) => Math.max(2, 1 + Math.log1p(l.value || 1))}
        linkCurvature={(l) => l.curvature || 0} // 평행 효과(곡선)
        linkDirectionalArrowLength={7} // 화살표 켜기
        linkDirectionalArrowRelPos={0.98} // 거의 끝 지점에 표시
        linkDirectionalArrowColor={() => "#FFFFFF"}
        enableNodeDrag={false}
        enableZoomInteraction={false}
        enablePanInteraction={false}
      />
    </div>
  );
}
