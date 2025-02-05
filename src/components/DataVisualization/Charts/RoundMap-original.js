import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as d3 from 'd3';
import './RoundMap.css';
import LineChart from './LineChart';
import stringSimilarity from 'string-similarity';
// import * as worldGeoJson from 'world-geojson';


const round_countries_path = process.env.PUBLIC_URL + "/assets/dataset/round-countries.geo.json";
const water_data_path = process.env.PUBLIC_URL + "/assets/dataset/world-water-data.csv";


function suggestMappings(waterNames, geojsonNames) {
  const mapping = {};
  waterNames.forEach(name => {
    const match = stringSimilarity.findBestMatch(name, geojsonNames);
    if (match.bestMatch.rating > 0.6) {
      mapping[name] = match.bestMatch.target;
    }
  });
  return mapping;
}

const loadGeoJSON = async (filePath) => {
  try {
    const response = await fetch(filePath);
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    const geojson = await response.json();

    const geojsonNames = geojson.features.map(
      feature => feature.properties.name_long || feature.properties.name
    );

    console.log("------------------[ geojsonNames ]------------------");
    console.log(geojsonNames);
    console.log("------------------[ geojsonNames ]------------------");

    return { geojsonNames, geojson }; 
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

  function unifyName(name) {
    return nameMapping[name] || name;
  }


  useEffect(() => {
    loadGeoJSON(round_countries_path).then(({ geojsonNames, geojson }) => {  
      if (!geojson || !geojsonNames) {
        console.error("Failed to load GeoJSON data or parse country names");
        return;
      }

      d3.csv(water_data_path).then(waterData => {
        const waterNames = [...new Set(waterData.map(row => row.Area))];
        console.log("---------------[waterNames]----------------");
        console.log(waterNames);
        console.log("---------------[waterNames]----------------");
        const mappings = suggestMappings(waterNames, geojsonNames);
        setNameMapping(mappings);
        setGeojson(geojson);

        waterData.forEach(d => {
          d.Year = +d.Year;
          d.Value = +d.Value || 0;
          d.Area = mappings[d.Area] || d.Area;
        });

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
        });

      let animationFrameId;

      const handleMouseMove = e => {
        if (isMouseDown) {
          const { movementX, movementY } = e;
          setRotation(prevRotation => {
            const newRotation = {
              x: prevRotation.x + movementX * 0.3,
              y: prevRotation.y - movementY * 0.3
            };

            cancelAnimationFrame(animationFrameId);
            animationFrameId = requestAnimationFrame(() => updateGlobe(svg, path, graticule, projection));
            return newRotation;
          });
        }
      };

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


      svg.call(zoomBehavior);

      svg.on('mousedown', () => setIsMouseDown(true))
        .on('mouseup', () => setIsMouseDown(false))
        .on('mousemove', handleMouseMove);

      updateGlobe(svg, path, graticule, projection);

      return () => {
        svg.on('mousedown', null)
          .on('mouseup', null)
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


  function handleClick(event, d) {
    const rawGeoName = d.properties.name_long || d.properties.name || "Unknown";
    const unifiedGeoName = unifyName(rawGeoName);
    setSelectedCountry(unifiedGeoName);
  }

  return (
    <>
      <svg ref={svgRef}></svg>
      <article ref={infoPanelRef} className="info"></article>

      <LineChart
        countryName={selectedCountry}
        waterData={waterData}
        onClose={() => setSelectedCountry(null)}
      />
    </>
  );
};

export default RoundMap;
