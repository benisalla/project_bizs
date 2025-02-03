import React, { useState } from 'react';
import FlatMap from './FlatMap';
import RoundMap from './RoundMap';
import './MapChart.css';
import { FaGlobe, FaMap } from 'react-icons/fa';
import { useLoader } from '../../APIs/Reducer';

const MapChart = ({ data = [] }) => {
    const [flatMap, setFlatMap] = useState(true);
    const { showLoader, hideLoader } = useLoader();

    const handleSwitch = () => {
        // Show the loading indicator
        showLoader();

        // After 2 seconds, toggle the map and hide the loader
        setTimeout(() => {
            setFlatMap(prev => !prev);
            hideLoader();
        }, 2000);
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
            {flatMap ? <FlatMap/> : <RoundMap/>}
        </div>
    );
};

export default MapChart;
