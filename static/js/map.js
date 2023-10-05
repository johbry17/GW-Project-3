// // call for data from server
// fetch('/api/listings')
//     .then(response => response.json())
//     .then(data => {
//         createMap(createMarkers(data));
//     });


// // main map creation
// function createMap(airbnbs) {
//     // initialize map
//     let map = L.map('map-id', {
//     center: [38.8951100, -77.0363700],
//     zoom: 12,
//     // layers: [baseLayer]
//     });

//     let baseLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
//         attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
//     }).addTo(map);

//     airbnbs.addTo(map);

//     map.invalidateSize();
// };

// // marker creation and settings
// function createMarkers(data) {
//     // empty marker layer
//     let markers = L.layerGroup(); 

//     // loop to populate markers
//     data.forEach(listing => {
//         let marker = L.marker([listing.latitude, listing.longitude]);
//         markers.addLayer(marker);
//     });

//     return markers;
// };

//     // function to create markers
//     // color code by entire home/apt, private room, other
//     // toggle for with/without license to operate
//     // filter for neighborhood