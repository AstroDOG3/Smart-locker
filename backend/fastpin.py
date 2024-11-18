from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from datetime import datetime, timedelta
import random

app = FastAPI()

# Configure CORS
origins = [
    "http://localhost:5173",  # Allow frontend from this origin
    "http://localhost",       # Also allow localhost if needed
    "http://localhost:3000",  # Add any other domains you want to allow
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,  # Allows all origins in the list above
    allow_credentials=True,
    allow_methods=["*"],    # Allows all methods (GET, POST, etc.)
    allow_headers=["*"],    # Allows all headers
)

current_pin = None
pin_expiration = datetime.now()

# Function to generate a new PIN
def generate_pin():
    global current_pin, pin_expiration
    current_pin = str(random.randint(100000, 999999))  # Generate a 6-digit PIN
    pin_expiration = datetime.now() + timedelta(minutes=1)

generate_pin()  # Initial PIN generation

@app.get("/api/pin")
def get_pin():
    # Check if the current PIN has expired and generate a new one if needed
    if datetime.now() >= pin_expiration:
        generate_pin()
    return {"pin": current_pin}
