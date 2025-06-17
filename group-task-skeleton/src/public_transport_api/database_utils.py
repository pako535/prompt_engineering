import sqlite3
from loguru import logger

import pandas as pd
import json

# Example DataFrame


def stops_list(group):
    return [
        {
            "name": row['stop_name'],
            "coordinates": {
                "latitude": row['stop_lat'],
                "longitude": row['stop_lon']
            },
            "arrival_time": row['arrival_time'],
            "departure_time": row['departure_time']
        }
        for _, row in group.iterrows()
    ]

def departures_json(df):
    result = []
    for (trip_id, route_id, trip_headsign), group in df.groupby(
            ['trip_id', 'route_id', 'trip_headsign']):
        trip = {
            "trip_details": {
                "trip_id": trip_id,
                "route_id": route_id,
                "trip_headsign": trip_headsign,
                "stops": stops_list(group)
            }
        }
        result.append(trip)
    json_str = json.dumps(result, indent=4, ensure_ascii=False)
    return json_str


def execute_query_from_file(conn, query_file_path, params=None):
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
        df = pd.read_sql_query(query, conn, params=params)
        return df

    except FileNotFoundError:
        logger.info("Query file not found.")
        raise

    except sqlite3.Error as e:
        logger.info(f"SQLite error: {e}")
        raise




if __name__ == '__main__':
    db_path = r'C:\Users\kdolata\PycharmProjects\prompt_engineering_group\group-task-skeleton\trips.sqlite'
    file_path = r'C:\Users\kdolata\PycharmProjects\prompt_engineering_group\group-task-skeleton\sql\select_trip_data.sql'

    parameters = {'trip_id': '3_14445093'}

    connection = sqlite3.connect(db_path)

    result = execute_query_from_file(
        conn=connection,
        query_file_path=file_path,
        params=parameters
    )

    json_departures = departures_json(result)
    print(1)