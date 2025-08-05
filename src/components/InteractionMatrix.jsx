import React from "react";
import ForceGraph2D from "react-force-graph-2d";

const InteractionMatrix = () => {
  const data = {
    nodes: [
      { id: "수빈", x: -100, y: 0 },
      { id: "민지", x: 100, y: 0 },
      { id: "지윤", x: 0, y: -100 },
      { id: "준서", x: 60, y: 100 },
      { id: "은지", x: -60, y: 100 },
    ],
    links: [
      { source: "수빈", target: "민지", value: 2 },
      { source: "민지", target: "준서", value: 2 },
      { source: "준서", target: "지윤", value: 2 },
      { source: "지윤", target: "은지", value: 2 },
      { source: "은지", target: "수빈", value: 2 },
    ],
  };

  return (
    <div style={{ width: "100%", height: "400px" }}>
      <ForceGraph2D
        graphData={data}
        nodeCanvasObject={(node, ctx) => {
          ctx.font = "16px Sans-Serif";
          ctx.fillStyle = "#fff";
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          ctx.fillText(node.id, node.x, node.y);
        }}
        linkDirectionalArrowLength={4}
        linkDirectionalArrowRelPos={1}
        linkWidth={(link) => link.value}
        linkColor={() => "#fff"}
        cooldownTicks={0} // 시뮬레이션 즉시 멈춤
        d3AlphaDecay={1} // 물리 계산 중단
        d3VelocityDecay={1} // 속도 0으로
        onEngineStop={() => {
          // 엔진 멈춘 뒤 강제로 좌표 고정
          data.nodes.forEach((node) => {
            node.fx = node.x;
            node.fy = node.y;
          });
        }}
        enableNodeDrag={false}
        enableZoomInteraction={false}
        enablePanInteraction={false}
      />
    </div>
  );
};

export default InteractionMatrix;
