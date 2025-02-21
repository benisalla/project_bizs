import React, { useEffect, useRef, useMemo } from "react";
import * as d3 from "d3";

// data is a dictionary of year:value pairs
const DistributionChart = ({ data, title }) => {
    const svgRef = useRef(null);

    const dataArray = useMemo(() => {
        if (!data) return [];
        return Object.entries(data)
            .map(([year, value]) => ({ year: +year, value }))
            .sort((a, b) => a.year - b.year);
    }, [data]);

    useEffect(() => {
        if (!dataArray || dataArray.length === 0) return;

        // Extract the numeric values from the dataArray.
        const values = dataArray.map(d => d.value);

        const svg = d3.select(svgRef.current);
        svg.selectAll("*").remove();

        // Compute dimensions just once and cache them on the svg element.
        if (!svgRef.current._dimensions) {
            const containerElement = svgRef.current.parentNode;
            const containerWidth = containerElement.clientWidth || 350;
            const containerHeight = containerElement.clientHeight || 250;
            // Increased left margin to accommodate y-axis label.
            const margin = { top: 60, right: 0, bottom: 35, left: 40 };
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
        d3.select(svgRef.current).selectAll("*").remove();

        // Set up the responsive SVG.
        const g = d3
            .select(svgRef.current)
            .attr("width", "100%")
            .attr("height", "100%")
            .attr("viewBox", `0 0 ${containerWidth} ${containerHeight}`)
            .attr("preserveAspectRatio", "xMidYMid meet")
            .append("g")
            .attr("transform", `translate(${margin.left}, ${margin.top})`);

        // Create tooltip div if it doesn't exist.
        let tooltip = d3.select("body").select(".tooltip");
        if (tooltip.empty()) {
            tooltip = d3
                .select("body")
                .append("div")
                .attr("class", "tooltip")
                .style("position", "absolute")
                .style("background", "rgba(0, 0, 0, 0.7)")
                .style("color", "#fff")
                .style("padding", "5px 8px")
                .style("border-radius", "4px")
                .style("pointer-events", "none")
                .style("opacity", 0);
        }

        // X scale based on the extent of the values.
        const x = d3.scaleLinear()
            .domain(d3.extent(values))
            .nice()
            .range([0, width]);

        // Create histogram bins.
        const bins = d3.histogram()
            .domain(x.domain())
            .thresholds(x.ticks(10))(values);

        // Y scale for histogram (frequency).
        const yHistogram = d3.scaleLinear()
            .domain([0, d3.max(bins, d => d.length)])
            .nice()
            .range([height, 0]);

        // Draw histogram bars with tooltip.
        g.selectAll(".bar")
            .data(bins)
            .enter()
            .append("rect")
            .attr("class", "bar")
            .attr("x", d => x(d.x0) + 1)
            .attr("y", d => yHistogram(d.length))
            .attr("width", d => Math.max(0, x(d.x1) - x(d.x0) - 1))
            .attr("height", d => height - yHistogram(d.length))
            .attr("fill", "#69b3a2")
            .attr("opacity", 0.7)
            .on("mouseover", function (event, d) {
                tooltip.transition().duration(200).style("opacity", 0.9);
                tooltip.html(`Range: ${d.x0.toFixed(2)} - ${d.x1.toFixed(2)}<br/>Count: ${d.length}`)
                    .style("left", (event.pageX + 10) + "px")
                    .style("top", (event.pageY - 28) + "px");
            })
            .on("mousemove", function (event, d) {
                tooltip.style("left", (event.pageX + 10) + "px")
                    .style("top", (event.pageY - 28) + "px");
            })
            .on("mouseout", function (event, d) {
                tooltip.transition().duration(500).style("opacity", 0);
            });

        // Compute kernel density estimation for the density plot.
        const range = d3.max(values) - d3.min(values);
        const bandwidth = range / 20; // adjustable bandwidth
        const kde = kernelDensityEstimator(kernelEpanechnikov(bandwidth), x.ticks(40));
        const density = kde(values);

        // Y scale for density.
        const yDensity = d3.scaleLinear()
            .domain([0, d3.max(density, d => d[1])])
            .nice()
            .range([height, 0]);

        // Draw density area with a different color and transparency.
        g.append("path")
            .datum(density)
            .attr("fill", "orange")
            .attr("opacity", 0.5)
            .attr("stroke", "orange")
            .attr("stroke-width", 1.5)
            .attr(
                "d",
                d3.area()
                    .curve(d3.curveBasis)
                    .x(d => x(d[0]))
                    .y0(height)
                    .y1(d => yDensity(d[1]))
            );

        // Add X axis.
        g.append("g")
            .attr("transform", `translate(0, ${height})`)
            .call(d3.axisBottom(x));

        // Add X axis label.
        g.append("text")
            .attr("class", "x axis-label")
            .attr("text-anchor", "middle")
            .attr("x", width / 2)
            .attr("y", height + margin.bottom - 5)
            .text("Value");

        // Add Y axis for the histogram.
        g.append("g")
            .call(d3.axisLeft(yHistogram));

        // Add Y axis label.
        g.append("text")
            .attr("class", "y axis-label")
            .attr("text-anchor", "middle")
            .attr("transform", `translate(-30, ${height / 2})rotate(-90)`)
            .text("Frequency");

        // Add title to the graph.
        g.append("text")
            .attr("x", width / 2)
            .attr("y", -10)
            .attr("text-anchor", "middle")
            .style("font-weight", "bold")
            .text(title);

        // Helper function: kernel density estimator.
        function kernelDensityEstimator(kernel, X) {
            return V => X.map(xVal => [xVal, d3.mean(V, v => kernel(xVal - v))]);
        }

        // Helper function: Epanechnikov kernel.
        function kernelEpanechnikov(k) {
            return v => Math.abs(v /= k) <= 1 ? 0.75 * (1 - v * v) / k : 0;
        }
    }, [dataArray, title]);

    return (
        <div className='DistributionContainer'>
            <svg ref={svgRef} />
        </div>
    );
}

export default DistributionChart;
