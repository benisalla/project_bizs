import React, { useState } from 'react';
import { WorldMap } from 'react-svg-worldmap';
import CountryModal from './CountryModal';

const MapChart = ({ data = [] }) => {
    const [selectedCountry, setSelectedCountry] = useState(null);
    const [modalOpen, setModalOpen] = useState(false);

    const handleCountryClick = (event) => {
        const countryData = data.find(
            (item) => item.country === event.countryCode
        );
        if (countryData) {
            setSelectedCountry(countryData);
            setModalOpen(true);
        }
    };

    const handleCloseModal = () => {
        setModalOpen(false);
    };

    return (
        <div className="container m-auto">
            <>
                <WorldMap
                    size="xxl"
                    data={data}
                    onClickFunction={handleCountryClick}
                    color="blue"
                    value-suffix=" units"
                />
                {selectedCountry && (
                    <CountryModal
                        country={selectedCountry}
                        open={modalOpen}
                        onClose={handleCloseModal}
                    />
                )}
            </>
        </div>
    );
};

export default MapChart;
