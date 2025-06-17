from flask import Flask
from flask import Flask, jsonify
from flask.testing import FlaskClient
from public_transport_api.main import app
from src.public_transport_api.main import app
from src.public_transport_api.main import app, trip_details
from unittest.mock import patch, MagicMock
import pytest
import unittest

class TestMain:

    def test_closest_departures_1(self):
        """
        Tests the closest_departures function when all required parameters are missing.

        This test verifies that the function returns a 400 error with a message
        listing all the missing required parameters when no parameters are provided.
        """
        with app.test_client() as client:
            response = client.get('/public_transport/city/TestCity/closest_departures')
            assert response.status_code == 400
            assert response.get_json() == {'error': 'Missing required parameters: start_coordinates, end_coordinates, start_time'}

    def test_closest_departures_4(self):
        """
        Tests the closest_departures function when start_coordinates and end_coordinates are missing,
        but start_time is provided. Expects a 400 error with a message listing the missing parameters.
        """
        client = FlaskClient(app)
        response = client.get('/public_transport/city/TestCity/closest_departures?start_time=2023-05-01T12:00:00Z')

        assert response.status_code == 400
        assert response.json == {'error': 'Missing required parameters: start_coordinates, end_coordinates'}

    def test_closest_departures_5(self):
        """
        Test case for closest_departures function when coordinates are provided but in an invalid format.

        This test verifies that the function returns a 400 error with an appropriate error message
        when the start_coordinates and end_coordinates are provided but not in the correct format.
        """
        with app.test_client() as client:
            response = client.get('/public_transport/city/TestCity/closest_departures?start_coordinates=invalid&end_coordinates=invalid&start_time=2023-05-01T12:00:00Z')

            assert response.status_code == 400
            assert response.get_json() == {'error': 'Invalid coordinates format. Use lat,lon.'}

    def test_closest_departures_invalid_coordinates(self):
        """
        Test the closest_departures function with invalid coordinate format.
        This test verifies that the function properly handles and reports errors
        when the coordinates are not in the expected 'lat,lon' format.
        """
        client = app.test_client()
        response = client.get('/public_transport/city/TestCity/closest_departures?start_coordinates=invalid&end_coordinates=invalid&start_time=2023-01-01T00:00:00Z')
        assert response.status_code == 400
        assert b'Invalid coordinates format. Use lat,lon.' in response.data

    def test_closest_departures_invalid_start_time(self):
        """
        Test the closest_departures function with invalid start_time format.
        This test ensures that the function correctly handles and reports errors
        when the start_time is not in the expected ISO8601 format.
        """
        client = app.test_client()
        response = client.get('/public_transport/city/TestCity/closest_departures?start_coordinates=51.1092,17.0415&end_coordinates=51.1099,17.0335&start_time=invalid')
        assert response.status_code == 400
        assert b'Invalid start_time format. Use ISO8601 format.' in response.data

    def test_closest_departures_missing_parameters(self):
        """
        Test the closest_departures function when some required parameters are missing.

        This test checks that the function correctly handles the case where
        start_coordinates is provided, but end_coordinates and start_time are missing.
        It should return a 400 error with a message listing the missing parameters.
        """
        with app.test_client() as client:
            response = client.get('/public_transport/city/TestCity/closest_departures?start_coordinates=51.1079,17.0385')

            assert response.status_code == 400
            data = response.get_json()
            assert 'error' in data
            assert 'Missing required parameters: end_coordinates, start_time' in data['error']

    def test_closest_departures_missing_parameters_2(self):
        """
        Test the closest_departures function with missing required parameters.
        This test checks if the function correctly handles the case when one or more
        required parameters (start_coordinates, end_coordinates, start_time) are missing.
        """
        client = app.test_client()
        response = client.get('/public_transport/city/TestCity/closest_departures')
        assert response.status_code == 400
        assert b'Missing required parameters: start_coordinates, end_coordinates, start_time' in response.data

    def test_closest_departures_missing_start_coordinates_and_start_time(self):
        """
        Test the closest_departures function when start_coordinates and start_time are missing.

        This test verifies that the function returns a 400 error with the correct error message
        when the required parameters start_coordinates and start_time are not provided.
        """
        with app.test_client() as client:
            response = client.get('/public_transport/city/TestCity/closest_departures?end_coordinates=51.1,17.0')
            assert response.status_code == 400
            assert response.get_json() == {'error': 'Missing required parameters: start_coordinates, start_time'}

    def test_trip_details_1(self):
        """
        Test that trip_details function returns correct JSON response for a given city and trip_id.

        This test verifies:
        1. The route '/public_transport/city/<city>/trip/<trip_id>' responds to GET requests
        2. The response is in JSON format
        3. The response contains a 'trip' key with correct trip details
        4. The trip details include correct city and trip_id values
        """
        with app.test_client() as client:
            response = client.get('/public_transport/city/TestCity/trip/3_14613060')
            assert response.status_code == 200
            data = response.get_json()

            assert 'trip' in data
            trip = data['trip']
            assert trip['city'] == 'TestCity'
            assert trip['trip_id'] == '3_14613060'
            assert 'route_id' in trip
            assert 'departure_time' in trip
            assert 'arrival_time' in trip
            assert 'status' in trip

    def test_trip_details_empty_city(self):
        """
        Test the trip_details function with an empty city parameter.
        This test checks that the function handles an empty city string
        without raising an exception and includes it in the response.
        """
        with app.test_client() as client:
            response = client.get('/public_transport/city//trip/123')
            self.assertEqual(response.status_code, 200)
            data = response.get_json()
            self.assertIn('trip', data)
            self.assertEqual(data['trip']['city'], '')
            self.assertEqual(data['trip']['trip_id'], '123')

    def test_trip_details_invalid_trip_id(self):
        """
        Test the trip_details function with an invalid trip_id.
        This test verifies that when an invalid trip_id is provided,
        the function still returns a response without raising an exception.
        """
        with app.test_client() as client:
            response = client.get('/public_transport/city/TestCity/trip/invalid_id')
            self.assertEqual(response.status_code, 200)
            data = response.get_json()
            self.assertIn('trip', data)
            self.assertEqual(data['trip']['trip_id'], 'invalid_id')
            self.assertEqual(data['trip']['city'], 'TestCity')
