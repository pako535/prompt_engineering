from flask import Flask, request, jsonify
from datetime import datetime
from flask_cors import CORS
import sqlite3

# Path to your local database file
db_file = 'mydatabase.db'

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

@app.route('/public_transport/city/<city>/closest_departures', methods=['GET'])
def closest_departures(city):
    start_coordinates = request.args.get('start_coordinates')
    end_coordinates = request.args.get('end_coordinates')
    start_time = request.args.get('start_time')
    limit = request.args.get('limit', default=5, type=int)

    missing = []
    if not start_coordinates:
        missing.append('start_coordinates')
    if not end_coordinates:
        missing.append('end_coordinates')
    if not start_time:
        missing.append('start_time')
    if missing:
        return jsonify({'error': f'Missing required parameters: {", ".join(missing)}'}), 400

    try:
        start_lat, start_lon = map(float, start_coordinates.split(','))
        end_lat, end_lon = map(float, end_coordinates.split(','))
    except Exception:
        return jsonify({'error': 'Invalid coordinates format. Use lat,lon.'}), 400

    try:
        start_time_dt = datetime.fromisoformat(start_time.replace('Z', '+00:00'))
    except Exception:
        return jsonify({'error': 'Invalid start_time format. Use ISO8601 format.'}), 400

    response = {
    "metadata": {
        "self": "/public_transport/city/Wroclaw/closest_departures?start_coordinates=51.1079,17.0385&amp;end_coordinates=51.1141,17.0301&amp;start_time=2025-04-02T08:30:00Z&amp;limit=3",
        "city": "Wroclaw",
        "query_parameters": {
            "start_coordinates": "51.1079,17.0385",
            "end_coordinates": "51.1141,17.0301",
            "start_time": "2025-04-02T08:30:00Z",
            "limit": 3
        }
    },
    "departures": [
        {
            "trip_id": "3_14613060",
            "route_id": "BACKEND_A",
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
            "trip_id": "3_14613109",
            "route_id": "BX",
            "trip_headsign": "Dworzec Główny",
            "stop": {
                "name": "Renoma",
                "coordinates": {
                    "latitude": 51.1140,
                    "longitude": 17.0285
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

    return jsonify(response)

@app.route('/public_transport/city/<city>/trip/<trip_id>', methods=['GET'])
def trip_details(city, trip_id):

    json_str={
        "metadata": {
            "self": "/public_transport/city/Wroclaw/trip/3_14613060",
            "city": "Wroclaw",
            "query_parameters": {
                "trip_id": "3_14613060"
            }
        },
        "trip_details": {
            "trip_id": "3_14613060",
            "route_id": "A",
            "trip_headsign": "KRZYKI",
            "stops": [
                {
                    "name": "Plac Grunwaldzki",
                    "coordinates": {
                        "latitude": 51.1092,
                        "longitude": 17.0415
                    },
                    "arrival_time": "2025-04-02T08:34:00Z",
                    "departure_time": "2025-04-02T08:35:00Z"
                },
                {
                    "name": "Renoma",
                    "coordinates": {
                        "latitude": 51.1040,
                        "longitude": 17.0280
                    },
                    "arrival_time": "2025-04-02T08:39:00Z",
                    "departure_time": "2025-04-02T08:40:00Z"
                },
                {
                    "name": "Dominikański",
                    "coordinates": {
                        "latitude": 51.1099,
                        "longitude": 17.0335
                    },
                    "arrival_time": "2025-04-02T08:44:00Z",
                    "departure_time": "2025-04-02T08:45:00Z"
                }
            ]
        }
    }


    return jsonify(json_str)

if __name__ == '__main__':
    app.run(debug=True)