"""
Firebase Admin SDK initialization
"""
import os
import firebase_admin
from firebase_admin import credentials, firestore, auth
from typing import Optional

_app: Optional[firebase_admin.App] = None
_db: Optional[firestore.Client] = None


def initialize_firebase():
    """Initialize Firebase Admin SDK"""
    global _app, _db
    
    if _app is not None:
        return _app
    
    # Check if we have a service account file
    service_account_path = os.getenv("FIREBASE_SERVICE_ACCOUNT_PATH")
    
    if service_account_path and os.path.exists(service_account_path):
        # Use service account file
        cred = credentials.Certificate(service_account_path)
    else:
        # Use environment variables
        service_account_dict = {
            "type": "service_account",
            "project_id": os.getenv("FIREBASE_PROJECT_ID"),
            "private_key_id": os.getenv("FIREBASE_PRIVATE_KEY_ID"),
            "private_key": os.getenv("FIREBASE_PRIVATE_KEY", "").replace("\\n", "\n"),
            "client_email": os.getenv("FIREBASE_CLIENT_EMAIL"),
            "client_id": os.getenv("FIREBASE_CLIENT_ID"),
            "auth_uri": "https://accounts.google.com/o/oauth2/auth",
            "token_uri": "https://oauth2.googleapis.com/token",
            "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
        }
        cred = credentials.Certificate(service_account_dict)
    
    _app = firebase_admin.initialize_app(cred)
    _db = firestore.client()
    
    return _app


def get_firestore() -> firestore.Client:
    """Get Firestore client"""
    global _db
    
    if _db is None:
        initialize_firebase()
    
    return _db


def verify_id_token(id_token: str):
    """Verify Firebase ID token"""
    try:
        decoded_token = auth.verify_id_token(id_token)
        return decoded_token
    except Exception as e:
        raise Exception(f"Invalid token: {e}")


# Initialize on import
initialize_firebase()
