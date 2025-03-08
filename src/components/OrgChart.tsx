"use client";
import React, { useEffect, useRef, useState } from "react";
import { hierarchy, linkVertical, select, tree } from "d3";
import useWindowSize from "@/app/hooks/useWindowSize";
import OrgCard from "./OrgCard";
import { createRoot } from "react-dom/client";
import { updateNodeById } from "@/utils/graph";

const initialData: DataNode = {
  id: 0,
  data: {
    title: "CEO",
    name: "Bob McRob",
  },
  children: [
    {
      id: 1,
      data: {
        title: "Poop Scooper",
        name: "Joseph Hubbard",
      },
      children: [
        {
          id: 4,
          data: {
            title: "SOmething",
            name: "something else",
          },
          children: [],
        },
      ],
    },
    {
      id: 3,
      data: {
        title: "Cleaner",
        name: "Skibidy Toilet",
      },
      children: [],
    },
  ],
};

export default function OrgChart() {
  const svgRef = useRef(null);
  const { width, height } = useWindowSize();
  const [data, setData] = useState<DataNode>(initialData);

  const updateCardFactory = (id: number) => {
    return ({ name, title }: { name: string; title: string }) => {
      // const JSON.parse(JSON.stringify(ingredientsList))
      setData((prev) => {
        const deepCopy = JSON.parse(JSON.stringify(prev));
        updateNodeById(id, deepCopy, { id, data: { name, title } });
        return deepCopy;
      });
    };
  };

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
      .attr("width", 100)
      .attr("height", 50)
      .attr("x", (d) => (d as any).x as number)
      .attr("y", (d) => (d as any).y as number)
      .append("xhtml:div")
      .style("display", "flex")
      .style("justify-content", "center")
      .style("align-items", "center")
      .style("width", "100%")
      .style("height", "100%")
      .style("background", "transparent")
      .html((d) => `<div id="node-${d.data.id}"></div>`);

    root.descendants().forEach((d) => {
      const nodeElement = document.getElementById(`node-${d.data.id}`);
      if (nodeElement) {
        const { title, name } = d.data.data;
        const orgCard = (
          <OrgCard
            id={`org-card-${d.data.id}`}
            name={name}
            title={title}
            updateCard={updateCardFactory(d.data.id)}
          />
        );
        createRoot(nodeElement).render(orgCard);

        const observer = new MutationObserver(() => {
          const cardSize = nodeElement.getBoundingClientRect();
          const parent = select(nodeElement.parentNode?.parentNode as Element);

          console.log("inside here bitch");

          if (cardSize.width > 0 && cardSize.height > 0) {
            //observer.disconnect();

            console.log("got good cardSize!");
            console.log({ width: cardSize.width, height: cardSize.height });
            parent
              .attr("width", cardSize.width)
              .attr("height", cardSize.height)
              .attr("x", (d) => ((d as any).x as number) - cardSize.width / 2)
              .attr("y", (d) => (d as any).y as number);
          }
        });
        observer.observe(nodeElement, { childList: true, subtree: true });
      }
    });
  }, [width, height, data]);

  return <svg ref={svgRef} />;
}
