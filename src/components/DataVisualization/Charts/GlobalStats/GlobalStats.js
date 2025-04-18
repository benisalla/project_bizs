import React, { useEffect, useState } from "react";
import * as d3 from "d3";
import {
    FaArrowUp,
    FaArrowDown,
    FaChartLine,
    FaGlobe,
    FaBalanceScale,
    FaEquals,
    FaUsers,
    FaTemperatureHigh,
} from "react-icons/fa";
import "./GlobalStats.css";

const GlobalStats = ({ waterData, populationData, temperatureData }) => {
    const [stats, setStats] = useState(null);

    useEffect(() => {
        if (!waterData || waterData.length === 0) {
            setStats(null);
            return;
        }

        // --- WATER USAGE STATS ---
        const waterValues = waterData
            .map((d) => +d.Value)
            .filter((v) => !isNaN(v));
        if (waterValues.length === 0) {
            setStats(null);
            return;
        }

        const highestValue = d3.max(waterValues);
        const lowestValue = d3.min(waterValues);
        const highestCountry =
            waterData.find((d) => +d.Value === highestValue)?.Area || "N/A";
        const lowestCountry =
            waterData.find((d) => +d.Value === lowestValue)?.Area || "N/A";
        const meanWater = d3.mean(waterValues);
        const medianWater = d3.median(waterValues);
        const stdDevWater = d3.deviation(waterValues);
        const totalReporting = waterData.length;

        // --- POPULATION STATS ---
        const popValues = populationData
            .map((d) => +d.value)
            .filter((v) => !isNaN(v));
        const meanPop = popValues.length > 0 ? d3.mean(popValues) : 0;

        // --- TEMPERATURE STATS ---
        const tempValues = temperatureData
            .map((d) => +d.value)
            .filter((v) => !isNaN(v));
        const meanTemp = tempValues.length > 0 ? d3.mean(tempValues) : 0;

        setStats({
            highestCountry,
            highestValue,
            lowestCountry,
            lowestValue,
            meanWater,
            medianWater,
            stdDevWater,
            totalReporting,
            meanPop,
            meanTemp,
        });
    }, [waterData, populationData, temperatureData]);

    if (!stats) {
        return <p className="loading-message">Loading global statistics...</p>;
    }

    return (
        <div className="global-stats">
            <h2>Global Water Resources &amp; Environment Statistics</h2>
            <p className="subtitle">
                Analyzing water usage in relation to population and temperature
            </p>
            <div className="stats-cards">
                {/* Highest Water Usage */}
                <div className="stat-card">
                    <div className="icon-wrapper highest-icon">
                        <FaArrowUp />
                    </div>
                    <div className="stat-info">
                        <h3>
                            {stats.highestCountry}{" "}
                            <span className="stat-value">({stats.highestValue.toFixed(2)}%)</span>
                        </h3>
                        <p>Highest Agricultural Water Withdrawal</p>
                    </div>
                </div>

                {/* Lowest Water Usage */}
                <div className="stat-card">
                    <div className="icon-wrapper lowest-icon">
                        <FaArrowDown />
                    </div>
                    <div className="stat-info">
                        <h3>
                            {stats.lowestCountry}{" "}
                            <span className="stat-value">({stats.lowestValue.toFixed(2)}%)</span>
                        </h3>
                        <p>Lowest Agricultural Water Withdrawal</p>
                    </div>
                </div>

                {/* Average Water Usage */}
                <div className="stat-card">
                    <div className="icon-wrapper average-icon">
                        <FaChartLine />
                    </div>
                    <div className="stat-info">
                        <h3>
                            {stats.meanWater.toFixed(2)}%
                            <span className="stat-value"> (avg)</span>
                        </h3>
                        <p>Average Water Usage</p>
                    </div>
                </div>

                {/* Median Water Usage */}
                <div className="stat-card">
                    <div className="icon-wrapper median-icon">
                        <FaEquals />
                    </div>
                    <div className="stat-info">
                        <h3>{stats.medianWater.toFixed(2)}%</h3>
                        <p>Median Water Usage</p>
                    </div>
                </div>

                {/* Standard Deviation */}
                <div className="stat-card">
                    <div className="icon-wrapper stddev-icon">
                        <FaBalanceScale />
                    </div>
                    <div className="stat-info">
                        <h3>{stats.stdDevWater.toFixed(2)}</h3>
                        <p>Variation in Water Usage</p>
                    </div>
                </div>

                {/* Total Reporting Countries */}
                <div className="stat-card">
                    <div className="icon-wrapper globe-icon">
                        <FaGlobe />
                    </div>
                    <div className="stat-info">
                        <h3>{stats.totalReporting}</h3>
                        <p>Reporting Countries</p>
                    </div>
                </div>

                {/* Average Population */}
                <div className="stat-card">
                    <div className="icon-wrapper population-icon">
                        <FaUsers />
                    </div>
                    <div className="stat-info">
                        <h3>{stats.meanPop.toLocaleString(undefined, { maximumFractionDigits: 0 })}</h3>
                        <p>Avg. Population</p>
                    </div>
                </div>

                {/* Average Temperature */}
                <div className="stat-card">
                    <div className="icon-wrapper temp-icon">
                        <FaTemperatureHigh />
                    </div>
                    <div className="stat-info">
                        <h3>{stats.meanTemp.toFixed(2)}°C</h3>
                        <p>Avg. Temperature</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default GlobalStats;
