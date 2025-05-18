from random import randint
from datetime import datetime, timedelta
from pymongo import MongoClient
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from passlib.context import CryptContext
from jose import jwt
import requests
import certifi

# ================================
# App & CORS Setup
# ================================
app = FastAPI()

origins = [
    "http://localhost:5173",
    "http://localhost:3000",
    "http://localhost",
    "https://a638-158-108-228-212.ngrok-free.app",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ================================
# MongoDB Setup
# ================================
MONGODB_URI = "mongodb+srv://mmixprm:*Mixzas1570123@cluster0.vdeuo.mongodb.net/smart_locker?retryWrites=true&w=majority"
client = MongoClient(MONGODB_URI, tlsCAFile=certifi.where())
db = client['test']
collection = db['users']

# ================================
# Password Hashing & JWT
# ================================
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
SECRET_KEY = "your-very-secret-key"
ALGORITHM = "HS256"

# ================================
# Models
# ================================
class LoginRequest(BaseModel):
    email: str
    password: str

class LockerStatus(BaseModel):
    locker_status: str  # "locked" or "unlocked"

# ================================
# Utils
# ================================
def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)

def get_user_phone(username: str):
    user = collection.find_one({"username": username})
    return user.get("phone") if user else None

# ================================
# Locker State
# ================================
lockers = {
    "hot": {
        "pin": None,
        "expiration": datetime.now(),
        "status": "free",
        "assignedUser": None
    },
    "cold": {
        "pin": None,
        "expiration": datetime.now(),
        "status": "free",
        "assignedUser": None
    },
}

def generate_pin(locker_type):
    pin = str(randint(100000, 999999))
    lockers[locker_type]["pin"] = pin
    lockers[locker_type]["expiration"] = datetime.now() + timedelta(minutes=1)

# ================================
# Auth Endpoint
# ================================
@app.post("/api/login")
async def login(request: LoginRequest):
    email = request.email
    password = request.password

    user = collection.find_one({"email": email})
    if not user:
        raise HTTPException(status_code=400, detail="Invalid email or password")

    if not verify_password(password, user["password"]):
        raise HTTPException(status_code=400, detail="Invalid email or password")

    token_data = {"sub": user["email"]}
    token = jwt.encode(token_data, SECRET_KEY, algorithm=ALGORITHM)

    return {
        "token": token,
        "username": user["username"]
    }

# ================================
# Locker + PIN Handling
# ================================
@app.get("/api/pin")
def get_pin(locker_type: str):
    if locker_type not in lockers:
        raise HTTPException(status_code=400, detail="Invalid locker type")
    
    if datetime.now() >= lockers[locker_type]["expiration"]:
        generate_pin(locker_type)
    
    username = lockers[locker_type].get("assignedUser")
    if not username:
        raise HTTPException(status_code=400, detail="Locker not booked or username missing")
    
    return {
        "locker_type": locker_type,
        "pin": lockers[locker_type]["pin"],
        "username": username
    }

@app.get("/api/locker")
def get_locker_status():
    return {
        "hot": lockers["hot"]["status"],
        "cold": lockers["cold"]["status"]
    }

@app.post("/api/locker")
async def set_locker(request: dict):
    locker_type = request.get("locker_type")
    username = request.get("username")
    
    if locker_type not in lockers:
        raise HTTPException(status_code=400, detail="Invalid locker type")

    if lockers[locker_type]["status"] == "booked":
        raise HTTPException(status_code=400, detail=f"Locker {locker_type} is already booked.")

    lockers[locker_type]["status"] = "booked"
    lockers[locker_type]["assignedUser"] = username

    generate_pin(locker_type)

    # Send to Raspberry Pi
    try:
        pi_url = "https://5387-158-108-230-237.ngrok-free.app/api/pin"
        response = requests.post(pi_url, json={"username": username, "locker_type": locker_type})
        if response.status_code == 200:
            print("Successfully sent username to Raspberry Pi.")
        else:
            print("Failed to send username to Raspberry Pi.")
    except requests.exceptions.RequestException as e:
        print("Error while sending to Raspberry Pi:", e)

    return {
        "locker": locker_type,
        "status": "booked",
        "assignedUser": username,
        "pin": lockers[locker_type]["pin"]
    }

@app.post("/api/free_locker")
async def free_locker(request: dict):
    locker_type = request.get("locker_type")
    if locker_type not in lockers:
        raise HTTPException(status_code=400, detail="Invalid locker type")

    lockers[locker_type]["status"] = "free"
    lockers[locker_type]["assignedUser"] = None
    lockers[locker_type]["pin"] = None
    return {"locker": locker_type, "status": "free"}

@app.post("/api/reset_lockers")
async def reset_lockers():
    for locker in lockers:
        lockers[locker]["status"] = "free"
        lockers[locker]["assignedUser"] = None
        lockers[locker]["pin"] = None
    return {"message": "All lockers have been reset to 'free' status."}

@app.post("/api/locker_status")
async def update_locker_status(status: LockerStatus):
    print(f"Locker status updated to: {status.locker_status}")
    return {"message": f"Locker status updated to {status.locker_status}"}

@app.get("/get_phone/{username}")
async def get_phone(username: str):
    phone_number = get_user_phone(username)
    if not phone_number:
        raise HTTPException(status_code=404, detail="User not found or phone number missing.")
    return {"phone": phone_number}
