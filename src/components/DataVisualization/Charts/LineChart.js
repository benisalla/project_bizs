import React, { useRef, useEffect } from "react";
import * as d3 from "d3";
import Modal from "react-modal";
import { useState } from "react";

const LineChart = ({ countryName, waterData }) => {
    const svgRef = useRef(null);
    const [isLineChartOpen, setIsLineChartOpen] = useState(false);

    useEffect(() => {
        if (!countryName || !waterData || waterData.length === 0) return;
        const filteredData = waterData.filter(row => row.Area === countryName);

        const groupedData = d3.rollups(
            filteredData,
            v => d3.sum(v, d => d.Value),
            d => d.Year
        )
            .map(([Year, TotalValue]) => ({ Year, TotalValue }))
            .sort((a, b) => a.Year - b.Year);

        const margin = { top: 40, right: 30, bottom: 50, left: 50 };
        const chartW = 600 - margin.left - margin.right;
        const chartH = 300 - margin.top - margin.bottom;

        d3.select(svgRef.current).selectAll("*").remove();

        const svg = d3
            .select(svgRef.current)
            .attr("width", chartW + margin.left + margin.right)
            .attr("height", chartH + margin.top + margin.bottom)
            .append("g")
            .attr("transform", `translate(${margin.left},${margin.top})`);

        const years = groupedData.map(d => d.Year);
        const xScale = d3.scaleBand()
            .domain(years)
            .range([0, chartW])
            .padding(0.2);

        const yMax = d3.max(groupedData, d => d.TotalValue) || 0;
        const yScale = d3.scaleLinear()
            .domain([0, yMax])
            .nice()
            .range([chartH, 0]);

        svg.append("g")
            .attr("transform", `translate(0,${chartH})`)
            .call(d3.axisBottom(xScale).tickValues(xScale.domain().filter((_, i) => i % 5 === 0)))
            .selectAll("text")
            .attr("transform", "rotate(-45)")
            .style("text-anchor", "end");

        svg.append("g").call(d3.axisLeft(yScale));

        const line = d3.line()
            .x(d => xScale(d.Year) + xScale.bandwidth() / 2)
            .y(d => yScale(d.TotalValue));

        svg.append("path")
            .datum(groupedData)
            .attr("fill", "none")
            .attr("stroke", "orange")
            .attr("stroke-width", 2)
            .attr("d", line);

        svg.append("text")
            .attr("x", chartW / 2)
            .attr("y", -10)
            .attr("text-anchor", "middle")
            .style("font-size", "16px")
            .text(`Annual sum of water values for ${countryName}`);
    }, [countryName, waterData]);

    if (!countryName) return null;

    return (
        <Modal
            isOpen={isLineChartOpen}
            onRequestClose={() => setIsLineChartOpen(false)}
            contentLabel="Line Chart Modal"
            style={{
                content: {
                    top: '50%',
                    left: '50%',
                    right: 'auto',
                    bottom: 'auto',
                    marginRight: '-50%',
                    transform: 'translate(-50%, -50%)',
                    background: '#fff',
                    border: '1px solid #ccc',
                    borderRadius: '8px',
                    boxShadow: '0 4px 8px rgba(0,0,0,0.2)',
                    padding: '20px',
                    width: '600px',
                    height: '350px'
                },
                overlay: {
                    backgroundColor: 'rgba(0, 0, 0, 0.75)'
                }
            }}
        >
            <button
                onClick={() => setIsLineChartOpen(false)}
                style={{
                    position: "absolute",
                    top: "10px",
                    right: "10px",
                    background: "#f44336",
                    color: "white",
                    border: "none",
                    borderRadius: "5px",
                    cursor: "pointer",
                    fontSize: "16px"
                }}
            >
                X
            </button>

            <svg ref={svgRef} />
        </Modal>
    );
}

export default LineChart;
