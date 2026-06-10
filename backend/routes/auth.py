from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, create_access_token, get_jwt_identity
from bson import ObjectId
import random # 🔥 NEW: For generating random Library ID tokens

auth_bp = Blueprint('auth', __name__)

def init_auth(db):
    user_model = db.users

    # 1. NEW USER REGISTRATION WITH RANDOM LIBRARY ID GENERATION
    @auth_bp.route('/register', methods=['POST'])
    def register():
        try:
            data = request.json
            email = data.get('email')
            name = data.get('name')
            password = data.get('password')

            if not email or not name or not password:
                return jsonify({"error": "Missing mandatory field records"}), 400

            # Check if user already exists
            if user_model.find_one({"email": email}):
                return jsonify({"error": "User directory entry already exists"}), 400
            
            # 🔥 GENERATE RANDOM LIBRARY ID (Example: BH-482910)
            random_digits = random.randint(100000, 999999)
            generated_library_id = f"BH-{random_digits}"

            # Import bcrypt here locally to match your current encryption setup
            import bcrypt
            hashed_password = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt())

            new_user = {
                "name": name,
                "email": email,
                "password": hashed_password,
                "role": "member", # Strict security default
                "library_id": generated_library_id, # 🔥 Saved to DB
                "wishlist": []
            }
            
            user_model.insert_one(new_user)
            return jsonify({"message": "User registered successfully", "library_id": generated_library_id}), 201
        except Exception as e:
            return jsonify({"error": f"Registration failed: {str(e)}"}), 500

    # 2. LOGIN ENGINE UPDATED TO SEND LIBRARY ID
    @auth_bp.route('/login', methods=['POST'])
    def login():
        try:
            data = request.json
            user = user_model.find_one({"email": data.get('email')})
            
            if user:
                db_password = user.get('password', '')
                input_password = data.get('password', '')
                is_match = False
                
                # Bcrypt cryptographic match check
                try:
                    import bcrypt
                    if bcrypt.checkpw(input_password.encode('utf-8'), bytes(db_password)):
                        is_match = True
                except Exception:
                    pass
                
                # Plaintext fallback check
                if not is_match and str(db_password) == str(input_password):
                    is_match = True

                if is_match:
                    access_token = create_access_token(identity=str(user['_id']))
                    return jsonify({
                        "token": access_token, 
                        "user": {
                            "id": str(user['_id']),
                            "name": user['name'],
                            "email": user['email'],
                            "role": user.get('role', 'member'),
                            "library_id": user.get('library_id', 'BH-ASSIGNING') # 🔥 Sent to React
                        }
                    }), 200
                    
            return jsonify({"error": "Invalid email or password match"}), 401
        except Exception as e:
            return jsonify({"error": f"Internal Server Error: {str(e)}"}), 500

    # 3. PROFILE DATA ROUTE WITH DIRECT DB STREAM
    @auth_bp.route('/profile', methods=['GET'])
    @jwt_required()
    def profile():
        try:
            current_user_id = get_jwt_identity()
            user = user_model.find_one({"_id": ObjectId(current_user_id)})
            
            if not user:
                return jsonify({"error": "User profile not found"}), 404
                
            return jsonify({
                "_id": str(user["_id"]),
                "name": user.get("name"),
                "email": user.get("email"),
                "role": user.get("role", "member"),
                "library_id": user.get("library_id", "BH-NOT-FOUND") # 🔥 Fresh sync from Atlas
            }), 200
        except Exception as e:
            return jsonify({"error": str(e)}), 500