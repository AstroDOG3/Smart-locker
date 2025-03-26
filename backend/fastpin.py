import certifi
import random
from datetime import datetime, timedelta
from pymongo import MongoClient
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

app = FastAPI()

# CORS settings to allow requests from React frontend
origins = [
    "http://localhost:5173",  # React Vite dev server
    "http://localhost:3000",  # React CRA dev server
    "http://localhost",       # General localhost
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# MongoDB setup
MONGODB_URI = "mongodb+srv://mmixprm:*Mixzas1570123@cluster0.vdeuo.mongodb.net/smart_locker?retryWrites=true&w=majority"
client = MongoClient(MONGODB_URI, tlsCAFile=certifi.where())
db = client['test']
collection = db['users']

# Function to retrieve user's phone number
def get_user_phone(username: str):
    user = collection.find_one({"username": username})
    return user.get("phone") if user else None

@app.get("/get_phone/{username}")
async def get_phone(username: str):
    phone_number = get_user_phone(username)
    if not phone_number:
        raise HTTPException(status_code=404, detail="User not found or phone number missing.")
    return {"phone": phone_number}

# Global variables to store locker data
lockers = {
    "hot": {"pin": None, "expiration": datetime.now(), "status": "free"},
    "cold": {"pin": None, "expiration": datetime.now(), "status": "free"},
}

# Function to generate a 6-digit PIN for a locker
def generate_pin(locker_type):
    pin = str(random.randint(100000, 999999))
    lockers[locker_type]["pin"] = pin
    lockers[locker_type]["expiration"] = datetime.now() + timedelta(minutes=1)  # PIN valid for 1 minute

@app.get("/api/pin")
def get_pin(locker_type: str):
    if locker_type not in lockers:
        raise HTTPException(status_code=400, detail="Invalid locker type")
    
    if datetime.now() >= lockers[locker_type]["expiration"]:
        generate_pin(locker_type)
    
    return {"locker_type": locker_type, "pin": lockers[locker_type]["pin"]}

@app.post("/api/locker")
async def set_locker(request: dict):
    locker_type = request.get("locker_type")
    if locker_type not in lockers:
        return {"error": "Invalid locker type"}, 400
    if lockers[locker_type]["status"] == "booked":
        return {"error": f"Locker {locker_type} is already booked."}, 400
    lockers[locker_type]["status"] = "booked"
    return {"message": f"Locker {locker_type} booked successfully."}

@app.post("/api/free_locker")
async def free_locker(request: dict):
    locker_type = request.get("locker_type")
    if locker_type not in lockers:
        return {"error": "Invalid locker type"}, 400
    if lockers[locker_type]["status"] == "free":
        return {"error": f"Locker {locker_type} is already free."}, 400
    lockers[locker_type]["status"] = "free"
    return {"message": f"Locker {locker_type} is now free."}

@app.get("/api/locker")
def get_locker_status():
    return {
        "hot": lockers["hot"]["status"],
        "cold": lockers["cold"]["status"]
    }

class LockerStatus(BaseModel):
    locker_status: str  # Status: "locked" or "unlocked"

@app.post("/api/locker_status")
async def update_locker_status(status: LockerStatus):
    print(f"Locker status updated to: {status.locker_status}")
    return {"message": f"Locker status updated to {status.locker_status}"}

@app.post("/api/reset_lockers")
async def reset_lockers():
    for locker in lockers:
        lockers[locker]["status"] = "free"
        lockers[locker]["pin"] = None  # Reset PIN
    return {"message": "All lockers have been reset to 'free' status."}
