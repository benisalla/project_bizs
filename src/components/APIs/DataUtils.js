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

// function computeNumericStats(data) {
//   if (data.length === 0) return null;
//   const values = data.map(row => parseFloat(row.Value));
//   const total = values.reduce((acc, val) => acc + val, 0);
//   const average = (total / values.length).toFixed(2);
//   const min = Math.min(...values);
//   const max = Math.max(...values);
//   return { count: data.length, average, min, max };
// }


function computeNumericStats(data) {
  if (!data || data.length === 0) {
    return null;
  }

  // Convert all "Value" fields to numbers
  const values = data.map(row => parseFloat(row.Value)).filter(v => !isNaN(v));

  if (values.length === 0) {
    return null;
  }

  // Basic numeric stats
  const total = values.reduce((acc, val) => acc + val, 0);
  const average = total / values.length;  // keep as Number, can format later
  const min = Math.min(...values);
  const max = Math.max(...values);

  // Group sums by "Variable"
  const sumsByVariable = {};
  data.forEach(row => {
    const varName = row.Variable; // make sure this matches your data shape
    const val = parseFloat(row.Value);
    if (!isNaN(val)) {
      sumsByVariable[varName] = (sumsByVariable[varName] || 0) + val;
    }
  });

  // Convert sums to percentage of total
  // e.g., for a pie chart [ { variable: "...", percentage: ... }, ... ]
  const variablePercentages = Object.entries(sumsByVariable).map(([variable, sum]) => {
    const percentage = (sum / total) * 100;
    return {
      variable,
      percentage,
    };
  });

  return {
    count: values.length,
    average,  // numeric; use toFixed(2) or similar in the UI
    min,
    max,
    total,
    variablePercentages,
  };
}


export {
  filterDataByCountry,
  filterDataByYear,
  filterDataByCountryAndYear,
  filterAndGroupDataByCountry,
  computeNumericStats
};

