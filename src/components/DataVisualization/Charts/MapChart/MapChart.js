import React, { useState, useEffect } from 'react';
import FlatMap from './FlatMap';
import RoundMap from './RoundMap';
import './MapChart.css';
import { useLoader } from '../../../APIs/Reducer';
import GlobalStats from '../GlobalStats/GlobalStats';

const flat_map_icon = process.env.PUBLIC_URL + "/assets/images/flat-map-icon.png";
const earth_map_icon = process.env.PUBLIC_URL + "/assets/images/earth-map-icon.png";

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
        setFilteredWaterData(waterData.filter(d => d.Year === selectedYear));
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
            <div className="world-map-controls">
                <button
                    className="switch-btn"
                    onClick={handleSwitch}
                    aria-label={flatMap ? 'Switch to round map' : 'Switch to flat map'}
                >
                    {!flatMap ? (
                        <img src={flat_map_icon} alt="flat map icon" className="chart-icon"
                        />
                    ) : (
                        <img src={earth_map_icon} alt="earth icon" className="chart-icon chart-icon-round"
                        />
                    )}
                </button>

                <div className="selected-year-container">
                    <h4>Selected Year: {selectedYear}</h4>
                    <div className="selected-year-sliders">
                        <div className="slider">
                            <input id="minYear" type="range" min="1967" max="2021" value={selectedYear} onChange={handleYearSelection}
                            />
                        </div>
                    </div>
                </div>
            </div>

            <div className="global-map-container">
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
                {roundGeoJson && flatGeoJson && waterData.length > 0 && (
                    <GlobalStats
                        waterData={filteredWaterData}
                        populationData={filteredPopuData}
                        temperatureData={filteredTempData} />

                )}
            </div>

        </div>
    );
};

export default MapChart;
