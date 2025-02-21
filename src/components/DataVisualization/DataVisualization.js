import React, { useState, useEffect } from 'react';
import './DataVisualization.css';
import MapChart from './Charts/MapChart/MapChart';
import CountryDetails from './CountryDetails';
import { useLoader } from '../APIs/Reducer';
import * as d3 from 'd3';
import * as topojson from 'topojson-client';

// all datasets
const flat_countries_path = process.env.PUBLIC_URL + "/assets/dataset/countries-110m.json";
const round_countries_path = process.env.PUBLIC_URL + "/assets/dataset/round-countries.geo.json";
const water_data_path = process.env.PUBLIC_URL + "/assets/dataset/water_use_rsc_dataset.csv";
const population_data_path = process.env.PUBLIC_URL + "/assets/dataset/population.csv";
const map_countries_names_path = process.env.PUBLIC_URL + "/assets/dataset/map-country-names.json";
const map_code_country_path = process.env.PUBLIC_URL + "/assets/dataset/map-code-country.json";
const temp_data_path = process.env.PUBLIC_URL + "/assets/dataset/temperature.csv";


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


const DataVisualization = () => {
  const [selectedCountry, setSelectedCountry] = useState(null);
  const { showLoader, hideLoader } = useLoader();
  const [isLoading, setIsLoading] = useState(true);
  const [country2CodeMapping, setCountry2CodeMapping] = useState({});
  const [code2CountryMapping, setCode2CountryMapping] = useState({});
  const [flatGeoJson, setFlatGeoJson] = useState({});
  const [roundGeoJson, setRoundGeoJson] = useState({});
  const [waterData, setWaterData] = useState([]);
  const [populationData, setPopulationData] = useState([]);
  const [temperatureData, setTemperatureData] = useState([]);

  useEffect(() => {
    fetch(map_countries_names_path)
      .then(response => response.json())
      .then(data => {
        const mapping = {};
        Object.keys(data).forEach(key => {
          mapping[key] = data[key];
        });
        setCountry2CodeMapping(mapping);
      })
      .catch(err => {
        console.error("Error loading mapping data:", err);
      });
  }, []);

  useEffect(() => {
    fetch(map_code_country_path)
      .then(response => response.json())
      .then(data => {
        const mapping = {};
        Object.keys(data).forEach(key => {
          mapping[key] = data[key];
        });
        setCode2CountryMapping(mapping);
      })
      .catch(err => {
        console.error("Error loading mapping data:", err);
      });
  }, []);


  useEffect(() => {

    showLoader();

    if (Object.keys(country2CodeMapping).length === 0) return;

    Promise.all([
      loadGeoJSON(round_countries_path),
      d3.json(flat_countries_path),
      d3.csv(water_data_path),
      d3.csv(population_data_path),
      d3.csv(temp_data_path)
    ]).then(values => {
      const [roundJson, flatJson, waterCsv, popuCsv, tempCsv] = values;

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
        d.UnifiedName = country2CodeMapping[d.Area];
        d.Year = +d.Year;
        d.Value = +d.Value || 0;
      });

      const countryWaterSum = {};
      waterCsv.forEach(d => {
        if (d.UnifiedName) {
          if (!countryWaterSum[d.UnifiedName]) {
            countryWaterSum[d.UnifiedName] = 0;
          }
          countryWaterSum[d.UnifiedName] += d.Value;
        }
      });

      // we want popu data to be a dictionary of country code with value as dict of year: value
      const new_popu_data = {};
      popuCsv.forEach(d => {
        const countryCode = d["Country Code"];
        if (!new_popu_data[countryCode]) {
          new_popu_data[countryCode] = {};
        }
        for (let year = 1967; year <= 2021; year++) {
          new_popu_data[countryCode][year] = +d[year] || 0;
        }
      });

      // Unify country names in round GeoJSON using state mapping
      const new_roundJson = roundJson;
      new_roundJson.features.forEach(feature => {
        feature.properties.UnifiedName = country2CodeMapping[feature.properties.name];
      });

      // get just meteorological year data in the desired format
      const filteredTempData = tempCsv
        .filter(d => d.Months === "Meteorological year")
        .reduce((acc, d) => {
          const unifiedName =  d["Area Code (ISO3)"];
          if (!unifiedName) return acc;
          const year = +d.Year;
          const value = +d.Value || 0;
          if (!acc[unifiedName]) {
            acc[unifiedName] = {};
          }
          acc[unifiedName][year] = value;
          return acc;
        }, {});

      // Add average temperature data to round GeoJSON
      new_roundJson.features.forEach(feature => {
        feature.properties.avg_temp = filteredTempData[feature.properties.UnifiedName] || {};
      });

      // Process flat GeoJSON similarly
      const new_flatJson = topojson.feature(flatJson, flatJson.objects.countries);
      new_flatJson.features.forEach(feature => {
        feature.properties.UnifiedName = country2CodeMapping[feature.properties.name];
      });

      new_flatJson.features.forEach(feature => {
        feature.properties.waterQTbyYear = countryWaterSum[feature.properties.UnifiedName] || 0;
      });

      new_roundJson.features.forEach(feature => {
        feature.properties.waterQTbyYear = countryWaterSum[feature.properties.UnifiedName] || 0;
      });

      setRoundGeoJson(() => new_roundJson);
      setFlatGeoJson(() => new_flatJson);
      setWaterData(() => waterCsv);
      setPopulationData(() => new_popu_data);
      setTemperatureData(() => filteredTempData);

      console.log("Data loaded successfully");
      console.log("temperatureData", filteredTempData);
      console.log("populationData", new_popu_data);

      hideLoader();
    });
  }, [country2CodeMapping]);


  useEffect(() => {
    if (!roundGeoJson || !flatGeoJson || waterData.length === 0 || populationData.length === 0) {
      setIsLoading(() => true);
      showLoader();
    } else {
      setIsLoading(() => false);
      hideLoader();
    }
  }, [roundGeoJson, flatGeoJson, waterData, populationData]);

  if (isLoading) {
    return null;
  }

  return (
    <div className="data-vis-container">
      {selectedCountry ? (
        <CountryDetails
          curr_country_code={selectedCountry}
          code2CountryMapping={code2CountryMapping}
          waterData={waterData}
          populationData={populationData}
          temperatureData={temperatureData}
          onBack={() => setSelectedCountry(null)}
        />
      ) : (
        <MapChart
          flatGeoJson={flatGeoJson}
          roundGeoJson={roundGeoJson}
          waterData={waterData}
          populationData={populationData}
          temperatureData={temperatureData}
          onCountryClick={setSelectedCountry}
        />
      )}
    </div>
  );
};

export default DataVisualization;
