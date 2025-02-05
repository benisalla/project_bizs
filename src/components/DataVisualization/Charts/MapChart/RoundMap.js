import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as d3 from 'd3';
import './RoundMap.css';
import ChartSelector from '../../Modals/ChartSelector';
import LineChart from '../LineChart/LineChart';
import AreaStats from '../AreaStats/AreaStats';
import { filterDataByCountry } from '../../../APIs/DataUtils';



const RoundMap = ({ roundGeoJson, waterData }) => {
  const svgRef = useRef();
  const tooltipRef = useRef();
  const baseScaleRef = useRef(null);

  const [isMouseDown, setIsMouseDown] = useState(false);
  const [rotation, setRotation] = useState({ x: 0, y: 0 });
  const [dimensions, setDimensions] = useState({ width: window.innerWidth, height: window.innerHeight });
  const [zoomScale, setZoomScale] = useState(1);
  const [selectedCountry, setSelectedCountry] = useState(null);
  const [isLineChartOpen, setIsLineChartOpen] = useState(false);
  const [lineChartData, setLineChartData] = useState([]);
  const [isChartSelectorOpen, setIsChartSelectorOpen] = useState(false);
  const [isAreaStatsOpen, setIsAreaStatsOpen] = useState(false);
  const [selectedChart, setSelectedChart] = useState(null);
  const [areaStatsData, setAreaStatsData] = useState([]);
  const [isScatterChartOpen, setIsScatterChartOpen] = useState(false);
  const [isBarChartOpen, setIsBarChartOpen] = useState(false);
  const [filteredDataByCountry, setFilteredDataByCountry] = useState([]);
  const [filteredDataByYear, setFilteredDataByYear] = useState([]);
  const [filteredDataByCountryAndYear, setFilteredDataByCountryAndYear] = useState([]);

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
      setDimensions({ width: window.innerWidth, height: window.innerHeight });
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const updateGlobe = useCallback((svg, path, graticule, projection) => {
    projection.rotate([rotation.x, rotation.y]);
    svg.selectAll('.country').attr('d', path);
    svg.selectAll('.graticule').attr('d', path(graticule));
  }, [rotation]);

  useEffect(() => {
    if (roundGeoJson) {
      const svg = d3.select(svgRef.current);
      const width = dimensions.width;
      const height = dimensions.height;

      const projection = d3.geoOrthographic()
        .fitSize([width / 2, height], roundGeoJson)
        .translate([width / 2, height / 2]);

      if (baseScaleRef.current === null) {
        baseScaleRef.current = projection.scale();
      }

      projection.scale(baseScaleRef.current * zoomScale);

      const path = d3.geoPath().projection(projection);
      const graticule = d3.geoGraticule();

      svg.attr('width', width).attr('height', height);

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
        .style('fill', '#997ffa')
        .style('stroke', '#060a0f')
        .attr('class', 'country')
        .on('mouseover', function (e, d) {
          const tooltipHtml = getSimpleStatsTooltip(d, waterData);
          d3.select(tooltipRef.current)
            .style('visibility', 'visible')
            .style('opacity', 1)
            .html(tooltipHtml);

          d3.select(this)
            .transition()
            .duration(300)
            .style('fill', '#5f3fb3');

          svg.selectAll('.country')
            .filter(function () { return this !== d3.select(this).node(); })
            .transition()
            .duration(300)
            .style('fill', '#997ffa');
        })
        .on('mousemove', function (event) {
          d3.select(tooltipRef.current)
            .style('left', (event.pageX + 10) + 'px')
            .style('top', (event.pageY + 10) + 'px');
        })
        .on('mouseout', function () {
          d3.select(tooltipRef.current)
            .style('visibility', 'hidden')
            .style('opacity', 0);
          d3.select(this)
            .transition()
            .duration(300)
            .style('fill', '#997ffa');
        })
        .on('mousedown', (e, d) => {
          e.stopPropagation();
          setSelectedCountry(d.properties.UnifiedName);
          console.log("Selected country:", d.properties.UnifiedName);
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


  // ==============================================
  //           Use Effects for Chart Selection
  // ==============================================
  useEffect(() => {
    if (selectedCountry && waterData.length > 0) {
      setIsChartSelectorOpen(true);
    }
  }, [selectedCountry]);


  // ==============================================
  //           Use Effects for Chart Selection
  // ==============================================
  useEffect(() => {
    if (selectedChart === 'LineChart') {
      const lineData = filterDataByCountry(selectedCountry, waterData);
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
      setAreaStatsData(area_stats_data);
      setIsAreaStatsOpen(true);
      setSelectedChart(null);
    }

    if (selectedChart === 'BarChart') {
      setIsBarChartOpen(true);
      setSelectedChart(null);
    }
  }, [selectedChart]);


  // ==============================================
  //          Handlers for Chart Selector
  // ==============================================
  const handleSelectChart = (chartType) => {
    setSelectedChart(chartType);
    setIsChartSelectorOpen(false);
  };


  return (
    <>
      <svg ref={svgRef}></svg>
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
          opacity: 0,
          transition: "opacity 0.2s"
        }}
      />


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
};

export default RoundMap;
