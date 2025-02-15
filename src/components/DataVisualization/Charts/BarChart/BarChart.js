import React, { useRef, useEffect, useCallback, useState } from "react";
import * as d3 from "d3";
import Modal from "react-modal";
import "./BarChart.css";
import { groupWaterDataByYear } from "../../../APIs/DataUtils";
import DoubleSlider from "../../../MicroComponents/DoubleSlider";

Modal.setAppElement("#root");

const BarChart = ({ data, title, isOpen, onClose }) => {
  const svgRef = useRef();
  const tooltipRef = useRef();
  const [waterType, setWaterType] = useState("usage");
  const [minMaxYear, setMinMaxYear] = useState([1967, 2021]);

  // Handler for the double slider – it updates the selected interval.
  const handleMinMaxYearChange = (min_max) => {
    setMinMaxYear(min_max);
  };

  // The chart drawing function now depends on minMaxYear as well.
  const drawChart = useCallback(() => {
    if (!svgRef.current || !data) return;

    // Filter barData by waterType and group it by year.
    const { barData, popuData } = data;

    console.log("------ [ bar water data ] ------");
    console.log(barData);
    console.log("------ [ population data ] ------");
    console.log(popuData);
    
    const filteredBarData = barData.filter((d) => d.type === waterType);
    const water_data = groupWaterDataByYear(filteredBarData);

    console.log("water_data", water_data);
    console.log("popuData", popuData);

    // Remove any existing SVG content.
    d3.select(svgRef.current).selectAll("*").remove();

    // -------------------------------------------------
    // Dimensions & margins (adapted to modal size)
    // -------------------------------------------------
    const containerElement = svgRef.current.parentNode;
    const containerWidth = containerElement.clientWidth || 550;
    const containerHeight = containerElement.clientHeight || 300;

    // Remove any existing SVG content.
    d3.select(svgRef.current).selectAll("*").remove();

    // Define margins.
    const margin = { top: 60, right: 60, bottom: 80, left: 60 };
    const width = containerWidth - margin.left - margin.right;
    const height = containerHeight - margin.top - margin.bottom;

    // Append an inner group for margins.
    const svg = d3
      .select(svgRef.current)
      .attr("width", "100%")
      .attr("height", "100%")
      .attr("viewBox", `0 0 ${containerWidth} ${containerHeight}`)
      .attr("preserveAspectRatio", "xMidYMid meet")
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    // -------------------------------------------------
    // Add Chart Title
    // -------------------------------------------------
    svg
      .append("text")
      .attr("x", width / 2)
      .attr("y", -20)
      .attr("text-anchor", "middle")
      .style("font-size", "16px")
      .style("font-weight", "bold")
      .text(`Consommation d'eau & Population pour ${title} (${waterType})`);

    // -------------------------------------------------
    // Data Processing
    // -------------------------------------------------
    const startYear = 1967;
    const endYear = 2021;

    // Get variable names (ignoring the "Year" key).
    // (For your data, water_data objects have keys like "Year" and "TotalValue")
    const variables = Object.keys(water_data[0] || {}).filter(
      (key) => key !== "Year"
    );

    // Process population data.
    const popArray = Object.entries(popuData[0])
      .filter(([key]) => !isNaN(key))
      .map(([year, value]) => ({ Year: +year, Population: +value }))
      .filter((d) => d.Year >= startYear && d.Year <= endYear);

    // Build the complete list of years from both datasets.
    const allYears = Array.from(
      new Set([
        ...water_data.map((d) => d.Year),
        ...popArray.map((d) => d.Year),
      ])
    ).sort((a, b) => a - b);

    // Use the external double slider state to filter the years.
    const filteredYears = allYears.filter(
      (year) => year >= minMaxYear[0] && year <= minMaxYear[1]
    );

    // Build the x-scale with only the filtered years.
    let xScale = d3
      .scaleBand()
      .domain(filteredYears.map(String))
      .range([0, width])
      .padding(0.2);

    // -------------------------------------------------
    // Color Mapping (by Variable)
    // -------------------------------------------------
    function getUniqueColors() {
      const countryVariables = new Map();
      barData.forEach((d) => {
        if (!countryVariables.has(d.Area)) {
          countryVariables.set(d.Area, new Set());
        }
        countryVariables.get(d.Area).add(d.Variable);
      });
      let maxCountry = null,
        maxVariables = 0;
      countryVariables.forEach((vars, country) => {
        if (vars.size > maxVariables) {
          maxVariables = vars.size;
          maxCountry = country;
        }
      });
      const uniqueVariables = [...(countryVariables.get(maxCountry) || [])];
      const colorPalette = d3.schemeCategory10.concat(d3.schemeSet3);
      return new Map(
        uniqueVariables.map((v, i) => [
          v,
          colorPalette[i % colorPalette.length],
        ])
      );
    }
    const variableToColor = getUniqueColors();

    // -------------------------------------------------
    // Stack the water data by variable.
    // -------------------------------------------------
    const stack = d3
      .stack()
      .keys(variables)
      .value((d, key) => d[key] || 0)
      .order(d3.stackOrderNone)
      .offset(d3.stackOffsetNone)(water_data);

    // -------------------------------------------------
    // Create Y Scales
    // -------------------------------------------------
    const yScaleWater = d3
      .scaleLinear()
      .domain([
        0,
        d3.max(water_data, (d) =>
          d3.sum(variables, (key) => d[key] || 0)
        ),
      ])
      .nice()
      .range([height, 0]);

    const maxPopulation = d3.max(popArray, (d) => d.Population);
    const yScalePop = d3
      .scaleLinear()
      .domain([0, maxPopulation])
      .nice()
      .range([height, 0]);

    // -------------------------------------------------
    // Tooltip Setup (with a fade transition)
    // -------------------------------------------------
    const tooltip = d3
      .select(tooltipRef.current)
      .style("visibility", "hidden")
      .style("opacity", 0);

    // -------------------------------------------------
    // Draw the Stacked Bars
    // -------------------------------------------------
    const serie = svg
      .selectAll(".serie")
      .data(stack)
      .enter()
      .append("g")
      .attr("class", "serie")
      .attr("fill", (d) => variableToColor.get(d.key) || "#4682b4");

    serie
      .selectAll("rect")
      .data((d) => d)
      .enter()
      .append("rect")
      .attr("x", (d) => xScale(String(d.data.Year)))
      .attr("y", (d) => yScaleWater(d[1]))
      .attr("width", xScale.bandwidth())
      .attr("height", (d) => Math.max(yScaleWater(d[0]) - yScaleWater(d[1]), 1))
      .attr("stroke", "#333")
      .attr("stroke-width", 0.5)
      .on("mouseover", (event, d) => {
        tooltip
          .style("visibility", "visible")
          .transition()
          .duration(200)
          .style("opacity", 0.9);
        const variableName = d3
          .select(event.currentTarget.parentNode)
          .datum().key;
        const barValue = (d[1] - d[0]).toFixed(2);
        tooltip.html(`
          <strong>Variable:</strong> ${variableName}<br/>
          <strong>Année:</strong> ${d.data.Year}<br/>
          <strong>Valeur:</strong> ${barValue} m³/an
        `);
      })
      .on("mousemove", (event) => {
        tooltip
          .style("top", event.pageY - 30 + "px")
          .style("left", event.pageX + 10 + "px");
      })
      .on("mouseleave", () => {
        tooltip
          .transition()
          .duration(200)
          .style("opacity", 0)
          .on("end", () => tooltip.style("visibility", "hidden"));
      });

    // -------------------------------------------------
    // Filter population data by the selected interval.
    // -------------------------------------------------
    const filteredPop = popArray.filter(
      (d) => d.Year >= minMaxYear[0] && d.Year <= minMaxYear[1]
    );

    // Draw the Population Line.
    let linePop = d3
      .line()
      .x((d) => xScale(String(d.Year)) + xScale.bandwidth() / 2)
      .y((d) => yScalePop(d.Population))
      .curve(d3.curveMonotoneX);

    svg
      .append("path")
      .datum(filteredPop)
      .attr("fill", "none")
      .attr("stroke", "darkblue")
      .attr("stroke-width", 2)
      .attr("d", linePop);

    // Draw Population Circles.
    svg
      .selectAll(".popCircle")
      .data(filteredPop)
      .enter()
      .append("circle")
      .attr("class", "popCircle")
      .attr("cx", (d) => xScale(String(d.Year)) + xScale.bandwidth() / 2)
      .attr("cy", (d) => yScalePop(d.Population))
      .attr("r", 3)
      .attr("fill", "darkblue")
      .on("mouseover", (event, d) => {
        tooltip
          .style("visibility", "visible")
          .transition()
          .duration(200)
          .style("opacity", 0.9);
        tooltip.html(`
          <strong>Année:</strong> ${d.Year}<br/>
          <strong>Population:</strong> ${d.Population} habitants
        `);
      })
      .on("mousemove", (event) => {
        tooltip
          .style("top", event.pageY - 30 + "px")
          .style("left", event.pageX + 10 + "px");
      })
      .on("mouseleave", () => {
        tooltip
          .transition()
          .duration(200)
          .style("opacity", 0)
          .on("end", () => tooltip.style("visibility", "hidden"));
      });

    // -------------------------------------------------
    // Draw Axes
    // -------------------------------------------------
    const xAxisG = svg
      .append("g")
      .attr("class", "x-axis")
      .attr("transform", `translate(0, ${height})`)
      .call(d3.axisBottom(xScale).tickFormat(d3.format("d")));

    xAxisG
      .selectAll("text")
      .attr("transform", "rotate(-45)")
      .style("text-anchor", "end");

    svg.append("g")
      .attr("class", "y-axis-left")
      .call(d3.axisLeft(yScaleWater));

    svg.append("g")
      .attr("class", "y-axis-right")
      .attr("transform", `translate(${width}, 0)`)
      .call(d3.axisRight(yScalePop));
  }, [data, waterType, minMaxYear]);

  // Re-draw the chart when the modal is open or when waterType/minMaxYear changes.
  useEffect(() => {
    if (isOpen) {
      drawChart();
    }
  }, [isOpen, drawChart]);

  // Re-draw the chart when the window is resized.
  useEffect(() => {
    window.addEventListener("resize", drawChart);
    return () => window.removeEventListener("resize", drawChart);
  }, [drawChart]);

  return (
    <Modal
      isOpen={isOpen}
      onAfterOpen={drawChart}
      onRequestClose={onClose}
      contentLabel="Bar Chart Modal"
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
      <div className="bar-chart-container">
        <button onClick={onClose} className="bar-chart-close-button"> &times; </button>
        <svg ref={svgRef} className="chart-svg"></svg>
        <div ref={tooltipRef} className="chart-tooltip" />
        <div className="double-slider-container">
          <DoubleSlider min={1967} max={2021} onChange={handleMinMaxYearChange} />
        </div>
      </div>
    </Modal>
  );
};

export default BarChart;
