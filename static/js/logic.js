function fetchData() {
  fetch('/api/listings')
      .then(response => response.json())
      .then(data => {
          if (data.length > 0) {
              // Assuming the first item in 'data' contains column names
              columnHeaders = Object.keys(data[0]);
              
              // Create a string with column headers
              columnHeaderString = columnHeaders.join(', ');
              
              // Display column headers in the specified div
              sampleMetadataDiv = document.getElementById('sample-metadata');
              sampleMetadataDiv.textContent = columnHeaderString;
          } else {
              console.log('No data found.');
          }
      })
}

// Call the fetchData function when the page loads
window.onload = fetchData;