import React, { useState, useRef, useEffect } from "react";
import * as d3 from "d3";
import "./FlatMap.css";
import ChartSelector from "../../Modals/ChartSelector";
import LineChart from "../LineChart/LineChart";
import BarChart from "../BarChart/BarChart";
import AreaStats from "../AreaStats/AreaStats";
import { filterWaterDataByCountry, filterPupulationDataByCountry } from '../../../APIs/DataUtils';


function FlatMap({ flatGeoJson, waterData, populationData }) {
  const mapRef = useRef(null);
  const tooltipRef = useRef(null);
  const baseScaleRef = useRef(null);
  const [zoomScale, setZoomScale] = useState(1);
  const [selectedCountry, setSelectedCountry] = useState(null);
  const [isLineChartOpen, setIsLineChartOpen] = useState(false);
  const [lineChartData, setLineChartData] = useState([]);
  const [isChartSelectorOpen, setIsChartSelectorOpen] = useState(false);
  const [selectedChart, setSelectedChart] = useState(null);
  const [isAreaStatsOpen, setIsAreaStatsOpen] = useState(false);
  const [areaStatsData, setAreaStatsData] = useState([]);
  const [isBarChartOpen, setIsBarChartOpen] = useState(false);
  const [barData, setBarData] = useState({
    barData: [],
    popuData: [],
  });
  const [isScatterChartOpen, setIsScatterChartOpen] = useState(false);


  const width = 960;
  const height = 600;

  // ==============================================
  // Draw or Update the Map
  // ==============================================
  useEffect(() => {
    if (!flatGeoJson || waterData.length === 0) return;

    // min and max values of waterQTbyYear
    const totalValues = flatGeoJson.features.map(
      (d) => d.properties.waterQTbyYear || 0
    );
    const minTotal = d3.min(totalValues);
    const maxTotal = d3.max(totalValues);

    // Create a color scale
    const colorScale = d3.scaleLinear()
      .domain([minTotal, (minTotal + maxTotal) / 2, maxTotal])
      .range(["blue", "white", "red"])
      .interpolate(d3.interpolateRgb);

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

    // Select or create the SVG
    const svg = d3
      .select(mapRef.current)
      .attr("width", "100%")
      .attr("height", 600)
      .attr("viewBox", `0 0 ${width} ${height}`);


    // Create a Mercator projection
    const projection = d3
      .geoMercator()
      .scale(150)
      .translate([width / 2, height / 1.4]);

    baseScaleRef.current = projection.scale();

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
      .data(flatGeoJson.features)
      .join("path")
      .attr("class", "country")
      .attr("d", path)
      .attr("stroke", "#fff")
      .attr("stroke-width", 0.5)
      .transition()
      .duration(600)
      .ease(d3.easeCubicOut)
      .style('fill', d => colorScale(d.properties.waterQTbyYear))

    // Attach mouse & click listeners
    svg.selectAll(".country")
      .on("mouseover", handleMouseOver)
      .on("mousemove", handleMouseMove)
      .on("mouseout", handleMouseOut)
      .on("click", handleClick);

    // ***** Add zoom behavior here *****
    const zoomBehavior = d3.zoom()
      .filter(event => {
        return (event.type === 'wheel' && event.ctrlKey) ||
          (event.type === 'touchstart') ||
          (event.type === 'touchmove') ||
          (event.type === 'touchend');
      })
      .scaleExtent([0.2, 4])
      .on('zoom', event => {
        const newAbsoluteScale = baseScaleRef.current * event.transform.k;
        if (Math.abs(newAbsoluteScale - projection.scale()) > 1e-5) {
          svg.transition()
            .duration(250)
            .ease(d3.easeCubicOut)
            .tween('zoom', () => {
              const i = d3.interpolate(projection.scale(), newAbsoluteScale);
              return t => {
                projection.scale(i(t));
                svg.selectAll('.country').attr('d', path);
              };
            });
          setZoomScale(event.transform.k);
        }
      });

    // Attach zoom behavior to the svg:
    svg.call(zoomBehavior);


    let lastX, lastY;
    const dragBehavior = d3.drag()
      .on("start", (event) => {
        [lastX, lastY] = d3.pointer(event, svg.node());
      })
      .on("drag", (event) => {
        const [currentX, currentY] = d3.pointer(event, svg.node());
        const dx = currentX - lastX;
        const dy = currentY - lastY;
        const currentTranslate = projection.translate();
        projection.translate([currentTranslate[0] + dx, currentTranslate[1] + dy]);
        svg.selectAll(".country").attr("d", path);
        lastX = currentX;
        lastY = currentY;
      });

    svg.call(dragBehavior);
    // Draw or update a legend
    drawLegend(svg, colorScale, minTotal, maxTotal);
  }, [flatGeoJson, waterData]);

  // 4) Draw a Legend
  function drawLegend(svg, colorScale, minTotal, maxTotal) {
    // Remove any old legend
    svg.select(".legend").remove();

    const legendWidth = 10;
    const legendHeight = 250;
    const legendX = width - 50;
    const legendY = 100;

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

    // Use three stops: one for the min, one for the mid, and one for the max.
    const stops = [minTotal, (minTotal + maxTotal) / 2, maxTotal];
    const stopPercents = ["0%", "50%", "100%"];
    stops.forEach((d, i) => {
      gradient.append("stop")
        .attr("offset", stopPercents[i])
        .attr("stop-color", colorScale(d));
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
      const lineData = filterWaterDataByCountry(selectedCountry, waterData);
      console.log("Line Data:", lineData);
      setLineChartData(lineData);
      setIsLineChartOpen(true);
      setSelectedChart(null);
    }

    if (selectedChart === 'ScatterChart') {
      setIsScatterChartOpen(true);
      setSelectedChart(null);
    }

    if (selectedChart === 'AreaStats') {
      const area_stats_data = filterWaterDataByCountry(selectedCountry, waterData);
      console.log("Area Stats Data:", area_stats_data);
      setAreaStatsData(area_stats_data);
      setIsAreaStatsOpen(true);
      setSelectedChart(null);
    }

    if (selectedChart === 'BarChart') {
      const barData = filterWaterDataByCountry(selectedCountry, waterData);
      const popuData = filterPupulationDataByCountry(selectedCountry, populationData);
      setBarData({ barData, popuData });
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
        <div ref={tooltipRef} className="map-tooltip" />
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

      {/* Bar Chart */}
      <BarChart
        data={barData}
        title={`Bar Chart of ${selectedCountry}`}
        isOpen={isBarChartOpen}
        onClose={() => {
          setIsBarChartOpen(false);
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
