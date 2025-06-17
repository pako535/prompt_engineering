/**
 * Wysyła dane podróży do backendu
 * @param {string} departureTime - czas odjazdu w formacie "hh:mm:ss"
 * @param {{ lat: number, lon: number }} startPoint - punkt odjazdu
 * @param {{ lat: number, lon: number }} endPoint - punkt przyjazdu
 */
async function sendTripData(departureTime, startPoint, endPoint) {
  const apiUrl = 'http://localhost:5000/public_transport/city/Wroclaw/closest_departures?start_coordinates=51.1079,17.0385&end_coordinates=51.1141,17.0301&start_time=2025-04-02T08:30:00Z&limit=5'; // <- zmień na właściwy endpoint backendu
  const mockResponse = {
  "metadata": {
    "self": "/public_transport/city/Wroclaw/closest_departures?start_coordinates=51.1090,17.0410&amp;end_coordinates=51.1045,17.0285&amp;start_time=2025-04-02T08:30:00Z&amp;limit=3",
    "city": "Wroclaw",
    "query_parameters": {
      "start_coordinates": "51.1090,17.0410",
      "end_coordinates": "51.1045,17.0285",
      "start_time": "2025-04-02T08:30:00Z",
      "limit": 3
    }
  },
  "departures": [
    {
      "trip_id": "3_14613060",
      "route_id": "A",
      "trip_headsign": "KOSZAROWA (Szpital)",
      "stop": {
        "name": "Plac Grunwaldzki",
        "coordinates": {
          "latitude": 51.1092,
          "longitude": 17.0415
        },
        "arrival_time": "2025-04-02T08:34:00Z",
        "departure_time": "2025-04-02T08:35:00Z"
      }
    },
    {
      "trip_id": "3_14613109",
      "route_id": "B",
      "trip_headsign": "Dworzec Główny",
      "stop": {
        "name": "Renoma",
        "coordinates": {
          "latitude": 51.1040,
          "longitude": 17.0280
        },
        "arrival_time": "2025-04-02T08:39:00Z",
        "departure_time": "2025-04-02T08:40:00Z"
      }
    },
    {
      "trip_id": "3_14613222",
      "route_id": "C",
      "trip_headsign": "Klecina",
      "stop": {
        "name": "Dominikański",
        "coordinates": {
          "latitude": 51.1099,
          "longitude": 17.0335
        },
        "arrival_time": "2025-04-02T08:44:00Z",
        "departure_time": "2025-04-02T08:45:00Z"
      }
    }
  ]
}

document.getElementById('sendBtn').addEventListener('click', () => {
  const startLat = parseFloat(document.getElementById('startLat').value);
  const startLng = parseFloat(document.getElementById('startLng').value);
  const endLat = parseFloat(document.getElementById('endLat').value);
  const endLng = parseFloat(document.getElementById('endLng').value);
  const departureTime = document.getElementById('startTime').value;

  if (isNaN(startLat) || isNaN(startLng) || isNaN(endLat) || isNaN(endLng) || !departureTime) {
    alert('Uzupełnij wszystkie pola poprawnie.');
    return;
  }

  const payload = {
    departure_time: departureTime,
    start_location: {
      latitude: startPoint.lat.toFixed(5),
      longitude: startPoint.lon.toFixed(5)
    },
    end_location: {
      latitude: endPoint.lat.toFixed(5),
      longitude: endPoint.lon.toFixed(5)
    }
  };

//  try {
//    const response = await fetch(apiUrl, {
//      method: 'POST',
//      headers: {
//        'Content-Type': 'application/json'
//      },
//      body: JSON.stringify(payload)
//    });

//    if (!response.ok) {
//      throw new Error(`Błąd HTTP: ${response.status}`);
//    }


    const data = await response.json();
    console.log('Odpowiedź z backendu:', data);
    renderStopsToList(data.trip_details.stops);
    return data;
    //const result = await response.json();
    //console.log('Odpowiedź z backendu:', result);
    //return result;
  } catch (error) {
    console.error('Błąd podczas wysyłania danych:', error);
    throw error;
  }
}

function handleTripResponse(response) {
  const { metadata, trip_details } = response;

  console.log(`Miasto: ${metadata.city}`);
  console.log(`ID trasy: ${trip_details.trip_id}`);
  console.log(`Kierunek: ${trip_details.trip_headsign}`);
  console.log(`Liczba przystanków: ${trip_details.stops.length}`);

  trip_details.stops.forEach((stop, index) => {
    console.log(`\nPrzystanek ${index + 1}: ${stop.name}`);
    console.log(`  Lokalizacja: ${stop.coordinates.latitude}, ${stop.coordinates.longitude}`);
    console.log(`  Przyjazd: ${new Date(stop.arrival_time).toLocaleTimeString()}`);
    console.log(`  Odjazd: ${new Date(stop.departure_time).toLocaleTimeString()}`);
  });
}

function renderStopsToList(stops) {
  const list = document.getElementById('stop-list');
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
  const map = L.map('map').setView([stops[0].coordinates.latitude, stops[0].coordinates.longitude], 13);

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; OpenStreetMap contributors'
  }).addTo(map);

  stops.forEach((stop, index) => {
    const { latitude, longitude } = stop.coordinates;
    L.marker([latitude, longitude])
      .addTo(map)
      .bindPopup(`<strong>${stop.name}</strong><br>Przyjazd: ${new Date(stop.arrival_time).toLocaleTimeString()}`);
  });

  const latlngs = stops.map(stop => [stop.coordinates.latitude, stop.coordinates.longitude]);
  L.polyline(latlngs, { color: 'blue' }).addTo(map);
}

