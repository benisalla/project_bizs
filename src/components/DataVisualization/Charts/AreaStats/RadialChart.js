import React, { useEffect, useRef } from "react";
import * as d3 from "d3";


const RadialChart = ({ data }) => {
    const svgRef = useRef();

    useEffect(() => {
        if (!data || data.length === 0) return;

        // Cache the container dimensions on the svg element.
        if (!svgRef.current._dimensions) {
            const containerElement = svgRef.current.parentNode;
            const containerWidth = containerElement.clientWidth || 350;
            const containerHeight = containerElement.clientHeight || 250;
            const margin = { top: 60, right: 0, bottom: 35, left: 0 };
            svgRef.current._dimensions = {
                containerWidth,
                containerHeight,
                margin,
                width: containerWidth - margin.left - margin.right,
                height: containerHeight - margin.top - margin.bottom,
            };
        }
        const { containerWidth, containerHeight, margin, width, height } = svgRef.current._dimensions;

        // Clear any previous SVG content.
        const svgEl = d3.select(svgRef.current);
        svgEl.selectAll("*").remove();

        // Set up the responsive SVG with viewBox and preserveAspectRatio.
        const svg = svgEl
            .attr("width", "100%")
            .attr("height", "100%")
            .attr("viewBox", `0 0 ${containerWidth} ${containerHeight}`)
            .attr("preserveAspectRatio", "xMidYMid meet");

        // Compute the available chart area and the center.
        const chartWidth = width,
            chartHeight = height;
        const centerX = margin.left + chartWidth / 2;
        const centerY = margin.top + chartHeight / 2;

        // Define radii based on the available chart area.
        const outerRadius = Math.min(chartWidth, chartHeight) / 2;
        const innerRadius = outerRadius * 0.2; // Adjust as needed

        // --- 3) Compute totals if needed.
        const columns = Object.keys(data[0]); // e.g. ["State", "col1", "col2", ..., "total"]
        const numericKeys = columns.slice(1);
        data.forEach(d => {
            let t = 0;
            numericKeys.forEach(k => {
                if (k !== "State") {
                    d[k] = +d[k] || 0;
                    t += d[k];
                }
            });
            d.total = t;
        });

        // --- 4) Define scales.
        const x = d3
            .scaleBand()
            .domain(data.map(d => d.State))
            .range([0, 2 * Math.PI])
            .align(0);

        const y = d3
            .scaleLinear()
            .domain([0, d3.max(data, d => d.total)])
            .range([innerRadius, outerRadius]);

        const subgroups = numericKeys.filter(k => k !== "total");
        const z = d3
            .scaleOrdinal()
            .domain(subgroups)
            .range(["#98abc5", "#8a89a6", "#7b6888", "#6b486b", "#a05d56", "#d0743c", "#ff8c00"]);

        // --- 5) Generate stacked data.
        const stackGenerator = d3.stack().keys(subgroups);
        const series = stackGenerator(data);

        // --- 6) Draw the arcs.
        // Append a <g> element translated to the center of the chart area.
        const g = svg.append("g")
            .attr("transform", `translate(${centerX}, ${centerY})`);

        g.append("g")
            .selectAll("g")
            .data(series)
            .enter()
            .append("g")
            .attr("fill", d => z(d.key))
            .selectAll("path")
            .data(d => d)
            .enter()
            .append("path")
            .attr("d", d3.arc()
                .innerRadius(d => y(d[0]))
                .outerRadius(d => y(d[1]))
                .startAngle(d => x(d.data.State))
                .endAngle(d => x(d.data.State) + x.bandwidth())
                .padAngle(0.01)
                .padRadius(innerRadius)
            );

        // --- 7) Add labels.
        const label = g.append("g")
            .selectAll("g")
            .data(data)
            .enter()
            .append("g")
            .attr("text-anchor", "middle")
            .attr("transform", d => {
                const angle = x(d.State) + x.bandwidth() / 2;
                const rotate = (angle * 180) / Math.PI - 90;
                return `rotate(${rotate})translate(${innerRadius},0)`;
            });

        label.append("line")
            .attr("x2", -5)
            .attr("stroke", "#000");

        label.append("text")
            .attr("transform", d => {
                const angle = x(d.State) + x.bandwidth() / 2;
                return (angle + Math.PI / 2) % (2 * Math.PI) < Math.PI
                    ? "rotate(90)translate(0,16)"
                    : "rotate(-90)translate(0,-9)";
            })
            .text(d => d.State);

        // --- 8) Radial gridlines & ticks.
        const yAxis = g.append("g")
            .attr("text-anchor", "middle");

        const yTicks = y.ticks(5).slice(1);
        const yTick = yAxis
            .selectAll("g")
            .data(yTicks)
            .enter()
            .append("g");

        yTick.append("circle")
            .attr("fill", "none")
            .attr("stroke", "#000")
            .attr("r", d => y(d));

        yTick.append("text")
            .attr("y", d => -y(d))
            .attr("dy", "0.35em")
            .attr("fill", "none")
            .attr("stroke", "#fff")
            .attr("stroke-width", 5)
            .text(d => d3.format(".2s")(d));

        yTick.append("text")
            .attr("y", d => -y(d))
            .attr("dy", "0.35em")
            .text(d => d3.format(".2s")(d));

        yAxis.append("text")
            .attr("y", -y(yTicks[yTicks.length - 1]))
            .attr("dy", "-1em")
            .text("Population (example)");

        // --- 9) Legend.
        const legend = g.append("g")
            .selectAll("g")
            .data(subgroups.slice().reverse())
            .enter()
            .append("g")
            .attr("transform", (d, i) => {
                return `translate(-40, ${(i - (subgroups.length - 1) / 2) * 20})`;
            });

        legend.append("rect")
            .attr("width", 18)
            .attr("height", 18)
            .attr("fill", d => z(d));

        legend.append("text")
            .attr("x", 24)
            .attr("y", 9)
            .attr("dy", "0.35em")
            .text(d => d);

    }, [data]);


    return (
        <div className="RadialChartContainer" style={{ width: "100%", height: "100%", display: "block", position: "relative" }}>
            <h3>Radial Chart</h3>
            <p>Example of a radial chart using D3.js.</p>
            <div
                ref={svgRef}
                style={{ width: "100%", height: "100%", minWidth: "350px", minHeight: "250px" }}
            />
        </div>
    );
};

export default RadialChart;
