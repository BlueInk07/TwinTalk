import os
from pathlib import Path

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from api.analysis import router as analysis_router
from api.interview import router as interview_router
from api.upload import router as upload_router
from database.mongo import users_collection
from google.oauth2 import id_token
from google.auth.transport import requests
from dotenv import load_dotenv

load_dotenv(Path(__file__).resolve().parent / ".env")

GOOGLE_CLIENT_ID = os.getenv("GOOGLE_CLIENT_ID")
FRONTEND_URLS = os.getenv("FRONTEND_URL", "")

allowed_origins = [
    "http://localhost:5173",
    "http://localhost:3000",
]

allowed_origins.extend(
    origin.strip().rstrip("/")
    for origin in FRONTEND_URLS.split(",")
    if origin.strip()
)

app = FastAPI()

# Allow requests from local development and the deployed frontend.
app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(upload_router)
app.include_router(interview_router)
app.include_router(analysis_router)


@app.get("/")
def home():
    return {"message": "TwinTalk AI Backend Running"}


@app.post("/auth/google")
def google_login(body: dict):
    if not GOOGLE_CLIENT_ID:
        raise HTTPException(status_code=500, detail="GOOGLE_CLIENT_ID is not configured")

    token = body.get("token")

    if not token:
        raise HTTPException(status_code=400, detail="Token is required")

    try:
        idinfo = id_token.verify_oauth2_token(
            token,
            requests.Request(),
            GOOGLE_CLIENT_ID
        )

        email = idinfo["email"]
        name = idinfo.get("name", "")
        picture = idinfo.get("picture", "")

    except Exception as e:
        raise HTTPException(status_code=401, detail=f"Invalid Google token: {str(e)}")

    existing_user = users_collection.find_one({"email": email})

    if not existing_user:
        users_collection.insert_one({
            "email": email,
            "name": name,
            "picture": picture,
            "created_at": __import__("datetime").datetime.utcnow()
        })
        is_new_user = True
    else:
        # Update picture in case it changed
        users_collection.update_one(
            {"email": email},
            {"$set": {"picture": picture, "last_login": __import__("datetime").datetime.utcnow()}}
        )
        is_new_user = False

    return {
        "status": "success",
        "email": email,
        "name": name,
        "picture": picture,
        "is_new_user": is_new_user
    }
