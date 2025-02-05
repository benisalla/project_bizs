import React, { useRef, useEffect, useCallback } from "react";
import * as d3 from "d3";
import Modal from "react-modal";
import "./LineChart.css";
import { groupDataByYear } from "../../../APIs/DataUtils";

Modal.setAppElement('#root');

function getPositionHtmlToolTip(d) {
    const year = d.Year;
    const totalValue = d.TotalValue;
    return `
      <div style="font-family: Arial, sans-serif; font-size: 12px;">
        <strong>Year:</strong> <em>${year}</em><br/>
        <strong>Value:</strong> <em>${totalValue}</em>
      </div>
    `;
}


const LineChart = ({ lineData, title, isOpen, onClose }) => {
    const svgRef = useRef();
    const tooltipRef = useRef();

    const drawChart = useCallback(() => {
        if (!svgRef.current || !lineData) return;

        console.log("First Line LineData in LineChart:", lineData[0]);

        // 1) Separate data by type
        const resourceData = lineData.filter(d => d.type === "resource");
        const usageData = lineData.filter(d => d.type === "usage");

        console.log("first resource data:", resourceData[0]);
        console.log("first usage data:", usageData[0]);

        // 2) Group each subset by Year 
        const resourceByYear = groupDataByYear(resourceData);
        const usageByYear = groupDataByYear(usageData);

        console.log("First Resource By Year:", resourceByYear[0]);
        console.log("First Usage By Year:", usageByYear[0]);

        // 3) Set up the chart dimensions
        const margin = { top: 40, right: 50, bottom: 50, left: 50 };
        const chartWidth = 600 - margin.left - margin.right;
        const chartHeight = 300 - margin.top - margin.bottom;

        // Clear any previous SVG contents
        d3.select(svgRef.current).selectAll("*").remove();

        // 4) Create the SVG container
        const svg = d3
            .select(svgRef.current)
            .attr("width", chartWidth + margin.left + margin.right)
            .attr("height", chartHeight + margin.top + margin.bottom)
            .append("g")
            .attr("transform", `translate(${margin.left},${margin.top})`);

        // 5) Create x scale 
        const allYears = Array.from(
            new Set([
                ...resourceByYear.map(d => d.Year),
                ...usageByYear.map(d => d.Year),
            ])
        );
        allYears.sort((a, b) => +a - +b);

        const xScale = d3
            .scaleBand()
            .domain(allYears)
            .range([0, chartWidth])
            .padding(0.4);

        // 6) Create separate y scales for each dataset
        const maxUsage = d3.max(usageByYear, d => d.TotalValue) || 0;
        const maxResource = d3.max(resourceByYear, d => d.TotalValue) || 0;

        const yScaleUsage = d3
            .scaleLinear()
            .domain([0, maxUsage])
            .nice()
            .range([chartHeight, 0]);

        const yScaleResource = d3
            .scaleLinear()
            .domain([0, maxResource])
            .nice()
            .range([chartHeight, 0]);

        // 7) Draw the x axis
        svg
            .append("g")
            .attr("transform", `translate(0, ${chartHeight})`)
            .call(d3.axisBottom(xScale))
            .selectAll("text")
            .attr("transform", "rotate(-45)")
            .style("text-anchor", "end");

        // 8) Draw the y axes
        svg.append("g")
            .attr("class", "axis axis--y-left")
            .call(d3.axisLeft(yScaleUsage));

        // Right axis for resource data 
        svg.append("g")
            .attr("class", "axis axis--y-right")
            .attr("transform", `translate(${chartWidth}, 0)`)
            .call(d3.axisRight(yScaleResource))
            .selectAll("text")
            .attr("fill", "black");

        // 9) Create separate line generators for each dataset
        const usageLineGenerator = d3
            .line()
            .x(d => xScale(d.Year) + xScale.bandwidth() / 2)
            .y(d => yScaleUsage(d.TotalValue))
            .curve(d3.curveMonotoneX);

        const resourceLineGenerator = d3
            .line()
            .x(d => xScale(d.Year) + xScale.bandwidth() / 2)
            .y(d => yScaleResource(d.TotalValue))
            .curve(d3.curveMonotoneX);

        // 10) Draw the USAGE line (blue) and add a transparent overlay for easier hover events
        svg.append("path")
            .datum(usageByYear)
            .attr("class", "usage-line")
            .attr("fill", "none")
            .attr("stroke", "#3498db")
            .attr("stroke-width", 2)
            .attr("d", usageLineGenerator);

        svg.append("path")
            .datum(usageByYear)
            .attr("class", "usage-line-hover")
            .attr("fill", "none")
            .attr("stroke", "transparent")
            .attr("stroke-width", 10)
            .attr("d", usageLineGenerator)

        // 11) Draw the RESOURCE line (green) and add a transparent overlay for hover events
        svg.append("path")
            .datum(resourceByYear)
            .attr("class", "resource-line")
            .attr("fill", "none")
            .attr("stroke", "#2ecc71")
            .attr("stroke-width", 2)
            .attr("d", resourceLineGenerator);

        svg.append("path")
            .datum(resourceByYear)
            .attr("class", "resource-line-hover")
            .attr("fill", "none")
            .attr("stroke", "transparent")
            .attr("stroke-width", 10)
            .attr("d", resourceLineGenerator)

        // 12) Draw circles with hover events for USAGE data
        svg.selectAll(".circle-usage")
            .data(usageByYear)
            .enter()
            .append("circle")
            .attr("class", "circle-usage")
            .attr("cx", d => xScale(d.Year) + xScale.bandwidth() / 2)
            .attr("cy", d => yScaleUsage(d.TotalValue))
            .attr("r", 4)
            .attr("fill", "#3498db")
            .on("mouseover", function (event, d) {
                d3.select(this).attr("r", 8);
                const tooltipHtml = getPositionHtmlToolTip(d);
                d3.select(tooltipRef.current)
                    .style("visibility", "visible")
                    .style("opacity", 1)
                    .html(tooltipHtml)
                    .style("left", (event.pageX) + "px")
                    .style("top", (event.pageY) + "px");
            })
            .on("mousemove", function (event, d) {
                d3.select(tooltipRef.current)
                    .style("left", (event.pageX) + "px")
                    .style("top", (event.pageY) + "px");
            })
            .on("mouseout", function (event, d) {
                d3.select(this).attr("r", 4);
                d3.select(tooltipRef.current)
                    .style("visibility", "hidden")
                    .style("opacity", 0);
            });

        // 13) Draw circles with hover events for RESOURCE data
        svg.selectAll(".circle-resource")
            .data(resourceByYear)
            .enter()
            .append("circle")
            .attr("class", "circle-resource")
            .attr("cx", d => xScale(d.Year) + xScale.bandwidth() / 2)
            .attr("cy", d => yScaleResource(d.TotalValue))
            .attr("r", 4)
            .attr("fill", "#2ecc71")
            .on("mouseover", function (event, d) {
                d3.select(this).attr("r", 8);
                const tooltipHtml = getPositionHtmlToolTip(d);
                d3.select(tooltipRef.current)
                    .style("visibility", "visible")
                    .style("opacity", 1)
                    .html(tooltipHtml)
                    .style("left", (event.pageX) + "px")
                    .style("top", (event.pageY) + "px");
            })
            .on("mousemove", function (event, d) {
                d3.select(tooltipRef.current)
                    .style("left", (event.pageX) + "px")
                    .style("top", (event.pageY) + "px");
            })
            .on("mouseout", function (event, d) {
                d3.select(this).attr("r", 4);
                d3.select(tooltipRef.current)
                    .style("visibility", "hidden")
                    .style("opacity", 0);
            });

        // 14) Add a chart title
        svg.append("text")
            .attr("x", chartWidth / 2)
            .attr("y", -10)
            .attr("text-anchor", "middle")
            .style("font-size", "16px")
            .text(title);

        // 15) Optional: add a legend
        const legendData = [
            { name: "Usage", color: "#3498db" },
            { name: "Resource", color: "#2ecc71" }
        ];

        const legend = svg.selectAll(".legend")
            .data(legendData)
            .enter()
            .append("g")
            .attr("class", "legend")
            .attr("transform", (_, i) => `translate(${chartWidth - 100}, ${i * 20})`);

        legend.append("rect")
            .attr("x", 0)
            .attr("y", 0)
            .attr("width", 12)
            .attr("height", 12)
            .style("fill", d => d.color);

        legend.append("text")
            .attr("x", 18)
            .attr("y", 10)
            .style("font-size", "0.75rem")
            .text(d => d.name);
    }, [lineData]);

    const afterOpenModal = () => {
        drawChart();
    };

    useEffect(() => {
        if (isOpen) {
            drawChart();
        }
    }, [isOpen, drawChart]);

    return (
        <Modal
            isOpen={isOpen}
            onAfterOpen={afterOpenModal}
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
                    borderRadius: "10px",
                    boxShadow: "0 4px 8px rgba(0, 0, 0, 0.2)",
                    padding: "20px",
                    width: "600px",
                    height: "350px",
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
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
            <div className="linechart-container"
                style={{
                    position: "relative",
                    top: 0,
                    left: 0,
                    width: "100%",
                    height: "100%",
                }}
            >
                <button onClick={onClose} className="close-button">
                    &times;
                </button>
                <svg ref={svgRef} className="linechart-svg"></svg>
                <div
                    ref={tooltipRef}
                    style={{
                        position: "absolute",
                        visibility: "hidden",
                        backgroundColor: "#fefefe",
                        border: "1px solid #d1d1d1",
                        borderRadius: "6px",
                        padding: "10px",
                        fontSize: "12px",
                        boxShadow: "0px 4px 8px rgba(0, 0, 0, 0.15)",
                        pointerEvents: "none",
                        opacity: 0,
                        transition: "opacity 0.2s"
                    }}
                />
            </div>
        </Modal>
    );
};

export default LineChart;