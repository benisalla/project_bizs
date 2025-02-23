import React, { useRef, useEffect, useCallback, useState } from "react";
import * as d3 from "d3";
import "./ScatterChart.css";
import DoubleSlider from "../../../MicroComponents/DoubleSlider";
import EditableText from "../../../MicroComponents/EditableText";
import * as ss from "simple-statistics";

// A tooltip helper function for population.
const getScatterTooltipHtml = (d) => {
    return `
    <div class="tooltip-content">
      <strong>Year:</strong> ${d.Year}<br/>
      <strong>Population:</strong> ${d.Population.toLocaleString()}<br/>
      <strong>Water Quantity:</strong> ${d.Value.toFixed(2)} ${d.Unit}
    </div>
  `;
};

// A tooltip helper function for temperature.
const getScatterTooltipHtmlTemperature = (d) => {
    return `
    <div class="tooltip-content">
      <strong>Year:</strong> ${d.Year}<br/>
      <strong>Temperature:</strong> ${d.Temper}<br/>
      <strong>Water Quantity:</strong> ${d.Value.toFixed(2)} ${d.Unit}
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
        `<p>This scatter chart provides an overview of how 
          <span style="color: #d38d00;">water usage</span> 
          correlates with 
          <span style="color: #000066;">population</span>. 
          Each <strong><span style="color: #d38d00;">dot</span></strong> represents a data point linking water consumption to demographic size.</p>
          
         <p><strong>What it helps us do:</strong></p>
         <ul>
           <li>Reveal patterns and potential anomalies in water demand.</li>
           <li>Examine how population changes may influence resource usage.</li>
           <li>Provide actionable insights for environmental planning and policy-making.</li>
         </ul>
      
         <p>You can edit this description to focus on specific findings or analyses relevant to your context.</p>`
    );


    const drawChart = useCallback(() => {
        if (!scatterSvgRef.current || !data || !data.waterData || !data.popuData || !data.tempData) {
            console.error("Missing required data properties.");
            return;
        }

        setTitle("Line Chart of Water " + (waterType == "usage" ? "Usage" : "Resource") + " & " + (showPopulation ? "Population" : "Temperature"));

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

        // yScale: Water Quantity.
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
            .attr("fill", "blue")
            .attr("stroke", "black")
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

        // Add x-axis label based on the showPopulation toggle.
        svg.append("text")
            .attr("class", "x-axis-label")
            .attr("x", width / 2)
            .attr("y", height + margin.bottom - 15)
            .attr("text-anchor", "middle")
            .style("font-size", "12px")
            .style("fill", "black")
            .text(showPopulation ? "Population (habitat)" : "Temperature (°C)");
        svg.append("text")
            .attr("class", "y-axis-label")
            .attr("transform", "rotate(-90)")
            .attr("x", -height / 2)
            .attr("y", -margin.left - 30)
            .attr("text-anchor", "middle")
            .style("font-size", "12px")
            .style("fill", "black")
            .text(waterType === "usage" ? "Water Usage Value" : "Water Resource Value");


        // Compute regression line data based on the scatter points.
        const regressionData = mergedData.map(d => [
            showPopulation ? d.Population : d.Temper,
            d.Value
        ]);

        if (regressionData.length > 1) {
            // Calculate linear regression parameters.
            const regression = ss.linearRegression(regressionData);
            const regressionLine = ss.linearRegressionLine(regression);

            // Determine the domain for the regression line.
            const xMin = d3.min(regressionData, d => d[0]);
            const xMax = d3.max(regressionData, d => d[0]);

            // Build the line data from the min and max x values.
            const lineData = [
                { x: xMin, y: regressionLine(xMin) },
                { x: xMax, y: regressionLine(xMax) }
            ];

            // Draw the regression line.
            svg.append("path")
                .datum(lineData)
                .attr("fill", "none")
                .attr("stroke", "red")
                .attr("stroke-width", 2)
                .attr("d", d3.line()
                    .x(d => xScale(d.x))
                    .y(d => yScale(d.y))
                );
        }
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
                            title="Water Usage"
                        >
                            U
                        </button>
                        <button
                            className={`water-type-btn ${waterType === "resource" ? "active" : ""}`}
                            onClick={() => setWaterType("resource")}
                            title="Water Resource"
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
