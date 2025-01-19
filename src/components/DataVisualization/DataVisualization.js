import React, { useEffect, useState } from 'react';
import Papa from 'papaparse';
import SideBar from '../SideBar/SideBar';
import './DataVisualization.css';
import MapChart from './Charts/MapChart';

const worldWaterDataPath = `${process.env.PUBLIC_URL}/assets/dataset/world-water-data.csv`;
const isoDataPath = `${process.env.PUBLIC_URL}/assets/dataset/iso.csv`;

const DataVisualization = () => {
  const [data, setData] = useState([]);

  // useEffect(() => {
  //   Promise.all([
  //     fetch(worldWaterDataPath).then(res => res.text()),
  //     fetch(isoDataPath).then(res => res.text())
  //   ])
  //     .then(([waterData, isoData]) => {
  //       Papa.parse(waterData, {
  //         header: true,
  //         complete: (resultsWater) => {
  //           Papa.parse(isoData, {
  //             header: true,
  //             complete: (resultsIso) => {
  //               const isoMap = new Map(
  //                 resultsIso.data.map(item => [item.name, item['alpha-2']])
  //               );

  //               const mergedData = resultsWater.data
  //                 .map(waterItem => ({
  //                   country: isoMap.get(waterItem.Area),
  //                   value: parseFloat(waterItem.Value),
  //                   name: waterItem.Area,
  //                 }))
  //                 .filter(item => item.country && item.value);

  //               setData(mergedData);
  //             },
  //           });
  //         },
  //       });
  //     })
  //     .catch(error => console.log('Error loading data:', error));
  // }, []);


  useEffect(() => {
    Promise.all([
      fetch(worldWaterDataPath).then(res => res.text()),
      fetch(isoDataPath).then(res => res.text())
    ])
      .then(([waterData, isoData]) => {
        Papa.parse(waterData, {
          header: true,
          complete: (resultsWater) => {
            Papa.parse(isoData, {
              header: true,
              complete: (resultsIso) => {
                const isoMap = new Map(
                  resultsIso.data.map(item => [item.name, item['alpha-2']])
                );

                const mergedData = resultsWater.data.map(waterItem => {
                  return {
                    country: isoMap.get(waterItem.Area) || '',  // Get ISO code or default to empty string if not found
                    area: waterItem.Area,
                    year: waterItem.Year,
                    value: parseFloat(waterItem.Value),  // Keep as float for possible numeric operations
                    unit: waterItem.Unit,
                    variableGroup: waterItem.VariableGroup,
                    subgroup: waterItem.Subgroup,
                    variable: waterItem.Variable,
                    symbol: waterItem.Symbol,
                    isAggregate: waterItem.IsAggregate,
                  };
                }).filter(item => item.country && !isNaN(item.value));  // Ensure country code exists and value is a valid number

                setData(mergedData);
              },
            });
          },
        });
      })
      .catch(error => console.log('Error loading data:', error));
  }, []);

  return (
    <div className="data-vis-page">
      <SideBar />
      <main className="page-content">
        <MapChart data={data} />
      </main>
    </div>
  );
};

export default DataVisualization;
