import React, { useEffect, useRef, useState } from "react";
import * as d3 from "d3";

function TreeMapChart({ data }) {
    const containerRef = useRef(null);
    const [yearToDisplay, setYearToDisplay] = useState(2000);
    const [sliderYear, setSliderYear] = useState(null);
    const [years, setYears] = useState([]);
    const [waterType, setWaterType] = useState("usage");

    // When data changes, extract the unique years and initialize.
    useEffect(() => {
        if (data && data.waterData) {
            const waterData = data.waterData;

            const uniqueYears = Array.from(new Set(waterData.map(d => d.Year)))
                .sort((a, b) => +a - +b);
            setYears(() => uniqueYears);
            if (sliderYear === null) {
                setYearToDisplay(() => uniqueYears[0]);
            }
        }
    }, [data, sliderYear]);

    useEffect(() => {
        setYearToDisplay(sliderYear);
    }, [sliderYear, years, yearToDisplay]);

    // Build the treemap.
    useEffect(() => {
        if (!data || !data.waterData || !data.popuData) return;
        const container = containerRef.current;

        const waterData = data.waterData;

        // Filter data for the current year.
        const filteredData = yearToDisplay ? waterData.filter(d => d.Year === yearToDisplay) : waterData;

        // Further filter data based on waterType ("usage" or "resource").
        const typeFilteredData = filteredData.filter(d => d.type === waterType);

        // Clear previous content.
        d3.select(container).selectAll("*").remove();

        // Get dimensions.
        const width = container.clientWidth || 350;
        const height = container.clientHeight || 250;

        // Remove any existing tooltip.
        d3.select(".tooltip").remove();
        // Create a tooltip.
        const tooltip = d3
            .select("body")
            .append("div")
            .attr("class", "tooltip")
            .style("position", "absolute")
            .style("visibility", "hidden")
            .style("background", "rgba(255, 255, 255, 0.9)")
            .style("border", "1px solid #ccc")
            .style("padding", "5px")
            .style("pointer-events", "none")
            .style("font-size", "12px")
            .style("box-shadow", "0 2px 5px rgba(0,0,0,0.3)");

        // Prepare hierarchy data.
        const hierarchyData = {
            id: "root",
            children: typeFilteredData.map(d => ({
                ...d,
                value: +d.Value || +d.value, // Ensure numeric value.
            })),
        };

        // Create hierarchy and compute treemap layout.
        const root = d3
            .hierarchy(hierarchyData)
            .sum(d => d.value)
            .sort((a, b) => b.value - a.value);

        d3.treemap()
            .size([width, height])
            .padding(2)
            .round(true)(root);

        // Set up color scale.
        const color = d3.scaleOrdinal(d3.schemeCategory10);

        // Render nodes.
        d3.select(container)
            .selectAll(".node")
            .data(root.leaves())
            .enter()
            .append("div")
            .attr("class", "node")
            .style("position", "absolute")
            .style("left", d => d.x0 + "px")
            .style("top", d => d.y0 + "px")
            .style("width", d => Math.max(0, d.x1 - d.x0) + "px")
            .style("height", d => Math.max(0, d.y1 - d.y0) + "px")
            .style("background", d => color(d.data.Variable))
            .style("opacity", 0.9)
            .style("border", "1px solid white")
            .style("font-size", "12px")
            .style("overflow", "hidden")
            .style("display", "flex")
            .style("align-items", "center")
            .style("justify-content", "center")
            .text(d => `${d.data.Variable}: ${d.value.toFixed(2)}`)
            .on("mouseover", (event, d) => {
                tooltip.html(
                    `<strong>Area:</strong> ${d.data.Area}<br/>
                    <strong>Value:</strong> ${d.value.toFixed(2)}<br/>
                    <strong>Variable:</strong> ${d.data.Variable || "N/A"}<br/>
                    <strong>Year:</strong> ${d.data.Year || "N/A"}`
                );
                tooltip.style("visibility", "visible");
                d3.select(event.currentTarget)
                    .style("opacity", 1)
                    .style("border", "2px solid #000");
            })
            .on("mousemove", event => {
                tooltip
                    .style("top", event.pageY + 10 + "px")
                    .style("left", event.pageX + 10 + "px");
            })
            .on("mouseout", (event) => {
                tooltip.style("visibility", "hidden");
                d3.select(event.currentTarget)
                    .style("opacity", 0.9)
                    .style("border", "1px solid white");
            });
    }, [data, yearToDisplay, waterType]);

    return (
        <div className="TreeMapChartContainer">
            {yearToDisplay && (
                <div className="year-display">
                    Year: {yearToDisplay}
                </div>
            )}
            {/* Toggle buttons for water type */}
            <div className="toggle-buttons">
                <button
                    onClick={() => setWaterType("usage")}
                    className={waterType === "usage" ? "usage" : ""}
                >
                    U
                </button>
                <button
                    onClick={() => setWaterType("resource")}
                    className={waterType === "resource" ? "resource" : ""}
                >
                    R
                </button>
            </div>
            <div
                ref={containerRef}
                className="treemap-container"
            />
            {years.length > 0 && (
                <div className="slider-container">
                    <input
                        type="range"
                        min={years[0]}
                        max={years[years.length - 1]}
                        step={1}
                        value={yearToDisplay}
                        onChange={(e) => {
                            setSliderYear(+e.target.value);
                        }}
                    />
                </div>
            )}
        </div>
    );
}

export default TreeMapChart;
