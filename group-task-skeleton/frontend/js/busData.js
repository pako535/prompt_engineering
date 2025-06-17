// Example bus data
const busData = {
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
      "trip_id": "3_14613222",
      "route_id": "B",
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
    },
    {
      "trip_id": "3_14613109",
      "route_id": "C",
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
    }
  ]
};