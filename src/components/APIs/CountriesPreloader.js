import React, { useState, useEffect } from "react";
import CountriesContext from "./CountriesContext";

function CountriesPreloader({ countryList, children }) {
    const [allCountriesData, setAllCountriesData] = useState(null);

    useEffect(() => {
        async function preloadAllCountries() {
            const result = {};
            await Promise.all(
                countryList.map(async (countryName) => {
                    const res = await fetch(`/assets/dataset/countries/${countryName}.json`);
                    const data = await res.json();
                    result[countryName] = data;
                })
            );
            setAllCountriesData(result);
        }

        preloadAllCountries();
    }, [countryList]);

    if (!allCountriesData) {
        return <div>Loading all country data...</div>;
    }

    return (
        <CountriesContext.Provider value={allCountriesData}>
            {children}
        </CountriesContext.Provider>
    );
}

export default CountriesPreloader;
