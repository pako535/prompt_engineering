import sqlite3
from loguru import logger

import pandas as pd

def execute_query_from_file(conn, query_file_path):
    """
    Executes an SQL query from a file using the given SQLite connection
    and returns the result as a pandas DataFrame.

    Parameters:
    - conn (sqlite3.Connection): An active SQLite database connection.
    - query_file_path (str): Path to the file containing the SQL query.

    Returns:
    - pd.DataFrame: Query result as a DataFrame.
    """
    try:
        # Read SQL query from file
        with open(query_file_path, 'r') as file:
            query = file.read()

        # Use pandas to execute the query and return a DataFrame
        df = pd.read_sql_query(query, conn)
        return df

    except FileNotFoundError:
        logger.info("Query file not found.")
        raise

    except sqlite3.Error as e:
        logger.info(f"SQLite error: {e}")
        raise
