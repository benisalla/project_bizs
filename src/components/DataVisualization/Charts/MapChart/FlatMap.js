import React, { useState, useRef, useEffect } from "react";
import * as d3 from "d3";
import "./FlatMap.css";



// water data contains attributes: 
//   Area
//   IsAggregate
//   Subgroup
//   Symbol
//   UnifiedName
//   Unit
//   Value
//   Variable
//   VariableGroup
//   Year
//   type

// population data contains attributes: 
//   UnifiedName
//   value

// temperature data contains attributes: 
//   UnifiedName
//   value

const FlatMap = (
  {
    flatGeoJson,
    waterData,
    temperatureData,
    populationData,
    onCountryClick
  }) => {

  const mapRef = useRef(null);
  const tooltipRef = useRef(null);
  const baseScaleRef = useRef(null);
  const [zoomScale, setZoomScale] = useState(1);

  const width = 960;
  const height = 600;

  // ==============================================
  // Draw or Update the Map
  // ==============================================
  useEffect(() => {
    if (!flatGeoJson) return;

    // Rollup the filtered waterData by UnifiedName for the selected year
    const rollupWater = d3.rollups(
      waterData,
      v => d3.sum(v, d => d.Value),
      d => d.UnifiedName
    );
    const waterByName = {};
    rollupWater.forEach(([countryName, totalValue]) => {
      waterByName[countryName] = totalValue;
    });
    const waterValues = Object.values(waterByName);
    const minTotal = d3.min(waterValues) || 0;
    const maxTotal = d3.max(waterValues) || 0;

    // Create a color scale
    const numStops = 10;
    const domainStops = d3.range(numStops).map(i => minTotal + i * (maxTotal - minTotal) / (numStops - 1));
    const rangeColors = ["#ff0000", "#ff3333", "#ff6666", "#ff9999", "#ffcccc", "#ccccff", "#9999ff", "#6666ff", "#3333ff", "#0000ff"];
    const colorScale = d3.scaleLinear()
      .domain(domainStops)
      .range(rangeColors)
      .interpolate(d3.interpolateRgb);

    // Map temperatureData by UnifiedName (each record contains a single value)
    const temperatureByName = {};
    temperatureData.forEach(d => {
      temperatureByName[d.UnifiedName] = d.value;
    });

    // Map populationData by UnifiedName (each record contains a single value)
    const populationByName = {};
    populationData.forEach(d => {
      populationByName[d.UnifiedName] = d.value;
    });

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
      const water_value = waterByName[unifiedName];
      const popu_value = populationByName[unifiedName];
      const temp_value = temperatureByName[unifiedName];
      tooltip
        .style("visibility", "visible")
        .style("opacity", 1)
        .html(`
          <strong>Country:</strong> ${unifiedName}<br/>
          <strong>Quantity Of Water:</strong> </br> ${water_value !== undefined && !isNaN(water_value) ? water_value.toFixed(2) : "N/A"}<br/>
          <strong>Population:</strong> ${popu_value !== undefined ? popu_value : "N/A"}<br/>
          <strong>Temperature:</strong> ${temp_value !== undefined ? temp_value.toFixed(2) : "N/A"}<br/>
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
      if (onCountryClick) {
        onCountryClick(d.properties.UnifiedName);
      }
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
      .style('fill', d => {
        const value = waterByName[d.properties.UnifiedName];
        return colorScale(value !== undefined ? value : 0);
      })

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
      .scaleExtent([0.1, 5])
      .on('zoom', event => {

        const slowK = 1 + (event.transform.k - 1) * 0.2; // reduce zoom sensitivity
        const newAbsoluteScale = baseScaleRef.current * slowK;

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
  }, [flatGeoJson, waterData, populationData, temperatureData]);

  // 4) Draw a Legend
  function drawLegend(svg, colorScale, minTotal, maxTotal) {
    // Remove any old legend
    svg.select(".legend").remove();

    const legendWidth = 10;
    const legendHeight = 250;
    const legendX = width + 50;
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
      .ticks(10)
      .tickSize(6);

    legend.append("g")
      .attr("transform", `translate(${legendWidth},0)`)
      .call(legendAxis);

    // "Water Quantity" box - centered horizontally under the legend label in the middle
    legend.append("rect")
      .attr("x", -50) // Centers a 100px wide rect on the legend origin
      .attr("y", legendHeight + 10)
      .attr("width", 100)
      .attr("height", 20)
      .style("fill", "lightgray");

    // Text label inside the "Water Quantity" box, centered horizontally
    legend.append("text")
      .attr("x", 0) // Center text relative to the box
      .attr("y", legendHeight + 10 + 10) // Center vertically in the 20px tall box
      .attr("text-anchor", "middle")
      .text("Water Quantity")
      .style("font-size", "12px")
      .attr("dy", "0.35em");
  }

  return (
    <>
      <div className="flatmap-container">
        <svg ref={mapRef} />
        <div ref={tooltipRef} className="map-tooltip" />
      </div>
    </>
  );
}

export default FlatMap;
