"use client";

import { useEffect, useRef, useLayoutEffect, useState } from 'react';
import * as d3 from 'd3';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { RelationshipGraphData, GraphNode, GraphLink } from '@/lib/types';
import { useTheme } from 'next-themes';

interface RelationshipGraphProps {
  data: RelationshipGraphData;
}

const relationshipColors = {
  support: "hsl(var(--chart-1))",
  conflict: "hsl(var(--chart-3))",
  neutral: "hsl(var(--border))",
};

const speakerColors = ["hsl(var(--chart-1))", "hsl(var(--chart-2))", "hsl(var(--chart-4))", "hsl(var(--chart-5))"];

export default function RelationshipGraph({ data }: RelationshipGraphProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const { resolvedTheme } = useTheme();
  
  const [dimensions, setDimensions] = useState({ width: 0, height: 300 });

  useLayoutEffect(() => {
    if (containerRef.current) {
        const resizeObserver = new ResizeObserver(entries => {
            if (!Array.isArray(entries) || !entries.length) return;
            const entry = entries[0];
            setDimensions({ width: entry.contentRect.width, height: 300 });
        });
        resizeObserver.observe(containerRef.current);
        return () => resizeObserver.disconnect();
    }
  }, []);

  useEffect(() => {
    if (!svgRef.current || dimensions.width === 0) return;

    const { width, height } = dimensions;
    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove(); // Clear previous render

    const nodes: (GraphNode & d3.SimulationNodeDatum)[] = JSON.parse(JSON.stringify(data.nodes));
    const links: (GraphLink & d3.SimulationLinkDatum<GraphNode & d3.SimulationNodeDatum>)[] = JSON.parse(JSON.stringify(data.links));

    const simulation = d3.forceSimulation(nodes)
      .force("link", d3.forceLink(links).id((d: any) => d.id).distance(100))
      .force("charge", d3.forceManyBody().strength(-300))
      .force("center", d3.forceCenter(width / 2, height / 2))
      .force("collide", d3.forceCollide().radius(30));

    svg.attr("viewBox", [0, 0, width, height]);

    const link = svg.append("g")
      .attr("stroke-opacity", 0.6)
      .selectAll("line")
      .data(links)
      .join("line")
      .attr("stroke", d => relationshipColors[d.type])
      .attr("stroke-width", d => Math.sqrt(d.value) * 2);

    const node = svg.append("g")
      .selectAll("g")
      .data(nodes)
      .join("g")
      .call(drag(simulation) as any);

    node.append("circle")
      .attr("r", 15)
      .attr("fill", (d) => speakerColors[d.group-1])
      .attr("stroke", resolvedTheme === 'dark' ? "#1a2a28" : "#fff")
      .attr("stroke-width", 2);

    node.append("text")
      .attr("x", 20)
      .attr("y", "0.31em")
      .text(d => d.label)
      .attr("fill", "currentColor")
      .attr("font-size", "12px")
      .attr("font-weight", "500");
    
    node.append("title")
      .text(d => d.label);

    simulation.on("tick", () => {
      link
        .attr("x1", d => (d.source as any).x)
        .attr("y1", d => (d.source as any).y)
        .attr("x2", d => (d.target as any).x)
        .attr("y2", d => (d.target as any).y);

      node.attr("transform", d => `translate(${d.x},${d.y})`);
    });

    function drag(simulation: d3.Simulation<any, any>) {
      function dragstarted(event: d3.D3DragEvent<any, any, any>) {
        if (!event.active) simulation.alphaTarget(0.3).restart();
        event.subject.fx = event.subject.x;
        event.subject.fy = event.subject.y;
      }
      function dragged(event: d3.D3DragEvent<any, any, any>) {
        event.subject.fx = event.x;
        event.subject.fy = event.y;
      }
      function dragended(event: d3.D3DragEvent<any, any, any>) {
        if (!event.active) simulation.alphaTarget(0);
        event.subject.fx = null;
        event.subject.fy = null;
      }
      return d3.drag().on("start", dragstarted).on("drag", dragged).on("end", dragended);
    }

  }, [data, dimensions, resolvedTheme]);

  return (
    <Card className="shadow-md">
      <CardHeader>
        <CardTitle>Relationship Graph</CardTitle>
        <CardDescription>Visualizing participant interactions.</CardDescription>
      </CardHeader>
      <CardContent ref={containerRef} className="w-full h-[300px]">
        <svg ref={svgRef} className="w-full h-full"></svg>
      </CardContent>
    </Card>
  );
}
