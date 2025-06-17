/**
 * Wysyła dane podróży do backendu
 * @param {string} departureTime - czas odjazdu w formacie "hh:mm:ss"
 * @param {{ lat: number, lon: number }} startPoint - punkt odjazdu
 * @param {{ lat: number, lon: number }} endPoint - punkt przyjazdu
 */
async function sendTripData(departureTime, startPoint, endPoint) {
  try {
    // Format coordinates and time for the API call
    const startCoords = `${startPoint.lat.toFixed(5)},${startPoint.lon.toFixed(4)}`;
    const endCoords = `${endPoint.lat.toFixed(5)},${endPoint.lon.toFixed(4)}`;

    // Format the date in ISO format
    let startTime = departureTime;
    if (!startTime.endsWith('Z')) {
      // Convert local time to UTC ISO string
      const dt = new Date(departureTime);
      startTime = dt.toISOString();
    }

    // Build the API URL with query parameters
    const apiUrl = `http://localhost:5000/public_transport/city/Wroclaw/closest_departures?start_coordinates=${startCoords}&end_coordinates=${endCoords}&start_time=${startTime}&limit=5`;

    console.log('Calling API:', apiUrl);

    // Try to fetch data from the API
    let data;
    try {
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    if (response.status === 200) {
      const data = await response.json();
      renderStopsToList(data.trip_details.stops);
      renderStopsOnMap(data.trip_details.stops);
      return data;
    } else if (response.status === 400) {
      throw new Error('400 Bad Request: Nieprawidłowe dane wejściowe. Sprawdź format i wymagane parametry.');
    } else if (response.status === 404) {
      throw new Error('404 Not Found: Podane miasto nie jest obsługiwane.');
    } else if (response.status === 500) {
      throw new Error('500 Internal Server Error: Wystąpił błąd po stronie serwera.');
    } else {
      throw new Error(`Nieoczekiwany błąd: ${response.status}`);
    }

  } catch (error) {
    console.error('Błąd podczas wysyłania danych:', error.message);
    alert(`Wystąpił błąd: ${error.message}`);
    throw error;
  }
}


function handleTripResponse(response) {
  const { metadata, departures } = response;

  console.log(`Miasto: ${metadata.city}`);

  departures.forEach((departure, index) => {
    const stop = departure.stop;
    console.log(`\nPrzystanek ${index + 1}: ${stop.name}`);
    console.log(`  Linia: ${departure.route_id}`);
    console.log(`  Kierunek: ${departure.trip_headsign}`);
    console.log(`  Lokalizacja: ${stop.coordinates.latitude}, ${stop.coordinates.longitude}`);
    console.log(`  Przyjazd: ${new Date(stop.arrival_time).toLocaleTimeString()}`);
    console.log(`  Odjazd: ${new Date(stop.departure_time).toLocaleTimeString()}`);
  });
}

function renderStopsToList(stops) {
  const list = document.getElementById('stop-list');
  if (!list) return; // Check if element exists

  list.innerHTML = ''; // wyczyść poprzednią zawartość

  stops.forEach((stop, index) => {
    const li = document.createElement('li');
    li.innerHTML = `
      <strong>${index + 1}. ${stop.name}</strong><br>
        ${stop.coordinates.latitude.toFixed(5)}, ${stop.coordinates.longitude.toFixed(5)}<br>
        Przyjazd: ${new Date(stop.arrival_time).toLocaleTimeString()}<br>
        Odjazd: ${new Date(stop.departure_time).toLocaleTimeString()}
    `;
    list.appendChild(li);
  });
}

function renderStopsOnMap(stops) {
  // Get the existing map instance from the global RouteMap instance
  const mapInstance = window.routeMapInstance;

  if (!mapInstance || !mapInstance.map) {
    console.error('Map not initialized');
    return;
  }

  const map = mapInstance.map;

  // Clear existing bus stop markers
  mapInstance.clearBusStops();

  // Create a bus icon using the image
  const busIcon = L.icon({
    iconUrl: 'image/bus_stop_icon.png',
    iconSize: [32, 32],
    iconAnchor: [16, 16],
    popupAnchor: [0, -16]
  });

  // Add markers for each bus stop
  stops.forEach(stop => {
    const { latitude, longitude } = stop.coordinates;

    const marker = L.marker([latitude, longitude], { icon: busIcon })
      .addTo(map)
      .bindPopup(`
        <b>${stop.name}</b><br>
        Przyjazd: ${new Date(stop.arrival_time).toLocaleTimeString()}<br>
        Odjazd: ${new Date(stop.departure_time).toLocaleTimeString()}
      `);

    mapInstance.busStopMarkers.push(marker);
  });

  // Draw route line
  const latlngs = stops.map(stop => [stop.coordinates.latitude, stop.coordinates.longitude]);

  // Clear existing route lines
  mapInstance.clearRouteLines();

  // Add new route line
  const line = L.polyline(latlngs, {
    color: '#e74c3c',
    weight: 4,
    opacity: 0.8
  }).addTo(map);

  mapInstance.routeLines.push(line);

  // Adjust map view to include all markers
  const allMarkers = [...mapInstance.busStopMarkers];
  if (mapInstance.startMarker) allMarkers.push(mapInstance.startMarker);
  if (mapInstance.endMarker) allMarkers.push(mapInstance.endMarker);

  if (allMarkers.length > 0) {
    const group = new L.featureGroup(allMarkers);
    map.fitBounds(group.getBounds().pad(0.5));
  }
}

// Add event listener for the send button
document.addEventListener('DOMContentLoaded', () => {
  // Wait a bit to ensure RouteMap is initialized first
  setTimeout(() => {
    const sendBtn = document.getElementById('sendBtn');
    if (sendBtn) {
      sendBtn.addEventListener('click', () => {
        const mapInstance = window.routeMapInstance;

        // Check if start and end points are selected
        if (!mapInstance || !mapInstance.startMarker || !mapInstance.endMarker) {
          alert('Nie wybrano punktu startowego i końcowego');
          return;
        }

        // Get coordinates directly from markers for more accuracy
        const startPos = mapInstance.startMarker.getLatLng();
        const endPos = mapInstance.endMarker.getLatLng();
        const departureTime = document.getElementById('startTime').value;

        if (!departureTime) {
          alert('Wybierz czas rozpoczęcia podróży.');
          return;
        }

        const startPoint = { lat: startPos.lat, lon: startPos.lng };
        const endPoint = { lat: endPos.lat, lon: endPos.lng };

        sendTripData(departureTime, startPoint, endPoint);
      });
    }
  }, 100); // Small delay to ensure RouteMap is initialized
});