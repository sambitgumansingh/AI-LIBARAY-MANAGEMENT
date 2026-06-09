import bcrypt
from flask import Blueprint, request, jsonify
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity
from models.user import User
from bson import ObjectId

auth_bp = Blueprint('auth', __name__)

def init_auth(db):
    user_model = User(db)
    
    @auth_bp.route('/register', methods=['POST'])
    def register():
        data = request.json
        if user_model.find_by_email(data['email']):
            return jsonify({"error": "User already exists"}), 400
        
        user_model.create_user(data['name'], data['email'], data['password'])
        return jsonify({"message": "User registered successfully"}), 201

    @auth_bp.route('/login', methods=['POST'])
    def login():
        data = request.json
        user = user_model.find_by_email(data['email'])
        
        if user and bcrypt.checkpw(data['password'].encode('utf-8'), user['password']):
            token = create_access_token(identity=str(user['_id']), additional_claims={"role": user.get('role', 'member')})
            return jsonify({
                "token": token,
                "user": {"name": user['name'], "email": user['email'], "role": user.get('role', 'member')}
            })
        return jsonify({"error": "Invalid credentials"}), 401

    @auth_bp.route('/profile', methods=['GET'])
    @jwt_required()
    def profile():
        current_user_id = get_jwt_identity()
        user = db.users.find_one({"_id": ObjectId(current_user_id)})
        if not user:
            return jsonify({"error": "User not found"}), 404
            
        return jsonify({
            "name": user.get("name"),
            "email": user.get("email"),
            "role": user.get("role")
        }), 200