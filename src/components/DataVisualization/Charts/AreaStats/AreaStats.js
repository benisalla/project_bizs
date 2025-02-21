import { useState } from 'react';
import './AreaStats.css';
import React from 'react';
import * as d3 from 'd3';
import DistributionChart from './DistributionChart';
import TreeMapChart from '../TreeMapChart/TreeMapChart';


const AreaStats = ({ data }) => {
    const [waterType, setWaterType] = useState("usage");


    if (!data || !data.popuData || !data.waterData) {
        return <p>No data found for the selected country.</p>;
    }

    const { waterData, popuData, tempData } = data;

    // Separate waterData into usage and resource (ensure your data uses these type labels)
    const waterUsage = waterData.filter((row) => row.type === "usage");
    const waterResource = waterData.filter((row) => row.type === "resource");

    // Grab all numeric keys from the first object (for population data).
    const validYears = Object.keys(popuData[0])
        .filter((k) => !isNaN(k))
        .sort((a, b) => +a - +b);

    // Create a dictionary of year: value, skipping any undefined or NaN values.
    const popuDict = validYears.reduce((acc, year) => {
        const value = +popuData[0][year];
        if (!isNaN(value)) {
            acc[year] = value;
        }
        return acc;
    }, {});

    // Create a dictionary of year: value, skipping any undefined or NaN values.
    const tempDict = validYears.reduce((acc, year) => {
        const value = +tempData[0][year];
        if (!isNaN(value)) {
            acc[year] = value;
        }
        return acc;
    }, {});

    // Additional population and temperature data processing can go here.
    const popuValues = Object.values(popuDict);
    const tempValues = Object.values(tempDict);

    return (
        <div className="AreaStats">

            {/* POPULATION STATS */}
            {popuValues && popuValues.length > 0 ? (
                <section className="population-stats">
                    <h2>Population Stats</h2>
                    <div className="popu-chart-container">
                        <DistributionChart data={popuDict} title="Population Distribution Over The Years" />
                        <div className="popu-stats">
                            <p><strong>Mean:</strong> {d3.mean(popuValues).toFixed(2)}</p>
                            <p><strong>Median:</strong> {d3.median(popuValues).toFixed(2)}</p>
                            <p><strong>Standard Deviation:</strong> {d3.deviation(popuValues).toFixed(2)}</p>
                            <p><strong>Min:</strong> {d3.min(popuValues).toFixed(2)}</p>
                            <p><strong>Max:</strong> {d3.max(popuValues).toFixed(2)}</p>
                            <p>
                                <strong>25th Percentile:</strong>{" "}
                                {d3.quantile([...popuValues].sort((a, b) => a - b), 0.25).toFixed(2)}
                            </p>
                            <p>
                                <strong>75th Percentile:</strong>{" "}
                                {d3.quantile([...popuValues].sort((a, b) => a - b), 0.75).toFixed(2)}
                            </p>
                        </div>
                    </div>
                </section>
            ) : (
                <section className="population-stats">
                    <h2>Population Stats</h2>
                    <p>No population data available.</p>
                </section>
            )}

            {/* TEMPERATURE STATS */}
            {tempValues && tempValues.length > 0 ? (
                <section className="population-stats">
                    <h2>Temperature Stats</h2>
                    <div className="popu-chart-container">
                        <DistributionChart data={tempValues} title="Population Distribution Over The Years" />
                        <div className="popu-stats">
                            <p><strong>Mean:</strong> {d3.mean(tempValues).toFixed(2)}</p>
                            <p><strong>Median:</strong> {d3.median(tempValues).toFixed(2)}</p>
                            <p><strong>Standard Deviation:</strong> {d3.deviation(tempValues).toFixed(2)}</p>
                            <p><strong>Min:</strong> {d3.min(tempValues).toFixed(2)}</p>
                            <p><strong>Max:</strong> {d3.max(tempValues).toFixed(2)}</p>
                            <p>
                                <strong>25th Percentile:</strong>{" "}
                                {d3.quantile([...tempValues].sort((a, b) => a - b), 0.25).toFixed(2)}
                            </p>
                            <p>
                                <strong>75th Percentile:</strong>{" "}
                                {d3.quantile([...tempValues].sort((a, b) => a - b), 0.75).toFixed(2)}
                            </p>
                        </div>
                    </div>
                </section>
            ) : (
                <section className="population-stats">
                    <h2>Temperature Stats</h2>
                    <p>No temperature data available.</p>
                </section>
            )}
        </div>
    );
};

export default AreaStats;
