import React, { useRef, useEffect, useCallback, useState } from "react";
import * as d3 from "d3";
import "./ScatterChart.css";
import DoubleSlider from "../../../MicroComponents/DoubleSlider";

// A tooltip helper function for the scatter chart.
const getScatterTooltipHtml = (d) => {
    return `
    <div class="tooltip-content">
      <strong>Year:</strong> ${d.Year}<br/>
      <strong>Population:</strong> ${d.Population.toLocaleString()}<br/>
      <strong>Water Value:</strong> ${d.Value.toFixed(2)} ${d.Unit}
    </div>
  `;
};

const ScatterChart = ({ data, title }) => {
    const scatterSvgRef = useRef();
    const tooltipRef = useRef();

    // We allow toggling water type (usage or resource) similar to the BarChart.
    const [waterType, setWaterType] = useState("usage");
    const [minMaxYear, setMinMaxYear] = useState([1967, 2021]);

    const drawChart = useCallback(() => {
        if (!scatterSvgRef.current || !data || !data.waterData || !data.popuData) {
            console.error("Missing required data properties.");
            return;
        }

        // Destructure the water and population data.
        const { waterData, popuData } = data;

        // Filter water data by the selected water type and year range.
        const filteredWaterData = waterData
            .filter(d => d.type === waterType)
            .filter(d => +d.Year >= minMaxYear[0] && +d.Year <= minMaxYear[1]);

        // Process population data.
        const popArray = Object.entries(popuData[0])
            .filter(([key]) => !isNaN(key))
            .map(([year, value]) => ({ Year: +year, Population: +value }))
            .filter(d => d.Year >= minMaxYear[0] && d.Year <= minMaxYear[1]);

        // Merge water and population data by year.
        const mergedData = popArray.map(p => {
            const waterItem = filteredWaterData.find(w => +w.Year === p.Year);
            return waterItem
                ? {
                    Year: p.Year,
                    Population: p.Population,
                    Value: +waterItem.Value,
                    Unit: waterItem.Unit,
                    Variable: waterItem.Variable
                }
                : null;
        }).filter(d => d !== null);

        console.log("Merged Data for Scatter Chart:", mergedData);

        // Get responsive dimensions
        if (!scatterSvgRef.current._dimensions) {
            const containerElement = scatterSvgRef.current.parentNode;
            const containerWidth = containerElement.clientWidth || 350;
            const containerHeight = containerElement.clientHeight || 250;
            const margin = { top: 60, right: 0, bottom: 35, left: 0 };
            scatterSvgRef.current._dimensions = {
                containerWidth,
                containerHeight,
                margin,
                width: containerWidth - margin.left - margin.right,
                height: containerHeight - margin.top - margin.bottom,
            };
        }
        const { containerWidth, containerHeight, margin, width, height } = scatterSvgRef.current._dimensions;

        // Clear any existing SVG content
        d3.select(scatterSvgRef.current).selectAll("*").remove();

        // Set up the responsive SVG
        const svg = d3
            .select(scatterSvgRef.current)
            .attr("width", "100%")
            .attr("height", "100%")
            .attr("viewBox", `0 0 ${containerWidth} ${containerHeight}`)
            .attr("preserveAspectRatio", "xMidYMid meet")
            .append("g")
            .attr("transform", `translate(${margin.left}, ${margin.top})`);

        // Create scales.
        // xScale: population (linear scale).
        const xScale = d3.scaleLinear()
            .domain([0, d3.max(mergedData, d => d.Population)])
            .range([0, width])
            .nice();

        // yScale: water value.
        const yScale = d3.scaleLinear()
            .domain([0, d3.max(mergedData, d => d.Value)])
            .range([height, 0])
            .nice();

        // Add Chart Title.
        svg.append("text")
            .attr("x", width / 2)
            .attr("y", -40)
            .attr("text-anchor", "middle")
            .style("font-size", "16px")
            .style("font-weight", "bold")
            .text(`Water (${waterType}) vs Population for ${title}`);

        // Draw the x-axis.
        const xAxisG = svg.append("g")
            .attr("class", "x-axis")
            .attr("transform", `translate(0, ${height})`)
            .call(d3.axisBottom(xScale).ticks(6));
        xAxisG.selectAll("text")
            .attr("transform", "rotate(-45)")
            .style("text-anchor", "end");

        // Draw the y-axis.
        svg.append("g")
            .attr("class", "y-axis")
            .call(d3.axisLeft(yScale));

        // Draw scatter points.
        svg.selectAll(".scatter-point")
            .data(mergedData)
            .enter()
            .append("circle")
            .attr("class", "scatter-point")
            .attr("cx", d => xScale(d.Population))
            .attr("cy", d => yScale(d.Value))
            .attr("r", 6)
            .attr("fill", "orange")
            .attr("stroke", "#333")
            .attr("stroke-width", 0.5)
            .on("mouseover", function (event, d) {
                d3.select(this).attr("r", 10);
                const tooltipHTML = getScatterTooltipHtml(d);
                d3.select(tooltipRef.current)
                    .style("visibility", "visible")
                    .html(tooltipHTML)
                    .transition().duration(200).style("opacity", 0.9);
            })
            .on("mousemove", function (event) {
                d3.select(tooltipRef.current)
                    .style("top", (event.pageY - 80) + "px")
                    .style("left", (event.pageX - 230) + "px");
            })
            .on("mouseout", function () {
                d3.select(this).attr("r", 6);
                d3.select(tooltipRef.current)
                    .transition().duration(200)
                    .style("opacity", 0)
                    .on("end", () => d3.select(tooltipRef.current).style("visibility", "hidden"));
            });

        // Optionally add a legend.
        const legendData = [
            { name: "Water Value", color: "orange" },
            { name: "Population", color: "darkblue" }
        ];
        const legend = svg.selectAll(".legend")
            .data(legendData)
            .enter()
            .append("g")
            .attr("class", "legend")
            .attr("transform", (_, i) => `translate(${width - 100}, ${i * 20})`);
        legend.append("rect")
            .attr("x", 0)
            .attr("y", 0)
            .attr("width", 12)
            .attr("height", 12)
            .style("fill", d => d.color);
        legend.append("text")
            .attr("x", 18)
            .attr("y", 10)
            .style("font-size", "12px")
            .text(d => d.name);
    }, [data, waterType, minMaxYear]);

    useEffect(() => {
        if (data && data.waterData && data.popuData) {
            drawChart();
        }
    }, [drawChart]);

    // Redraw on window resize.
    useEffect(() => {
        window.addEventListener("resize", drawChart);
        return () => window.removeEventListener("resize", drawChart);
    }, [drawChart]);

    // Handler for the double slider.
    const handleMinMaxYearChange = (range) => {
        setMinMaxYear(range);
    };

    return (
        <div className="chart-container">

            <div className="chart-description">
                <h2>{title}</h2>
                <p> the line chart is bla bla </p>
                <p> the line chart is bla bla </p>
                <p> the line chart is bla bla </p>
                <p> the line chart is bla bla </p>
            </div>
            <div className="chart-figure">

                <div className="chart-controls">
                    <div className="water-type-switch">
                        <button
                            className={`water-type-btn ${waterType === "usage" ? "active" : ""}`}
                            onClick={() => setWaterType("usage")}
                        >
                            U
                        </button>
                        <button
                            className={`water-type-btn ${waterType === "resource" ? "active" : ""}`}
                            onClick={() => setWaterType("resource")}
                        >R</button>
                    </div>
                </div>
                <svg ref={scatterSvgRef} className="chart-svg"></svg>
                <div ref={tooltipRef} className="chart-tooltip" />
                <div className="double-slider-container">
                    <DoubleSlider min={1967} max={2021} onChange={handleMinMaxYearChange} />
                </div>
            </div>
        </div>
    );
};

export default ScatterChart;
