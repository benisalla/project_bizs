import React, { useRef, useEffect, useCallback, useState } from "react";
import * as d3 from "d3";
import "./ScatterChart.css";
import DoubleSlider from "../../../MicroComponents/DoubleSlider";
import EditableText from "../../../MicroComponents/EditableText";

// A tooltip helper function for population.
const getScatterTooltipHtml = (d) => {
    return `
    <div class="tooltip-content">
      <strong>Year:</strong> ${d.Year}<br/>
      <strong>Population:</strong> ${d.Population.toLocaleString()}<br/>
      <strong>Water Value:</strong> ${d.Value.toFixed(2)} ${d.Unit}
    </div>
  `;
};

// A tooltip helper function for temperature.
const getScatterTooltipHtmlTemperature = (d) => {
    return `
    <div class="tooltip-content">
      <strong>Year:</strong> ${d.Year}<br/>
      <strong>Temperature:</strong> ${d.Temper}<br/>
      <strong>Water Value:</strong> ${d.Value.toFixed(2)} ${d.Unit}
    </div>
  `;
};

const ScatterChart = ({ data }) => {
    const scatterSvgRef = useRef();
    const tooltipRef = useRef();
    const [waterType, setWaterType] = useState("usage");
    const [minMaxYear, setMinMaxYear] = useState([1967, 2021]);
    const [showPopulation, setShowPopulation] = useState(true);
    const [title, setTitle] = useState("Scatter Chart of Water Usage & Population");
    const [description, setDescription] = useState(
        `<p><strong>Overview:</strong> This scatter chart visualizes the relationship between <span style="color: #d38d00;">water usage</span> and <span style="color: #000066;">population growth</span> for DZA.</p>
    
    <p><strong>Insights:</strong></p>
    <ul>
        <li>Each <span style="color: #d38d00;">dot</span> represents a data point linking <strong>water consumption</strong> to <strong>population size</strong>.</li>
        <li>Identifies patterns and potential anomalies in resource usage.</li>
        <li>Provides a clear view of how population dynamics impact water demand.</li>
    </ul>
    
    <p><strong>Application:</strong> Useful for environmental analysis, resource planning, and policy-making to ensure sustainable water management.</p>`
    );

    const drawChart = useCallback(() => {
        if (!scatterSvgRef.current || !data || !data.waterData || !data.popuData || !data.tempData) {
            console.error("Missing required data properties.");
            return;
        }

        // Destructure the water, population and temperature data.
        const { waterData, popuData, tempData } = data;

        // Filter water data by the selected water type and year range.
        const filteredWaterData = waterData
            .filter(d => d.type === waterType)
            .filter(d => +d.Year >= minMaxYear[0] && +d.Year <= minMaxYear[1]);

        // Process population data.
        const popArray = Object.entries(popuData[0])
            .filter(([key]) => !isNaN(key))
            .map(([year, value]) => ({ Year: +year, Population: +value }))
            .filter(d => d.Year >= minMaxYear[0] && d.Year <= minMaxYear[1]);

        // Process temperature data.
        const tempArray = Object.entries(tempData[0])
            .filter(([key]) => !isNaN(key))
            .map(([year, value]) => ({ Year: +year, Temper: +value }))
            .filter(d => d.Year >= minMaxYear[0] && d.Year <= minMaxYear[1]);

        // Choose the variable array based on the toggle.
        const variableArray = showPopulation ? popArray : tempArray;

        // Merge water and variable data by year.
        const mergedData = variableArray.map(v => {
            const waterItem = filteredWaterData.find(w => +w.Year === v.Year);
            if (waterItem) {
                return {
                    Year: v.Year,
                    // If showing population, use Population; otherwise, add property Temper.
                    ...(showPopulation ? { Population: v.Population } : { Temper: v.Temper }),
                    Value: +waterItem.Value,
                    Unit: waterItem.Unit,
                    Variable: waterItem.Variable
                };
            }
            return null;
        }).filter(d => d !== null);

        console.log("Merged Data for Scatter Chart:", mergedData);

        // Get responsive dimensions.
        if (!scatterSvgRef.current._dimensions) {
            const containerElement = scatterSvgRef.current.parentNode;
            const containerWidth = containerElement.clientWidth || 350;
            const containerHeight = containerElement.clientHeight || 250;
            const margin = { top: 60, right: 0, bottom: 40, left: 0 };
            scatterSvgRef.current._dimensions = {
                containerWidth,
                containerHeight,
                margin,
                width: containerWidth - margin.left - margin.right,
                height: containerHeight - margin.top - margin.bottom,
            };
        }
        const { containerWidth, containerHeight, margin, width, height } = scatterSvgRef.current._dimensions;

        // Clear any existing SVG content.
        d3.select(scatterSvgRef.current).selectAll("*").remove();

        // Set up the responsive SVG.
        const svg = d3
            .select(scatterSvgRef.current)
            .attr("width", "100%")
            .attr("height", "100%")
            .attr("viewBox", `0 0 ${containerWidth} ${containerHeight}`)
            .attr("preserveAspectRatio", "xMidYMid meet")
            .append("g")
            .attr("transform", `translate(${margin.left}, ${margin.top})`);

        // Create scales.
        // xScale: based on population or temperature.
        const xDomain = showPopulation
            ? [d3.min(variableArray, d => d.Population), d3.max(variableArray, d => d.Population)]
            : d3.extent(tempArray, d => d.Temper);
        const xScale = d3.scaleLinear()
            .domain(xDomain)
            .range([0, width])
            .nice();

        // yScale: water value.
        const yScale = d3.scaleLinear()
            .domain([d3.min(mergedData, d => d.Value), d3.max(mergedData, d => d.Value)])
            .range([height, 0])
            .nice();

        // Add Chart Title.
        svg.append("text")
            .attr("x", width / 2)
            .attr("y", -40)
            .attr("text-anchor", "middle")
            .style("font-size", "16px")
            .style("font-weight", "bold")
            .text(`Water (${waterType}) vs ${showPopulation ? "Population" : "Temperature"} for ${title}`);

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
            .attr("cx", d => showPopulation ? xScale(d.Population) : xScale(d.Temper))
            .attr("cy", d => yScale(d.Value))
            .attr("r", 6)
            .attr("fill", "orange")
            .attr("stroke", "#333")
            .attr("stroke-width", 0.5)
            .on("mouseover", function (event, d) {
                d3.select(this).attr("r", 10);
                const tooltipHTML = showPopulation
                    ? getScatterTooltipHtml(d)
                    : getScatterTooltipHtmlTemperature(d);
                d3.select(tooltipRef.current)
                    .style("visibility", "visible")
                    .html(tooltipHTML)
                    .transition().duration(200).style("opacity", 0.9);
            })
            .on("mousemove", function (event) {
                const [x, y] = d3.pointer(event, this.parentNode);
                d3.select(tooltipRef.current)
                    .style("top", (y + 10) + "px")
                    .style("left", (x + 10) + "px");
            })
            .on("mouseout", function () {
                d3.select(this).attr("r", 6);
                d3.select(tooltipRef.current)
                    .transition().duration(200)
                    .style("opacity", 0)
                    .on("end", () => d3.select(tooltipRef.current).style("visibility", "hidden"));
            });

        // Add a legend.
        const legendData = [
            { name: "Water Value", color: "orange" },
            { name: showPopulation ? "Population" : "Temperature", color: showPopulation ? "darkblue" : "red" }
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
    }, [data, waterType, minMaxYear, showPopulation]);

    useEffect(() => {
        if (data && data.waterData && data.popuData && data.tempData) {
            drawChart();
        }
    }, [drawChart, data]);

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
        <div id="scatter-chart" className="chart-container">
            <div className="chart-description">
                <h2>{title}</h2>
                <EditableText
                    initialText={description}
                    className="chart-description-text"
                    onChange={(newText) => setDescription(newText)}
                    tag="div"
                />
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
                        >
                            R
                        </button>
                    </div>
                    {/* Population / Temperature toggle */}
                    <div className="scatter-toggle-buttons">
                        <button
                            className={`temp-popu-type-btn ${showPopulation ? "active" : ""}`}
                            onClick={() => setShowPopulation(true)}
                            title="Population"
                        >
                            P
                        </button>
                        <button
                            className={`temp-popu-type-btn ${!showPopulation ? "active" : ""}`}
                            onClick={() => setShowPopulation(false)}
                            title="Temperature"
                        >
                            T
                        </button>
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
