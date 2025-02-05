import React from 'react';
import './WaterLoader.css';

const WaterLoader = () => {
    return (
        <div className='water-loader-container'>
            <div className='water-loader'>
                <div className="drop"></div>
                <div className="wave"></div>
            </div>
        </div>
    );
};

export default WaterLoader;