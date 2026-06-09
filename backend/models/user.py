import bcrypt
from datetime import datetime

class User:
    def __init__(self, db):
        self.collection = db.users

    def create_user(self, name, email, password, role="member"):
        hashed = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt())
        user = {
            "name": name,
            "email": email.lower(),
            "password": hashed,
            "role": role,
            "created_at": datetime.utcnow()
        }
        return self.collection.insert_one(user)

    def find_by_email(self, email):
        return self.collection.find_one({"email": email.lower()})