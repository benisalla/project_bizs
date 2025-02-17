import React, { useState, useEffect } from "react";
import * as d3 from "d3";
import { useParams } from "react-router-dom";
import "./CountryDetails.css";
import CountryMap from "./Charts/MapChart/CountryMap";
import { filterWaterDataByCountry, filterPupulationDataByCountry } from "../APIs/DataUtils";


const CountryDetails = ({ code2CountryMapping, countryUnifiedName, waterData, populationData, onBack }) => {
  const [countryGeoJson, setCountryGeoJson] = useState(null);
  const [statsData, setStatsData] = useState(null);
  const [lineData, setLineData] = useState({ lineData: [], popuData: [] });
  const [barData, setBarData] = useState({ barData: [], popuData: [] });
  const [scatterData, setScatterData] = useState({ scatterData: [], popuData: [] });
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const countryCode = code2CountryMapping[countryUnifiedName];
    console.log("Country code: ", countryCode);
    if (countryCode) {
      d3.json(`/assets/dataset/countries/${countryCode}.json`).then((geoJsonData) => {
        console.log("GeoJson data: ", geoJsonData);
        setCountryGeoJson(geoJsonData);
        setIsLoaded(true);
      });
    }
  }, [countryUnifiedName]);

  // Prepare filtered data for charts and statistics.
  useEffect(() => {
    if (waterData && populationData) {
      const filteredWater = filterWaterDataByCountry(countryUnifiedName, waterData);
      const filteredPop = filterPupulationDataByCountry(countryUnifiedName, populationData);
      setLineData({ lineData: filteredWater, popuData: filteredPop });
      setBarData({ barData: filteredWater, popuData: filteredPop });
      setScatterData({ scatterData: filteredWater, popuData: filteredPop });
      setStatsData(filteredWater);
    }
  }, [countryUnifiedName, waterData, populationData]);

  return (
    <div className="country-details-container">
      <div className="back-button-container">
        <button className="back-button" onClick={onBack}>← Back to Map</button>
      </div>

      <div className="country-header">
        <div className="country-map">
          {code2CountryMapping ? (
            <CountryMap countryGeoJson={countryGeoJson} />
          ) : (
            <div>Loading map...</div>
          )}
        </div>
      </div>

      <section className="country-charts">
        <p>Dummy text for testing purposes</p>
      </section>

      <section className="charts-section">
        <p>Dummy object: {JSON.stringify({ key: "value" })}</p>
      </section>
    </div>
  );
};

export default CountryDetails;
