from fastapi import FastAPI, HTTPException, Depends, status
from pydantic import BaseModel
from typing import List
from jose import JWTError, jwt
import psycopg2
from psycopg2 import pool  # Connection pooling
import os
from datetime import datetime
from fastapi.security import OAuth2PasswordBearer

# FastAPI app initialization
app = FastAPI()

# JWT token configs: secret key and algorithm
ENV = os.getenv("ENVIRONMENT", "dev")
JWT_SECRET_KEY = os.getenv("JWT_SECRET_KEY")
ALGORITHM = os.getenv('ALGORITHM')

print(f'Environment: {ENV}')

# OAuth2 scheme for token extraction from Authorization header
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

# Define database credentials based on environment
DATABASE_NAME = os.getenv("DATABASE_NAME")
DATABASE_HOST = os.getenv("DATABASE_HOST")
DATABASE_USER = os.getenv("DATABASE_USER")
DATABASE_PASSWORD = os.getenv("DATABASE_PASSWORD")
DATABASE_PORT = os.getenv("DATABASE_PORT")


# Initialize connection pool (this can be done when the app starts)
db_pool = psycopg2.pool.SimpleConnectionPool(
    minconn=1,
    maxconn=50,  # Adjust max connections according to your app's traffic and database capacity
    dbname=DATABASE_NAME,
    user=DATABASE_USER,
    password=DATABASE_PASSWORD,
    host=DATABASE_HOST,
    port=DATABASE_PORT
)

# Get a connection from the pool


def get_db_connection():
    try:
        conn = db_pool.getconn()
        if conn is None:
            raise HTTPException(
                status_code=500, detail="Database connection failed")
        return conn
    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Database connection failed: {str(e)}")

# Release a connection back to the pool


def release_db_connection(conn):
    try:
        if conn:
            db_pool.putconn(conn)
    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Failed to release connection: {str(e)}")

# Token verification function


def verify_token(token: str = Depends(oauth2_scheme)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Invalid token",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        # TODO: verify the token
        # TODO: probe identification should be part of jwt token
        payload = jwt.decode(token, JWT_SECRET_KEY, algorithms=[ALGORITHM])
        return payload
    except JWTError:
        raise credentials_exception

# Structure of ping results


class PingResult(BaseModel):
    ip_address: str
    avg_rtt: float
    packets_sent: int
    packets_received: int
    packet_loss: float
    probe_name: str

# Endpoint to get nodes from the database


@app.get("/nodes/")
async def get_nodes(token: str = Depends(verify_token)):
    conn = get_db_connection()
    cursor = conn.cursor()

    try:
        cursor.execute('SELECT * FROM nodes;')
        nodes = cursor.fetchall()
        return {"nodes": nodes}

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

    finally:
        cursor.close()
        release_db_connection(conn)

# Endpoint to accept bulk ping results


@app.post("/ping_results/")
async def add_ping_results(ping_results: List[PingResult], token: str = Depends(verify_token)):
    conn = get_db_connection()
    cursor = conn.cursor()

    try:
        insert_query = '''
            INSERT INTO ping_results 
            (ip_address, avg_rtt, packets_sent, packets_received, packet_loss, probe_name, ping_at_datetime)
            VALUES (%s, %s, %s, %s, %s, %s, NOW())
        '''

        # Prepare data for bulk insert
        data_to_insert = [
            (
                result.ip_address,
                result.avg_rtt,
                result.packets_sent,
                result.packets_received,
                result.packet_loss,
                result.probe_name
            )
            for result in ping_results
        ]

        # Perform bulk insert
        cursor.executemany(insert_query, data_to_insert)
        conn.commit()

        return {"status": "success", "message": "Ping results inserted successfully"}

    except Exception as e:
        conn.rollback()
        raise HTTPException(status_code=500, detail=str(e))

    finally:
        cursor.close()
        release_db_connection(conn)
