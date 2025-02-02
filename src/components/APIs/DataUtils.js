const filterDataByCountry = (countryName, waterData) => {
  if (!countryName || !waterData || waterData.length === 0) {
    return [];
  }

  const filteredData = waterData.filter(row => row.UnifiedName === countryName);

  return filteredData;
};

const filterDataByYear = (year, waterData) => {
  if (!year || !waterData || waterData.length === 0) {
    return [];
  }

  const filteredData = waterData.filter(row => row.Year === year);

  return filteredData;
};

const filterDataByCountryAndYear = (countryName, year, waterData) => {
  if (!countryName || !year || !waterData || waterData.length === 0) {
    return [];
  }

  const filteredData = waterData.filter(row => row.UnifiedName === countryName && row.Year === year);

  return filteredData;
};

export { filterDataByCountry, filterDataByYear, filterDataByCountryAndYear };

