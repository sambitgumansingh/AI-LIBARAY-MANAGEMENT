import os
from flask import Flask
from flask_cors import CORS
from flask_jwt_extended import JWTManager
from pymongo import MongoClient
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__)
CORS(app)

app.config["JWT_SECRET_KEY"] = os.getenv("JWT_SECRET_KEY", "fallback-secret-key")
jwt = JWTManager(app)

# Initialize MongoDB Client Connection
client = MongoClient(os.getenv("MONGO_URI"))
db = client["library"] # Connecting directly to your verified cloud database

# Import and Initialize Blueprints
from routes.auth import auth_bp, init_auth
from routes.books import books_bp, init_books
from routes.ai import ai_bp, init_ai

init_auth(db)
init_books(db)
init_ai(db)

app.register_blueprint(auth_bp, url_prefix='/api/auth')
app.register_blueprint(books_bp, url_prefix='/api')
app.register_blueprint(ai_bp, url_prefix='/api/ai')

if __name__ == "__main__":
    app.run(debug=True, port=5000)