import React, { useRef, useEffect } from "react";
import * as d3 from "d3";

const TreemapChart = ({ data }) => {
  const chartRef = useRef();

  useEffect(() => {
    const width = 928;
    const height = width;

    const formatNumber = d3.format(",d");
    const parseNumber = (string) => +string.replace(/,/g, "");
    const max = d3.max(
      data.keys,
      (d, i) => d3.hierarchy(data.group).sum((d) => d.values[i]).value
    );

    const color = d3
      .scaleOrdinal()
      .domain(data.group.keys())
      .range(d3.schemeCategory10.map((d) => d3.interpolateRgb(d, "white")(0.5)));

    const treemap = d3
      .treemap()
      .size([width, height])
      .tile(d3.treemapResquarify)
      .padding((d) => (d.height === 1 ? 1 : 0))
      .round(true);

    const root = treemap(
      d3
        .hierarchy(data.group)
        .sum((d) => (Array.isArray(d.values) ? d3.sum(d.values) : 0))
        .sort((a, b) => b.value - a.value)
    );

    const svg = d3
      .select(chartRef.current)
      .attr("width", width)
      .attr("height", height + 20)
      .attr("viewBox", [0, -20, width, height + 20])
      .style("max-width", "100%")
      .style("height", "auto")
      .style("font", "10px sans-serif")
      .style("overflow", "visible");

    const box = svg
      .append("g")
      .selectAll("g")
      .data(
        data.keys
          .map((key, i) => {
            const value = root.sum((d) => d.values[i]).value;
            return { key, value, i, k: Math.sqrt(value / max) };
          })
          .reverse()
      )
      .join("g")
      .attr(
        "transform",
        ({ k }) => `translate(${(1 - k) / 2 * width},${(1 - k) / 2 * height})`
      )
      .attr("opacity", ({ i }) => (i >= 0 ? 1 : 0)) // Update based on `initialIndex`
      .call((g) =>
        g
          .append("text")
          .attr("y", -6)
          .attr("fill", "#777")
          .selectAll("tspan")
          .data(({ key, value }) => [key, ` ${formatNumber(value)}`])
          .join("tspan")
          .attr("font-weight", (d, i) => (i === 0 ? "bold" : null))
          .text((d) => d)
      )
      .call((g) =>
        g
          .append("rect")
          .attr("fill", "none")
          .attr("stroke", "#ccc")
          .attr("width", ({ k }) => k * width)
          .attr("height", ({ k }) => k * height)
      );

    const leaf = svg
      .append("g")
      .selectAll("g")
      .data(layout(0)) // Replace 0 with the initial index
      .join("g")
      .attr("transform", (d) => `translate(${d.x0},${d.y0})`);

    leaf
      .append("rect")
      .attr("fill", (d) => {
        while (d.depth > 1) d = d.parent;
        return color(d.data[0]);
      })
      .attr("width", (d) => d.x1 - d.x0)
      .attr("height", (d) => d.y1 - d.y0);

    leaf
      .append("text")
      .attr("clip-path", (d) => d.clipUid)
      .selectAll("tspan")
      .data((d) => [d.data.name, formatNumber(d.value)])
      .join("tspan")
      .attr("x", 3)
      .attr("y", (d, i, nodes) =>
        `${(i === nodes.length - 1) * 0.3 + 1.1 + i * 0.9}em`
      )
      .attr("fill-opacity", (d, i, nodes) =>
        i === nodes.length - 1 ? 0.7 : null
      )
      .text((d) => d);

    // Update function for animations
    function layout(index) {
      const k = Math.sqrt(root.sum((d) => d.values[index]).value / max);
      const tx = (1 - k) / 2 * width;
      const ty = (1 - k) / 2 * height;
      return treemap
        .size([width * k, height * k])(root)
        .each((d) => {
          d.x0 += tx;
          d.x1 += tx;
          d.y0 += ty;
          d.y1 += ty;
        })
        .leaves();
    }

    return () => {
      svg.selectAll("*").remove();
    };
  }, [data]);

  return <svg ref={chartRef}></svg>;
};

export default TreemapChart;
