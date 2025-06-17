/**
 * Wysyła dane podróży do backendu
 * @param {string} departureTime - czas odjazdu w formacie "hh:mm:ss"
 * @param {{ lat: number, lon: number }} startPoint - punkt odjazdu
 * @param {{ lat: number, lon: number }} endPoint - punkt przyjazdu
 */
async function sendTripData(departureTime, startPoint, endPoint) {
  const apiUrl = 'http://localhost:5000/public_transport/city/Wroclaw/closest_departures?start_coordinates=51.1079,17.0385&end_coordinates=51.1141,17.0301&start_time=2025-04-02T08:30:00Z&limit=5'; // <- zmień na właściwy endpoint backendu

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

  try {
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      throw new Error(`Błąd HTTP: ${response.status}`);
    }

    const result = await response.json();
    console.log('Odpowiedź z backendu:', result);
    return result;
  } catch (error) {
    console.error('Błąd podczas wysyłania danych:', error);
    throw error;
  }
}
