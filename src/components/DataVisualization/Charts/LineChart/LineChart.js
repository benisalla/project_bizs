import React, { useRef, useEffect, useCallback, useState } from "react";
import * as d3 from "d3";
import Modal from "react-modal";
import "./LineChart.css";
import { groupWaterDataByYear } from "../../../APIs/DataUtils";
import DoubleSlider from "../../../MicroComponents/DoubleSlider";

Modal.setAppElement("#root");

// A tooltip helper function similar to the one in BarChart.
const getTooltipHtml = (d) => {
    return `
    <div class="tooltip-content">
      <strong>Year:</strong> ${d.Year}<br/>
      <strong>Water Quantity:</strong> ${d.TotalValue}
    </div>
  `;
};

const LineChart = ({ data, title, isOpen, onClose }) => {
    const svgRef = useRef();
    const tooltipRef = useRef();
    const [showUsage, setShowUsage] = useState(true);
    const [showResource, setShowResource] = useState(true);
    const [minMaxYear, setMinMaxYear] = useState([1967, 2021]);

    const drawChart = useCallback(() => {
        if (!svgRef.current || !data) return;

        // Destructure water and population data.
        const { lineData, popuData } = data;

        // Filter water data based on selected year range.
        const filteredData = lineData.filter(
            (d) => d.Year >= minMaxYear[0] && d.Year <= minMaxYear[1]
        );

        // Separate by type and group by year.
        const usageData = filteredData.filter((d) => d.type === "usage");
        const resourceData = filteredData.filter((d) => d.type === "resource");
        const usageByYear = groupWaterDataByYear(usageData);
        const resourceByYear = groupWaterDataByYear(resourceData);

        // Process population data.
        const popuDataArray = Object.entries(popuData[0])
            .filter(([key]) => !isNaN(key))
            .map(([year, value]) => ({ Year: +year, Population: +value }))
            .filter((d) => d.Year >= minMaxYear[0] && d.Year <= minMaxYear[1]);

        // Get responsive dimensions.
        const containerElement = svgRef.current.parentNode;
        const containerWidth = containerElement.clientWidth || 750;
        const containerHeight = containerElement.clientHeight || 450;
        const margin = { top: 80, right: 60, bottom: 80, left: 60 };
        const width = containerWidth - margin.left - margin.right;
        const height = containerHeight - margin.top - margin.bottom;

        // Clear any previous SVG content.
        d3.select(svgRef.current).selectAll("*").remove();

        // Set up the responsive SVG.
        const svg = d3
            .select(svgRef.current)
            .attr("width", "100%")
            .attr("height", "100%")
            .attr("viewBox", `0 0 ${containerWidth} ${containerHeight}`)
            .attr("preserveAspectRatio", "xMidYMid meet")
            .append("g")
            .attr("transform", `translate(${margin.left}, ${margin.top})`);

        // Build a complete list of years from usage, resource, and population data.
        const allYears = Array.from(
            new Set([
                ...usageByYear.map((d) => d.Year),
                ...resourceByYear.map((d) => d.Year),
                ...popuDataArray.map((d) => d.Year),
            ])
        ).sort((a, b) => a - b);

        // Create x scale.
        const xScale = d3
            .scaleBand()
            .domain(allYears.map(String))
            .range([0, width])
            .padding(0.2);

        // Create y scales for usage and resource.
        const maxUsage = d3.max(usageByYear, (d) => d.TotalValue) || 0;
        const yScaleUsage = d3
            .scaleLinear()
            .domain([0, maxUsage])
            .nice()
            .range([height, 0]);

        const maxResource = d3.max(resourceByYear, (d) => d.TotalValue) || 0;
        const yScaleResource = d3
            .scaleLinear()
            .domain([0, maxResource])
            .nice()
            .range([height, 0]);

        // Create a scale for population.
        const maxPopulation = d3.max(popuDataArray, (d) => d.Population) || 0;
        const yScalePopulation = d3
            .scaleLinear()
            .domain([0, maxPopulation])
            .nice()
            .range([height, 0]);

        // Add Chart Title.
        svg
            .append("text")
            .attr("x", width / 2)
            .attr("y", -40)
            .attr("text-anchor", "middle")
            .style("font-size", "16px")
            .style("font-weight", "bold")
            .text(title);

        // Draw the x axis.
        const xAxisG = svg
            .append("g")
            .attr("transform", `translate(0, ${height})`)
            .call(d3.axisBottom(xScale).tickFormat(d3.format("d")));
        xAxisG
            .selectAll("text")
            .attr("transform", "rotate(-45)")
            .style("text-anchor", "end");

        // Draw the y axes.
        svg.append("g").attr("class", "y-axis-left").call(d3.axisLeft(yScaleUsage));
        svg
            .append("g")
            .attr("class", "y-axis-right")
            .attr("transform", `translate(${width}, 0)`)
            .call(d3.axisRight(yScaleResource));
        // Optionally, you could add a third axis for population if desired.

        // Create line generators.
        const usageLineGenerator = d3
            .line()
            .x((d) => xScale(String(d.Year)) + xScale.bandwidth() / 2)
            .y((d) => yScaleUsage(d.TotalValue))
            .curve(d3.curveMonotoneX);

        const resourceLineGenerator = d3
            .line()
            .x((d) => xScale(String(d.Year)) + xScale.bandwidth() / 2)
            .y((d) => yScaleResource(d.TotalValue))
            .curve(d3.curveMonotoneX);

        const populationLineGenerator = d3
            .line()
            .x((d) => xScale(String(d.Year)) + xScale.bandwidth() / 2)
            .y((d) => yScalePopulation(d.Population))
            .curve(d3.curveMonotoneX);

        // Draw the USAGE line (if toggled on).
        if (showUsage && usageByYear.length) {
            svg
                .append("path")
                .datum(usageByYear)
                .attr("class", "usage-line")
                .attr("fill", "none")
                .attr("stroke", "#3498db")
                .attr("stroke-width", 2)
                .attr("d", usageLineGenerator);

            // Transparent overlay to ease hover events.
            svg
                .append("path")
                .datum(usageByYear)
                .attr("class", "usage-line-hover")
                .attr("fill", "none")
                .attr("stroke", "transparent")
                .attr("stroke-width", 10)
                .attr("d", usageLineGenerator);
        }

        // Draw the RESOURCE line (if toggled on).
        if (showResource && resourceByYear.length) {
            svg
                .append("path")
                .datum(resourceByYear)
                .attr("class", "resource-line")
                .attr("fill", "none")
                .attr("stroke", "#2ecc71")
                .attr("stroke-width", 2)
                .attr("d", resourceLineGenerator);

            svg
                .append("path")
                .datum(resourceByYear)
                .attr("class", "resource-line-hover")
                .attr("fill", "none")
                .attr("stroke", "transparent")
                .attr("stroke-width", 10)
                .attr("d", resourceLineGenerator);
        }

        // Draw circles with hover events for USAGE data.
        if (showUsage) {
            svg
                .selectAll(".circle-usage")
                .data(usageByYear)
                .enter()
                .append("circle")
                .attr("class", "circle-usage")
                .attr("cx", (d) => xScale(String(d.Year)) + xScale.bandwidth() / 2)
                .attr("cy", (d) => yScaleUsage(d.TotalValue))
                .attr("r", 4)
                .attr("fill", "#3498db")
                .on("mouseover", function (event, d) {
                    d3.select(this).attr("r", 8);
                    const tooltipHtml = getTooltipHtml(d);
                    d3.select(tooltipRef.current)
                        .style("visibility", "visible")
                        .html(tooltipHtml)
                        .transition()
                        .duration(200)
                        .style("opacity", 0.9);
                })
                .on("mousemove", function (event) {
                    d3.select(tooltipRef.current)
                        .style("top", event.pageY - 80 + "px")
                        .style("left", event.pageX - 230 + "px");
                })
                .on("mouseout", function () {
                    d3.select(this).attr("r", 4);
                    d3.select(tooltipRef.current)
                        .transition()
                        .duration(200)
                        .style("opacity", 0)
                        .on("end", () =>
                            d3.select(tooltipRef.current).style("visibility", "hidden")
                        );
                });
        }

        // Draw circles with hover events for RESOURCE data.
        if (showResource) {
            svg
                .selectAll(".circle-resource")
                .data(resourceByYear)
                .enter()
                .append("circle")
                .attr("class", "circle-resource")
                .attr("cx", (d) => xScale(String(d.Year)) + xScale.bandwidth() / 2)
                .attr("cy", (d) => yScaleResource(d.TotalValue))
                .attr("r", 4)
                .attr("fill", "#2ecc71")
                .on("mouseover", function (event, d) {
                    d3.select(this).attr("r", 8);
                    const tooltipHtml = getTooltipHtml(d);
                    d3.select(tooltipRef.current)
                        .style("visibility", "visible")
                        .html(tooltipHtml)
                        .transition()
                        .duration(200)
                        .style("opacity", 0.9);
                })
                .on("mousemove", function (event) {
                    d3.select(tooltipRef.current)
                        .style("top", event.pageY - 80 + "px")
                        .style("left", event.pageX - 230 + "px");
                })
                .on("mouseout", function () {
                    d3.select(this).attr("r", 4);
                    d3.select(tooltipRef.current)
                        .transition()
                        .duration(200)
                        .style("opacity", 0)
                        .on("end", () =>
                            d3.select(tooltipRef.current).style("visibility", "hidden")
                        );
                });
        }

        // Draw the population line.
        svg.append("path")
            .datum(popuDataArray)
            .attr("class", "population-line")
            .attr("fill", "none")
            .attr("stroke", "darkblue")
            .attr("stroke-width", 2)
            .attr("d", populationLineGenerator);

        // Draw population circles with tooltips.
        svg.selectAll(".population-circle")
            .data(popuDataArray)
            .enter()
            .append("circle")
            .attr("class", "population-circle")
            .attr("cx", d => xScale(String(d.Year)) + xScale.bandwidth() / 2)
            .attr("cy", d => yScalePopulation(d.Population))
            .attr("r", 3)
            .attr("fill", "darkblue")
            .on("mouseover", (event, d) => {
                const tooltipHtml = `
          <div class="tooltip-content">
            <strong>Year:</strong> ${d.Year}<br/>
            <strong>Population:</strong> ${d.Population.toLocaleString()}
          </div>`;
                d3.select(tooltipRef.current)
                    .style("visibility", "visible")
                    .html(tooltipHtml)
                    .transition().duration(200).style("opacity", 0.9);
            })
            .on("mousemove", (event) => {
                d3.select(tooltipRef.current)
                    .style("top", (event.pageY - 80) + "px")
                    .style("left", (event.pageX - 230) + "px");
            })
            .on("mouseout", () => {
                d3.select(tooltipRef.current)
                    .transition().duration(200)
                    .style("opacity", 0)
                    .on("end", () => d3.select(tooltipRef.current).style("visibility", "hidden"));
            });

        // Add a legend.
        const legendData = [];
        if (showUsage) legendData.push({ name: "Usage", color: "#3498db" });
        if (showResource) legendData.push({ name: "Resource", color: "#2ecc71" });
        legendData.push({ name: "Population", color: "darkblue" });

        const legend = svg
            .selectAll(".legend")
            .data(legendData)
            .enter()
            .append("g")
            .attr("class", "legend")
            .attr("transform", (_, i) => `translate(${width - 100}, ${i * 20})`);

        legend
            .append("rect")
            .attr("x", 0)
            .attr("y", 0)
            .attr("width", 12)
            .attr("height", 12)
            .style("fill", (d) => d.color);

        legend
            .append("text")
            .attr("x", 18)
            .attr("y", 10)
            .style("font-size", "12px")
            .text((d) => d.name);
    }, [data, showUsage, showResource, minMaxYear]);

    // Redraw the chart when modal opens or dependencies change.
    useEffect(() => {
        if (isOpen) {
            drawChart();
        }
    }, [isOpen, drawChart]);

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
        <Modal
            isOpen={isOpen}
            onAfterOpen={drawChart}
            onRequestClose={onClose}
            contentLabel="Line Chart Modal"
            style={{
                content: {
                    top: "50%",
                    left: "50%",
                    marginRight: "-50%",
                    transform: "translate(-50%, -50%)",
                    background: "#fff",
                    border: "1px solid #ccc",
                    borderRadius: "5px",
                    boxShadow: "0 4px 12px rgba(0, 0, 0, 0.2)",
                    padding: "10px",
                    width: "750px",
                    height: "450px",
                    overflow: "hidden",
                },
                overlay: {
                    backgroundColor: "rgba(0, 0, 0, 0.75)",
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                },
            }}
        >
            <div className="chart-container">
                <button onClick={onClose} className="bar-chart-close-button">&times;</button>
                {/* Dynamic Controls */}
                <div className="chart-controls">
                    <div className="line-toggle-buttons">
                        <button
                            className={`water-type-btn ${showUsage ? "active" : ""}`}
                            onClick={() => setShowUsage(!showUsage)}
                        >U</button>
                        <button
                            className={`water-type-btn ${showResource ? "active" : ""}`}
                            onClick={() => setShowResource(!showResource)}
                        >R</button>
                    </div>
                </div>
                <svg ref={svgRef} className="chart-svg"></svg>
                <div ref={tooltipRef} className="chart-tooltip" />
                <div className="double-slider-container">
                    <DoubleSlider min={1967} max={2021} onChange={handleMinMaxYearChange} />
                </div>
            </div>
        </Modal>
    );
};

export default LineChart;
