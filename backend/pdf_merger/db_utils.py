import psycopg2
from dotenv import load_dotenv
import os

load_dotenv()

def get_db_connection():
    """Creates a connection to the PostgreSQL database."""
    conn = psycopg2.connect(os.getenv('DATABASE_URL'), sslmode='require')
    return conn
