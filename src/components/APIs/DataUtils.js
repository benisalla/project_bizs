import * as d3 from 'd3';

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

const filterAndGroupDataByCountry = (countryName, data) => {
  const subset = data.filter(item => item.UnifiedName === countryName);
  const grouped = d3.rollup(
    subset,
    arr => d3.sum(arr, e => e.Value),
    e => e.Year
  );
  const result = Array.from(grouped, ([Year, TotalValue]) => ({ Year, TotalValue }));
  result.sort((a, b) => a.Year - b.Year);
  return result;
};



export { filterDataByCountry, filterDataByYear, filterDataByCountryAndYear, filterAndGroupDataByCountry };

