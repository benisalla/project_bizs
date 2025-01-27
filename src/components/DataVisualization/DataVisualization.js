import React, { useEffect, useState } from 'react';
import Papa from 'papaparse';
import SideBar from '../SideBar/SideBar';
import './DataVisualization.css';
import Globe from './Charts/Globe';
import FlatMap from './Charts/FlatMap';
// import MapChart from './Charts/MapChart';

const worldWaterDataPath = `${process.env.PUBLIC_URL}/assets/dataset/world-water-data.csv`;
const isoDataPath = `${process.env.PUBLIC_URL}/assets/dataset/iso.csv`;

const DataVisualization = () => {
  const [data, setData] = useState([]);

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

                const mergedData = resultsWater.data
                  .map(waterItem => ({
                    country: isoMap.get(waterItem.Area),
                    value: parseFloat(waterItem.Value),
                    name: waterItem.Area,
                  }))
                  .filter(item => item.country && item.value);

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
        {/* <MapChart data={data} /> */}
        {/* <Globe /> */}
        <FlatMap />
      </main>
    </div>
  );
};

export default DataVisualization;
