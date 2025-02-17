import React, { useState, useEffect, useRef } from "react";
import "./DoubleSlider.css";

const DoubleSlider = ({ min = 1967, max = 2021, onChange }) => {
    const [minVal, setMinVal] = useState(min);
    const [maxVal, setMaxVal] = useState(max);
    const rangeRef = useRef(null);

    // Update the slider range fill whenever minVal or maxVal changes.
    useEffect(() => {
        if (rangeRef.current) {
            const percentMin = ((minVal - min) / (max - min)) * 100;
            const percentMax = ((maxVal - min) / (max - min)) * 100;
            rangeRef.current.style.left = `${percentMin}%`;
            rangeRef.current.style.width = `${percentMax - percentMin}%`;
        }
    }, [minVal, maxVal, min, max]);

    const handleMinChange = (e) => {
        const value = Math.min(Number(e.target.value), maxVal - 1);
        setMinVal(value);
        if (onChange) onChange([value, maxVal]);
    };

    const handleMaxChange = (e) => {
        const value = Math.max(Number(e.target.value), minVal + 1);
        setMaxVal(value);
        if (onChange) onChange([minVal, value]);
    };

    return (
        <div className="double-container">
            {/* Integrated selected interval text */}
            <div className="slider-values">
                <span>
                    Selected Interval: {minVal} - {maxVal}
                </span>
            </div>
            <div className="double-slider">
                {/* The static track */}
                <div className="slider-track" />
                {/* The highlighted range fill */}
                <div className="slider-range" ref={rangeRef} />
                {/* Left thumb */}
                <input
                    type="range"
                    min={min}
                    max={max}
                    value={minVal}
                    onChange={handleMinChange}
                    className="thumb thumb--left"
                />
                {/* Right thumb */}
                <input
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
