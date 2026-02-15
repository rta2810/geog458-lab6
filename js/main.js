mapboxgl.accessToken = 'pk.eyJ1IjoidHllYW5razQ2NyIsImEiOiJjbWt0NzM2aXMxMTl0M2VvZDhxNGg1cGJiIn0.6KyP80qDn6aZnqlm5xg1Hw';

const map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/mapbox/light-v11',
    center: [-98, 39],
    zoom: 3
});

async function geojsonFetch() {
    let response, data;
    try {
        response = await fetch('assets/national_parks.geojson');
        if (!response.ok) throw new Error('Network response was not ok');
        data = await response.json();
    } catch (error) {
        console.error("Could not load data:", error);
        return;
    }

    map.on('load', () => {
        map.addSource('parks', {
            type: 'geojson',
            data: data
        });

        map.addLayer({
            id: 'park-circles',
            type: 'circle',
            source: 'parks',
            paint: {
                'circle-radius': ['interpolate', ['linear'], ['get', 'visitors'], 3000000, 8, 13000000, 35],
                'circle-color': ['match', ['get', 'region'], 'West', '#3498db', 'Southwest', '#e67e22', 'Southeast', '#2ecc71', 'Northeast', '#9b59b6', '#999'],
                'circle-opacity': 0.75,
                'circle-stroke-width': 1,
                'circle-stroke-color': '#fff'
            }
        });

        updateDashboard(data);

        map.on('moveend', () => {
            const features = map.queryRenderedFeatures({ layers: ['park-circles'] });
            if (features) {
                updateDashboard({ features: features });
            }
        });

        map.on('click', 'park-circles', (e) => {
            const props = e.features[0].properties;
            const coordinates = e.features[0].geometry.coordinates.slice();
            new mapboxgl.Popup()
                .setLngLat(coordinates)
                .setHTML(`<strong>${props.title}</strong><br>Region: ${props.region}<br>Visitors: ${props.visitors.toLocaleString()}`)
                .addTo(map);
        });

        map.on('mouseenter', 'park-circles', () => map.getCanvas().style.cursor = 'pointer');
        map.on('mouseleave', 'park-circles', () => map.getCanvas().style.cursor = '');
    });
}

function updateDashboard(data) {
    const features = data.features;
    const totalVisitors = features.reduce((sum, f) => sum + f.properties.visitors, 0);
    document.getElementById('total-visitors').innerText = totalVisitors.toLocaleString();

    const regionCounts = {};
    features.forEach(f => {
        const r = f.properties.region;
        regionCounts[r] = (regionCounts[r] || 0) + 1;
    });

    if (Object.keys(regionCounts).length === 0) regionCounts['No Data'] = 1;

    c3.generate({
        bindto: '#region-chart',
        data: { columns: Object.entries(regionCounts), type: 'donut' },
        donut: { title: "Regions" },
        color: { pattern: ['#3498db', '#e67e22', '#2ecc71', '#9b59b6'] }
    });

    const parkNames = features.map(f => f.properties.title);
    const parkAcres = features.map(f => f.properties.acres);
    
    c3.generate({
        bindto: '#acres-chart',
        data: {
            x: 'x',
            columns: [['x', ...parkNames], ['Acres', ...parkAcres]],
            type: 'bar',
            colors: { Acres: '#34495e' }
        },
        axis: { x: { type: 'category', tick: { rotate: 75, multiline: false } } },
        legend: { show: false }
    });
}

geojsonFetch();
