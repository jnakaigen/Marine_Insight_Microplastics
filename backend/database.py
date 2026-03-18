import os
from dotenv import load_dotenv
import motor.motor_asyncio

# Load environment variables from .env file
load_dotenv()

MONGO_DETAILS = os.getenv("MONGO_DETAILS")
DATABASE_NAME = os.getenv("DATABASE_NAME")

client = motor.motor_asyncio.AsyncIOMotorClient(MONGO_DETAILS)
database = client[DATABASE_NAME]

# Get a reference to the 'users' collection
user_collection = database.get_collection("users")

# Helper to convert MongoDB document to Python dict
def user_helper(user) -> dict:
    return {
        "id": str(user["_id"]),
        "fullName": user["fullName"],
        "email": user["email"],
    }