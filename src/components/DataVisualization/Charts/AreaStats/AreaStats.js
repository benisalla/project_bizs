import { useState } from 'react';
import './AreaStats.css';
import React from 'react';
import * as d3 from 'd3';
import DistributionChart from './DistributionChart';
import TreeMapChart from '../TreeMapChart/TreeMapChart';


// water data contains attributes:
//   Area
//   IsAggregate
//   Subgroup
//   Symbol
//   UnifiedName
//   Unit
//   Value
//   Variable
//   VariableGroup
//   Year
//   type

// population data contains attributes: 
//   UnifiedName
//   value

// temperature data contains attributes: 
//   UnifiedName
//   value

const AreaStats = ({ data }) => {
    const [waterType, setWaterType] = useState("usage");


    if (!data || !data.popuData || !data.waterData) {
        return <p>No data found for the selected country.</p>;
    }

    const { waterData, popuData, tempData } = data;

    // Separate waterData into usage and resource (ensure your data uses these type labels)
    const waterUsage = waterData.filter((row) => row.type === "usage");
    const waterResource = waterData.filter((row) => row.type === "resource");

    // Aggregate water data by year (summing values if multiple rows exist per year).
    const aggregateWaterData = (dataArray) => {
        return dataArray.reduce((acc, row) => {
            const year = row.Year;
            const value = +row.Value;
            if (year && !isNaN(value)) {
                acc[year] = (acc[year] || 0) + value;
            }
            return acc;
        }, {});
    };

    const waterUsageDict = aggregateWaterData(waterUsage);
    const waterResourceDict = aggregateWaterData(waterResource);
    const waterUsageValues = Object.values(waterUsageDict);
    const waterResourceValues = Object.values(waterResourceDict);

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



            {/* WATER STATS */}
            <section className="population-stats">
                <h2>Water Stats</h2>
                <div className="popu-chart-container water-toggle-container">
                    <button
                        className={`water-type-btn ${waterType === "usage" ? "active" : ""}`}
                        onClick={() => setWaterType("usage")}
                        title="Water Usage Data"
                    >
                        <i className="fa fa-tint" aria-hidden="true"></i> U
                    </button>
                    <button
                        className={`water-type-btn ${waterType === "resource" ? "active" : ""}`}
                        onClick={() => setWaterType("resource")}
                        title="Water Resource Data"
                    >
                        <i className="fa fa-water" aria-hidden="true"></i> R
                    </button>
                </div>
                {waterType === "usage" ? (
                    waterUsageValues && waterUsageValues.length > 0 ? (
                        <div className="popu-chart-container">
                            <DistributionChart data={waterUsageDict} title="Water Usage Over The Years" />
                            <div className="popu-stats">
                                <p><strong>Mean:</strong> {d3.mean(waterUsageValues).toFixed(2)}</p>
                                <p><strong>Median:</strong> {d3.median(waterUsageValues).toFixed(2)}</p>
                                <p><strong>Standard Deviation:</strong> {d3.deviation(waterUsageValues).toFixed(2)}</p>
                                <p><strong>Min:</strong> {d3.min(waterUsageValues).toFixed(2)}</p>
                                <p><strong>Max:</strong> {d3.max(waterUsageValues).toFixed(2)}</p>
                                <p>
                                    <strong>25th Percentile:</strong>{" "}
                                    {d3.quantile([...waterUsageValues].sort((a, b) => a - b), 0.25).toFixed(2)}
                                </p>
                                <p>
                                    <strong>75th Percentile:</strong>{" "}
                                    {d3.quantile([...waterUsageValues].sort((a, b) => a - b), 0.75).toFixed(2)}
                                </p>
                            </div>
                        </div>
                    ) : (
                        <p>No water usage data available.</p>
                    )
                ) : (
                    waterResourceValues && waterResourceValues.length > 0 ? (
                        <div className="popu-chart-container">
                            <DistributionChart data={waterResourceDict} title="Water Resource Over The Years" />
                            <div className="popu-stats">
                                <p><strong>Mean:</strong> {d3.mean(waterResourceValues).toFixed(2)}</p>
                                <p><strong>Median:</strong> {d3.median(waterResourceValues).toFixed(2)}</p>
                                <p><strong>Standard Deviation:</strong> {d3.deviation(waterResourceValues).toFixed(2)}</p>
                                <p><strong>Min:</strong> {d3.min(waterResourceValues).toFixed(2)}</p>
                                <p><strong>Max:</strong> {d3.max(waterResourceValues).toFixed(2)}</p>
                                <p>
                                    <strong>25th Percentile:</strong>{" "}
                                    {d3.quantile([...waterResourceValues].sort((a, b) => a - b), 0.25).toFixed(2)}
                                </p>
                                <p>
                                    <strong>75th Percentile:</strong>{" "}
                                    {d3.quantile([...waterResourceValues].sort((a, b) => a - b), 0.75).toFixed(2)}
                                </p>
                            </div>
                        </div>
                    ) : (
                        <p>No water resource data available.</p>
                    )
                )}
            </section>

        </div>
    );
};

export default AreaStats;
