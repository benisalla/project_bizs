import React from 'react';
import SideBar from '../SideBar/SideBar';
import './DataVisualization.css';

const DataVisualization = () => {
  return (
    <div className="data-vis-page">
      <SideBar />

      <main className="page-content">
        <h1>Welcome to Data Visualization</h1>
        <p>
          This is a placeholder for the main content area. Here you can display
          various data visualizations and insights.
        </p>
        <ul>
          <li>Chart 1: Sales Over Time</li>
          <li>Chart 2: Customer Demographics</li>
          <li>Chart 3: Product Performance</li>
        </ul>
      </main>
    </div>
  );
};

export default DataVisualization;
