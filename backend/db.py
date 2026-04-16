"""
db.py
─────
Handles MongoDB connection and sets up the users collection.
"""
import os
from pymongo import MongoClient
from dotenv import load_dotenv

# Load environment variables (MONGO_URI)
load_dotenv()

# Connect to MongoDB Atlas
MONGO_URI = os.getenv("MONGO_URI", "mongodb://localhost:27017/")
client = MongoClient(MONGO_URI)

# Select Database and Collection
db = client["smart_interview_db"]
users_collection = db["users"]

# Ensure unique emails at the database level to prevent duplicate signups
try:
    users_collection.create_index("email", unique=True)
    print("[DB] Connected to MongoDB and verified unique email index.")
except Exception as e:
    print(f"[DB] Error connecting to MongoDB: {e}")