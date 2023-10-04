document.addEventListener('DOMContentLoaded', function() {
    // initialize map
    let map = L.map('map-id', {
    center: [38.8951100, -77.0363700],
    zoom: 12,
    // layers: [baseLayer]
    });

    let baseLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);

    map.invalidateSize();
});
