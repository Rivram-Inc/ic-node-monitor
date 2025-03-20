import os
import datetime
import psycopg2
import logging
from dotenv import load_dotenv
from pathlib import Path

# Get the environment name
env = os.getenv("ENV", "default")

# Set up script directory and log file
script_dir = Path(__file__).resolve().parent
log_file = script_dir / f"{env}.delete_ping_results.log"
env_file = script_dir / f".env.{env}"

log_path = Path(log_file)
if not log_path.exists():
    log_path.touch()  # Create the file if it doesn't exist

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(levelname)s - %(message)s",
    handlers=[
        logging.FileHandler(log_file),  # Logs to a file
        # logging.StreamHandler()          # Logs to the console
    ]
)

# Load the environment-specific .env file
dotenv_path = Path(env_file)
if dotenv_path.exists():
    load_dotenv(dotenv_path)
    logging.info(f"Loaded environment variables from {env_file}")
else:
    logging.warning(f"Environment file {env_file} not found. Falling back to default environment variables.")

# Define database credentials based on environment
DATABASE_NAME = os.getenv("DATABASE_NAME")
DATABASE_HOST = os.getenv("DATABASE_HOST")
DATABASE_USER = os.getenv("DATABASE_USER")
DATABASE_PASSWORD = os.getenv("DATABASE_PASSWORD")
DATABASE_PORT = os.getenv("DATABASE_PORT")

# Compute the timestamp for three months ago
three_months_ago = (datetime.datetime.utcnow() - datetime.timedelta(days=90)).isoformat()

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
        logging.info(f"Deleted {deleted_rows} old ping result entries.")
    except Exception as e:
        logging.error(f"Error deleting old entries: {e}")

if __name__ == "__main__":
    delete_old_entries()
