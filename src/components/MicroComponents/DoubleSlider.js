import React, { useState } from "react";
import "./DoubleSlider.css";

const DoubleSlider = ({ min = 1967, max = 2021, onChange }) => {
    // Initial state for the two thumbs.
    const [minVal, setMinVal] = useState(min);
    const [maxVal, setMaxVal] = useState(max);

    // When the left (min) slider changes.
    const handleMinChange = (e) => {
        const value = Math.min(Number(e.target.value), maxVal - 1);
        setMinVal(value);
        if (onChange) onChange([value, maxVal]);
    };

    // When the right (max) slider changes.
    const handleMaxChange = (e) => {
        const value = Math.max(Number(e.target.value), minVal + 1);
        setMaxVal(value);
        if (onChange) onChange([minVal, value]);
    };

    return (
        <div className="double-container">
            <h4>
                Selected Interval: {minVal} - {maxVal}
            </h4>
            <div className="double-slider">
                {/* Left thumb for minimum value */}
                <input
                    id="minYear"
                    type="range"
                    min={min}
                    max={max}
                    value={minVal}
                    onChange={handleMinChange}
                    className="thumb thumb--left"
                />
                {/* Right thumb for maximum value */}
                <input
                    id="maxYear"
                    type="range"
                    min={min}
                    max={max}
                    value={maxVal}
                    onChange={handleMaxChange}
                    className="thumb thumb--right"
                />
            </div>
        </div>
    );
};

export default DoubleSlider;
