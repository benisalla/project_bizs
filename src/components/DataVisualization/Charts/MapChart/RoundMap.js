import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as d3 from 'd3';
import './RoundMap.css';


const RoundMap = ({ roundGeoJson, waterData, onCountryClick }) => {
  const svgRef = useRef();
  const tooltipRef = useRef();
  const baseScaleRef = useRef(null);
  const [isMouseDown, setIsMouseDown] = useState(false);
  const [rotation, setRotation] = useState({ x: 0, y: 0 });
  const [dimensions, setDimensions] = useState({ width: null, height: null });
  const [zoomScale, setZoomScale] = useState(1);

  function getSimpleStatsTooltip(feature, waterData) {
    const { formal_en, UnifiedName } = feature.properties;
    const countryWaterData = waterData.filter(record => record.UnifiedName === UnifiedName);

    if (countryWaterData.length === 0) {
      return `
        <div style="font-family: Arial, sans-serif; font-size: 12px;">
          <strong>${formal_en}</strong>
          <br/><em>No water data available.</em>
        </div>
      `;
    }

    const totalValue = d3.sum(countryWaterData, d => d.Value);
    const maxValue = d3.max(countryWaterData, d => d.Value);
    const minValue = d3.min(countryWaterData, d => d.Value > 0 ? d.Value : Infinity);

    return `
      <div style="font-family: Arial, sans-serif; font-size: 12px; line-height: 1.3;">
        <strong>${formal_en}</strong>
        <div style="margin-top: 4px;">
          <span>Total: ${totalValue.toFixed(2)}</span><br/>
          <span>Max: ${maxValue.toFixed(2)}</span><br/>
          <span>Min: ${minValue.toFixed(2)}</span>
        </div>
      </div>
    `;
  }


  // ==============================================
  //                 Use Effects
  // ==============================================
  useEffect(() => {
    const handleResize = () => {
      const newWidth = window.innerWidth;
      const newHeight = window.innerHeight;
      setDimensions({ width: newWidth, height: newHeight });

      if (roundGeoJson) {
        const svg = d3.select(svgRef.current)
          .attr('width', newWidth)
          .attr('height', newHeight)
          .attr('viewBox', `0 0 ${newWidth} ${newHeight}`);

        const projection = d3.geoOrthographic()
          .fitSize([newWidth / 2, newHeight], roundGeoJson)
          .translate([newWidth / 2, newHeight / 2]);

        if (baseScaleRef.current !== null) {
          projection.scale(baseScaleRef.current * zoomScale);
        }

        const path = d3.geoPath().projection(projection);
        const graticule = d3.geoGraticule();

        svg.selectAll('.graticule').attr('d', path(graticule()));
        svg.selectAll('.country').attr('d', path);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [roundGeoJson, zoomScale]);


  const updateGlobe = useCallback((svg, path, graticule, projection) => {
    projection.rotate([rotation.x, rotation.y]);
    svg.selectAll('.country').attr('d', path);
    svg.selectAll('.graticule').attr('d', path(graticule));
  }, [rotation]);

  useEffect(() => {
    if (roundGeoJson && waterData) {
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

      const svgElement = svgRef.current;
      if (!svgElement._dimensions) {
        const containerElement = svgElement.parentNode;
        const containerWidth = containerElement.clientWidth || 960;
        const containerHeight = containerElement.clientHeight || 620;
        svgElement._dimensions = {
          width: containerWidth, height: containerHeight
        };
      }
      const { width, height } = svgElement._dimensions;

      const svg = d3.select(svgRef.current)
        .attr('width', width)
        .attr('height', height)
        .attr('viewBox', `0 0 ${width} ${height}`);

      const projection = d3.geoOrthographic()
        .fitSize([width / 2, height], roundGeoJson)
        .translate([width / 2, height / 2]);

      if (baseScaleRef.current === null) {
        baseScaleRef.current = projection.scale();
      }

      projection.scale(baseScaleRef.current * zoomScale);

      const path = d3.geoPath().projection(projection);
      const graticule = d3.geoGraticule();

      svg.selectAll('*').remove();

      svg.append('path')
        .attr('class', 'graticule')
        .attr('d', path(graticule()))
        .attr('fill', 'none')
        .attr('stroke', '#bcb9ca')
        .attr('stroke-width', '0.5')
        .attr('vector-effect', 'non-scaling-stroke')
        .attr('stroke-opacity', '0.7');

      svg.selectAll('.country')
        .data(roundGeoJson.features)
        .enter().append('path')
        .attr('d', path)
        .style('fill', d => {
          const value = waterByName[d.properties.UnifiedName];
          return colorScale(value !== undefined ? value : 0);
        })
        .style('stroke-width', 0.5)
        .style('stroke', '#060a0f')
        .attr('class', 'country')
        .on('mouseover', function (e, d) {
          d3.select(tooltipRef.current)
            .style('visibility', 'visible')
            .style('opacity', 1)
            .html(getSimpleStatsTooltip(d, waterData));

          d3.select(this)
            .transition()
            .duration(300)
            .style('fill', '#5f3fb3');
        })
        .on('mousemove', function (event) {
          d3.select(tooltipRef.current)
            .style('left', (event.pageX + 10) + 'px')
            .style('top', (event.pageY + 10) + 'px');
        })
        .on('mouseout', function (e, d) {
          d3.select(tooltipRef.current)
            .style('visibility', 'hidden')
            .style('opacity', 0);
          d3.select(this)
            .transition()
            .duration(300)
            .style('fill', () => {
              const value = waterByName[d.properties.UnifiedName];
              return colorScale(value !== undefined ? value : 0);
            });
        })
        .on('mousedown', (e, d) => {
          e.stopPropagation();
          if (onCountryClick) {
            onCountryClick(d.properties.UnifiedName);
          }
        })

      let animationFrameId;

      // handle mouse move to rotate the globe
      const handleMouseMove = e => {
        if (isMouseDown) {
          const { movementX, movementY } = e;
          setRotation(prevRotation => {
            const newRotation = {
              x: prevRotation.x + movementX * 0.2,
              y: prevRotation.y - movementY * 0.2,
            };

            cancelAnimationFrame(animationFrameId);
            animationFrameId = requestAnimationFrame(() => updateGlobe(svg, path, graticule, projection));
            return newRotation;
          });
        }
      };

      // handle zoom behavior
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
                  svg.selectAll('.graticule').attr('d', path(graticule));
                };
              });
            setZoomScale(event.transform.k);
          }
        });

      // add zoom behavior to the svg
      svg.call(zoomBehavior);

      // add event listeners
      svg.on('mousedown', (e) => { setIsMouseDown(true) })
        .on('mouseup', () => setIsMouseDown(false))
        .on('mousemove', handleMouseMove);

      // initial update of the globe
      updateGlobe(svg, path, graticule, projection);

      // draw legend
      drawLegend(svg, dimensions.width, colorScale, minTotal, maxTotal);

      // clean up
      return () => {
        svg.on('mousedown', null)
          .on('mouseup', null)
          .on('mouseover', null)
          .on('mousemove', null);
      };
    }

  }, [
    roundGeoJson,
    isMouseDown,
    rotation,
    dimensions,
    zoomScale,
    updateGlobe
  ]);


  function drawLegend(svg, width, colorScale, minTotal, maxTotal) {
    // Remove any old legend
    svg.select(".legend").remove();

    const legendWidth = 10;
    const legendHeight = 250;
    const legendX = 60;
    const legendY = 150;

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

    const numStops = 10;
    const stops = d3.range(numStops).map(i => minTotal + i * (maxTotal - minTotal) / (numStops - 1));
    const stopPercents = d3.range(numStops).map(i => `${(i / (numStops - 1)) * 100}%`);

    stops.forEach((d, i) => {
      gradient.append("stop")
        .attr("offset", stopPercents[i])
        .attr("stop-color", colorScale(d));
    });

    legend.append("rect")
      .attr("width", legendWidth)
      .attr("height", legendHeight)
      .style("fill", "url(#legend-gradient)");

    const legendScale = d3.scaleLinear()
      .domain([minTotal, maxTotal])
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
      <div className="roundmap-container">
        <svg ref={svgRef}></svg>
        <div ref={tooltipRef} className="map-tooltip"></div>
      </div>
    </>
  );
};

export default RoundMap;