import React from 'react';
import Modal from 'react-modal';
import './ChartSelector.css';

Modal.setAppElement('#root');

const ChartSelector = ({ isOpen, onClose, onSelect }) => {
  const handleClick = (chartType) => {
    if (onSelect) {
      onSelect(chartType);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onClose}
      contentLabel="Chart Selector Modal"
      style={{
        content: {
          top: "50%",
          left: "50%",
          marginRight: "-50%",
          transform: "translate(-50%, -50%)",
          background: "#fff",
          border: "1px solid #ccc",
          borderRadius: "10px",
          boxShadow: "0 4px 8px rgba(0, 0, 0, 0.2)",
          padding: "20px",
          width: "600px",
          height: "350px",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          overflow: "hidden",
        },
        overlay: {
          backgroundColor: "rgba(0, 0, 0, 0.75)",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        },
      }}
    >
      <button onClick={onClose} className="close-button">&times;</button>
      <div className="chart-grid">
        <button
          className="chart-card"
          onClick={() => handleClick('LineChart')}
        >
          <img
            src="/assets/images/line-chart-icon.png"
            alt="Line Chart"
            className="chart-icon"
          />
          <div className="chart-title">Line Chart</div>
        </button>

        <button
          className="chart-card"
          onClick={() => handleClick('ScatterChart')}
        >
          <img
            src="/assets/images/scatter-chart-icon.png"
            alt="Scatter Chart"
            className="chart-icon"
          />
          <div className="chart-title">Scatter Chart</div>
        </button>

        <button
          className="chart-card"
          onClick={() => handleClick('AreaStats')}
        >
          <img
            src="/assets/images/stats-icon.png"
            alt="Area Statistics"
            className="chart-icon"
          />
          <div className="chart-title">Area Statistics</div>
        </button>

        <button
          className="chart-card"
          onClick={() => handleClick('BarChart')}
        >
          <img
            src="/assets/images/bar-chart-icon.png"
            alt="Bar Chart"
            className="chart-icon"
          />
          <div className="chart-title">Bar Chart</div>
        </button>
      </div>

    </Modal>
  );
};

export default ChartSelector;
