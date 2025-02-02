// import React, { useRef, useEffect } from "react";
// import * as d3 from "d3";
// import Modal from "react-modal";
// import { useLoader } from "../../APIs/Reducer";

// Modal.setAppElement("#root");

// const LineChart = ({ countryName, filteredData, isOpen, onClose }) => {
//     const svgRef = useRef(null);
//     const { showLoader, hideLoader } = useLoader();

//     useEffect(() => {
//         showLoader();
//         if (!countryName || !filteredData || filteredData.length === 0) return;

//         console.log("--------------------");
//         console.log("countryName", countryName);
//         console.log("filteredData", filteredData);
//         console.log("--------------------");

//         const groupedData = d3.rollups(
//             filteredData,
//             v => d3.sum(v, d => d.Value),
//             d => d.Year
//         )
//             .map(([Year, TotalValue]) => ({ Year, TotalValue }))
//             .sort((a, b) => a.Year - b.Year);

//         const margin = { top: 40, right: 30, bottom: 50, left: 50 };
//         const chartW = 600 - margin.left - margin.right;
//         const chartH = 300 - margin.top - margin.bottom;

//         d3.select(svgRef.current).selectAll("*").remove();

//         const svg = d3
//             .select(svgRef.current)
//             .attr("width", chartW + margin.left + margin.right)
//             .attr("height", chartH + margin.top + margin.bottom)
//             .append("g")
//             .attr("transform", `translate(${margin.left},${margin.top})`);

//         const years = groupedData.map(d => d.Year);
//         const xScale = d3.scaleBand()
//             .domain(years)
//             .range([0, chartW])
//             .padding(0.2);

//         const yMax = d3.max(groupedData, d => d.TotalValue) || 0;
//         const yScale = d3.scaleLinear()
//             .domain([0, yMax])
//             .nice()
//             .range([chartH, 0]);

//         svg.append("g")
//             .attr("transform", `translate(0,${chartH})`)
//             .call(d3.axisBottom(xScale).tickValues(xScale.domain().filter((_, i) => i % 5 === 0)))
//             .selectAll("text")
//             .attr("transform", "rotate(-45)")
//             .style("text-anchor", "end");

//         svg.append("g").call(d3.axisLeft(yScale));

//         const line = d3.line()
//             .x(d => xScale(d.Year) + xScale.bandwidth() / 2)
//             .y(d => yScale(d.TotalValue));

//         svg.append("path")
//             .datum(groupedData)
//             .attr("fill", "none")
//             .attr("stroke", "orange")
//             .attr("stroke-width", 2)
//             .attr("d", line);

//         svg.append("text")
//             .attr("x", chartW / 2)
//             .attr("y", -10)
//             .attr("text-anchor", "middle")
//             .style("font-size", "16px")
//             .text(`Annual sum of water values for ${countryName}`);

//         hideLoader();
//     }, [countryName, filteredData]);

//     return (
//         <Modal
//             isOpen={isOpen}
//             onRequestClose={() => onClose()}
//             contentLabel="Line Chart Modal"
//             style={{
//                 content: {
//                     top: '50%',
//                     left: '50%',
//                     right: 'auto',
//                     bottom: 'auto',
//                     marginRight: '-50%',
//                     transform: 'translate(-50%, -50%)',
//                     background: '#fff',
//                     border: '1px solid #ccc',
//                     borderRadius: '8px',
//                     boxShadow: '0 4px 8px rgba(0,0,0,0.2)',
//                     padding: '20px',
//                     width: '600px',
//                     height: '350px'
//                 },
//                 overlay: {
//                     backgroundColor: 'rgba(0, 0, 0, 0.75)'
//                 }
//             }}
//         >
//             <button
//                 onClick={() => onClose()}
//                 style={{
//                     position: "absolute",
//                     top: "10px",
//                     right: "10px",
//                     background: "#f44336",
//                     color: "white",
//                     border: "none",
//                     borderRadius: "5px",
//                     cursor: "pointer",
//                     fontSize: "16px"
//                 }}
//             >
//                 X
//             </button>

//             <svg ref={svgRef} />
//         </Modal>
//     );
// }

// export default LineChart;




// import React, { useMemo, useRef, useEffect } from "react";
// import * as d3 from "d3";
// import Modal from "react-modal";
// import { useLoader } from "../../APIs/Reducer";

// Modal.setAppElement("#root");

// const LineChart = ({ countryName, filteredData, isOpen, onClose }) => {
//     const svgRef = useRef(null);
//     const { showLoader, hideLoader } = useLoader();

//     const groupedData = useMemo(() => {
//         if (!countryName || !filteredData || filteredData.length === 0) return [];
//         return d3.rollups(
//             filteredData,
//             v => d3.sum(v, d => d.Value),
//             d => d.Year
//         )
//             .map(([Year, TotalValue]) => ({ Year, TotalValue }))
//             .sort((a, b) => a.Year - b.Year);
//     }, [countryName, filteredData]);

//     useEffect(() => {
//         console.log("----------[ start drawing line chart ]----------");
//         showLoader();
//         if (!countryName || !filteredData || filteredData.length === 0) return;
//         // (If groupedData is empty, nothing to draw.)
//         if (groupedData.length === 0) return;

//         const margin = { top: 40, right: 30, bottom: 50, left: 50 };
//         const chartW = 600 - margin.left - margin.right;
//         const chartH = 300 - margin.top - margin.bottom;

//         // Clear any previous content.
//         d3.select(svgRef.current).selectAll("*").remove();

//         // Create the SVG container.
//         const svg = d3
//             .select(svgRef.current)
//             .attr("width", chartW + margin.left + margin.right)
//             .attr("height", chartH + margin.top + margin.bottom)
//             .append("g")
//             .attr("transform", `translate(${margin.left},${margin.top})`);

//         // Create scales.
//         const years = groupedData.map(d => d.Year);
//         const xScale = d3.scaleBand()
//             .domain(years)
//             .range([0, chartW])
//             .padding(0.2);

//         const yMax = d3.max(groupedData, d => d.TotalValue) || 0;
//         const yScale = d3.scaleLinear()
//             .domain([0, yMax])
//             .nice()
//             .range([chartH, 0]);

//         // Draw the axes.
//         svg.append("g")
//             .attr("transform", `translate(0,${chartH})`)
//             .call(
//                 d3.axisBottom(xScale)
//                     .tickValues(xScale.domain().filter((_, i) => i % 5 === 0))
//             )
//             .selectAll("text")
//             .attr("transform", "rotate(-45)")
//             .style("text-anchor", "end");

//         svg.append("g")
//             .call(d3.axisLeft(yScale));

//         // Create the line generator.
//         const line = d3.line()
//             .x(d => xScale(d.Year) + xScale.bandwidth() / 2)
//             .y(d => yScale(d.TotalValue));

//         // Append the line path.
//         svg.append("path")
//             .datum(groupedData)
//             .attr("fill", "none")
//             .attr("stroke", "orange")
//             .attr("stroke-width", 2)
//             .attr("d", line);

//         // Add a title.
//         svg.append("text")
//             .attr("x", chartW / 2)
//             .attr("y", -10)
//             .attr("text-anchor", "middle")
//             .style("font-size", "16px")
//             .text(`Annual sum of water values for ${countryName}`);

//         console.log("----------[ finish drawing line chart ]----------");
//         hideLoader();
//     }, [countryName, filteredData]);

//     return (
//         <Modal
//             isOpen={isOpen}
//             onRequestClose={() => onClose()}
//             contentLabel="Line Chart Modal"
//             style={{
//                 content: {
//                     top: '50%',
//                     left: '50%',
//                     right: 'auto',
//                     bottom: 'auto',
//                     marginRight: '-50%',
//                     transform: 'translate(-50%, -50%)',
//                     background: '#fff',
//                     border: '1px solid #ccc',
//                     borderRadius: '8px',
//                     boxShadow: '0 4px 8px rgba(0,0,0,0.2)',
//                     padding: '20px',
//                     width: '600px',
//                     height: '350px' 
//                 },
//                 overlay: {
//                     backgroundColor: 'rgba(0, 0, 0, 0.75)'
//                 }
//             }}
//         >
//             <button
//                 onClick={() => onClose()}
//                 style={{
//                     position: "absolute",
//                     top: "10px",
//                     right: "10px",
//                     background: "#f44336",
//                     color: "white",
//                     border: "none",
//                     borderRadius: "5px",
//                     cursor: "pointer",
//                     fontSize: "16px"
//                 }}
//             >
//                 X
//             </button>
//             <svg ref={svgRef} />
//         </Modal>
//     );
// };

// export default LineChart;







// import React, { useRef, useEffect, useMemo } from "react";
// import * as d3 from "d3";
// import Modal from "react-modal";
// import { useLoader } from "../../APIs/Reducer";

// Modal.setAppElement("#root");

// const LineChart = ({ countryName, filteredData, isOpen, onClose }) => {
//     const svgRef = useRef(null);

//     const groupedData = useMemo(() => {
//         if (!countryName || !filteredData || filteredData.length === 0) return [];
//         return d3
//             .rollups(
//                 filteredData,
//                 (v) => d3.sum(v, (d) => d.Value),
//                 (d) => d.Year
//             )
//             .map(([Year, TotalValue]) => ({ Year, TotalValue }))
//             .sort((a, b) => a.Year - b.Year);
//     }, [countryName, filteredData]);

//     useEffect(() => {
//         if (!countryName || !filteredData || filteredData.length === 0) return;
//         if (groupedData.length === 0) return;

//         const margin = { top: 40, right: 30, bottom: 50, left: 50 };
//         const chartW = 600 - margin.left - margin.right;
//         const chartH = 300 - margin.top - margin.bottom;

//         // Remove any previous content.
//         d3.select(svgRef.current).selectAll("*").remove();

//         // Create the SVG container.
//         const svg = d3
//             .select(svgRef.current)
//             .attr("width", chartW + margin.left + margin.right)
//             .attr("height", chartH + margin.top + margin.bottom)
//             .append("g")
//             .attr("transform", `translate(${margin.left},${margin.top})`);

//         // Set up scales.
//         const years = groupedData.map((d) => d.Year);
//         const xScale = d3.scaleBand().domain(years).range([0, chartW]).padding(0.2);

//         const yMax = d3.max(groupedData, (d) => d.TotalValue) || 0;
//         const yScale = d3.scaleLinear().domain([0, yMax]).nice().range([chartH, 0]);

//         // Draw axes.
//         svg
//             .append("g")
//             .attr("transform", `translate(0,${chartH})`)
//             .call(
//                 d3.axisBottom(xScale).tickValues(
//                     xScale.domain().filter((_, i) => i % 5 === 0)
//                 )
//             )
//             .selectAll("text")
//             .attr("transform", "rotate(-45)")
//             .style("text-anchor", "end");

//         svg.append("g").call(d3.axisLeft(yScale));

//         // Create the line generator.
//         const line = d3
//             .line()
//             .x((d) => xScale(d.Year) + xScale.bandwidth() / 2)
//             .y((d) => yScale(d.TotalValue));

//         // Append the line path.
//         svg
//             .append("path")
//             .datum(groupedData)
//             .attr("fill", "none")
//             .attr("stroke", "orange")
//             .attr("stroke-width", 2)
//             .attr("d", line);

//         // Add a title.
//         svg
//             .append("text")
//             .attr("x", chartW / 2)
//             .attr("y", -10)
//             .attr("text-anchor", "middle")
//             .style("font-size", "16px")
//             .text(`Annual sum of water values for ${countryName}`);

//         console.log("SVG Element:", svgRef.current);
//     }, [isOpen, countryName, filteredData]);

//     return (
//         <Modal
//             isOpen={isOpen}
//             onRequestClose={() => onClose()}
//             contentLabel="Line Chart Modal"
//             style={{
//                 content: {
//                     top: "50%",
//                     left: "50%",
//                     right: "auto",
//                     bottom: "auto",
//                     marginRight: "-50%",
//                     transform: "translate(-50%, -50%)",
//                     background: "#fff",
//                     border: "1px solid #ccc",
//                     borderRadius: "8px",
//                     boxShadow: "0 4px 8px rgba(0,0,0,0.2)",
//                     padding: "20px",
//                     width: "600px",
//                     height: "350px",
//                 },
//                 overlay: {
//                     backgroundColor: "rgba(0, 0, 0, 0.75)",
//                 },
//             }}
//         >
//             <button
//                 onClick={() => onClose()}
//                 style={{
//                     position: "absolute",
//                     top: "10px",
//                     right: "10px",
//                     background: "#f44336",
//                     color: "white",
//                     border: "none",
//                     borderRadius: "5px",
//                     cursor: "pointer",
//                     fontSize: "16px",
//                 }}
//             >
//                 X
//             </button>

//             <svg ref={svgRef} />
//         </Modal>
//     );
// };

// export default LineChart;





import React, { useRef, useEffect, useMemo } from "react";
import * as d3 from "d3";
import Modal from "react-modal";
import { useLoader } from "../../APIs/Reducer";

Modal.setAppElement("#root");

const LineChart = ({ countryName, filteredData, isOpen, onClose }) => {
  const svgRef = useRef(null);
  const { showLoader, hideLoader } = useLoader();

  // Compute the grouped data only when needed.
  const groupedData = useMemo(() => {
    if (!countryName || !filteredData || filteredData.length === 0) return [];
    return d3
      .rollups(
        filteredData,
        (v) => d3.sum(v, (d) => d.Value),
        (d) => d.Year
      )
      .map(([Year, TotalValue]) => ({ Year, TotalValue }))
      .sort((a, b) => a.Year - b.Year);
  }, [countryName, filteredData]);

  useEffect(() => {
    // Run only if the modal is open.
    if (!isOpen) return;

    // Ensure we have data to draw the chart.
    if (!countryName || !filteredData || filteredData.length === 0) return;
    if (groupedData.length === 0) return;

    // Optionally show a loader if you're using one.
    showLoader();

    const margin = { top: 40, right: 30, bottom: 50, left: 50 };
    const chartW = 600 - margin.left - margin.right;
    const chartH = 300 - margin.top - margin.bottom;

    // Clear any previous content from the SVG.
    d3.select(svgRef.current).selectAll("*").remove();

    // Create the SVG container.
    const svg = d3
      .select(svgRef.current)
      .attr("width", chartW + margin.left + margin.right)
      .attr("height", chartH + margin.top + margin.bottom)
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    // Set up scales.
    const years = groupedData.map((d) => d.Year);
    const xScale = d3.scaleBand().domain(years).range([0, chartW]).padding(0.2);
    const yMax = d3.max(groupedData, (d) => d.TotalValue) || 0;
    const yScale = d3.scaleLinear().domain([0, yMax]).nice().range([chartH, 0]);

    // Draw the axes.
    svg
      .append("g")
      .attr("transform", `translate(0,${chartH})`)
      .call(
        d3
          .axisBottom(xScale)
          .tickValues(xScale.domain().filter((_, i) => i % 5 === 0))
      )
      .selectAll("text")
      .attr("transform", "rotate(-45)")
      .style("text-anchor", "end");

    svg.append("g").call(d3.axisLeft(yScale));

    // Create the line generator.
    const line = d3
      .line()
      .x((d) => xScale(d.Year) + xScale.bandwidth() / 2)
      .y((d) => yScale(d.TotalValue));

    // Append the line path.
    svg
      .append("path")
      .datum(groupedData)
      .attr("fill", "none")
      .attr("stroke", "orange")
      .attr("stroke-width", 2)
      .attr("d", line);

    // Add a title.
    svg
      .append("text")
      .attr("x", chartW / 2)
      .attr("y", -10)
      .attr("text-anchor", "middle")
      .style("font-size", "16px")
      .text(`Annual sum of water values for ${countryName}`);

    console.log("SVG Element:", svgRef.current);

    hideLoader();
  }, [isOpen, countryName, filteredData, groupedData]);

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onClose}
      contentLabel="Line Chart Modal"
      style={{
        content: {
          top: "50%",
          left: "50%",
          right: "auto",
          bottom: "auto",
          marginRight: "-50%",
          transform: "translate(-50%, -50%)",
          background: "#fff",
          border: "1px solid #ccc",
          borderRadius: "8px",
          boxShadow: "0 4px 8px rgba(0,0,0,0.2)",
          padding: "20px",
          width: "600px",
          height: "350px",
        },
        overlay: {
          backgroundColor: "rgba(0, 0, 0, 0.75)",
        },
      }}
    >
      <button
        onClick={onClose}
        style={{
          position: "absolute",
          top: "10px",
          right: "10px",
          background: "#f44336",
          color: "white",
          border: "none",
          borderRadius: "5px",
          cursor: "pointer",
          fontSize: "16px",
        }}
      >
        X
      </button>
      <svg ref={svgRef} />
    </Modal>
  );
};

export default LineChart;
