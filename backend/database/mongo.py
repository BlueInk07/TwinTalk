import os
from pymongo import MongoClient
from dotenv import load_dotenv

load_dotenv()

MONGO_URI ="mongodb+srv://simuchouhan17_db_user:HPFkjyZnbTUSYWiV@twintalk-ai.flwee6h.mongodb.net/?appName=Twintalk-AI"

try:
    client = MongoClient(MONGO_URI, serverSelectionTimeoutMS=5000)
    client.admin.command('ping')
    print("✅ MongoDB connected:", client.list_database_names())
except Exception as e:
    print("❌ MongoDB connection failed:", e)
    raise

db = client["twintalk"]
users_collection = db["users"]
chats_collection = db["chats"]