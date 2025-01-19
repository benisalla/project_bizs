import React from 'react';
import './WaterLoader.css';

const WaterLoader = ({ text = "Loading..." }) => {
  return (
    <div className="spinner-container">
      <div className="water-effect"></div>
      <div className="spinner-text">{text}</div>
    </div>
  );
};

export default WaterLoader;
