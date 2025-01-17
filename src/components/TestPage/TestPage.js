import React from 'react';
import * as d3 from 'd3';
import WaterButton from '../MicroComponents/WaterButton';

const LinePlot = ({
    data,
    width = 640,
    height = 400,
    marginTop = 20,
    marginRight = 20,
    marginBottom = 20,
    marginLeft = 20
}) => {
    const x = d3.scaleLinear().domain([0, data.length - 1]).range([marginLeft, width - marginRight]);
    const y = d3.scaleLinear().domain(d3.extent(data)).range([height - marginBottom, marginTop]);
    const line = d3.line().x((d, i) => x(i)).y(y);
    return (
        <svg width={width} height={height}>
            <path fill="none" stroke="currentColor" strokeWidth="1.5" d={line(data)} />
            <g fill="white" stroke="currentColor" strokeWidth="1.5">
                {data.map((d, i) => (<circle key={i} cx={x(i)} cy={y(d)} r="2.5" />))}
            </g>
        </svg>
    );
};

const TestPage = () => {
    const sampleData = [10, 20, 30, 40, 50, 60, 70, 80, 90, 100];
    
    return (
        <div>
            <WaterButton onClick={() => alert('Button clicked')}>Click me</WaterButton>
            <h1>Welcome to the Test Page</h1>
            <p>This is a simple test page for our project.</p>
            <LinePlot data={sampleData} />
        </div>
    );
};

export default TestPage;