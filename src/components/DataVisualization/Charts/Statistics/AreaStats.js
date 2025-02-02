import React from 'react';
import Modal from 'react-modal';
import { computeNumericStats } from '../../../APIs/DataUtils';
import './AreaStats.css'; // <-- Import the improved CSS here

Modal.setAppElement('#root');

const modalStyles = {
    content: {
        top: '50%',
        left: '50%',
        right: 'auto',
        bottom: 'auto',
        marginRight: '-50%',
        transform: 'translate(-50%, -50%)',
        background: '#f4f4f9',
        border: '1px solid #d3d3d5',
        borderRadius: '12px',
        padding: '2px',
        width: '60vw',   
        maxWidth: '800px',
        height: '70vh',   
        maxHeight: '90vh',
        overflowY: 'auto',
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
        fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif",
        color: '#333',
    },
    overlay: {
        backgroundColor: 'rgba(0, 0, 0, 0.75)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
    },
};

const AreaStats = ({ isOpen, onClose, areaData, title }) => {
    // Separate data by type
    const resourceData = areaData.filter(row => row.type === 'resource');
    const usageData = areaData.filter(row => row.type === 'usage');

    // Compute stats for each
    const resourceStats = computeNumericStats(resourceData);
    const usageStats = computeNumericStats(usageData);

    // Helper to render variable distribution for pie charts
    const renderPieDistribution = (percentages) => {
        if (!percentages || percentages.length === 0) {
            return <p>No variable distribution found.</p>;
        }
        return (
            <ul>
                {percentages.map(({ variable, percentage }) => (
                    <li key={variable}>
                        <span>{variable}</span>
                        <span>{percentage.toFixed(2)}%</span>
                    </li>
                ))}
            </ul>
        );
    };

    return (
        <Modal
            isOpen={isOpen}
            onRequestClose={onClose}
            contentLabel={title}
            style={modalStyles}
        >
            <button className="closeButton" onClick={onClose}>
                &times;
            </button>
            
            <div className="modalContentContainer">
                {/* Modal title */}
                <h2 className="modalHeading">{title}</h2>

                {/* RESOURCE STATS */}
                <div className="statsSection">
                    <h3>Resource Data</h3>
                    {resourceStats ? (
                        <>
                            <ul>
                                <li>
                                    <strong>Records:</strong> {resourceStats.count}
                                </li>
                                <li>
                                    <strong>Total Value:</strong>{' '}
                                    {resourceStats.total?.toFixed
                                        ? resourceStats.total.toFixed(2)
                                        : resourceStats.total}
                                </li>
                                <li>
                                    <strong>Average Value:</strong>{' '}
                                    {resourceStats.average?.toFixed
                                        ? resourceStats.average.toFixed(2)
                                        : resourceStats.average}
                                </li>
                                <li>
                                    <strong>Minimum Value:</strong> {resourceStats.min}
                                </li>
                                <li>
                                    <strong>Maximum Value:</strong> {resourceStats.max}
                                </li>
                            </ul>

                            <div className="distributionContainer">
                                <h4>Distribution by Variable (Pie Chart)</h4>
                                {renderPieDistribution(resourceStats.variablePercentages)}
                            </div>
                        </>
                    ) : (
                        <p>No resource data available.</p>
                    )}
                </div>

                {/* USAGE STATS */}
                <div className="statsSection">
                    <h3>Usage Data</h3>
                    {usageStats ? (
                        <>
                            <ul>
                                <li>
                                    <strong>Records:</strong> {usageStats.count}
                                </li>
                                <li>
                                    <strong>Total Value:</strong>{' '}
                                    {usageStats.total?.toFixed
                                        ? usageStats.total.toFixed(2)
                                        : usageStats.total}
                                </li>
                                <li>
                                    <strong>Average Value:</strong>{' '}
                                    {usageStats.average?.toFixed
                                        ? usageStats.average.toFixed(2)
                                        : usageStats.average}
                                </li>
                                <li>
                                    <strong>Minimum Value:</strong> {usageStats.min}
                                </li>
                                <li>
                                    <strong>Maximum Value:</strong> {usageStats.max}
                                </li>
                            </ul>

                            <div className="distributionContainer">
                                <h4>Distribution by Variable (Pie Chart)</h4>
                                {renderPieDistribution(usageStats.variablePercentages)}
                            </div>
                        </>
                    ) : (
                        <p>No usage data available.</p>
                    )}
                </div>
            </div>
        </Modal>
    );
};

export default AreaStats;
