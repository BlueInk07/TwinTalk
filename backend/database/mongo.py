import os
from pathlib import Path

from pymongo import MongoClient
from dotenv import load_dotenv

load_dotenv(Path(__file__).resolve().parents[1] / ".env")

MONGO_URI = os.getenv("MONGO_URI")

if not MONGO_URI:
    raise RuntimeError("MONGO_URI environment variable is not set")

try:
    client = MongoClient(MONGO_URI, serverSelectionTimeoutMS=5000)
    client.admin.command('ping')
    print("MongoDB connected")
except Exception as e:
    print("MongoDB connection failed:", e)
    raise

db = client["twintalk"]
users_collection = db["users"]
chats_collection = db["chats"]
uploads_collection = db["uploads"]
questions_collection = db["questions"]
interviews_collection = db["interviews"]
reports_collection = db["reports"]
