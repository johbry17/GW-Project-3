function fetchData() {
    fetch('/api/reviews')
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
  
  // Define a function to create a chart for the best 10 listing with the most number of reviews by property
  function chart_property_type() {
      fetch('/api/listings_by_property_type')
          .then(response => response.json())
          .then(data => {
              if (data.length > 0) {
                  // Map property types and total number of reviews directly from the data
                  const propertytypes = data.map(item => item.property_type);
                  const number_reviws = data.map(item => item.toltal_number_reviws_by_type_property); // Correct property name
  
                  // Create a bar chart
                  const p = document.getElementById('property_type').getContext('2d');
                  const b = new Chart(p, {
                      type: 'bar',
                      data: {
                          labels: propertytypes,
                          datasets: [{
                              label: 'Number of Reviews',
                              data: number_reviws,
                              backgroundColor: 'rgba(255, 0, 0, 0.6)',
                              borderColor: 'rgba(255, 0, 0, 1)',
                              borderWidth: 1,
                          }],
                      },
                      options: {
                          maintainAspectRatio: false,
                          scales: {
                              y: {
                                  beginAtZero: true,
                              },
                          },
                      },
                  });
              } else {
                  console.log('No data found.');
              }
          });
  }
  // Call the chart_roperty_type function when the Document Object Model is loaded
  document.addEventListener('DOMContentLoaded', function () {
      chart_property_type();
  });
  
  function chart_by_neighbourhood() {
      fetch('/api/listings_by_neighborhood')
          .then(response => response.json())
          .then(data => {
              console.log('Data received:', data); // Debugging line
              
              if (data.length > 0) {
                  let neighborhoods = data.map(item => item.neighbourhood_cleansed);
                  let number_reviews = data.map(item => item.toltal_number_reviws_by_neighborhood);
                  
                  console.log('Neighborhoods:', neighborhoods); // Debugging line
                  console.log('Number Reviews:', number_reviews); // Debugging line
                  
                  // Get the canvas element
                  const canvas = document.getElementById('neighborhood');
  
                  if (canvas) {
                      // Check if there's an existing chart on this canvas and destroy it
                      if (canvas.chart) {
                          canvas.chart.destroy();
                      }
  
                      // Create a chart
                      const ctx = canvas.getContext('2d');
                      canvas.chart = new Chart(ctx, {
                          type: 'bar',
                          data: {
                              labels: neighborhoods,
                              datasets: [{
                                  label: 'Number of Listings',
                                  data: number_reviews,
                                  backgroundColor: 'rgba(75, 192, 192, 0.2)',
                                  borderColor: 'rgba(75, 192, 192, 1)',
                                  borderWidth: 1,
                              }],
                          },
                          options: {
                              maintainAspectRatio: false,
                              scales: {
                                  y: {
                                      beginAtZero: true,
                                  },
                              },
                          },
                      });
                  } else {
                      console.log('Canvas element not found.');
                  }
              } else {
                  console.log('No data found.');
              }
          });
  }
  
  
  // Call the chart_neighbourhood function when the Document Object Model is loaded
  document.addEventListener('DOMContentLoaded', function () {
      chart_by_neighbourhood() ;
  });
  
  
  