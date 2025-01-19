import Papa from 'papaparse';

// Function to fetch and parse CSV data
export const fetchData = (path) => {
  return fetch(path)
    .then(response => response.text())
    .then(csvData => new Promise((resolve, reject) => {
      Papa.parse(csvData, {
        header: true,
        complete: results => resolve(results.data),
        error: error => reject(error)
      });
    }));
};

// Calculate statistics such as average, min, max
export const calculateStatistics = (data, key) => {
  const filteredData = data.map(item => parseFloat(item[key])).filter(item => !isNaN(item));
  const sum = filteredData.reduce((acc, value) => acc + value, 0);
  const count = filteredData.length;
  const average = sum / count;
  const min = Math.min(...filteredData);
  const max = Math.max(...filteredData);

  return { average, min, max, count };
};

// Group data by a specific key
export const groupBy = (data, key) => {
  return data.reduce((storage, item) => {
    const group = item[key];
    storage[group] = storage[group] || [];
    storage[group].push(item);
    return storage;
  }, {});
};

// Calculate aggregated values per country or group
export const aggregateDataByCountry = (data, countryKey = 'Area', valueKey = 'Value') => {
  const groupedData = groupBy(data, countryKey);
  return Object.keys(groupedData).map(country => {
    const stats = calculateStatistics(groupedData[country], valueKey);
    return {
      country,
      averageValue: stats.average,
      minValue: stats.min,
      maxValue: stats.max,
      count: stats.count
    };
  });
};

