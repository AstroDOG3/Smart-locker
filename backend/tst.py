import certifi
import requests
from pymongo import MongoClient

# Use certifi's certificate for secure connection
MONGODB_URI = "mongodb+srv://mmixprm:*Mixzas1570123@cluster0.vdeuo.mongodb.net/smart_locker?retryWrites=true&w=majority"
client = MongoClient(MONGODB_URI, tlsCAFile=certifi.where())

# Proceed with your database operations
db = client['test']
collection = db['users']

# Fetch the user from the MongoDB database
user = collection.find_one({"username": "johndoe"})

if user:
    print(f"Found user: {user}")
    
    # Extract the phone number from the user document
    phone_number = user.get("phone")

    if phone_number:
        # Send the phone number to the Raspberry Pi for validation
        raspberry_pi_url = "http://192.168.1.39:8000/validate_phone"  # Update this URL
        response = requests.post(raspberry_pi_url, json={"phone": phone_number})
        
        # Check the response from Raspberry Pi
        if response.status_code == 200:
            print("Phone number is correct.")
        else:
            print("Phone number validation failed.")
    else:
        print("Phone number not found in user data.")
else:
    print("User not found")
