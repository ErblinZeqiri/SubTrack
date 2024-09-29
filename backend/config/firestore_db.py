import os
CURR_DIR = os.path.dirname(__file__)

import firebase_admin
from firebase_admin import credentials, firestore

cred = credentials.Certificate(os.path.join(CURR_DIR, "subtrack-backend-cred.json"))
firebase_admin.initialize_app(cred)

db = firestore.client()