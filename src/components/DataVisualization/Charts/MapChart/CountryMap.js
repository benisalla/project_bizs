import React, { useRef, useEffect } from "react";
import * as d3 from "d3";
import "./CountryMap.css";

const CountryMap = ({
  countryGeoJson,
  country_name,
  width = 800,
  height = 600,
}) => {
  const svgRef = useRef(null);
  const tooltipRef = useRef(null);

  useEffect(() => {
    if (!countryGeoJson) return;

    // Select the SVG element and clear any previous content
    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    // Create (or select) a tooltip element appended to the body
    const tooltip = d3.select(tooltipRef.current);

    // Set up a projection that fits the geo data within the given width and height
    const projection = d3
      .geoIdentity()
      .reflectY(true)
      .reflectX(false)
      .fitExtent(
        [
          [6, 6],
          [width - 6, height - 6],
        ],
        countryGeoJson
      );

    // Create a geoPath generator using the defined projection
    const pathGenerator = d3.geoPath().projection(projection);

    // Append the country path to the SVG
    svg
      .append("path")
      .datum(countryGeoJson)
      .attr("d", pathGenerator)
      .attr("fill", "lightblue")
      .attr("stroke", "black")
      .attr("stroke-width", 1)
      .style("cursor", "pointer")
      .on("mouseover", (event, d) => {
        // On mouseover, darken the fill and show the tooltip
        d3.select(event.currentTarget)
          .transition()
          .duration(200)
          .attr("fill", d3.rgb("lightblue").darker(0.5));

        tooltip
          .transition()
          .duration(200)
          .style("opacity", 0.9);

        // Display the country's name if available
        const countryName = d.properties?.name || "Unknown Country";
        tooltip
          .html(`<strong>${countryName}</strong>`)
          .style("left", event.pageX + 10 + "px")
          .style("top", event.pageY - 28 + "px");
      })
      .on("mousemove", (event) => {
        // Update tooltip position on mouse move
        tooltip
          .style("left", event.pageX + 10 + "px")
          .style("top", event.pageY - 28 + "px");
      })
      .on("mouseout", (event) => {
        // Revert fill color and hide the tooltip on mouseout
        d3.select(event.currentTarget)
          .transition()
          .duration(200)
          .attr("fill", "lightblue");
        tooltip
          .transition()
          .duration(500)
          .style("opacity", 0);
      });

    // Cleanup: remove tooltip when the component unmounts
    return () => {
      if (tooltipRef.current) {
        d3.select(tooltipRef.current).remove();
        tooltipRef.current = null;
      }
    };
  }, [countryGeoJson]);

  return (
    <div className="country-map-container">
      {country_name && (
        <div className="map-title">
          Map of <strong>{country_name}</strong>
        </div>
      )}
      <svg
        ref={svgRef}
        width={width}
        height={height}
      />
      <div ref={tooltipRef} className="country-map-tooltip" />
    </div>
  );
};

export default CountryMap;
