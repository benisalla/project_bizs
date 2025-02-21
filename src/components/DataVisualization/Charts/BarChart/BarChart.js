import React, { useRef, useEffect, useCallback, useState, useMemo } from "react";
import * as d3 from "d3";
import "./BarChart.css";
import { groupWaterDataByYear } from "../../../APIs/DataUtils";
import DoubleSlider from "../../../MicroComponents/DoubleSlider";


const getTooltipHtml = (type, d, extra = {}) => {
  switch (type) {
    case "bar":
      return `
        <div class="tooltip-content">
          <strong>Category:</strong> ${extra.variableName}<br/>
          <strong>Year:</strong> ${d.data.Year}<br/>
          <strong>Water Quantity:</strong> ${(d[1] - d[0]).toFixed(2)} m³/year
        </div>
      `;
    case "total":
      return `
        <div class="tooltip-content">
          <strong>Year:</strong> ${d.Year}<br/>
          <strong>Total Water Quantity:</strong> ${d.total.toFixed(2)} m³/year
        </div>
      `;
    case "pop":
      return `
        <div class="tooltip-content">
          <strong>Year:</strong> ${d.Year}<br/>
          <strong>Population:</strong> ${d.Population} habitants
        </div>
      `;
    default:
      return "";
  }
};


const BarChart = ({ data, title }) => {
  const barSvgRef = useRef();
  const tooltipRef = useRef();
  const [waterType, setWaterType] = useState("usage");
  const [minMaxYear, setMinMaxYear] = useState([1967, 2021]);
  const [selectedVariable, setSelectedVariable] = useState("AllVariables");

  // Compute unique variables from the raw water data.
  const uniqueVariables = useMemo(() => {
    if (!data || !data.waterData) return { "usage": [], "resource": [] };
    const usageSet = new Set();
    const resourceSet = new Set();
    data.waterData.forEach(d => {
      if (d.type === "usage" && d.Variable) usageSet.add(d.Variable);
      if (d.type === "resource" && d.Variable) resourceSet.add(d.Variable);
    });
    return {
      "usage": Array.from(usageSet),
      "resource": Array.from(resourceSet),
    };
  }, [data]);

  // Handler for the double slider – updates the selected interval.
  const handleMinMaxYearChange = (min_max) => {
    setMinMaxYear(min_max);
  };

  // The main chart drawing function.
  const drawChart = useCallback(() => {
    if (!barSvgRef.current || !data) return;

    const { waterData, popuData } = data;
    const filteredBarData = waterData.filter((d) => d.type === waterType);
    let water_data = groupWaterDataByYear(filteredBarData);

    // Get responsive dimensions
    if (!barSvgRef.current._dimensions) {
      const containerElement = barSvgRef.current.parentNode;
      const containerWidth = containerElement.clientWidth || 350;
      const containerHeight = containerElement.clientHeight || 250;
      const margin = { top: 60, right: 0, bottom: 35, left: 0 };
      barSvgRef.current._dimensions = {
        containerWidth,
        containerHeight,
        margin,
        width: containerWidth - margin.left - margin.right,
        height: containerHeight - margin.top - margin.bottom,
      };
    }
    const { containerWidth, containerHeight, margin, width, height } = barSvgRef.current._dimensions;

    // Clear any existing SVG content
    d3.select(barSvgRef.current).selectAll("*").remove();

    // Set up the responsive SVG
    const svg = d3
      .select(barSvgRef.current)
      .attr("width", "100%")
      .attr("height", "100%")
      .attr("viewBox", `0 0 ${containerWidth} ${containerHeight}`)
      .attr("preserveAspectRatio", "xMidYMid meet")
      .append("g")
      .attr("transform", `translate(${margin.left}, ${margin.top})`);

    // Add Chart Title.
    svg
      .append("text")
      .attr("x", width / 2)
      .attr("y", -20)
      .attr("text-anchor", "middle")
      .style("font-size", "16px")
      .style("font-weight", "bold")
      .text(`Consommation d'eau & Population pour ${title} (${waterType})`);

    // Data Processing.
    const startYear = 1967;
    const endYear = 2021;

    // Process population data.
    const popArray = Object.entries(popuData[0])
      .filter(([key]) => !isNaN(key))
      .map(([year, value]) => ({ Year: +year, Population: +value }))
      .filter((d) => d.Year >= startYear && d.Year <= endYear);

    // Build complete list of years.
    const allYears = Array.from(
      new Set([...water_data.map((d) => d.Year), ...popArray.map((d) => d.Year)])
    ).sort((a, b) => a - b);

    const filteredYears = allYears.filter(
      (year) => year >= minMaxYear[0] && year <= minMaxYear[1]
    );

    const filteredWaterData = water_data.filter(d => filteredYears.includes(d.Year));

    let xScale = d3
      .scaleBand()
      .domain(filteredYears.map(String))
      .range([0, width])
      .padding(0.2);

    // CASE 1: "AllVariables" view – display AllVariables variables as stacked bars.
    if (selectedVariable === "AllVariables") {
      // Use AllVariables keys (except "Year") from filteredWaterData.
      const variables = Object.keys(filteredWaterData[0]).filter(key => key !== "Year" && key !== "TotalValue");

      const stack = d3.stack()
        .keys(variables)
        .value((d, key) => +d[key] || 0)
        .order(d3.stackOrderNone)
        .offset(d3.stackOffsetNone)(filteredWaterData);

      const yScaleWater = d3.scaleLinear()
        .domain([0, d3.max(filteredWaterData, d => d3.sum(variables, key => d[key] || 0))])
        .nice()
        .range([height, 0]);
      const maxPopulation = d3.max(popArray, d => d.Population);
      const yScalePop = d3.scaleLinear()
        .domain([0, maxPopulation])
        .nice()
        .range([height, 0]);

      // Create a color mapping for variables.
      const getUniqueColors = keys => {
        const colorPalette = d3.schemeCategory10.concat(d3.schemeSet3);
        return new Map(keys.map((v, i) => [v, colorPalette[i % colorPalette.length]]));
      };
      const variableToColor = getUniqueColors(variables);

      const serie = svg.selectAll(".serie")
        .data(stack)
        .enter()
        .append("g")
        .attr("class", "serie")
        .attr("fill", d => variableToColor.get(d.key) || "#4682b4");

      serie.selectAll("rect")
        .data(d => d)
        .enter()
        .append("rect")
        .attr("x", d => xScale(String(d.data.Year)))
        .attr("y", d => yScaleWater(d[1]))
        .attr("width", xScale.bandwidth())
        .attr("height", d => Math.max(yScaleWater(d[0]) - yScaleWater(d[1]), 1))
        .attr("stroke", "#333")
        .attr("stroke-width", 0.5)
        .on("mouseover", (event, d) => {
          const tooltipSel = d3.select(tooltipRef.current);
          const variableName = d3.select(event.currentTarget.parentNode).datum().key;
          const htmlContent = getTooltipHtml("bar", d, { variableName });
          tooltipSel.style("visibility", "visible")
            .html(htmlContent);
          tooltipSel.transition().duration(200).style("opacity", 0.9);
        })
        .on("mousemove", event => {
          d3.select(tooltipRef.current)
            .style("top", (event.pageY - 80) + "px")
            .style("left", (event.pageX - 230) + "px");
        })
        .on("mouseleave", () => {
          d3.select(tooltipRef.current)
            .transition().duration(200)
            .style("opacity", 0)
            .on("end", () => d3.select(tooltipRef.current).style("visibility", "hidden"));
        });

      const linePop = d3.line()
        .x(d => xScale(String(d.Year)) + xScale.bandwidth() / 2)
        .y(d => yScalePop(d.Population))
        .curve(d3.curveMonotoneX);

      svg.append("path")
        .datum(popArray.filter(d => filteredYears.includes(d.Year)))
        .attr("fill", "none")
        .attr("stroke", "darkblue")
        .attr("stroke-width", 2)
        .attr("d", linePop);

      svg.selectAll(".popCircle")
        .data(popArray.filter(d => filteredYears.includes(d.Year)))
        .enter()
        .append("circle")
        .attr("class", "popCircle")
        .attr("cx", d => xScale(String(d.Year)) + xScale.bandwidth() / 2)
        .attr("cy", d => yScalePop(d.Population))
        .attr("r", 3)
        .attr("fill", "darkblue")
        .on("mouseover", (event, d) => {
          const tooltipSel = d3.select(tooltipRef.current);
          const htmlContent = getTooltipHtml("pop", d);
          tooltipSel.style("visibility", "visible")
            .html(htmlContent);
          tooltipSel.transition().duration(200).style("opacity", 0.9);
        })
        .on("mousemove", event => {
          d3.select(tooltipRef.current)
            .style("top", (event.pageY - 80) + "px")
            .style("left", (event.pageX - 230) + "px");
        })
        .on("mouseleave", () => {
          d3.select(tooltipRef.current)
            .transition().duration(200)
            .style("opacity", 0)
            .on("end", () => d3.select(tooltipRef.current).style("visibility", "hidden"));
        });

      const xAxisG = svg.append("g")
        .attr("class", "x-axis")
        .attr("transform", `translate(0, ${height})`)
        .call(d3.axisBottom(xScale).tickFormat(d3.format("d")));
      xAxisG.selectAll("text")
        .attr("transform", "rotate(-45)")
        .style("text-anchor", "end");
      svg.append("g")
        .attr("class", "y-axis-left")
        .call(d3.axisLeft(yScaleWater));
      svg.append("g")
        .attr("class", "y-axis-right")
        .attr("transform", `translate(${width}, 0)`)
        .call(d3.axisRight(yScalePop));
    }
    // CASE 2: a specific variable selected – use a single bar.
    else {
      // Use only the selected variable.
      const variables = [selectedVariable];
      const stack = d3.stack()
        .keys(variables)
        .value((d, key) => +d[key] || 0)
        .order(d3.stackOrderNone)
        .offset(d3.stackOffsetNone)(filteredWaterData);

      const yScaleWater = d3.scaleLinear()
        .domain([0, d3.max(filteredWaterData, d => d3.sum(variables, key => d[key] || 0))])
        .nice()
        .range([height, 0]);
      const maxPopulation = d3.max(popArray, d => d.Population);
      const yScalePop = d3.scaleLinear()
        .domain([0, maxPopulation])
        .nice()
        .range([height, 0]);

      // For a single variable, choose one color.
      const variableToColor = new Map([[selectedVariable, "#4682b4"]]);

      const serie = svg.selectAll(".serie")
        .data(stack)
        .enter()
        .append("g")
        .attr("class", "serie")
        .attr("fill", d => variableToColor.get(d.key) || "#4682b4");

      serie.selectAll("rect")
        .data(d => d)
        .enter()
        .append("rect")
        .attr("x", d => xScale(String(d.data.Year)))
        .attr("y", d => yScaleWater(d[1]))
        .attr("width", xScale.bandwidth())
        .attr("height", d => Math.max(yScaleWater(d[0]) - yScaleWater(d[1]), 1))
        .attr("stroke", "#333")
        .attr("stroke-width", 0.5)
        .on("mouseover", (event, d) => {
          const tooltipSel = d3.select(tooltipRef.current);
          const htmlContent = getTooltipHtml("bar", d, { variableName: selectedVariable });
          tooltipSel.style("visibility", "visible")
            .html(htmlContent);
          tooltipSel.transition().duration(200).style("opacity", 0.9);
        })
        .on("mousemove", event => {
          d3.select(tooltipRef.current)
            .style("top", (event.pageY - 80) + "px")
            .style("left", (event.pageX - 230) + "px");
        })
        .on("mouseleave", () => {
          d3.select(tooltipRef.current)
            .transition().duration(200)
            .style("opacity", 0)
            .on("end", () => d3.select(tooltipRef.current).style("visibility", "hidden"));
        });

      const linePop = d3.line()
        .x(d => xScale(String(d.Year)) + xScale.bandwidth() / 2)
        .y(d => yScalePop(d.Population))
        .curve(d3.curveMonotoneX);

      svg.append("path")
        .datum(popArray.filter(d => filteredYears.includes(d.Year)))
        .attr("fill", "none")
        .attr("stroke", "darkblue")
        .attr("stroke-width", 2)
        .attr("d", linePop);

      svg.selectAll(".popCircle")
        .data(popArray.filter(d => filteredYears.includes(d.Year)))
        .enter()
        .append("circle")
        .attr("class", "popCircle")
        .attr("cx", d => xScale(String(d.Year)) + xScale.bandwidth() / 2)
        .attr("cy", d => yScalePop(d.Population))
        .attr("r", 3)
        .attr("fill", "darkblue")
        .on("mouseover", (event, d) => {
          const tooltipSel = d3.select(tooltipRef.current);
          const htmlContent = getTooltipHtml("pop", d);
          tooltipSel.style("visibility", "visible")
            .html(htmlContent);
          tooltipSel.transition().duration(200).style("opacity", 0.9);
        })
        .on("mousemove", event => {
          d3.select(tooltipRef.current)
            .style("top", (event.pageY - 80) + "px")
            .style("left", (event.pageX - 230) + "px");
        })
        .on("mouseleave", () => {
          d3.select(tooltipRef.current)
            .transition().duration(200)
            .style("opacity", 0)
            .on("end", () => d3.select(tooltipRef.current).style("visibility", "hidden"));
        });

      const xAxisG = svg.append("g")
        .attr("class", "x-axis")
        .attr("transform", `translate(0, ${height})`)
        .call(d3.axisBottom(xScale).tickFormat(d3.format("d")));
      xAxisG.selectAll("text")
        .attr("transform", "rotate(-45)")
        .style("text-anchor", "end");
      svg.append("g")
        .attr("class", "y-axis-left")
        .call(d3.axisLeft(yScaleWater));
      svg.append("g")
        .attr("class", "y-axis-right")
        .attr("transform", `translate(${width}, 0)`)
        .call(d3.axisRight(yScalePop));
    }

  }, [data, waterType, minMaxYear, selectedVariable]);

  useEffect(() => {
    if (data && data.waterData && data.popuData) {
      drawChart();
    }
  }, [drawChart]);

  // Redraw chart on window resize.
  useEffect(() => {
    window.addEventListener("resize", drawChart);
    return () => window.removeEventListener("resize", drawChart);
  }, [drawChart]);

  return (
    <div className="chart-container" style={{ flexDirection: "row-reverse" }}>
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
              onClick={() => {
                setWaterType("usage");
                setSelectedVariable("AllVariables");
              }}
            >U</button>
            <button
              className={`water-type-btn ${waterType === "resource" ? "active" : ""}`}
              onClick={() => {
                setWaterType("resource");
                setSelectedVariable("AllVariables");
              }}
            >R</button>
          </div>
          <div className="variable-selector">
            <select
              value={selectedVariable}
              onChange={(e) => setSelectedVariable(e.target.value)}
            >
              <option value="AllVariables">All Variables</option>
              <option value="TotalValue">Total Quantity</option>
              {uniqueVariables[waterType].map((v, i) => (
                <option key={i} value={v}>
                  {v}
                </option>
              ))}
            </select>
          </div>
        </div>
        <svg ref={barSvgRef} className="chart-svg"></svg>
        <div ref={tooltipRef} className="chart-tooltip" />
        <div className="double-slider-container">
          <DoubleSlider min={1967} max={2021} onChange={handleMinMaxYearChange} />
        </div>
      </div>
    </div >
  );
};

export default BarChart;
