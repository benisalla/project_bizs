import React, { useState, useEffect, use } from 'react';
import FlatMap from './FlatMap';
import RoundMap from './RoundMap';
import './MapChart.css';
import { useLoader } from '../../../APIs/Reducer';

const MapChart = ({
    onCountryClick,
    roundGeoJson,
    flatGeoJson,
    waterData,
    populationData,
    temperatureData }) => {

    const { showLoader, hideLoader } = useLoader();
    const [flatMap, setFlatMap] = useState(true);
    const [selectedYear, setSelectedYear] = useState(2000);
    const [filteredWaterData, setFilteredWaterData] = useState([]);
    const [filteredPopuData, setFilteredPopuData] = useState([]);
    const [filteredTempData, setFilteredTempData] = useState([]);

    useEffect(() => {
        setFilteredWaterData(waterData.filter(d => d.Year == selectedYear));
        setFilteredPopuData(
            Object.entries(populationData).map(([UnifiedName, data]) => ({
                UnifiedName,
                value: data[selectedYear],
            }))
        );

        setFilteredTempData(
            Object.entries(temperatureData).map(([UnifiedName, data]) => ({
                UnifiedName,
                value: data[selectedYear],
            }))
        );

    }, [selectedYear]);

    const handleYearSelection = (e) => {
        setSelectedYear(e.target.value);
    };

    const handleSwitch = () => {
        showLoader();

        setTimeout(() => {
            setFlatMap(prev => !prev);
            hideLoader();
        }, 2100);
    };

    return (
        <div className="map-chart-container">
            <button
                className="switch-btn"
                onClick={handleSwitch}
                aria-label={flatMap ? 'Switch to round map' : 'Switch to flat map'}
            >
                {flatMap ? (
                    <img
                        src="/assets/images/flat-map-icon.png"
                        alt="flat map icon"
                        className="chart-icon"
                    />
                ) : (
                    <img
                        src="/assets/images/earth-icon.png"
                        alt="earth icon"
                        className="chart-icon"
                    />
                )}
            </button>

            <div className="selected-year-container">
                <h4>Selected Year: {selectedYear}</h4>
                <div className="selected-year-sliders">
                    <div className="slider">
                        <input
                            id="minYear"
                            type="range"
                            min="1967"
                            max="2021"
                            value={selectedYear}
                            onChange={handleYearSelection}
                        />
                    </div>
                </div>
            </div>

            {roundGeoJson && flatGeoJson && waterData.length > 0 && (
                flatMap ?
                    <FlatMap
                        flatGeoJson={flatGeoJson}
                        waterData={filteredWaterData}
                        populationData={filteredPopuData}
                        temperatureData={filteredTempData}
                        onCountryClick={onCountryClick} /> :
                    <RoundMap
                        roundGeoJson={roundGeoJson}
                        waterData={filteredWaterData}
                        populationData={filteredPopuData}
                        temperatureData={filteredTempData}
                        onCountryClick={onCountryClick} />
            )}

        </div>
    );
};

export default MapChart;
