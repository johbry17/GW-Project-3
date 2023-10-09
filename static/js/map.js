// const { radiansToLength } = require("@turf/helpers");

// define globals
let map; // main map
let neighborhoodsLayer; // polygons of neighborhoods
let listingsData; // to reload marker popups in neighborhood view

// call for data from server
fetch("/api/listings")
  .then((response) => response.json())
  .then((data) => {
    listingsData = data;
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

  // call function to control neighborhoods
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

// changes infoBox summary
function updateInfoBox(neighborhoodDesignation) {
  // Find the info box element
  let infoBoxElement = document.querySelector(".neighborhood-info");

  // Update the content of the info box
  if (infoBoxElement) {
    infoBoxElement.innerHTML = `This is ${neighborhoodDesignation}`;
  }
}

function dcInfoBox() {
  updateInfoBox("Washington, D.C.");
}

//   dynamic color markers
// (radio buttons?)
// price
// rating
// license

//   popups (listings., unless otherwise noted)
// description on hover over listing.simple summary
// price
// beds
// bathrooms_text
// hosts.host_name
//   host_name
//     host_about
//   host_identity_verified 
//   calculated_host_listings.calculated_host_listings_count
//     calculated_host_listings.calculated_host_listings_count_entire_homes
//     calculated_host_listings.calculated_host_listings_count_private_rooms
//     calculated_host_listings.calculated_host_listings_count_shared_rooms
//     (a subhover) 
// accommodates
// property_type
// listing_url (hover the actual url - call it pretty like google)
// neighborhood_cleansed
// license
// listing_reviews.review_scores_rating
//   review_scores_accuracy
//   review_scores_cleanliness
//   review_scores_checkin 
//   review_scores_communication 
//   review_scores_location 
//   reviews_per_month (?)
//   review_scores_value 


//   charts infoBox
// dc vs neighborhood max, min, median, mode
// price
// number of airbnbs (how many neighborhoods_cleansed are there?)
// property type
// ratings

// decide what to do with airbnbs that have no listing_description
// add a webpage to show EDA plots, w/ tooltip "click to expand", that expands to fullscreen
// scrape pretty url summary for listing in popup
// add data for entire calendar year, analyze for trends in price / availability

// remove node_modules from the directory 
// get ETL for building sql from Imen for repo records
// share new schema with Imen for listing_description