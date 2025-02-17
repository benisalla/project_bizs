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







// import React, { useRef, useEffect } from "react";
// import * as d3 from "d3";

// const CountryMap = ({ countryGeoJson }) => {
//   const svgRef = useRef();

//   useEffect(() => {
//     if (!countryGeoJson || !svgRef.current) {
//       console.log("SVG or GeoJSON not available");
//       return;
//     }
//     if (!countryGeoJson.features || countryGeoJson.features.length === 0) {
//       console.error("GeoJSON has no features");
//       return;
//     }

//     // Fixed overall dimensions.
//     const width = 960;
//     const height = 600;

//     // Define internal margins for padding.
//     const margin = { top: 40, right: 40, bottom: 40, left: 40 };
//     const innerWidth = width - margin.left - margin.right;
//     const innerHeight = height - margin.top - margin.bottom;

//     // Clear any previous SVG content.
//     d3.select(svgRef.current).selectAll("*").remove();

//     // Create SVG with a fixed viewBox.
//     const svg = d3.select(svgRef.current)
//       .attr("width", width)
//       .attr("height", height)
//       .attr("viewBox", `0 0 ${width} ${height}`);

//     // Append a group element that honors the margins.
//     const g = svg.append("g")
//       .attr("transform", `translate(${margin.left}, ${margin.top})`);

//     // Create a Mercator projection that fits the country into the inner area.
//     const projection = d3.geoMercator().fitSize([innerWidth, innerHeight], countryGeoJson);
//     const path = d3.geoPath().projection(projection);

//     // Append the country paths.
//     g.selectAll("path")
//       .data(countryGeoJson.features)
//       .enter()
//       .append("path")
//       .attr("d", path)
//       .attr("fill", "#ddeeff")
//       .attr("stroke", "#333")
//       .attr("stroke-width", 2)
//       .on("mouseover", function () {
//         d3.select(this).attr("fill", "#aaccee");
//       })
//       .on("mouseout", function () {
//         d3.select(this).attr("fill", "#ddeeff");
//       });

//     // Add a title text above the map.
//     svg.append("text")
//       .attr("x", width / 2)
//       .attr("y", margin.top / 2)
//       .attr("text-anchor", "middle")
//       .style("font-size", "24px")
//       .style("font-weight", "bold")
//       .text("Country Map");

//     console.log("CountryMap rendered with dimensions:", width, height);
//   }, [countryGeoJson]);

//   return (
//     <svg ref={svgRef} style={{ border: "1px solid #ccc" }} />
//   );
// };

// export default CountryMap;






// import React, { useRef, useEffect } from "react";
// import * as d3 from "d3";

// const CountryMap = ({ countryGeoJson }) => {
//   const svgRef = useRef();

//   useEffect(() => {
//     if (!countryGeoJson || !svgRef.current) return;
//     if (!countryGeoJson.features || !countryGeoJson.features.length) return;

//     // Select the SVG element and clear previous content
//     const svg = d3.select(svgRef.current);
//     svg.selectAll("*").remove();

//     // Get current dimensions of the SVG
//     const width = svgRef.current.clientWidth;
//     const height = svgRef.current.clientHeight;

//     // Create a projection that fits the GeoJSON within the SVG dimensions
//     const projection = d3.geoConicConformal()
//       .fitSize([width, height], countryGeoJson);

//     // Create a geoPath generator using the projection
//     const pathGenerator = d3.geoPath().projection(projection);

//     // Bind the GeoJSON data to paths and render them
//     svg.selectAll("path")
//       .data(countryGeoJson.features)
//       .join("path")
//       .attr("d", pathGenerator)
//       .attr("fill", "lightblue")
//       .attr("stroke", "black")
//       .attr("stroke-width", 1);
//   }, [countryGeoJson]);

//   return (
//     <svg
//       ref={svgRef}
//       style={{ width: "100%", height: "100vh", border: "1px solid #ccc" }}
//     />
//   );
// };

// export default CountryMap;






import React, { useRef, useEffect } from "react";
import * as d3 from "d3";

const CountryMap = ({ countryGeoJson }) => {
  const svgRef = useRef();

  useEffect(() => {
    if (!countryGeoJson || !countryGeoJson.features) return;

    const svg = d3.select(svgRef.current);
    const width = 800;
    const height = 600;

    // 1) Quick debugging: original bounding box & centroid
    console.log("GeoBounds (original):", d3.geoBounds(countryGeoJson));
    console.log("GeoCentroid (original):", d3.geoCentroid(countryGeoJson));

    // Helper to flip [lat, lon] -> [lon, lat] in each geometry
    function flipGeometryCoords(geometry) {
      const { type, coordinates } = geometry;

      if (type === "Polygon") {
        geometry.coordinates = coordinates.map(ring =>
          ring.map(([lat, lon]) => [lon, lat])
        );
      } else if (type === "MultiPolygon") {
        geometry.coordinates = coordinates.map(polygon =>
          polygon.map(ring =>
            ring.map(([lat, lon]) => [lon, lat])
          )
        );
      }
      return geometry;
    }

    // 2) Create a flipped version of the data
    const flippedData = {
      ...countryGeoJson,
      features: countryGeoJson.features.map(feature => ({
        ...feature,
        geometry: flipGeometryCoords({ ...feature.geometry })
      }))
    };

    // Debug: bounding box & centroid after flipping
    console.log("GeoBounds (flipped):", d3.geoBounds(flippedData));
    console.log("GeoCentroid (flipped):", d3.geoCentroid(flippedData));

    // 3) Set up the projection with flipped data
    const projection = d3.geoMercator().flipGeometryCoords(true)
      .fitSize([width, height], flippedData);

    const path = d3.geoPath().projection(projection);

    // 4) Clear any existing content
    svg.selectAll("*").remove();

    // 5) Draw the map using flipped data
    svg.append("g")
      .selectAll("path")
      .data(flippedData.features)
      .enter()
      .append("path")
      .attr("d", path)
      .attr("fill", "#ccc")
      .attr("stroke", "#333");

  }, [countryGeoJson]);

  return (
    <svg
      ref={svgRef}
      width={800}
      height={600}
      style={{ border: "1px solid #ccc" }}
    />
  );
};

export default CountryMap;
