from loguru import logger
from public_transport_api.database_utils import execute_query_from_file
from src.public_transport_api.database_utils import execute_query_from_file
import pandas as pd
import pytest
import sqlite3
import tempfile
import unittest

class TestDatabaseUtils:

    def test_execute_query_from_file_1(self):
        """
        Test that execute_query_from_file correctly reads a SQL query from a file,
        executes it using the provided SQLite connection, and returns the result
        as a pandas DataFrame.
        """
        # Create a temporary SQLite database in memory
        conn = sqlite3.connect(':memory:')
        cursor = conn.cursor()

        # Create a sample table and insert some data
        cursor.execute('''
            CREATE TABLE test_table (
                id INTEGER PRIMARY KEY,
                name TEXT
            )
        ''')
        cursor.executemany('INSERT INTO test_table (name) VALUES (?)',
                           [('Alice',), ('Bob',), ('Charlie',)])
        conn.commit()

        # Create a temporary file with a SQL query
        with tempfile.NamedTemporaryFile(mode='w', delete=False, suffix='.sql') as temp_file:
            temp_file.write('SELECT * FROM test_table')
            query_file_path = temp_file.name

        # Execute the query using the function under test
        result_df = execute_query_from_file(conn, query_file_path)

        # Assert that the result is a pandas DataFrame
        assert isinstance(result_df, pd.DataFrame)

        # Assert that the DataFrame contains the expected data
        expected_data = pd.DataFrame({
            'id': [1, 2, 3],
            'name': ['Alice', 'Bob', 'Charlie']
        })
        pd.testing.assert_frame_equal(result_df, expected_data)

        # Clean up
        conn.close()

    def test_execute_query_from_file_nonexistent_file(self):
        """
        Test that execute_query_from_file raises a FileNotFoundError when given a non-existent file path.
        """
        conn = sqlite3.connect(':memory:')
        with self.assertRaises(FileNotFoundError):
            execute_query_from_file(conn, 'nonexistent_file.sql')

    def test_execute_query_from_file_sqlite_error(self):
        """
        Test that execute_query_from_file raises a sqlite3.Error when there's an issue with the SQL query.
        """
        conn = sqlite3.connect(':memory:')
        with open('invalid_query.sql', 'w') as f:
            f.write('INVALID SQL QUERY')

        with self.assertRaises(sqlite3.Error):
            execute_query_from_file(conn, 'invalid_query.sql')
