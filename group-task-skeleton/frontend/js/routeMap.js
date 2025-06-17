class RouteMap {
  constructor() {
    this.defaultCenter = [51.107883, 17.038538]; // Wrocław centrum
    this.map = L.map('map').setView(this.defaultCenter, 13);
    this.startMarker = null;
    this.endMarker = null;
    this.routeLine = null;
    this.clickCount = 0;
    this.busStopMarkers = [];
    this.routeLines = [];

    // Inicjalizacja mapy
    this.initMap();
    // Pobieranie elementów DOM
    this.initDomElements();
    // Dodawanie event listenerów
    this.initEventListeners();
  }

  initMap() {
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(this.map);
  }

  initDomElements() {
    this.startLatInput = document.getElementById('startLat');
    this.startLngInput = document.getElementById('startLng');
    this.startTimeInput = document.getElementById('startTime');
    this.endLatInput = document.getElementById('endLat');
    this.endLngInput = document.getElementById('endLng');
    this.clearBtn = document.getElementById('clearBtn');
    this.testRouteBtn = document.getElementById('testRouteBtn');
    
    // Set default start time to current time
    const now = new Date();
    const localDatetime = new Date(now.getTime() - now.getTimezoneOffset() * 60000)
      .toISOString()
      .slice(0, 16);
    this.startTimeInput.value = localDatetime;
  }

  initEventListeners() {
    // Obsługa kliknięć na mapie
    this.map.on('click', (e) => this.handleMapClick(e));

    // Obsługa zmian w inputach
    const inputs = [this.startLatInput, this.startLngInput, this.endLatInput, this.endLngInput];
    inputs.forEach(input => input.addEventListener('change', () => this.handleInputChange()));
    
    // Obsługa zmiany czasu
    this.startTimeInput.addEventListener('change', () => this.handleTimeChange());

    // Obsługa przycisku czyszczenia
    this.clearBtn.addEventListener('click', () => this.clearAll());
    
    // Obsługa przycisku testowej trasy
    this.testRouteBtn.addEventListener('click', () => this.showTestRoute());
  }

  handleMapClick(e) {
    const { lat, lng } = e.latlng;

    if (this.clickCount === 0) {
      this.updateStartMarker(lat, lng);
      this.clickCount = 1;
    } else if (this.clickCount === 1) {
      this.updateEndMarker(lat, lng);
      this.clickCount = 2;
    } else {
      this.clearAll();
      this.clickCount = 0;
    }
  }

  updateStartMarker(lat, lng) {
    if (this.startMarker) {
      this.startMarker.setLatLng([lat, lng]);
      this.startMarker.setPopupContent(`Start: ${this.formatTime(this.startTimeInput.value)}`);
    } else {
      this.startMarker = this.createMarker([lat, lng], `Start: ${this.formatTime(this.startTimeInput.value)}`, (e) => {
        const pos = e.target.getLatLng();
        this.setInputValues(this.startLatInput, this.startLngInput, pos.lat, pos.lng);
        this.updateRouteLine();
      });
    }
    this.setInputValues(this.startLatInput, this.startLngInput, lat, lng);
    this.updateRouteLine();
  }

  updateEndMarker(lat, lng) {
    if (this.endMarker) {
      this.endMarker.setLatLng([lat, lng]);
      this.endMarker.setPopupContent(`Koniec (Start: ${this.formatTime(this.startTimeInput.value)})`);
    } else {
      this.endMarker = this.createMarker([lat, lng], `Koniec (Start: ${this.formatTime(this.startTimeInput.value)})`, (e) => {
        const pos = e.target.getLatLng();
        this.setInputValues(this.endLatInput, this.endLngInput, pos.lat, pos.lng);
        this.updateRouteLine();
      });
    }
    this.setInputValues(this.endLatInput, this.endLngInput, lat, lng);
    this.updateRouteLine();
  }

  createMarker(coords, popupText, dragendCallback) {
    const marker = L.marker(coords, { draggable: true })
      .addTo(this.map)
      .bindPopup(popupText)
      .openPopup();

    marker.on('dragend', dragendCallback);
    return marker;
  }

  updateRouteLine() {
    if (this.routeLine) {
      this.map.removeLayer(this.routeLine);
      this.routeLine = null;
    }

    if (this.startMarker && this.endMarker) {
      this.routeLine = L.polyline(
        [this.startMarker.getLatLng(), this.endMarker.getLatLng()],
        { color: 'blue' }
      ).addTo(this.map);

      // Dopasuj widok mapy do obu punktów
      const group = new L.featureGroup([this.startMarker, this.endMarker]);
      this.map.fitBounds(group.getBounds().pad(0.5));
    }
  }

  setInputValues(latInput, lngInput, lat, lng) {
    latInput.value = lat.toFixed(5);
    lngInput.value = lng.toFixed(5);
  }

  parseCoord(val) {
    const num = parseFloat(val);
    return isNaN(num) ? null : num;
  }

  handleInputChange() {
    const sLat = this.parseCoord(this.startLatInput.value);
    const sLng = this.parseCoord(this.startLngInput.value);
    const eLat = this.parseCoord(this.endLatInput.value);
    const eLng = this.parseCoord(this.endLngInput.value);

    if (sLat !== null && sLng !== null) {
      this.updateStartMarker(sLat, sLng);
    }

    if (eLat !== null && eLng !== null) {
      this.updateEndMarker(eLat, eLng);
    }
  }
  
  handleTimeChange() {
    if (this.startMarker) {
      this.startMarker.setPopupContent(`Start: ${this.formatTime(this.startTimeInput.value)}`);
    }
    if (this.endMarker) {
      this.endMarker.setPopupContent(`Koniec (Start: ${this.formatTime(this.startTimeInput.value)})`);
    }
  }
  
  formatTime(datetimeStr) {
    if (!datetimeStr) return '';
    const dt = new Date(datetimeStr);
    return dt.toLocaleString();
  }

  clearAll() {
    if (this.startMarker) {
      this.map.removeLayer(this.startMarker);
      this.startMarker = null;
    }

    if (this.endMarker) {
      this.map.removeLayer(this.endMarker);
      this.endMarker = null;
    }

    if (this.routeLine) {
      this.map.removeLayer(this.routeLine);
      this.routeLine = null;
    }
    
    // Clear bus stop markers and route lines
    this.clearBusStops();
    this.clearRouteLines();

    [this.startLatInput, this.startLngInput, this.endLatInput, this.endLngInput]
      .forEach(input => input.value = '');
      
    // Reset start time to current time
    const now = new Date();
    const localDatetime = new Date(now.getTime() - now.getTimezoneOffset() * 60000)
      .toISOString()
      .slice(0, 16);
    this.startTimeInput.value = localDatetime;

    this.clickCount = 0;
  }
  
  clearBusStops() {
    this.busStopMarkers.forEach(marker => this.map.removeLayer(marker));
    this.busStopMarkers = [];
  }
  
  clearRouteLines() {
    this.routeLines.forEach(line => this.map.removeLayer(line));
    this.routeLines = [];
  }
  
  drawRouteLine(data) {
    // Clear existing route lines
    this.clearRouteLines();
    
    // Extract bus stop coordinates in the order they appear in the data
    const busStopCoords = data.departures.map(departure => {
      const { latitude, longitude } = departure.stop.coordinates;
      return [latitude, longitude];
    });
    
    // Draw a single polyline connecting all bus stops
    if (busStopCoords.length > 1) {
      const line = L.polyline(busStopCoords, { 
        color: '#e74c3c',
        weight: 4,
        opacity: 0.8
      }).addTo(this.map);
      
      this.routeLines.push(line);
    }
  }
  
  showTestRoute() {
    // Set example coordinates from the JSON data
    const startCoords = busData.metadata.query_parameters.start_coordinates.split(',');
    const endCoords = busData.metadata.query_parameters.end_coordinates.split(',');
    
    // Set start time from the JSON data
    const startTime = busData.metadata.query_parameters.start_time;
    const localStartTime = new Date(startTime);
    this.startTimeInput.value = localStartTime.toISOString().slice(0, 16);
    
    // Update markers
    this.updateStartMarker(parseFloat(startCoords[0]), parseFloat(startCoords[1]));
    this.updateEndMarker(parseFloat(endCoords[0]), parseFloat(endCoords[1]));
    
    // Render bus stops
    this.renderBusStops(busData);
    
    // Draw route line between all stops
    this.drawRouteLine(busData);
  }
  
  renderBusStops(data) {
    // Clear existing bus stop markers
    this.clearBusStops();
    
    // Create a bus icon using the image
    const busIcon = L.icon({
      iconUrl: 'image/bus_stop_icon.png',
      iconSize: [32, 32],
      iconAnchor: [16, 16],
      popupAnchor: [0, -16]
    });
    
    // Add markers for each bus stop
    data.departures.forEach(departure => {
      const { latitude, longitude } = departure.stop.coordinates;
      
      const marker = L.marker([latitude, longitude], { icon: busIcon })
        .addTo(this.map)
        .bindPopup(`
          <b>${departure.stop.name}</b><br>
          Linia: ${departure.route_id}<br>
          Kierunek: ${departure.trip_headsign}<br>
          Odjazd: ${new Date(departure.stop.departure_time).toLocaleTimeString()}
        `);
      
      this.busStopMarkers.push(marker);
    });
    
    // Adjust map view to include all markers
    const allMarkers = [...this.busStopMarkers];
    if (this.startMarker) allMarkers.push(this.startMarker);
    if (this.endMarker) allMarkers.push(this.endMarker);
    
    if (allMarkers.length > 0) {
      const group = new L.featureGroup(allMarkers);
      this.map.fitBounds(group.getBounds().pad(0.5));
    }
  }
}

// Inicjalizacja aplikacji po załadowaniu strony
document.addEventListener('DOMContentLoaded', () => {
  // Store the RouteMap instance globally so it can be accessed from other scripts
  window.routeMapInstance = new RouteMap();
});