// define globals
let map; // main map
let neighborhoodsLayer; // polygons of neighborhoods
let listingsData; // to reload marker popups in neighborhood view

// call for data from server
fetch("/api/listings")
  .then((response) => response.json())
  .then((data) => {
    listingsData = data;
    [dcMeanPrice, dcMedianPrice] = calculateDCStats(data);
    fetch("/static/resources/neighbourhoods.geojson")
      .then((response) => response.json())
      .then((neighborhoodData) => {
        createMap(createMarkers(data), neighborhoodData);
      });
  });

// main map creation
function createMap(airbnbs, neighborhoods) {
  // initialize map
  map = L.map("map-id", {
    center: [38.89511, -77.03637],
    zoom: 12,
  });

  // add baseLayer
  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution:
      '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
  }).addTo(map);

  // initialize neighborhoodLayer
  neighborhoodsLayer = L.geoJSON(neighborhoods, {
    style: {
      // opacity: 0,
      color: "blue",
      weight: 3,
    },
  });

  // add markers
  airbnbs.addTo(map);

  // call function to manage user interaction with neighborhoods
  neighborhoodsControl(map, neighborhoods);

  // create info box
  let infoBox = L.control({ position: "bottomleft" });

  infoBox.onAdd = function (map) {
    let div = L.DomUtil.create("div", "info legend neighborhood-info");
    div.innerHTML =
      "Welcome to the map" +
      "Choose a neighborhood for a closer look" +
      "Each AirBnB has a marker that shows summary information" +
      "When you return to this view, summary stats for all of DC will appear here";
    return div;
  };

  infoBox.addTo(map);

  // resize map to current container size
  map.invalidateSize();
}

// marker creation and settings
function createMarkers(data) {
  // empty marker layer
  markers = L.layerGroup();

  // marker design
  markerOptions = {
    radius: 2,
    fillColor: "red",
    color: "black",
    weight: 1,
    fillOpacity: 1,
  };

  // loop to populate markers
  data.forEach((listing) => {
    let marker = L.circleMarker(
      [listing.latitude, listing.longitude],
      markerOptions
    );

    // marker info popups
    marker.bindPopup(listing.hover_description, { className: "marker-popup" });

    // boolean to track if a popup is open
    let popupOpen = false;

    // open popup on mouseover
    marker.on("mouseover", (e) => marker.openPopup());

    // close popup on mouseout
    marker.on("mouseout", (e) => {
      if (!popupOpen) {
        marker.closePopup();
      }
    });

    // open popup on click
    marker.on("click", (e) => {
      if (popupOpen) {
        marker.closePopup();
      } else {
        marker.openPopup();
      }
      //toggle popupOpen boolean
      popupOpen = !popupOpen;
    });

    markers.addLayer(marker);
  });

  return markers;
}

// create dropdown for neighborhood interaction
function neighborhoodsControl(map, neighborhoodsInfo) {
  //  initialize and position neighborhoodControl
  let neighborhoodControl = L.control({ position: "topright" });

  // create box and text for dropdown
  neighborhoodControl.onAdd = function (map) {
    let div = L.DomUtil.create("div", "info legend neighborhood-control");
    div.innerHTML =
      '<div class="control-header">' +
      '<label for="neighborhoods-dropdown">Select a Neighborhood</label>' +
      "<br>" +
      '<select id="neighborhoods-dropdown"></select>';
    return div;
  };

  neighborhoodControl.addTo(map);

  dropdown = document.getElementById("neighborhoods-dropdown");

  // set first dropdown choice for initial map view
  let allDC = document.createElement("option");
  allDC.text = "Washington, D.C.";
  allDC.value = "top";
  dropdown.appendChild(allDC);

  // populate dropdown menu with neighborhoods
  neighborhoodsInfo.features.forEach((feature) => {
    names = feature.properties.neighbourhood;
    option = document.createElement("option");
    option.text = names;
    option.value = names;
    dropdown.appendChild(option);
  });

  // changes view to user's selection
  dropdown.addEventListener("change", function () {
    selectedNeighborhood = this.value;

    if (selectedNeighborhood === "top") {
      map.setView([38.89511, -77.03637], 12);
      // neighborhoodsLayer is on when zoomed in
      map.removeLayer(neighborhoodsLayer);
      // update infoBox for all DC
      dcInfoBox();
    } else {
      zoomIn(selectedNeighborhood);
    }
  });
}

// handles neighborhood view
function zoomIn(neighborhoodDesignation) {
  // initialize boundaries first, or it won't zoom
  let boundaries;

  // remove any boundaries from prior calls of zoomIn()
  neighborhoodsLayer.resetStyle(boundaries);

  // get borders of selected neighborhood
  boundaries = neighborhoodsLayer
    .getLayers()
    .find(
      (layer) =>
        layer.feature.properties.neighbourhood === neighborhoodDesignation
    );

  // transparent boundary removes neighborhoodsLayer opacity from selected neighborhood
  // the contrast makes the neighborhood stand out
  boundaries.setStyle({
    weight: 3,
    color: "transparent",
  });

  // zoom in on selected neighborhood
  map.fitBounds(boundaries.getBounds());

  // add neighborhoodsLayer for contrast
  neighborhoodsLayer.addTo(map);

  // reload marker popups
  newMarkers = createMarkers(listingsData);
  newMarkers.addTo(map);
  
  updateInfoBox(neighborhoodDesignation);
}

// infoBox for all of DC
function dcInfoBox() {
  let infoBoxElement = document.querySelector(".neighborhood-info");

  infoBoxElement.innerHTML = "";
  
  infoBoxElement.innerHTML = `<strong>Washington, D.C.</strong><br>
  Number of AirBnB's: ${listingsData.length}<br>
  Mean Price: $${dcMeanPrice.toFixed(2)}<br>
  Median Price: $${dcMedianPrice.toFixed(2)}<br>`;

  // remove any boundaries from prior calls of zoomIn()
  neighborhoodsLayer.resetStyle(boundaries);
}

// changes infoBox summary for neighborhoods
function updateInfoBox(neighborhoodDesignation) {

  // filter to selected neighborhood
  let neighborhoodListings = listingsData.filter(
    (listing) => listing.neighbourhood_cleansed === neighborhoodDesignation
  );
  
  // Find the info box element
  let infoBoxElement = document.querySelector(".neighborhood-info");

  // Update the content of the info box for neighborhoods
  if (infoBoxElement) {
    meanPrice = neighborhoodListings.reduce((sum, listing) => sum + parseFloat(listing.price), 0) / neighborhoodListings.length;
    medianPrice = calculateMedian(neighborhoodListings)

    infoBoxElement.innerHTML = 
    `<strong>${neighborhoodDesignation}</strong><br>
    Number of AirBnB's in Neighborhood: ${neighborhoodListings.length}
    <div id="infoBox-container">
        <div id="infoBox-price" class = "infoBox-chart"></div>
        <div id="infoBox-ratings" class = "infoBox-chart"></div>
      <select id="infoBox-selector">
        <option value="infoBox-price">Price</option>
        <option value="infoBox-ratings">Ratings</option>
      </select>
    </div>`;
    infoBoxPrice(neighborhoodDesignation);
    
    // neighborhood vs. DC price
    function infoBoxPrice(neighborhoodDesignation) {
      // to dynamically narrow y-axis to emphasize difference
      minRange = Math.min(meanPrice, medianPrice, dcMeanPrice, dcMedianPrice) - 20;
      maxRange = Math.max(meanPrice, medianPrice, dcMeanPrice, dcMedianPrice) + 20;

      trace = {
        x: ['Mean (Neighborhood)', 'Median (Neighborhood)', 'Mean (All of DC)', 'Median (All of DC)'],
        y: [meanPrice, medianPrice, dcMeanPrice, dcMedianPrice],
        type: 'bar',
        hovertemplate: '%{y:$,.2f}',
        marker: {
          color: ['blue', 'blue', 'red', 'red'],
          line: {
            color: 'black',
            width: 1,
          },
        },
      }

      layout = {
        xaxis: { tickangle: 45, },
        yaxis: { title: 'Price', range: [minRange, maxRange] },
      }

      Plotly.newPlot("infoBox-price", [trace], layout);
    }
  
  //   function infoBoxRatings(neighborhoodDesignation) {
  //     selectedHood = data.map(d => d.ratings === neighborhoodDesignation);
  //     selectedHoodPrices = data.map(d => d.mean);

  //     trace = {
  //       x: selectedHood,
  //       y: selectedHoodPrices,
  //       type: 'bar',
  //     }

  //     layout = {
  //       yaxis: 'Mean Price',
  //     }

  //     Plotly.newPlot("infoBox-ratings", [trace], layout);
  //   }

    infoBoxChange = document.getElementById('infoBox-selector')
    infoBoxChange.addEventListener('change', function() {
      chosenChart = infoBoxChange.value;
      document.querySelectorAll('.infoBox-chart').forEach(function (chart) {
        chart.style.display = 'none';
      });
      document.getElementById(chosenChart).style.display = 'block';
    });
  };
};

function calculateDCStats(data) {
  dcMeanPrice = listingsData.reduce((sum, listing) => sum + parseFloat(listing.price), 0) / listingsData.length;
  dcMedianPrice = calculateMedian(listingsData);
  return [dcMeanPrice, dcMedianPrice];
};

function calculateMedian(neighborhoodListings) {
  // create and sort array of prices
  prices = neighborhoodListings.map((listing) => parseFloat(listing.price));
  prices.sort((a, b) => a-b);

  // select midpoint - Math.floor to round down to an int, to get the index of the array
  mid = Math.floor(prices.length /2);
  if (prices.length % 2 === 0) {
    return (prices[mid - 1] + prices[mid]) / 2;
  } else {
    return prices[mid];
  }
}