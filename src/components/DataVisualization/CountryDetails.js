import React, { useState, useEffect, use } from "react";
import * as d3 from "d3";
import "./CountryDetails.css";
import CountryMap from "./Charts/MapChart/CountryMap";
import { filterWaterDataByCountry } from "../APIs/DataUtils";
import { useLoader } from "../APIs/Reducer";
import LineChart from "./Charts/LineChart/LineChart";
import BarChart from "./Charts/BarChart/BarChart";
import ScatterChart from "./Charts/ScatterChart/ScatterChart";
import AreaStats from "./Charts/AreaStats/AreaStats";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import Prediction from "./Charts/Prediction/Prediction";


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
      d3.json(`${process.env.PUBLIC_URL}/assets/dataset/countries/${curr_country_code}.json`).then((geoJsonData) => {
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
  }, [code2CountryMapping]);

  // Function to add one section to the PDF, splitting into multiple pages if needed.
  const addSectionToPdf = async (pdf, element) => {
    const canvas = await html2canvas(element, { scale: 2 });
    const imgData = canvas.toDataURL("image/png");
    const pdfPageWidth = pdf.internal.pageSize.getWidth();
    const pdfPageHeight = pdf.internal.pageSize.getHeight();
    const imgWidth = pdfPageWidth;
    const imgHeight = (canvas.height * pdfPageWidth) / canvas.width;
    let heightLeft = imgHeight;
    let position = 0;
    pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
    heightLeft -= pdfPageHeight;
    while (heightLeft > 0) {
      position = heightLeft - imgHeight;
      pdf.addPage();
      pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
      heightLeft -= pdfPageHeight;
    }
  };

  const handleDownloadPdf = async () => {
    showLoader();
    try {
      const pdf = new jsPDF("p", "mm", "a4");
      const sectionIds = [
        "page-header",
        "line-chart",
        "bar-chart",
        "scatter-chart",
        "page-statistics",
      ];

      for (let i = 0; i < sectionIds.length; i++) {
        const element = document.getElementById(sectionIds[i]);
        if (!element) continue;
        await addSectionToPdf(pdf, element);
        if (i < sectionIds.length - 1) {
          pdf.addPage();
        }
      }
      const countryName = code2CountryMapping[curr_country_code] || "UnknownCountry";
      pdf.save(`report_of_${countryName}.pdf`);
    } catch (error) {
      console.error("Error generating PDF:", error);
    }
    hideLoader();
  };


  if (!isLoaded) {
    return <p></p>;
  }
  return (
    <div id="country-details-container" className="country-details-container">
      <section id="page-header" className="page-header">
        <div className="back-button-container">
          <button className="back-button" onClick={onBack}>
            <i className="fa fa-arrow-left" aria-hidden="true" style={{ fontSize: "24px", color: "white" }}></i>
          </button>
          <button className="pdf-button" onClick={handleDownloadPdf}>
            <i className="fa fa-file-pdf" aria-hidden="true" style={{ fontSize: "24px", color: "white" }}></i>
          </button>
        </div>

        <div className="country-header">
          <div className="country-map">
            {code2CountryMapping ? (
              <CountryMap
                countryGeoJson={countryGeoJson}
                country_name={code2CountryMapping[curr_country_code]}
              />
            ) : (
              <p>Loading...</p>
            )}
          </div>
        </div>
      </section>

      <section className="country-charts">
        {(filteredData.waterData.length === 0 ||
          filteredData.tempData.length === 0 ||
          filteredData.popuData.length === 0) ? (
          <p>No data found for the selected country.</p>
        ) : (
          <>
            <h2 className="section-title">Bar Chart</h2>
            <LineChart
              title={`Line Chart of ${curr_country_code}`}
              data={filteredData}
              width={800}
              height={400}
            />


            <h2 className="section-title">Bar Chart</h2>
            <BarChart
              data={filteredData}
              title={`Bar Chart of ${curr_country_code}`}
              width={800}
              height={400}
            />

            <h2 className="section-title">Scatter Chart</h2>
            <ScatterChart
              title={`Scatter Chart of ${curr_country_code}`}
              data={filteredData}
              width={800}
              height={400}
            />

          </>
        )}
      </section>


      {/* prediction section */}
      <section id="prediction" className="prediction-section">
        {(filteredData.waterData.length === 0 ||
          filteredData.tempData.length === 0 ||
          filteredData.popuData.length === 0) ? (
          <p>No data found for the selected country.</p>
        ) : (
          <>
            <h2 className="section-title">Prediction</h2>
            <Prediction
              data={filteredData}
              countryName={code2CountryMapping[curr_country_code]}
            />
          </>
        )}
      </section>

      <section id="page-statistics" className="statistics-section">
        <AreaStats
          data={filteredData}
          countryName={code2CountryMapping[curr_country_code]}
        />
      </section>


    </div>
  );
};

export default CountryDetails;
