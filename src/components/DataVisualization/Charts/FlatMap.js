import React, { useState, useRef, useEffect } from "react";
import * as d3 from "d3";
import * as topojson from "topojson-client";
import "./FlatMap.css";
import stringSimilarity from 'string-similarity';

const countries_path = process.env.PUBLIC_URL + "/assets/dataset/countries-110m.json";
const water_data_path = process.env.PUBLIC_URL + "/assets/dataset/world-water-data.csv";
const iso_data_path = process.env.PUBLIC_URL + "/assets/dataset/iso.csv";

function suggestMappings(waterNames, geojsonNames) {
  const mapping = {};
  waterNames.forEach(name => {
    const match = stringSimilarity.findBestMatch(name, geojsonNames);
    if (match.bestMatch.rating > 0.6) {
      mapping[name] = match.bestMatch.target;
    } 
  });
  return mapping;
}

function FlatMap() {
  const [countriesGeo, setCountriesGeo] = useState(null);
  const [waterData, setWaterData] = useState([]);
  const [isoData, setIsoData] = useState([]);
  const [nameMapping, setNameMapping] = useState({});
  const mapRef = useRef(null);
  const tooltipRef = useRef(null);
  const popupRef = useRef(null);

  const width = 960;
  const height = 600;

  function unifyName(name) {
    return nameMapping[name] || name;
  }

  // LOAD DATA
  useEffect(() => {
    Promise.all([
      d3.json(countries_path),
      d3.csv(water_data_path),
      d3.csv(iso_data_path)
    ]).then(([worldData, waterCsv, isoCsv]) => {
      const world = topojson.feature(worldData, worldData.objects.countries);
      setCountriesGeo(world);

      const geojsonNames = world.features.map(feat => feat.properties.name);
      const waterNames = waterCsv.map(row => row.Area);

      const mappings = suggestMappings(waterNames, geojsonNames);
      setNameMapping(mappings);

      waterCsv.forEach(d => {
        d.Year = +d.Year;
        d.Value = +d.Value || 0;
        d.Area = mappings[d.Area] || d.Area;
      });

      setWaterData(waterCsv);
      setIsoData(isoCsv);
    }).catch(err => console.error("Error loading data:", err));
  }, []);

  // 2) DRAW or UPDATE THE MAP
  useEffect(() => {
    if (!countriesGeo || waterData.length === 0) return;

    // Rollup the data by country
    const rollup = d3.rollups(
      waterData,
      v => d3.sum(v, d => d.Value),
      d => d.Area
    );

    // Convert to a simple object
    const valueByName = {};
    for (let [countryName, totalValue] of rollup) {
      valueByName[countryName] = totalValue;
    }

    // Build a color scale
    const allValues = Object.values(valueByName);
    const maxVal = d3.max(allValues) || 0;
    const colorScale = d3
      .scaleLinear()
      .domain([0, maxVal])
      .range(["#e0f3f8", "#0868ac"]);

    // Select or create the SVG
    const svg = d3
      .select(mapRef.current)
      .attr("width", width)
      .attr("height", height);

    // Create a Mercator projection
    const projection = d3
      .geoMercator()
      .scale(150)
      .translate([width / 2, height / 1.4]);

    const path = d3.geoPath().projection(projection);

    // Tooltip selection
    const tooltip = d3.select(tooltipRef.current);

    // MOUSE HANDLERS
    function handleMouseOver(event, d) {
      const rawGeoName = d.properties.name || "Unknown";
      const unifiedGeoName = unifyName(rawGeoName);

      const val = valueByName[unifiedGeoName];
      tooltip
        .style("visibility", "visible")
        .style("opacity", 1)
        .html(`
          <strong>Country:</strong> ${unifiedGeoName}<br/>
          <strong>Value:</strong> ${val !== undefined && !isNaN(val)
            ? val.toFixed(2)
            : "N/A"
          }
        `);
    }

    function handleMouseMove(event) {
      tooltip
        .style("left", event.pageX + 10 + "px")
        .style("top", event.pageY + 10 + "px");
    }

    function handleMouseOut() {
      tooltip.style("visibility", "hidden").style("opacity", 0);
    }

    function handleClick(event, d) {
      const rawGeoName = d.properties.name || "Unknown";
      const unifiedGeoName = unifyName(rawGeoName);

      // We'll draw the chart for that country
      drawChart(unifiedGeoName);
    }

    // BIND GEOJSON
    svg.selectAll(".country")
      .data(countriesGeo.features)
      .join("path")
      .attr("class", "country")
      .attr("d", path)
      .attr("stroke", "#fff")
      .attr("stroke-width", 0.5)
      .transition()
      .duration(600)
      .ease(d3.easeCubicOut)
      .attr("fill", d => {
        const rawGeoName = d.properties.name;
        const unifiedGeoName = unifyName(rawGeoName);
        const val = valueByName[unifiedGeoName];
        if (val === undefined || isNaN(val)) {
          return "lightgray";
        }
        return colorScale(val);
      });

    // Attach mouse & click listeners
    svg.selectAll(".country")
      .on("mouseover", handleMouseOver)
      .on("mousemove", handleMouseMove)
      .on("mouseout", handleMouseOut)
      .on("click", handleClick);

    // Draw or update a legend
    drawLegend(svg, colorScale);
  }, [countriesGeo, waterData]);

  // 3) Draw the Chart in a Popup
  function drawChart(countryName) {
    // Filter water data by the unified name
    const filteredData = waterData.filter(row => row.Area === countryName);

    // Group by year (if your data has multiple years) and sum
    const groupedData = d3.rollups(
      filteredData,
      v => d3.sum(v, d => d.Value),
      d => d.Year
    )
      .map(([Year, TotalValue]) => ({ Year, TotalValue }))
      .sort((a, b) => a.Year - b.Year);

    // Show the popup
    const chartPopup = d3.select(popupRef.current);
    chartPopup
      .style("visibility", "visible")
      .style("opacity", 1)
      .style("left", `${window.innerWidth / 2 - 300}px`)
      .style("top", `${window.innerHeight / 2 - 200}px`);

    // Clear old content
    chartPopup.selectAll("*").remove();

    // Close button
    chartPopup
      .append("button")
      .text("X")
      .style("position", "absolute")
      .style("top", "10px")
      .style("right", "10px")
      .style("background", "#f44336")
      .style("color", "white")
      .style("border", "none")
      .style("border-radius", "5px")
      .style("cursor", "pointer")
      .style("font-size", "16px")
      .on("click", () => {
        chartPopup.style("visibility", "hidden");
      });

    // Dimensions for the chart
    const margin = { top: 40, right: 30, bottom: 50, left: 50 };
    const chartW = 600 - margin.left - margin.right;
    const chartH = 300 - margin.top - margin.bottom;

    // Create the chart SVG
    const svg = chartPopup
      .append("svg")
      .attr("width", chartW + margin.left + margin.right)
      .attr("height", chartH + margin.top + margin.bottom)
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    // X scale - discrete years
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

    // X axis
    svg.append("g")
      .attr("transform", `translate(0,${chartH})`)
      .call(
        d3.axisBottom(xScale)
          .tickValues(xScale.domain().filter((_, i) => i % 5 === 0))
      )
      .selectAll("text")
      .attr("transform", "rotate(-45)")
      .style("text-anchor", "end");

    // Y axis
    svg.append("g").call(d3.axisLeft(yScale));

    // Line chart
    const line = d3.line()
      .x(d => xScale(d.Year) + xScale.bandwidth() / 2)
      .y(d => yScale(d.TotalValue));

    svg.append("path")
      .datum(groupedData)
      .attr("fill", "none")
      .attr("stroke", "orange")
      .attr("stroke-width", 2)
      .attr("d", line);

    // Title
    svg.append("text")
      .attr("x", chartW / 2)
      .attr("y", -10)
      .attr("text-anchor", "middle")
      .style("font-size", "16px")
      .text(`Annual sum of water values for ${countryName}`);
  }

  // 4) Draw a Legend
  function drawLegend(svg, colorScale) {
    // Remove any old legend
    svg.select(".legend").remove();

    const legendWidth = 20;
    const legendHeight = 200;
    const legendX = width - 70;
    const legendY = 50;

    const legend = svg.append("g")
      .attr("class", "legend")
      .attr("transform", `translate(${legendX},${legendY})`);

    let defs = svg.select("defs");
    if (defs.empty()) defs = svg.append("defs");
    defs.selectAll("#legend-gradient").remove();

    const gradient = defs.append("linearGradient")
      .attr("id", "legend-gradient")
      .attr("x1", "0%").attr("x2", "0%")
      .attr("y1", "100%").attr("y2", "0%");

    const stops = d3.ticks(0, 1, 10);
    stops.forEach(stop => {
      gradient.append("stop")
        .attr("offset", stop)
        .attr("stop-color", colorScale(
          colorScale.invert
            ? colorScale.invert(stop)
            : stop * colorScale.domain()[1]
        ));
    });

    legend.append("rect")
      .attr("width", legendWidth)
      .attr("height", legendHeight)
      .style("fill", "url(#legend-gradient)");

    const [minVal, maxVal] = colorScale.domain();
    const legendScale = d3.scaleLinear()
      .domain([minVal, maxVal])
      .range([legendHeight, 0]);

    const legendAxis = d3.axisRight(legendScale)
      .ticks(5)
      .tickSize(6);

    legend.append("g")
      .attr("transform", `translate(${legendWidth},0)`)
      .call(legendAxis);

    legend.append("rect")
      .attr("x", 0)
      .attr("y", legendHeight + 10)
      .attr("width", legendWidth)
      .attr("height", 20)
      .style("fill", "lightgray");

    legend.append("text")
      .attr("x", legendWidth / 2)
      .attr("y", legendHeight + 40)
      .text("No Data")
      .attr("text-anchor", "middle")
      .style("font-size", "12px");
  }

  return (
    <div style={{ position: "relative" }}>
      <svg ref={mapRef} />

      {/* Tooltip */}
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
          opacity: 0
        }}
      />

      {/* Popup chart */}
      <div
        ref={popupRef}
        style={{
          position: "absolute",
          visibility: "hidden",
          width: "600px",
          height: "350px",
          background: "#fff",
          border: "1px solid #ccc",
          borderRadius: "8px",
          boxShadow: "0 4px 8px rgba(0,0,0,0.2)",
          padding: "20px"
        }}
      />
    </div>
  );
}

export default FlatMap;
