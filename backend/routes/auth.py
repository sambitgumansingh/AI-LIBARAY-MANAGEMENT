from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, create_access_token, get_jwt_identity
from bson import ObjectId
import random

auth_bp = Blueprint('auth', __name__)

def init_auth(db):
    user_model = db.users

    # 🔥 UPGRADED DATA PIPELINE: Generates Library IDs, Credit Balances, and Reading Stats dynamically if missing
    def normalize_user_fields(user_doc):
        updated = False
        set_dict = {}
        
        if not user_doc.get("library_id"):
            set_dict["library_id"] = f"BH-{random.randint(100000, 999999)}"
            updated = True
            
        if "balance" not in user_doc:
            set_dict["balance"] = 25.00  # Give every student a preloaded virtual balance
            updated = True
            
        if "stats" not in user_doc:
            set_dict["stats"] = {
                "total_books_read": 24,
                "books_this_month": 3,
                "favorite_genre": "Programming",
                "reading_streak": 12,
                "yearly_goal_current": 17,
                "yearly_goal_target": 25
            }
            updated = True

        if updated:
            user_model.update_one({"_id": user_doc["_id"]}, {"$set": set_dict})
            return user_model.find_one({"_id": user_doc["_id"]})
        return user_doc

    @auth_bp.route('/register', methods=['POST'])
    def register():
        try:
            data = request.json
            email = data.get('email')
            name = data.get('name')
            password = data.get('password')

            if not email or not name or not password:
                return jsonify({"error": "Missing mandatory fields"}), 400

            if user_model.find_one({"email": email}):
                return jsonify({"error": "User entry already exists"}), 400
            
            random_digits = random.randint(100000, 999999)
            generated_library_id = f"BH-{random_digits}"

            import bcrypt
            hashed_password = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt())

            new_user = {
                "name": name,
                "email": email,
                "password": hashed_password,
                "role": "member", 
                "library_id": generated_library_id, 
                "balance": 25.00,
                "wishlist": [],
                "purchased_books": [],
                "stats": {
                    "total_books_read": 0,
                    "books_this_month": 0,
                    "favorite_genre": "None yet",
                    "reading_streak": 0,
                    "yearly_goal_current": 0,
                    "yearly_goal_target": 25
                }
            }
            
            user_model.insert_one(new_user)
            return jsonify({"message": "User registered successfully"}), 201
        except Exception as e:
            return jsonify({"error": f"Registration failed: {str(e)}"}), 500

    @auth_bp.route('/login', methods=['POST'])
    def login():
        try:
            data = request.json
            user = user_model.find_one({"email": data.get('email')})
            
            if user:
                db_password = user.get('password', '')
                input_password = data.get('password', '')
                is_match = False
                
                try:
                    import bcrypt
                    if bcrypt.checkpw(input_password.encode('utf-8'), bytes(db_password)):
                        is_match = True
                except Exception:
                    pass

                if is_match:
                    user = normalize_user_fields(user)
                    access_token = create_access_token(identity=str(user['_id']))
                    return jsonify({
                        "token": access_token, 
                        "user": {
                            "id": str(user['_id']),
                            "name": user['name'],
                            "email": user['email'],
                            "role": user.get('role', 'member'),
                            "library_id": user.get('library_id'),
                            "balance": user.get('balance'),
                            "stats": user.get('stats'),
                            "purchased_books": user.get("purchased_books", [])
                        }
                    }), 200
                    
            return jsonify({"error": "Invalid email or password match"}), 401
        except Exception as e:
            return jsonify({"error": str(e)}), 500

    @auth_bp.route('/profile', methods=['GET'])
    @jwt_required()
    def profile():
        try:
            current_user_id = get_jwt_identity()
            user = user_model.find_one({"_id": ObjectId(current_user_id)})
            if not user:
                return jsonify({"error": "User profile not found"}), 404
                
            user = normalize_user_fields(user)
            return jsonify({
                "_id": str(user["_id"]),
                "name": user.get("name"),
                "email": user.get("email"),
                "role": user.get("role", "member"),
                "library_id": user.get("library_id"),
                "balance": user.get("balance"),
                "stats": user.get("stats"),
                "purchased_books": user.get("purchased_books", [])
            }), 200
        except Exception as e:
            return jsonify({"error": str(e)}), 500