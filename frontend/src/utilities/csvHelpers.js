// csvHelpers.js
  


export const validateColumnMappings = (csvColumnMappings, csvHeaders) => {
  const missingColumns = Object.entries(csvColumnMappings).filter(
    ([key, columnName]) => columnName && !csvHeaders.includes(columnName)
  ).map(([key]) => key);

  return missingColumns;
};

export const processCSVData = (result, csvColumnMappings, currentRowNumber, updateRowNumber, setCurrentData, setMappingData, remapValue) => {
  let localRowNumber = currentRowNumber;
  let sharedMap = {}; 
  let subjectTrialCounts = {}; 

  const filteredData = result.data.filter(row => row[csvColumnMappings.condition] !== null && row[csvColumnMappings.condition] !== '');

  const processedData = filteredData.map(row => {
    const subjectNumber = row[csvColumnMappings.subject];
    if (!subjectTrialCounts[subjectNumber]) {
      subjectTrialCounts[subjectNumber] = 1;
    } else {
      subjectTrialCounts[subjectNumber] += 1;
    }

    const dataObject = {
      rowNum: `${subjectNumber}-${subjectTrialCounts[subjectNumber]}`,
      subject: subjectNumber,
      condition: row[csvColumnMappings.condition],
      stimulus: remapValue(row[csvColumnMappings.stimulus], sharedMap),
      response: remapValue(row[csvColumnMappings.response], sharedMap),
    };

    localRowNumber += 1;
    return dataObject;
  });

  updateRowNumber(localRowNumber);
  setCurrentData(processedData);
  setMappingData({ sharedMap });
};

export const remapValue = (value, valueMap) => {
  // Check if the value is 'None' and skip mapping
  if (value === 'None') {
    return null;
  }

  // mapping non-'None' values
  if (!(value in valueMap)) {
    if (Object.keys(valueMap).length >= 2) {
      throw new Error("Too many values for stimulus/response. The value map should not have more than 2 unique values.");
    }
    valueMap[value] = Object.keys(valueMap).length;
  }
  return valueMap[value];
};
