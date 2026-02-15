
mapboxgl.accessToken = 'pk.eyJ1IjoidHllYW5razQ2NyIsImEiOiJjbWxuODFnOTEwNGVlM3Bvb2hidTIwcDIwIn0.smfm-P_KFkIcp1Psc-cdUA';

const map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/mapbox/light-v11',
    center: [-98, 39],
    zoom: 3
});

async function init() {
    try {
        const response = await fetch('assets/national_parks.geojson');
        const data = await response.json();
        
        // Load Dashboard
        updateDashboard(data);
        
        // Load Map Layers
        map.on('load', () => {
            map.addSource('parks', { type: 'geojson', data: data });
            
            map.addLayer({
                id: 'park-circles',
                type: 'circle',
                source: 'parks',
                paint: {
                    'circle-radius': ['interpolate', ['linear'], ['get', 'visitors'], 3000000, 8, 13000000, 35],
                    'circle-color': ['match', ['get', 'region'], 
                        'West', '#3498db', 
                        'Southwest', '#e67e22', 
                        'Southeast', '#2ecc71', 
                        'Northeast', '#9b59b6', 
                        '#999'],
                    'circle-opacity': 0.75,
                    'circle-stroke-width': 1,
                    'circle-stroke-color': '#fff'
                }
            });
            
            map.on('click', 'park-circles', (e) => {
                const p = e.features[0].properties;
                new mapboxgl.Popup()
                    .setLngLat(e.features[0].geometry.coordinates)
                    .setHTML(`<strong>${p.title}</strong><br>Visitors: ${p.visitors.toLocaleString()}<br>${p.description}`)
                    .addTo(map);
            });
            
            map.on('mouseenter', 'park-circles', () => map.getCanvas().style.cursor = 'pointer');
            map.on('mouseleave', 'park-circles', () => map.getCanvas().style.cursor = '');
        });
    } catch (err) {
        console.error("Error loading GeoJSON:", err);
    }
}

function updateDashboard(data) {
    const f = data.features;
    document.getElementById('total-visitors').innerText = f.reduce((s, x) => s + x.properties.visitors, 0).toLocaleString();
    
    // Region Chart
    const rCounts = {};
    f.forEach(x => rCounts[x.properties.region] = (rCounts[x.properties.region]||0)+1);
    c3.generate({
        bindto: '#region-chart',
        data: { columns: Object.entries(rCounts), type: 'donut' },
        color: { pattern: ['#3498db', '#e67e22', '#2ecc71', '#9b59b6'] },
        donut: { title: "Regions" }
    });
    
    // Acres Chart
    c3.generate({
        bindto: '#acres-chart',
        data: {
            x: 'x',
            columns: [
                ['x', ...f.map(i => i.properties.title)],
                ['Acres', ...f.map(i => i.properties.acres)]
            ],
            type: 'bar',
            colors: { Acres: '#34495e' }
        },
        axis: { x: { type: 'category', tick: { rotate: 75, multiline: false } } },
        legend: { show: false }
    });
}

init();
