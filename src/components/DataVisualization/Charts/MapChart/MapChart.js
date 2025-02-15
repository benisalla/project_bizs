import React, { useState, useEffect } from 'react';
import FlatMap from './FlatMap';
import RoundMap from './RoundMap';
import './MapChart.css';
import * as d3 from 'd3';
import * as topojson from 'topojson-client';
import { useLoader } from '../../../APIs/Reducer';

const flat_countries_path = process.env.PUBLIC_URL + "/assets/dataset/countries-110m.json";
const round_countries_path = process.env.PUBLIC_URL + "/assets/dataset/round-countries.geo.json";
const water_data_path = process.env.PUBLIC_URL + "/assets/dataset/water_use_rsc_dataset.csv";
const map_countries_names_path = process.env.PUBLIC_URL + "/assets/dataset/map-country-names.json";
const population_data_path = process.env.PUBLIC_URL + "/assets/dataset/population.csv";


const loadGeoJSON = async (filePath) => {
    try {
        const response = await fetch(filePath);
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        const roundGeoJson = await response.json();
        return roundGeoJson;
    } catch (err) {
        console.error("Error loading or parsing the GeoJSON file:", err);
        return {};
    }

};


const MapChart = () => {
    const [flatMap, setFlatMap] = useState(true);
    const { showLoader, hideLoader } = useLoader();
    const [nameMapping, setNameMapping] = useState({});
    const [flatGeoJson, setFlatGeoJson] = useState({});
    const [waterData, setWaterData] = useState([]);
    const [roundGeoJson, setRoundGeoJson] = useState({});
    const [selectedYear, setSelectedYear] = useState(2000);
    const [populationData, setPopulationData] = useState([]);

    const handleYearSelection = (e) => {
        setSelectedYear(() => Number(e.target.value));
    };

    useEffect(() => {
        fetch(map_countries_names_path)
            .then(response => response.json())
            .then(data => {
                const mapping = {};
                Object.keys(data).forEach(key => {
                    mapping[key] = data[key];
                });
                setNameMapping(mapping);
            })
            .catch(err => {
                console.error("Error loading mapping data:", err);
            });
    }, []);

    useEffect(() => {
        if (Object.keys(nameMapping).length === 0) return;

        Promise.all([
            loadGeoJSON(round_countries_path),
            d3.json(flat_countries_path),
            d3.csv(water_data_path),
            d3.csv(population_data_path),
        ]).then(values => {
            const [roundJson, flatJson, waterCsv, popuCsv] = values;

            if (!roundJson || !roundJson.features || !flatJson || !flatJson.objects) {
                console.error("Failed to load or parse GeoJSON data");
                return;
            }

            // Process population data
            popuCsv.forEach(d => {
                d.UnifiedName = d['Country Code'];
                for (let year = 1960; year <= 2023; year++) {
                    d[year] = +d[year] || 0;
                }
            });

            // Process water data
            waterCsv.forEach(d => {
                d.UnifiedName = nameMapping[d.Area];
                d.Year = +d.Year;
                d.Value = +d.Value || 0;
            });

            const countryWaterSum = {};
            waterCsv.forEach(d => {
                if (d.UnifiedName && d.Year === selectedYear) {
                    if (!countryWaterSum[d.UnifiedName]) {
                        countryWaterSum[d.UnifiedName] = 0;
                    }
                    countryWaterSum[d.UnifiedName] += d.Value;
                }
            });

            // Unify country names in round GeoJSON using state mapping
            const new_roundJson = roundJson;
            new_roundJson.features.forEach(feature => {
                feature.properties.UnifiedName = nameMapping[feature.properties.name];
            });

            // Process flat GeoJSON similarly
            const new_flatJson = topojson.feature(flatJson, flatJson.objects.countries);
            new_flatJson.features.forEach(feature => {
                feature.properties.UnifiedName = nameMapping[feature.properties.name];
            });

            new_flatJson.features.forEach(feature => {
                feature.properties.waterQTbyYear = countryWaterSum[feature.properties.UnifiedName] || 0;
            });

            new_roundJson.features.forEach(feature => {
                feature.properties.waterQTbyYear = countryWaterSum[feature.properties.UnifiedName] || 0;
            });

            setRoundGeoJson(new_roundJson);
            setFlatGeoJson(new_flatJson);
            setWaterData(() => waterCsv);
            setPopulationData(() => popuCsv);
        });
    }, [nameMapping, selectedYear]);


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
                    <FlatMap flatGeoJson={flatGeoJson} waterData={waterData} populationData={populationData}/> :
                    <RoundMap roundGeoJson={roundGeoJson} waterData={waterData} populationData={populationData}/>
            )}
          
        </div>
    );
};

export default MapChart;
