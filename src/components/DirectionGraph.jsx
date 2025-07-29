import React, { useEffect, useRef } from "react";
import cytoscape from "cytoscape";

export default function DirectionGraph({ matrix, names }) {
  const cyRef = useRef(null);

  useEffect(() => {
    if (!matrix || !names) return;

    const elements = [];

    // 노드 생성
    for (const name of names) {
      elements.push({ data: { id: name } });
    }

    // 엣지 생성 (i → j)
    for (let i = 0; i < names.length; i++) {
      for (let j = 0; j < names.length; j++) {
        if (i !== j) {
          const score = matrix[i][j];
          elements.push({
            data: {
              id: `${names[i]}->${names[j]}`,
              source: names[i],
              target: names[j],
              weight: score,
              label: `${score}`,
            },
          });
        }
      }
    }

    const cy = cytoscape({
      container: cyRef.current,
      elements,
      style: [
        {
          selector: "node",
          style: {
            label: "data(id)",
            "background-color": "#555",
            color: "#fff",
            "text-valign": "center",
            "text-halign": "center",
          },
        },
        {
          selector: "edge",
          style: {
            width: "mapData(weight, 0, 40, 1, 8)",
            "line-color": "#333",
            "target-arrow-color": "#333",
            "target-arrow-shape": "triangle",
            label: "data(label)",
            "font-size": 10,
            "curve-style": "bezier",
          },
        },
      ],
      layout: {
        name: "circle",
      },
    });

    return () => cy.destroy(); // cleanup
  }, [matrix, names]);

  return (
    <div
      ref={cyRef}
      className="w-full h-[500px] border border-gray-300 rounded-md"
    />
  );
}
