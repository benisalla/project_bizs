import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as d3 from 'd3';
import './RoundMap.css';
import LineChart from './LineChart';

const round_countries_path = process.env.PUBLIC_URL + "/assets/dataset/round-countries.geo.json";
const water_data_path = process.env.PUBLIC_URL + "/assets/dataset/world-water-data.csv";
const map_countries_names_path = process.env.PUBLIC_URL + "/assets/dataset/map-country-names.json";

const loadGeoJSON = async (filePath) => {
  try {
    const response = await fetch(filePath);
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    const geojson = await response.json();
    return geojson;
  } catch (err) {
    console.error("Error loading or parsing the GeoJSON file:", err);
    return {};
  }
};


const RoundMap = () => {
  const svgRef = useRef();
  const infoPanelRef = useRef();
  const [geojson, setGeojson] = useState(null);
  const [isMouseDown, setIsMouseDown] = useState(false);
  const [rotation, setRotation] = useState({ x: 0, y: 0 });
  const [dimensions, setDimensions] = useState({ width: window.innerWidth, height: window.innerHeight });
  const [zoomScale, setZoomScale] = useState(1);
  const baseScaleRef = useRef(null);
  const [selectedCountry, setSelectedCountry] = useState(null);
  const [waterData, setWaterData] = useState([]);
  const [nameMapping, setNameMapping] = useState({});

  const mouseDownPosRef = useRef({ x: 0, y: 0 });

  function unifyName(name) {
    return nameMapping[name] || name;
  }

  // load water data and map countries names
  useEffect(() => {
    fetch(map_countries_names_path)
      .then(response => response.json())
      .then(data => {
        const nameMapping = {};
        Object.keys(data).forEach(key => {
          nameMapping[key] = data[key];
        });
        setNameMapping(nameMapping);
      })
      .catch(err => console.error("Error loading map countries names:", err));

    // water data and geojson
    loadGeoJSON(round_countries_path).then((geojson) => {
      if (!geojson) {
        console.error("Failed to load GeoJSON data or parse country names");
        return;
      }

      geojson.features.forEach(feature => {
        const rawName = feature.properties.name_long || feature.properties.name;
        feature.properties.UnifiedName = unifyName(rawName);
      });

      d3.csv(water_data_path).then(waterData => {
        waterData.forEach(d => {
          d.UnifiedName = unifyName(d.Area);
          d.Year = +d.Year;
          d.Value = +d.Value || 0;
        });

        setGeojson(geojson);
        setWaterData(waterData);
      }).catch(err => console.error("Error loading water data:", err));
    }).catch(err => console.error("Error loading GeoJSON data:", err));
  }, []);



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
    if (geojson) {
      const svg = d3.select(svgRef.current);
      const width = dimensions.width;
      const height = dimensions.height;

      const projection = d3.geoOrthographic()
        .fitSize([width / 2, height], geojson)
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
        .data(geojson.features)
        .enter().append('path')
        .attr('d', path)
        .style('fill', '#997ffa')
        .style('stroke', '#060a0f')
        .attr('class', 'country')
        .on('mouseover', function (e, d) {
          const { formal_en, economy } = d.properties;
          d3.select(infoPanelRef.current).html(`<h1>${formal_en}</h1><hr><p>${economy}</p>`);

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
        .on('mouseout', function () {
          d3.select(this)
            .transition()
            .duration(300)
            .style('fill', '#997ffa');
        })
        .on('mousedown', (e, d) => {
          // console.log(d.properties.UnifiedName);
          setSelectedCountry(d.properties.UnifiedName)
        });


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
    geojson,
    isMouseDown,
    rotation,
    dimensions,
    zoomScale,
    updateGlobe
  ]);

  if (!geojson) {
    return null;
  }

  return (
    <>
      <svg ref={svgRef}></svg>
      <article ref={infoPanelRef} className="info"></article>

      {selectedCountry && (
        <LineChart
          countryName={selectedCountry}
          waterData={waterData}
        />
      )}
    </>
  );
};

export default RoundMap;
