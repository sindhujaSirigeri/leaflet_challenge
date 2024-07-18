// Create the map
let map = L.map('map', {
    center: [37.7749, -122.4194],
    zoom: 5
});

// Add a street tile layer
let streetMap = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
}).addTo(map);

// Add a topographic tile layer
let topoMap = L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
    attribution: 'Map data: &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, <a href="http://viewfinderpanoramas.org">SRTM</a> | Map style: &copy; <a href="https://opentopomap.org">OpenTopoMap</a> (<a href="https://creativecommons.org/licenses/by-sa/3.0/">CC-BY-SA</a>)'
});

// Fetch the earthquake data
let earthquakeUrl = 'https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson';

let heatArray = [];

d3.json(earthquakeUrl).then(function(data) {
    data.features.forEach(function(feature) {
        let coordinates = feature.geometry.coordinates;
        let lat = coordinates[1];
        let lng = coordinates[0];
        let magnitude = feature.properties.mag * 10;
        heatArray.push([lat, lng, magnitude]);
    });

   // Create a heatmap layer with custom gradient and max value
   let heat = L.heatLayer(heatArray, {
    radius: 25,
    maxZoom: 17,
    max: 100,
    scaleRadius : true,
    gradient: {
        0.0: '#0066ff',  // Bright blue
        0.4: '#00ffcc',  // Bright cyan
        0.6: '#ccff00',  // Bright yellow-green
        0.8: '#ff9900',  // Bright orange
        1.0: '#ff0000'   // Bright red
    }
}).addTo(map);

    // Fetch the tectonic plates data
    let tectonicPlatesLink = "https://raw.githubusercontent.com/fraxen/tectonicplates/master/GeoJSON/PB2002_boundaries.json";

    let tectonicPlates = new L.LayerGroup();

    d3.json(tectonicPlatesLink).then(function(data) {
        L.geoJson(data, {
            style: function(feature) {
                return {
                    color: "Black",
                    weight: 2
                };
            }
        }).addTo(tectonicPlates);

        tectonicPlates.addTo(map);

        // Add layer control
        let baseMaps = {
            "Street Map": streetMap,
            "Topographic Map": topoMap
        };

        let overlayMaps = {
            "Heatmap": heat,
            "Tectonic Plates": tectonicPlates
        };

        L.control.layers(baseMaps, overlayMaps, {
            collapsed: false
        }).addTo(map);
    });
});
