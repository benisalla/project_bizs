import * as d3 from 'd3';

const filterWaterDataByCountry = (countryName, waterData) => {
  if (!countryName || !waterData || waterData.length === 0) {
    return [];
  }

  const filteredData = waterData.filter(row => row.UnifiedName === countryName);
  return filteredData;
};

const filterPupulationDataByCountry = (countryName, populationData) => {
  if (!countryName || !populationData || populationData.length === 0) {
    return [];
  }

  const filteredData = populationData.filter(row => row.UnifiedName === countryName);
  return filteredData;
};

const filterWaterDataByYear = (year, waterData) => {
  if (!year || !waterData || waterData.length === 0) {
    return [];
  }

  const filteredData = waterData.filter(row => row.Year === year);

  return filteredData;
};

const filterWaterDataByCountryAndYear = (countryName, year, waterData) => {
  if (!countryName || !year || !waterData || waterData.length === 0) {
    return [];
  }

  const filteredData = waterData.filter(row => row.UnifiedName === countryName && row.Year === year);

  return filteredData;
};

// const groupWaterDataByYear = (data) => {
//   const groupedData = d3.rollups(
//     data,
//     v => d3.sum(v, d => parseFloat(d.Value)),
//     d => d.Year
//   )
//     .map(([Year, TotalValue]) => ({ Year, TotalValue }))
//     .sort((a, b) => a.Year - b.Year);
//   return groupedData;
// };


const groupWaterDataByYear = (data) => {
  const grouped = d3.rollups(
    data,
    (v) => {
      const common = (({ Area, IsAggregate, Subgroup, Symbol, UnifiedName, Unit, type, VariableGroup }) =>
        ({ Area, IsAggregate, Subgroup, Symbol, UnifiedName, Unit, type, VariableGroup }))(v[0]);

      const result = { Year: v[0].Year, TotalValue: 0, ...common };

      v.forEach(d => {
        const variable = d.Variable;
        const value = parseFloat(d.Value);
        result.TotalValue += value;
        result[variable] = (result[variable] || 0) + value;
      });
      return result;
    },
    d => d.Year
  )
    .map(([Year, obj]) => obj)
    .sort((a, b) => a.Year - b.Year);

  return grouped;
};


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
  const average = total / values.length;
  const min = Math.min(...values);
  const max = Math.max(...values);

  // Group sums by "Variable"
  const sumsByVariable = {};
  data.forEach(row => {
    const varName = row.Variable;
    const val = parseFloat(row.Value);
    if (!isNaN(val)) {
      sumsByVariable[varName] = (sumsByVariable[varName] || 0) + val;
    }
  });

  // Convert sums to percentage of total
  const variablePercentages = Object.entries(sumsByVariable).map(([variable, sum]) => {
    const percentage = (sum / total) * 100;
    return {
      variable,
      percentage,
    };
  });

  return {
    count: values.length,
    average,
    min,
    max,
    total,
    variablePercentages,
  };
}


export {
  filterWaterDataByCountry,
  filterWaterDataByYear,
  filterWaterDataByCountryAndYear,
  groupWaterDataByYear,
  computeNumericStats,
  filterPupulationDataByCountry
};

