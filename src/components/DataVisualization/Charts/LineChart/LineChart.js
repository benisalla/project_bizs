import React, { useRef, useEffect, useCallback, useState } from "react";
import * as d3 from "d3";
import "./LineChart.css";
import { groupWaterDataByYear } from "../../../APIs/DataUtils";
import DoubleSlider from "../../../MicroComponents/DoubleSlider";


// A tooltip helper function similar to the one in BarChart.
const getTooltipHtml = (d) => {
    return `
    <div class="tooltip-content">
      <strong>Year:</strong> ${d.Year}<br/>
      <strong>Water Quantity:</strong> ${d.TotalValue}
    </div>
  `;
};

// tooltip for population and temperature
const getTooltipHtmlPopulation = (d) => {
    return `
    <div class="tooltip-content">
        <strong>Year:</strong> ${d.Year}<br/>
        <strong>Population:</strong> ${d.Population}<br/>
    </div>
    `;
};

// tooltip for temperature
const getTooltipHtmlTemperature = (d) => {
    return `
    <div class="tooltip-content">
        <strong>Year:</strong> ${d.Year}<br/>
        <strong>Temperature:</strong> ${d.Temper}<br/>  
    </div>
    `;
};

const LineChart = ({ data }) => {
    const lineSvgRef = useRef();
    const tooltipRef = useRef();
    const [showUsage, setShowUsage] = useState(true);
    const [showPopulation, setShowPopulation] = useState(true);
    const [minMaxYear, setMinMaxYear] = useState([1967, 2021]);
    const [title, setTitle] = useState("Line Chart of Water Usage & Population");

    const drawChart = useCallback(() => {
        if (!lineSvgRef.current || !data || !data.waterData || !data.popuData) return;

        setTitle("Line Chart of Water " + (showUsage ? "Usage" : "Resource") + " & " + (showPopulation ? "Population" : "Temperature"));

        // Destructure water and population data and set default values to avoid errors if empty.
        const { waterData = [], popuData = [{}], tempData = [{}] } = data;

        // Filter water data based on selected year range.
        const filteredData = waterData.filter(
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

        // Process temperature data.
        const tempDataArray = Object.entries(tempData[0])
            .filter(([key]) => !isNaN(key))
            .map(([year, value]) => ({ Year: +year, Temper: +value, }))
            .filter((d) => d.Year >= minMaxYear[0] && d.Year <= minMaxYear[1]);


        // Compute dimensions just once and cache them on the svg element.
        if (!lineSvgRef.current._dimensions) {
            const containerElement = lineSvgRef.current.parentNode;
            const containerWidth = containerElement.clientWidth || 350;
            const containerHeight = containerElement.clientHeight || 250;
            const margin = { top: 60, right: 0, bottom: 35, left: 0 };
            lineSvgRef.current._dimensions = {
                containerWidth,
                containerHeight,
                margin,
                width: containerWidth - margin.left - margin.right,
                height: containerHeight - margin.top - margin.bottom,
            };
        }
        const { containerWidth, containerHeight, margin, width, height } = lineSvgRef.current._dimensions;

        // Clear any previous SVG content.
        d3.select(lineSvgRef.current).selectAll("*").remove();

        // Set up the responsive SVG.
        const svg = d3
            .select(lineSvgRef.current)
            .attr("width", "100%")
            .attr("height", "100%")
            .attr("viewBox", `0 0 ${containerWidth} ${containerHeight}`)
            .attr("preserveAspectRatio", "xMidYMid meet")
            .append("g")
            .attr("transform", `translate(${margin.left}, ${margin.top})`);

        // Build a complete list of years from all data sources.
        const allYears = Array.from(
            new Set([
                ...usageByYear.map((d) => d.Year),
                ...resourceByYear.map((d) => d.Year),
                ...popuDataArray.map((d) => d.Year),
                ...tempDataArray.map((d) => d.Year),
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

        // Create a scale for temperature (using "Temper" property).
        const maxTemperature = d3.max(tempDataArray, (d) => d.Temper) || 0;
        const minTemperature = d3.min(tempDataArray, (d) => d.Temper) || 0;
        const yScaleTemperature = d3
            .scaleLinear()
            .domain([minTemperature, maxTemperature])
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
        svg.append("g").attr("class", "y-axis-left").call(d3.axisLeft(showUsage ? yScaleUsage : yScaleResource));
        if (showPopulation) {
            svg
                .append("g")
                .attr("class", "y-axis-right")
                .attr("transform", `translate(${width}, 0)`)
                .call(d3.axisRight(yScalePopulation));
        } else {
            svg
                .append("g")
                .attr("class", "y-axis-right")
                .attr("transform", `translate(${width}, 0)`)
                .call(d3
                    .axisRight(yScaleTemperature)
                    .ticks(20)
                    .tickFormat(d3.format(".4f")));
        }

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

        // NEW: Create a line generator for temperature data.
        const temperatureLineGenerator = d3
            .line()
            .x((d) => xScale(String(d.Year)) + xScale.bandwidth() / 2)
            .y((d) => yScaleTemperature(d.Temper))
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
        if (!showUsage && resourceByYear.length) {
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
                        .html(tooltipHtml)
                        .style("visibility", "visible")
                        .style("opacity", 0.9);
                })
                .on("mousemove", function (event) {
                    const [x, y] = d3.pointer(event, this.parentNode);
                    d3.select(tooltipRef.current)
                        .style("top", (y + 10) + "px")
                        .style("left", (x + 10) + "px");
                })
                .on("mouseout", function () {
                    d3.select(this).attr("r", 4);
                    d3.select(tooltipRef.current)
                        .style("opacity", 0)
                        .style("visibility", "hidden");
                });
        }

        // Draw circles with hover events for RESOURCE data.
        if (!showUsage) {
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
                    const [x, y] = d3.pointer(event, this.parentNode);
                    d3.select(tooltipRef.current)
                        .style("top", (y + 10) + "px")
                        .style("left", (x + 10) + "px");
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

        // Draw temperature or population line.
        if (showPopulation) {
            // Draw the population line.
            svg.append("path")
                .datum(popuDataArray)
                .attr("class", "population-line")
                .attr("fill", "none")
                .attr("stroke", "darkblue")
                .attr("stroke-width", 2)
                .attr("d", populationLineGenerator);

            // Draw population circles with tooltips.
            svg
                .selectAll(".population-circle")
                .data(popuDataArray)
                .enter()
                .append("circle")
                .attr("class", "population-circle")
                .attr("cx", (d) => xScale(String(d.Year)) + xScale.bandwidth() / 2)
                .attr("cy", (d) => yScalePopulation(d.Population))
                .attr("r", 3)
                .attr("fill", "darkblue")
                .on("mouseover", function (event, d) {
                    d3.select(this).attr("r", 8);
                    const tooltipHtml = getTooltipHtmlPopulation(d);
                    d3.select(tooltipRef.current)
                        .html(tooltipHtml)
                        .style("visibility", "visible")
                        .style("opacity", 0.9);
                })
                .on("mousemove", function (event) {
                    const [x, y] = d3.pointer(event, this.parentNode);
                    d3.select(tooltipRef.current)
                        .style("top", (y + 10) + "px")
                        .style("left", (x + 10) + "px");
                })
                .on("mouseout", function () {
                    d3.select(this).attr("r", 3);
                    d3.select(tooltipRef.current)
                        .style("opacity", 0)
                        .style("visibility", "hidden");
                });

        } else {
            // Draw the temperature line using the dedicated temperature line generator.
            svg.append("path")
                .datum(tempDataArray)
                .attr("class", "temperature-line")
                .attr("fill", "none")
                .attr("stroke", "red")
                .attr("stroke-width", 2)
                .attr("d", temperatureLineGenerator);

            // Draw temperature circles with tooltips.
            svg
                .selectAll(".temperature-circle")
                .data(tempDataArray)
                .enter()
                .append("circle")
                .attr("class", "temperature-circle")
                .attr("cx", (d) => xScale(String(d.Year)) + xScale.bandwidth() / 2)
                .attr("cy", (d) => yScaleTemperature(d.Temper))
                .attr("r", 3)
                .attr("fill", "red")
                .on("mouseover", function (event, d) {
                    d3.select(this).attr("r", 8);
                    const tooltipHtml = getTooltipHtmlTemperature(d);
                    d3.select(tooltipRef.current)
                        .html(tooltipHtml)
                        .style("visibility", "visible")
                        .style("opacity", 0.9);
                })
                .on("mousemove", function (event) {
                    const [x, y] = d3.pointer(event, this.parentNode);
                    d3.select(tooltipRef.current)
                        .style("top", (y + 10) + "px")
                        .style("left", (x + 10) + "px");
                })
                .on("mouseout", function () {
                    d3.select(this).attr("r", 3);
                    d3.select(tooltipRef.current)
                        .style("opacity", 0)
                        .style("visibility", "hidden");
                });

        }

        // Add a legend.
        const legendData = [];
        if (showUsage) legendData.push({ name: "Usage", color: "#3498db" });
        if (!showUsage) legendData.push({ name: "Resource", color: "#2ecc71" });
        if (showPopulation) legendData.push({ name: "Population", color: "darkblue" });
        if (!showPopulation) legendData.push({ name: "Temperature", color: "red" });

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
    }, [data, showUsage, showPopulation, minMaxYear]);

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
                    <div className="line-toggle-buttons">
                        <button
                            title="Usage"
                            className={`water-type-btn ${showUsage ? "active" : ""}`}
                            onClick={() => setShowUsage(true)}
                        >
                            U
                        </button>
                        <button
                            title="Resource"
                            className={`water-type-btn ${!showUsage ? "active" : ""}`}
                            onClick={() => setShowUsage(false)}
                        >
                            R
                        </button>
                    </div>
                    <div className="line-toggle-buttons">
                        <button
                            title="Population"
                            className={`temp-popu-type-btn ${showPopulation ? "active" : ""}`}
                            onClick={() => setShowPopulation(true)}
                        >
                            P
                        </button>
                        <button
                            title="Temperature"
                            className={`temp-popu-type-btn ${!showPopulation ? "active" : ""}`}
                            onClick={() => setShowPopulation(false)}
                        >
                            T
                        </button>
                    </div>

                </div>
                <svg ref={lineSvgRef} className="chart-svg"></svg>
                <div ref={tooltipRef} className="chart-tooltip" />
                <div className="double-slider-container">
                    <DoubleSlider min={1967} max={2021} onChange={handleMinMaxYearChange} />
                </div>
            </div>
        </div>
    );
};

export default LineChart;
