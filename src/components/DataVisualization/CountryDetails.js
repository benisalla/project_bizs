import React, { useState, useEffect, use } from "react";
import * as d3 from "d3";
import "./CountryDetails.css";
import CountryMap from "./Charts/MapChart/CountryMap";
import { filterWaterDataByCountry, filterPupulationDataByCountry } from "../APIs/DataUtils";
import { useLoader } from "../APIs/Reducer";
import LineChart from "./Charts/LineChart/LineChart";
import BarChart from "./Charts/BarChart/BarChart";
import ScatterChart from "./Charts/ScatterChart/ScatterChart";
import AreaStats from "./Charts/AreaStats/AreaStats";
import TreeMapChart from "./Charts/TreeMapChart/TreeMapChart";


const CountryDetails = ({
  code2CountryMapping,
  curr_country_code,
  waterData,
  populationData,
  temperatureData,
  onBack }) => {

  const [countryGeoJson, setCountryGeoJson] = useState(null);
  const [filteredData, setFilteredData] = useState({ "waterData": [], "popuData": [] });
  const [isLoaded, setIsLoaded] = useState(false);
  const { showLoader, hideLoader } = useLoader();

  useEffect(() => {
    showLoader();
    const countryName = code2CountryMapping[curr_country_code];
    if (countryName) {
      d3.json(`/assets/dataset/countries/${curr_country_code}.json`).then((geoJsonData) => {
        setCountryGeoJson(geoJsonData);
        setIsLoaded(true);
      });
    }
  }, [curr_country_code]);

  // Prepare filtered data for charts and statistics.
  useEffect(() => {
    if (waterData && populationData && temperatureData) {
      const filteredWater = filterWaterDataByCountry(curr_country_code, waterData);
      const filteredPop = [populationData[curr_country_code]] || [];
      const filteredTemp = [temperatureData[curr_country_code]] || [];
      setFilteredData({ "waterData": filteredWater, "popuData": filteredPop, "tempData": filteredTemp });
    }
  }, [curr_country_code, waterData, populationData]);

  useEffect(() => {
    if (code2CountryMapping) {
      hideLoader();
    }
  }
    , [code2CountryMapping]);

  if (!isLoaded) {
    return <p>Loading...</p>;
  }
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
            <p>Loading...</p>
          )}
        </div>
      </div>

      <section className="country-charts">
        {(filteredData.waterData.length === 0 || 
        filteredData.tempData.length === 0 ||
        filteredData.popuData.length === 0) ? (
          <p>No data found for the selected country.</p>
        ) : (
          <>
            <LineChart
              title={`Line Chart of ${curr_country_code}`}
              data={filteredData}
              width={800}
              height={400}
            />

            <BarChart
              data={filteredData}
              title={`Bar Chart of ${curr_country_code}`}
              width={800}
              height={400}
            />

            <ScatterChart
              title={`Scatter Chart of ${curr_country_code}`}
              data={filteredData}
              width={800}
              height={400}
            />

          </>
        )}
      </section>


      <section className="statistics-section">
        <AreaStats
          data={filteredData}
          countryName={code2CountryMapping[curr_country_code]}
        />
      </section>


    </div>
  );
};

export default CountryDetails;
