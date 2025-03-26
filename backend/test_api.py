import certifi
from pymongo import MongoClient
from fastapi import FastAPI, HTTPException

app = FastAPI()

# Use certifi's certificate for secure connection
MONGODB_URI = "mongodb+srv://mmixprm:*Mixzas1570123@cluster0.vdeuo.mongodb.net/smart_locker?retryWrites=true&w=majority"
client = MongoClient(MONGODB_URI, tlsCAFile=certifi.where())

db = client['test']
collection = db['users']

def get_user_phone(username: str):
    user = collection.find_one({"username": username})
    return user.get("phone") if user else None

@app.get("/get_phone/{username}")
async def get_phone(username: str):
    phone_number = get_user_phone(username)
    if not phone_number:
        raise HTTPException(status_code=404, detail="User not found or phone number missing.")
    return {"phone": phone_number}
