"use client";
import React, { useEffect, useRef } from "react";
import { hierarchy, linkVertical, select, tree } from "d3";
import useWindowSize from "@/app/hooks/useWindowSize";
import OrgCard from "./OrgCard";
import { createRoot } from 'react-dom/client';

interface DataNode {
  id: number;
  data: {
    name: string;
    title: string;
  }
  children: DataNode[]
};

const data: DataNode = {
  id: 0,
  data: {
    name: "Bob McRob",
    title: "CEO"
  },
  children: [
    {
      id: 1,
      data: {
        name: "Joseph Hubbard",
        title: "Poop Scooper"
      },
      children: []
    }
  ]
}

export default function OrgChart() {
  const svgRef = useRef(null);
  const { width, height } = useWindowSize();

  useEffect(() => {
    if (!svgRef) return;
    if (!width || !height) return;

    const svg = select(svgRef.current);
    svg.selectAll("*").remove();
    svg.attr("width", width).attr("height", height);

    const root = hierarchy(data);
    const treeLayout = tree().size([width - 100, height - 100]);
    treeLayout(root);
    const paths = treeLayout(root).links();

    const pathGenerator = linkVertical()
      .x((d) => (d as any).x)
      .y((d) => (d as any).y);

    svg
      .selectAll("path")
      .data(paths)
      .enter()
      .append("path")
      .attr("d", pathGenerator as any)
      .attr("stroke", "#ccc")
      .attr("stroke-width", 2)
      .attr("fill", "none");

    const nodes = svg
      .selectAll(".node")
      .data(root.descendants())
      .enter()
      .append("foreignObject")
      .attr("width", 300)
      .attr("height", 300)
      .attr("x", d => ((d as any).x as number) - 50)
      .attr("y", d => ((d as any).y as number) - 30)
      .append("xhtml:div")
      .style("display", "flex")
      .style("justify-content", "center")
      .style("align-items", "center")
      .style("width", "100%")
      .style("height", "100%")
      .style("background", "transparent")
      .html(d => `<div id="node-${d.data.id}"></div>`);

      root.descendants().forEach(d => {
        const nodeElement = document.getElementById(`node-${d.data.id}`);
        if (nodeElement) {
          const { name, title } = d.data.data;
          const orgCard = <OrgCard id={`org-card-${d.data.id}`} name={name} title={title} />;
          createRoot(nodeElement).render(orgCard);

          const element = document.getElementById(`org-card-${d.data.id}`);
          if(!element) {
            console.log(`element with id org-card-${d.data.id} not found`);
            return;
          }
          
          console.log(`element with id org-card-${d.data.id} width: ${element.clientWidth}, height: ${element.clientHeight}`);
        }
      });

  }, [width, height]);

  return <svg ref={svgRef} />;
}
