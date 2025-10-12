import Papa from 'papaparse';

function isAnyAttributeNull (object) {
    for (const key in object) {
        if (object[key] === null || object[key] === "") {
        return true;
        }
    }
    return false;
};

function checkAttributeNull (attr) {
    return attr === null || attr === "";
}

function formatFileSize(size) {
    if (size === null || isNaN(size)) return 'Unknown';
    if (size < 1024) return size + ' Bytes';
    if (size < 1024 * 1024) return (size / 1024).toFixed(2) + ' KB';
    if (size < 1024 * 1024 * 1024) return (size / (1024 * 1024)).toFixed(2) + ' MB';
    return (size / (1024 * 1024 * 1024)).toFixed(2) + ' GB';
}

function getFileExtension(fileName) {
    return fileName.split('.').pop().toLowerCase();
};

function readCSV(file) {
    return new Promise((resolve, reject) => {
      Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        complete: function (results) {
          const rowsArray = [];
          const valuesArray = [];
  
          results.data.forEach((d) => {
            rowsArray.push(Object.keys(d));
            valuesArray.push(Object.values(d));
          });
  
          const parsedData = results.data;
          const tableRows = rowsArray[0];
          const values = valuesArray;
  
          resolve({ parsedData, tableRows, values });
        },
        error: function (error) {
          reject(error);
        },
      });
    });
}  

function classNames(...classes) {
  return classes.filter(Boolean).join(' ')
}

function formatEta(eta) {
  const date = new Date(eta);
  
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');

  return `${hours}:${minutes} ${day}-${month}-${year}`;
}

function formatTravelTime(minutes) {
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = Math.round(minutes % 60);
  if (hours == 0) {
    return `${remainingMinutes} Menit`;
  }
  return `${hours} Jam ${remainingMinutes} Menit`;
}

function formatTravelDistance(distance) {
  const distanceInKm = Math.round(distance / 1000);
  return `${distanceInKm} KM`;
}

export {isAnyAttributeNull, checkAttributeNull, formatFileSize, getFileExtension, readCSV, classNames, formatEta, formatTravelDistance, formatTravelTime};