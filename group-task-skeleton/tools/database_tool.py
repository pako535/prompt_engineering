import os
import sqlite3
import pandas as pd

# Path to the GTFS files folder
GTFS_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'OtwartyWroclaw_rozklad_jazdy_GTFS')
# Path to the target SQLite database
DB_PATH = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'trips.sqlite')

def infer_column_types(df: pd.DataFrame) -> list[tuple[str, str]]:
    """
    Infers SQLite column types for each column in the DataFrame.
    Returns a list of (column_name, column_type) tuples.
    """
    col_types = []
    for col in df.columns:
        sample = df[col].dropna()
        if sample.empty:
            col_types.append((col, 'TEXT'))
        elif pd.api.types.is_integer_dtype(sample):
            col_types.append((col, 'INTEGER'))
        elif pd.api.types.is_float_dtype(sample):
            col_types.append((col, 'REAL'))
        else:
            col_types.append((col, 'TEXT'))
    return col_types

def create_table(cursor: sqlite3.Cursor, table_name: str, col_types: list[tuple[str, str]]) -> None:
    """
    Drops the table if it exists and creates a new one with inferred column types.
    """
    cursor.execute(f'DROP TABLE IF EXISTS "{table_name}"')
    columns_sql = ', '.join([f'"{col}" {ctype}' for col, ctype in col_types])
    cursor.execute(f'CREATE TABLE "{table_name}" ({columns_sql})')

def import_gtfs_file(cursor: sqlite3.Cursor, conn: sqlite3.Connection, gtfs_dir: str, filename: str) -> None:
    """
    Imports a single GTFS file into the SQLite database.
    """
    file_path = os.path.join(gtfs_dir, filename)
    if not os.path.exists(file_path):
        print(f'File {filename} not found, skipping.')
        return
    table_name = os.path.splitext(filename)[0]
    df = pd.read_csv(file_path)
    col_types = infer_column_types(df)
    create_table(cursor, table_name, col_types)
    df.to_sql(table_name, conn, if_exists='append', index=False)
    print(f'Imported {filename} into table {table_name}')

def infer_and_import_gtfs(gtfs_dir: str = GTFS_DIR, db_path: str = DB_PATH) -> None:
    """
    Imports selected GTFS files into a SQLite database with inferred column types.
    """
    selected_files = ['stops.txt', 'stop_times.txt', 'trips.txt']
    with sqlite3.connect(db_path) as conn:
        cursor = conn.cursor()
        for filename in selected_files:
            import_gtfs_file(cursor, conn, gtfs_dir, filename)
        conn.commit()

if __name__ == '__main__':
    infer_and_import_gtfs()