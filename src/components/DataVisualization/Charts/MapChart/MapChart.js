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

    // ==============================================
    // Load All data for differnet maps and charts
    // ==============================================
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
            d3.csv(water_data_path)
        ]).then(values => {
            const [roundJson, flatJson, waterCsv] = values;

            if (!roundJson || !roundJson.features || !flatJson || !flatJson.objects) {
                console.error("Failed to load or parse GeoJSON data");
                return;
            }

            // Unify country names in round GeoJSON using state mapping
            roundJson.features.forEach(feature => {
                feature.properties.UnifiedName = nameMapping[feature.properties.name];
            });
            setRoundGeoJson(roundJson);

            // Process flat GeoJSON similarly
            const processedFlatGeoJson = topojson.feature(flatJson, flatJson.objects.countries);
            processedFlatGeoJson.features.forEach(feature => {
                feature.properties.UnifiedName = nameMapping[feature.properties.name];
            });
            setFlatGeoJson(processedFlatGeoJson);

            // Process water data
            waterCsv.forEach(d => {
                d.UnifiedName = nameMapping[d.Area];
                d.Year = +d.Year;
                d.Value = +d.Value || 0;
            });
            setWaterData(waterCsv);
        });
    }, [nameMapping]);


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

            {/* checking that all the data is loaded */}
            {roundGeoJson && flatGeoJson && waterData.length > 0 && (
                flatMap ?
                    <FlatMap flatGeoJson={flatGeoJson} waterData={waterData} /> :
                    <RoundMap roundGeoJson={roundGeoJson} waterData={waterData} />
            )}
        </div>
    );
};

export default MapChart;
