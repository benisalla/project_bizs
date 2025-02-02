import React, { useRef, useEffect, useCallback } from "react";
import * as d3 from "d3";
import Modal from "react-modal";
import "./LineChart.css";

Modal.setAppElement('#root');

const LineChart = ({ data, xField, yField, title, isOpen, onClose }) => {
    const svgRef = useRef(null);

    const drawChart = useCallback(() => {
        if (!svgRef.current) return;

        const margin = { top: 40, right: 30, bottom: 50, left: 50 };
        const chartWidth = 600 - margin.left - margin.right;
        const chartHeight = 300 - margin.top - margin.bottom;

        // Clear any previous content.
        d3.select(svgRef.current).selectAll("*").remove();

        // Create an SVG container.
        const svg = d3
            .select(svgRef.current)
            .attr("width", chartWidth + margin.left + margin.right)
            .attr("height", chartHeight + margin.top + margin.bottom)
            .append("g")
            .attr("transform", `translate(${margin.left},${margin.top})`);

        // Create the x-scale.
        const xDomain = data.map(d => d[xField]);
        const xScale = d3
            .scaleBand()
            .domain(xDomain)
            .range([0, chartWidth])
            .padding(0.2);

        // Create the y-scale.
        const yMax = d3.max(data, d => +d[yField]) || 0;
        const yScale = d3
            .scaleLinear()
            .domain([0, yMax])
            .nice()
            .range([chartHeight, 0]);

        // Add the x-axis.
        const xAxis = d3.axisBottom(xScale)
            .tickValues(
                xScale.domain().filter((d, i) => i % Math.ceil(xDomain.length / 10) === 0)
            );
        svg
            .append("g")
            .attr("transform", `translate(0,${chartHeight})`)
            .call(xAxis)
            .selectAll("text")
            .attr("transform", "rotate(-45)")
            .style("text-anchor", "end");

        // Add the y-axis.
        svg.append("g").call(d3.axisLeft(yScale));

        // Define the line generator.
        const line = d3
            .line()
            .x(d => xScale(d[xField]) + xScale.bandwidth() / 2)
            .y(d => yScale(+d[yField]));

        // Append the line path.
        svg.append("path")
            .datum(data)
            .attr("fill", "none")
            .attr("stroke", "orange")
            .attr("stroke-width", 2)
            .attr("d", line);

        // Add a title.
        svg.append("text")
            .attr("x", chartWidth / 2)
            .attr("y", -10)
            .attr("text-anchor", "middle")
            .style("font-size", "16px")
            .text(title);
    }, [data, xField, yField, title]);

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
            <button onClick={onClose} className="close-button">
                &times;
            </button>
            <svg ref={svgRef} className="linechart-svg"></svg>
        </Modal>
    );
};

export default LineChart;
