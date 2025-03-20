import os
import datetime
import psycopg2
import logging
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Define database credentials based on environment
DATABASE_NAME = os.getenv("DATABASE_NAME")
DATABASE_HOST = os.getenv("DATABASE_HOST")
DATABASE_USER = os.getenv("DATABASE_USER")
DATABASE_PASSWORD = os.getenv("DATABASE_PASSWORD")
DATABASE_PORT = os.getenv("DATABASE_PORT")

# Configure logging
LOG_FILE = "delete_old_ping_results.log"
logging.basicConfig(
    filename=LOG_FILE,
    level=logging.INFO,
    format="%(asctime)s - %(levelname)s - %(message)s"
)

# Compute the timestamp for three months ago
three_months_ago = (datetime.datetime.utcnow() -
                    datetime.timedelta(days=90)).isoformat()

# Delete query


def delete_old_entries():
    try:
        # Connect to PostgreSQL
        connection = psycopg2.connect(
            dbname=DATABASE_NAME,
            user=DATABASE_USER,
            password=DATABASE_PASSWORD,
            host=DATABASE_HOST,
            port=DATABASE_PORT
        )
        cursor = connection.cursor()

        # Execute delete query
        delete_query = """
            DELETE FROM ping_results 
            WHERE ping_at_datetime < %s
        """
        cursor.execute(delete_query, (three_months_ago,))

        # Commit and close
        connection.commit()
        deleted_rows = cursor.rowcount
        cursor.close()
        connection.close()

        logging.info(f"Deleted {deleted_rows} old ping result entries.")
    except Exception as e:
        logging.error(f"Error deleting old entries: {e}")


if __name__ == "__main__":
    delete_old_entries()
