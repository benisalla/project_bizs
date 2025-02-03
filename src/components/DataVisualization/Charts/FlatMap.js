import React, { useState, useRef, useEffect } from "react";
import * as d3 from "d3";
import * as topojson from "topojson-client";
import "./FlatMap.css";
import ChartSelector from "../Modals/ChartSelector";
import LineChart from "./LineChart/LineChart";
import AreaStats from "./Statistics/AreaStats";
import { filterDataByCountry } from '../../APIs/DataUtils';

const countries_path = process.env.PUBLIC_URL + "/assets/dataset/countries-110m.json";
const water_data_path = process.env.PUBLIC_URL + "/assets/dataset/world-water-data.csv";
const map_countries_names_path = process.env.PUBLIC_URL + "/assets/dataset/map-country-names.json";


function FlatMap() {
  const [geojson, setGeojson] = useState(null);
  const [waterData, setWaterData] = useState([]);
  const [selectedCountry, setSelectedCountry] = useState(null);
  const [isLineChartOpen, setIsLineChartOpen] = useState(false);
  const [lineChartData, setLineChartData] = useState([]);
  const [isChartSelectorOpen, setIsChartSelectorOpen] = useState(false);
  const [selectedChart, setSelectedChart] = useState(null);
  const [isAreaStatsOpen, setIsAreaStatsOpen] = useState(false);
  const [areaStatsData, setAreaStatsData] = useState([]);
  const [isBarChartOpen, setIsBarChartOpen] = useState(false);
  const [isScatterChartOpen, setIsScatterChartOpen] = useState(false);
  

  const mapRef = useRef(null);
  const tooltipRef = useRef(null);
  const popupRef = useRef(null);

  const width = 960;
  const height = 600;

  // ==============================================
  // Load Data: GeoJSON, water data, and country name mapping
  // ==============================================
  useEffect(() => {
    Promise.all([
      d3.json(countries_path),
      d3.csv(water_data_path),
      d3.json(map_countries_names_path)
    ]).then(([topoJsonData, waterData, mappingData]) => {
      // Convert the TopoJSON to GeoJSON
      const worldgeo = topojson.feature(topoJsonData, topoJsonData.objects.countries);

      // For each geo feature, assign a UnifiedName using mappingData.
      worldgeo.features.forEach(feature => {
        feature.properties.UnifiedName = mappingData[feature.properties.name];
      });

      // Log all the countries in worldgeo
      // console.log("Countries in worldgeo:", worldgeo.features.map(feature => feature.properties.name));

      // Process water CSV records: add numeric values and UnifiedName
      waterData.forEach(d => {
        d.Year = +d.Year;
        d.Value = +d.Value || 0;
        d.UnifiedName = mappingData[d.Area];
      });

      setGeojson(worldgeo);
      setWaterData(waterData);
    }).catch(err => console.error("Error loading data:", err));
  }, []);

  // ==============================================
  // Draw or Update the Map
  // ==============================================
  useEffect(() => {
    if (!geojson || waterData.length === 0) return;

    // Rollup the data by UnifiedName
    const rollup = d3.rollups(
      waterData,
      v => d3.sum(v, d => d.Value),
      d => d.UnifiedName
    );

    // Convert to a simple object: key = UnifiedName, value = total water value
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
    function handleMouseOver(e, d) {
      const unifiedName = d.properties.UnifiedName;
      const val = valueByName[unifiedName];
      tooltip
        .style("visibility", "visible")
        .style("opacity", 1)
        .html(`
          <strong>Country:</strong> ${unifiedName}<br/>
          <strong>Value:</strong> ${val !== undefined && !isNaN(val)
            ? val.toFixed(2)
            : "N/A"}
        `);
    }

    function handleMouseMove(e) {
      tooltip
        .style("left", e.pageX + 10 + "px")
        .style("top", e.pageY + 10 + "px");
    }

    function handleMouseOut() {
      tooltip.style("visibility", "hidden").style("opacity", 0);
    }

    // When a country is clicked, use its UnifiedName.
    function handleClick(e, d) {
      console.log("Clicked on:", d.properties.UnifiedName);
      setSelectedCountry(d.properties.UnifiedName);
      setIsChartSelectorOpen(true);
    }

    // BIND GEOJSON
    svg.selectAll(".country")
      .data(geojson.features)
      .join("path")
      .attr("class", "country")
      .attr("d", path)
      .attr("stroke", "#fff")
      .attr("stroke-width", 0.5)
      .transition()
      .duration(600)
      .ease(d3.easeCubicOut)
      .attr("fill", d => {
        const unifiedGeoName = d.properties.UnifiedName;
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
  }, [geojson, waterData]);

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


  // ==============================================
  // Handle Chart Selection
  // ==============================================
  useEffect(() => {
    if (selectedCountry && waterData.length > 0) {
      setIsChartSelectorOpen(true);
    }
  }, [selectedCountry]);


  useEffect(() => {
    if (selectedChart === 'LineChart') {
      const lineData = filterDataByCountry(selectedCountry, waterData);
      // console.log("Line Data:", lineData);
      setLineChartData(lineData);
      setIsLineChartOpen(true);
      setSelectedChart(null);
    }

    if (selectedChart === 'ScatterChart') {
      setIsScatterChartOpen(true);
      setSelectedChart(null);
    }

    if (selectedChart === 'AreaStats') {
      const area_stats_data = filterDataByCountry(selectedCountry, waterData);
      // console.log("Area Stats Data:", area_stats_data);
      setAreaStatsData(area_stats_data);
      setIsAreaStatsOpen(true);
      setSelectedChart(null);
    }

    if (selectedChart === 'BarChart') {
      setIsBarChartOpen(true);
      setSelectedChart(null);
    }
  }, [selectedChart]);


  const handleSelectChart = (chartType) => {
    setSelectedChart(chartType);
    setIsChartSelectorOpen(false);
  };

  return (
    <>
      <div className="flatmap-container">
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


      {/* here we select the chart we want */}
      <ChartSelector
        isOpen={isChartSelectorOpen}
        onClose={() => {
          setIsChartSelectorOpen(false);
          setSelectedCountry(null);
        }}
        onSelect={handleSelectChart}
      />

      {/* line chart */}
      <LineChart
        title={`Line Chart of ${selectedCountry}`}
        lineData={lineChartData}
        isOpen={isLineChartOpen}
        onClose={() => {
          setIsLineChartOpen(false);
          setSelectedCountry(null);
        }}
      />

      {/* Area Stats */}
      <AreaStats
        isOpen={isAreaStatsOpen}
        onClose={() => {
          setIsAreaStatsOpen(false);
          setSelectedCountry(null);
        }}
        areaData={areaStatsData}
        title={`${selectedCountry} Statistics`}
      />
    </>
  );
}

export default FlatMap;
