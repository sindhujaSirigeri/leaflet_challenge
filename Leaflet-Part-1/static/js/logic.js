// Create the map
let map = L.map('map').setView([37.7749, -122.4194], 5);

// Add a tile layer
let streetMap = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
}).addTo(map);

// Add a topographic tile layer
let topoMap = L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
    attribution: 'Map data: &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, <a href="http://viewfinderpanoramas.org">SRTM</a> | Map style: &copy; <a href="https://opentopomap.org">OpenTopoMap</a> (<a href="https://creativecommons.org/licenses/by-sa/3.0/">CC-BY-SA</a>)'
});

// Fetch the earthquake data
let earthquakeUrl = 'https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson';

let earthquakes = new L.LayerGroup();

d3.json(earthquakeUrl).then(function(data) {
    function getColor(depth) {
        return depth > 90 ? '#d73027' :
               depth > 70 ? '#fc8d59' :
               depth > 50 ? '#fee08b' :
               depth > 30 ? '#d9ef8b' :
               depth > 10 ? '#91cf60' :
                            '#1a9850';
    }

    function getRadius(magnitude) {
        return magnitude * 4;
    }

    function style(feature) {
        return {
            fillColor: getColor(feature.geometry.coordinates[2]),
            weight: 1,
            opacity: 1,
            color: '#000000',
            fillOpacity: 0.8,
            radius: getRadius(feature.properties.mag)
        };
    }

    function onEachFeature(feature, layer) {
        layer.bindPopup(`<h3>${feature.properties.place}</h3><hr><p>Magnitude: ${feature.properties.mag}<br>Depth: ${feature.geometry.coordinates[2]}</p>`);
    }

    L.geoJson(data, {
        pointToLayer: function (feature, latlng) {
            return L.circleMarker(latlng);
        },
        style: style,
        onEachFeature: onEachFeature
    }).addTo(earthquakes);

    earthquakes.addTo(map);

    // Add a legend to the map
    let legend = L.control({position: 'bottomright'});

    legend.onAdd = function () {
        let div = L.DomUtil.create('div', 'info legend'),
            grades = [-10, 10, 30, 50, 70, 90],
            labels = [];

        div.innerHTML += '<h4>Depth</h4>';

        for (let i = 0; i < grades.length; i++) {
            div.innerHTML +=
                '<i style="background:' + getColor(grades[i] + 1) + '"></i> ' +
                grades[i] + (grades[i + 1] ? '&ndash;' + grades[i + 1] + '<br>' : '+');
        }

        return div;
    };

    legend.addTo(map);
});

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
        "Earthquakes": earthquakes,
        "Tectonic Plates": tectonicPlates
    };

    L.control.layers(baseMaps, overlayMaps, {
        collapsed: false
    }).addTo(map);
});
