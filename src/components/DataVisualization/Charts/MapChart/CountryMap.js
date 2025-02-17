// import React, { useRef, useEffect } from "react";
// import * as d3 from "d3";

// const CountryMap = ({ countryGeoJson }) => {
//   const svgRef = useRef();

//   useEffect(() => {
//     if (!svgRef.current || !countryGeoJson) {
//       console.log("SVG or data not available");
//       return;
//     }
//     if (!countryGeoJson.features) {
//       console.error("Invalid GeoJSON: missing 'features' array.");
//       return;
//     }

//     // Force a minimum size if the parent's dimensions are too small.
//     const container = svgRef.current.parentNode;
//     const containerWidth = Math.max(container.clientWidth, 600);
//     const containerHeight = Math.max(container.clientHeight, 600);

//     // Define margins for padding.
//     const margin = { top: 20, right: 20, bottom: 20, left: 20 };
//     const width = containerWidth - margin.left - margin.right;
//     const height = containerHeight - margin.top - margin.bottom;

//     // Clear previous content.
//     d3.select(svgRef.current).selectAll("*").remove();

//     // Create the SVG with viewBox.
//     const svg = d3.select(svgRef.current)
//       .attr("width", containerWidth)
//       .attr("height", containerHeight)
//       .attr("viewBox", `0 0 ${containerWidth} ${containerHeight}`);

//     // Append a group element for margins.
//     const g = svg.append("g")
//       .attr("transform", `translate(${margin.left}, ${margin.top})`);

//     // Fit the projection to the available drawing area.
//     const projection = d3.geoMercator().fitSize([width, height], countryGeoJson);
//     const path = d3.geoPath().projection(projection);

//     // Append the country paths.
//     g.selectAll("path")
//       .data(countryGeoJson.features)
//       .enter()
//       .append("path")
//       .attr("d", path)
//       .attr("stroke", "#333")
//       .attr("stroke-width", 1.5)
//       .attr("fill", "#ddd")
//       .on("mouseover", function () {
//         d3.select(this)
//           .attr("fill", "#ccc")
//           .attr("stroke-width", 2.5);
//       })
//       .on("mouseout", function () {
//         d3.select(this)
//           .attr("fill", "#ddd")
//           .attr("stroke-width", 1.5);
//       });

//     // Add a title at the top of the SVG.
//     svg.append("text")
//       .attr("x", containerWidth / 2)
//       .attr("y", margin.top / 2)
//       .attr("text-anchor", "middle")
//       .style("font-size", "18px")
//       .style("font-weight", "bold")
//       .text("Country Map");

//     console.log("CountryMap rendered with dimensions:", containerWidth, containerHeight);
//   }, [countryGeoJson]);

//   return (
//     <div style={{
//       width: "100%",
//       height: "600px",
//       display: "flex",
//       justifyContent: "center",
//       alignItems: "center"
//     }}>
//       <svg ref={svgRef}></svg>
//     </div>
//   );
// };

// export default CountryMap;







import React, { useRef, useEffect } from "react";
import * as d3 from "d3";

const CountryMap = ({ countryGeoJson }) => {
  const svgRef = useRef();

  useEffect(() => {
    if (!countryGeoJson || !svgRef.current) {
      console.log("SVG or GeoJSON not available");
      return;
    }
    if (!countryGeoJson.features || countryGeoJson.features.length === 0) {
      console.error("GeoJSON has no features");
      return;
    }

    // Fixed overall dimensions.
    const width = 960;
    const height = 600;

    // Define internal margins for padding.
    const margin = { top: 40, right: 40, bottom: 40, left: 40 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    // Clear any previous SVG content.
    d3.select(svgRef.current).selectAll("*").remove();

    // Create SVG with a fixed viewBox.
    const svg = d3.select(svgRef.current)
      .attr("width", width)
      .attr("height", height)
      .attr("viewBox", `0 0 ${width} ${height}`);

    // Append a group element that honors the margins.
    const g = svg.append("g")
      .attr("transform", `translate(${margin.left}, ${margin.top})`);

    // Create a Mercator projection that fits the country into the inner area.
    const projection = d3.geoMercator().fitSize([innerWidth, innerHeight], countryGeoJson);
    const path = d3.geoPath().projection(projection);

    // Append the country paths.
    g.selectAll("path")
      .data(countryGeoJson.features)
      .enter()
      .append("path")
      .attr("d", path)
      .attr("fill", "#ddeeff")
      .attr("stroke", "#333")
      .attr("stroke-width", 2)
      .on("mouseover", function () {
        d3.select(this).attr("fill", "#aaccee");
      })
      .on("mouseout", function () {
        d3.select(this).attr("fill", "#ddeeff");
      });

    // Add a title text above the map.
    svg.append("text")
      .attr("x", width / 2)
      .attr("y", margin.top / 2)
      .attr("text-anchor", "middle")
      .style("font-size", "24px")
      .style("font-weight", "bold")
      .text("Country Map");

    console.log("CountryMap rendered with dimensions:", width, height);
  }, [countryGeoJson]);

  return (
    <svg ref={svgRef} style={{ border: "1px solid #ccc" }} />
  );
};

export default CountryMap;
