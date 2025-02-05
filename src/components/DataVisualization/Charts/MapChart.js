import React, { useState } from 'react';
import { ComposableMap, Geographies, Geography, ZoomableGroup } from 'react-simple-maps';
import CountryModal from './CountryModal';

const geoUrl = process.env.PUBLIC_URL + '/assets/dataset/' + 'World_Countries.json';

const MapChart = ({ data = [] }) => {
    const [position, setPosition] = useState({ coordinates: [0, 0], zoom: 1 });
    const [selectedCountry, setSelectedCountry] = useState(null);
    const [modalOpen, setModalOpen] = useState(false);

    const handleCountryClick = geo => {
        const countryData = data.find(item => item.country === geo.properties.ISO_A3);
        if (countryData) {
            setSelectedCountry(countryData);
            setModalOpen(true);
        }
    };

    const handleCloseModal = () => {
        setModalOpen(false);
    };

    const handleZoomIn = () => {
        setPosition(pos => ({ ...pos, zoom: Math.min(pos.zoom + 0.5, 4) }));
    };

    const handleZoomOut = () => {
        setPosition(pos => ({ ...pos, zoom: Math.max(pos.zoom - 0.5, 1) }));
    };


    const handleMoveEnd = newPosition => {
        setPosition(newPosition);
    };

    return (
        <div className="container m-auto" style={{ backgroundColor: "#f5f5f5" }}>
            <button onClick={handleZoomIn}>+</button>
            <button onClick={handleZoomOut}>-</button>
            <ComposableMap
                projectionConfig={{ scale: 200 }}
                width={800}
                height={400}
                style={{ width: "100%", height: "auto" }}
            >
                <ZoomableGroup zoom={position.zoom} center={position.coordinates} onMoveEnd={handleMoveEnd}>
                    <Geographies geography={geoUrl}>
                        {({ geographies }) =>
                            geographies.map(geo => {
                                return (
                                    <Geography
                                        key={geo.rsmKey}
                                        geography={geo}
                                        fill="#DDD"
                                        stroke="#888"
                                        onClick={() => handleCountryClick(geo)}
                                    />
                                );
                            })
                        }
                    </Geographies>
                </ZoomableGroup>
            </ComposableMap>
            {selectedCountry && (
                <CountryModal
                    country={selectedCountry}
                    open={modalOpen}
                    onClose={handleCloseModal}
                />
            )}
        </div>
    );
};

export default MapChart;

