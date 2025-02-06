import React from 'react';
import SideBar from '../SideBar/SideBar';
import './DataVisualization.css';
import MapChart from './Charts/MapChart/MapChart';

const DataVisualization = () => {
  return (
    <div className="data-vis-page">
      {/* <SideBar /> */}
      <main className="page-content">
        <MapChart />
      </main>
    </div>
  );
};

export default DataVisualization;
