// import React, { useEffect, useRef, useState, useCallback } from 'react';
// import * as d3 from 'd3';
// import './Globe.css';

// const Globe = () => {
//   const svgRef = useRef(null);
//   const infoPanelRef = useRef(null);
//   const [geojson, setGeojson] = useState(null);
//   const [isMouseDown, setIsMouseDown] = useState(false);
//   const [rotation, setRotation] = useState({ x: 0, y: 0 });
//   const lastMousePosRef = useRef({ x: 0, y: 0 });
//   const [dimensions, setDimensions] = useState({
//     width: window.innerWidth,
//     height: window.innerHeight,
//   });
//   const baseScaleRef = useRef(null);
//   const zoomFactorRef = useRef(1);


//   // Fetch geojson data
//   useEffect(() => {
//     d3.json('https://assets.codepen.io/911796/custom.geo.json').then((data) => {
//       setGeojson(data);
//     });
//   }, []);


//   // Update dimensions on resize
//   useEffect(() => {
//     const handleResize = () => {
//       setDimensions({
//         width: window.innerWidth,
//         height: window.innerHeight,
//       });
//     };
//     window.addEventListener('resize', handleResize);
//     return () => window.removeEventListener('resize', handleResize);
//   }, []);

//   // Helper to redraw the globe after rotation/zoom changes
//   const updateGlobe = useCallback((svg, path, graticule, projection) => {
//     projection.rotate([rotation.x, rotation.y]);
//     if (baseScaleRef.current && zoomFactorRef.current) {
//       projection.scale(baseScaleRef.current * zoomFactorRef.current);
//     }
//     svg.selectAll('.country').attr('d', path);
//     svg.selectAll('.graticule').attr('d', path(graticule));
//   },
//     [rotation]
//   );

//   useEffect(() => {
//     if (!geojson) return;

//     const svg = d3.select(svgRef.current);
//     const { width, height } = dimensions;

//     // 1) Create an orthographic projection
//     const projection = d3
//       .geoOrthographic()
//       .fitSize([width / 2, height], geojson)
//       .translate([width / 2, height / 2]);

//     // On first render, store the "base" scale
//     if (!baseScaleRef.current) {
//       baseScaleRef.current = projection.scale();
//     } else {
//       // If we already have it, apply base * zoomFactor
//       projection.scale(baseScaleRef.current * zoomFactorRef.current);
//     }

//     const pathGenerator = d3.geoPath().projection(projection);
//     const graticule = d3.geoGraticule()();

//     // 2) Clear the SVG
//     svg.selectAll('*').remove();
//     svg.attr('width', width).attr('height', height);

//     // 3) Draw the graticule
//     svg
//       .append('path')
//       .attr('class', 'graticule')
//       .attr('fill', 'none')
//       .attr('stroke', '#bcb9ca')
//       .attr('stroke-width', 0.5)
//       .attr('stroke-opacity', 0.7)
//       .attr('vector-effect', 'non-scaling-stroke')
//       .attr('d', pathGenerator(graticule));

//     // 4) Draw countries
//     svg
//       .selectAll('.country')
//       .data(geojson.features)
//       .enter()
//       .append('path')
//       .attr('class', 'country')
//       .attr('fill', '#997ffa')
//       .attr('stroke', '#060a0f')
//       .attr('d', pathGenerator)
//       .on('mouseover', function (e, d) {
//         const { formal_en, economy } = d.properties;
//         d3.select(infoPanelRef.current).html(
//           `<h1>${formal_en}</h1><hr><p>${economy}</p>`
//         );
//         d3.select(this).transition().duration(300).attr('fill', '#5f3fb3');
//       })
//       .on('mouseout', function () {
//         d3.select(this).transition().duration(300).attr('fill', '#997ffa');
//       })
//       .on('click', (e, d) => {
//         console.log('Clicked country:', d.properties.formal_en);
//       });

//     let animationFrameId;

//     function handleMouseDown(e) {
//       if (e.button !== 0) return;
//       console.log('Mouse Down', e.clientX, e.clientY);
//       setIsMouseDown(true);
//       lastMousePosRef.current = { x: e.clientX, y: e.clientY };
//       svg.style('cursor', 'grabbing');
//     }

//     function handleMouseUp() {
//       console.log('Mouse Up');
//       setIsMouseDown(false);
//       svg.style('cursor', 'grab');
//     }


//     function handleMouseMove(e) {
//       console.log('Mouse Move', isMouseDown); // Debugging
//       if (!isMouseDown) return;
//       const dx = e.clientX - lastMousePosRef.current.x;
//       const dy = e.clientY - lastMousePosRef.current.y;
//       lastMousePosRef.current = { x: e.clientX, y: e.clientY };
//       setRotation(prev => ({
//         x: prev.x + dx * 0.5,
//         y: prev.y + dy * 0.5,
//       }));
//     }

//     svg
//       .on('mousedown', handleMouseDown)
//       .on('mouseup', handleMouseUp)
//       .on('mousemove', handleMouseMove);

//     const zoomBehavior = d3
//       .zoom()
//       .filter((event) => {
//         return (
//           event.type === 'wheel' ||
//           event.type === 'touchstart' ||
//           event.type === 'touchmove' ||
//           event.type === 'touchend'
//         );
//       })
//       .scaleExtent([0.5, 4])
//       .on('zoom', (event) => {
//         zoomFactorRef.current = event.transform.k;
//         requestAnimationFrame(() => {
//           updateGlobe(svg, pathGenerator, graticule, projection);
//         });
//       });

//     svg.call(zoomBehavior)
//       .on('mousedown.zoom', null)
//       .on('mousemove.zoom', null)
//       .on('mouseup.zoom', null)
//       .on('touchstart.zoom', null)
//       .on('touchmove.zoom', null)
//       .on('touchend.zoom', null)
//       .on('dblclick.zoom', null);

//     updateGlobe(svg, pathGenerator, graticule, projection);

//     return () => {
//       svg.on('mousedown', null)
//         .on('mouseup', null)
//         .on('mousemove', null);
//     };
//   }, [geojson, dimensions, updateGlobe]);

//   return (
//     <>
//       <svg
//         ref={svgRef}
//       ></svg>
//       <article ref={infoPanelRef} className="info"></article>
//     </>
//   );
// };

// export default Globe;






// import React, { useEffect, useRef, useState, useCallback } from 'react';
// import * as d3 from 'd3';
// import './Globe.css';

// const Globe = () => {
//   const svgRef = useRef();
//   const infoPanelRef = useRef();
//   const [geojson, setGeojson] = useState(null);
//   const [isMouseDown, setIsMouseDown] = useState(false);
//   const [rotation, setRotation] = useState({ x: 0, y: 0 });
//   const [dimensions, setDimensions] = useState({ width: window.innerWidth, height: window.innerHeight });
//   const [zoomScale, setZoomScale] = useState(1);

//   useEffect(() => {
//     d3.json('https://assets.codepen.io/911796/custom.geo.json').then(data => {
//       setGeojson(data);
//     });
//   }, []);

//   useEffect(() => {
//     const handleResize = () => {
//       setDimensions({ width: window.innerWidth, height: window.innerHeight });
//     };

//     window.addEventListener('resize', handleResize);
//     return () => window.removeEventListener('resize', handleResize);
//   }, []);

//   const updateGlobe = useCallback((svg, path, graticule, projection) => {
//     projection.rotate([rotation.x, rotation.y]);
//     svg.selectAll('.country').attr('d', path);
//     svg.selectAll('.graticule').attr('d', path(graticule));
//   }, [rotation]);

//   useEffect(() => {
//     if (geojson) {
//       const svg = d3.select(svgRef.current);
//       const width = dimensions.width;
//       const height = dimensions.height;

//       const projection = d3.geoOrthographic()
//         .fitSize([width / 2, height], geojson)
//         .translate([width / 2, height / 2]);

//       const path = d3.geoPath().projection(projection);
//       const graticule = d3.geoGraticule();

//       svg.attr('width', width).attr('height', height);

//       svg.append('path')
//         .attr('class', 'graticule')
//         .attr('d', path(graticule()))
//         .attr('fill', 'none')
//         .attr('stroke', '#bcb9ca')
//         .attr('stroke-width', '0.5')
//         .attr('vector-effect', 'non-scaling-stroke')
//         .attr('stroke-opacity', '0.7');

//       svg.selectAll('.country')
//         .data(geojson.features)
//         .enter().append('path')
//         .attr('d', path)
//         .style('fill', '#997ffa')
//         .style('stroke', '#060a0f')
//         .attr('class', 'country')
//         .on('mouseover', function (e, d) {
//           const { formal_en, economy } = d.properties;
//           d3.select(infoPanelRef.current).html(`<h1>${formal_en}</h1><hr><p>${economy}</p>`);

//           d3.select(this)
//             .transition()
//             .duration(300) 
//             .style('fill', '#5f3fb3'); 

//           svg.selectAll('.country')
//             .filter(function () { return this !== d3.select(this).node(); })
//             .transition()
//             .duration(300) 
//             .style('fill', '#997ffa');  
//         })
//         .on('mouseout', function () {
//           d3.select(this)
//             .transition()
//             .duration(300)
//             .style('fill', '#997ffa');
//         });

//       let animationFrameId;

//       const handleMouseMove = e => {
//         if (isMouseDown) {
//           const { movementX, movementY } = e;
//           setRotation(prevRotation => {
//             const newRotation = { x: prevRotation.x - movementX / 2, y: prevRotation.y - movementY / 2 };
//             cancelAnimationFrame(animationFrameId);
//             animationFrameId = requestAnimationFrame(() => updateGlobe(svg, path, graticule, projection));
//             return newRotation;
//           });
//         }
//       };


//       const zoomBehavior = d3.zoom()
//         .filter(event => {
//           return (event.type === 'wheel' && event.ctrlKey) ||
//             (event.type === 'touchstart') ||
//             (event.type === 'touchmove') ||
//             (event.type === 'touchend');
//         })
//         .scaleExtent([0.5, 4])
//         .on('zoom', event => {
//           const newScale = projection.scale() * event.transform.k;
//           projection.scale(newScale);
//           svg.selectAll('.country').attr('d', path);
//           svg.selectAll('.graticule').attr('d', path(graticule));
//         });

//       svg.call(zoomBehavior);

//       svg.on('mousedown', () => setIsMouseDown(true))
//         .on('mouseup', () => setIsMouseDown(false))
//         .on('mousemove', handleMouseMove);

//       return () => {
//         svg.on('mousedown', null)
//           .on('mouseup', null)
//           .on('mousemove', null);
//       };
//     }
//   }, [geojson, isMouseDown, rotation, dimensions, updateGlobe]);

//   return (
//     <>
//       <svg ref={svgRef}></svg>
//       <article ref={infoPanelRef} className="info"></article>
//     </>
//   );
// };

// export default Globe;






import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as d3 from 'd3';
import './Globe.css';

const Globe = () => {
  const svgRef = useRef();
  const infoPanelRef = useRef();

  const [geojson, setGeojson] = useState(null);
  const [isMouseDown, setIsMouseDown] = useState(false);
  const [rotation, setRotation] = useState({ x: 0, y: 0 });
  const [dimensions, setDimensions] = useState({ width: window.innerWidth, height: window.innerHeight });
  const [zoomScale, setZoomScale] = useState(1);
  const baseScaleRef = useRef(null);

  useEffect(() => {
    d3.json('https://assets.codepen.io/911796/custom.geo.json').then(data => {
      setGeojson(data);
    });
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

  return (
    <>
      <svg ref={svgRef}></svg>
      <article ref={infoPanelRef} className="info"></article>
    </>
  );
};

export default Globe;
