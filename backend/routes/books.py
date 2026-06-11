from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from bson import ObjectId
from datetime import datetime, timedelta

books_bp = Blueprint('books', __name__)

def init_books(db):
    
    # 1. GET ALL BOOKS
    @books_bp.route('/books', methods=['GET'])
    def list_books():
        try:
            books_collection = db["Book"]
            books = list(books_collection.find())
            sanitized = []
            for b in books:
                item = dict(b)
                item['_id'] = str(item['_id'])
                sanitized.append(item)
            return jsonify(sanitized), 200
        except Exception as e:
            return jsonify({"error": str(e)}), 500

    # 2. ADD A NEW BOOK (UPGRADED FOR V2.0)
    @books_bp.route('/books', methods=['POST'])
    @jwt_required()
    def add_new_book():
        try:
            data = request.get_json()
            books_collection = db["Book"]
            
            new_book = {
                "title": data.get("title", "Untitled Volume"),
                "author": data.get("author", "Unknown Author"),
                "category": data.get("category", "General"),
                "isbn": data.get("isbn", ""),
                "available": int(data.get("available", 1)),
                "description": data.get("description", ""),
                "image_url": data.get("image_url", ""),
                
                # 🔥 NEW BOOKHIVE 2.0 DATABASE FIELDS 🔥
                "price": float(data.get("price", 14.99)), # Standard default price
                "rating": float(data.get("rating", 4.8)), # Default star rating
                "queue_list": [] # Array to hold IDs of students waiting
            }
            
            result = books_collection.insert_one(new_book)
            return jsonify({"message": "✅ Book added successfully to the hive!", "id": str(result.inserted_id)}), 201
            
        except Exception as e:
            return jsonify({"error": f"Failed to add book: {str(e)}"}), 500

    # 3. GET A SINGLE BOOK
    @books_bp.route('/book/<book_id>', methods=['GET'])
    def get_single_book(book_id):
        try:
            books_collection = db["Book"]
            book = books_collection.find_one({"_id": ObjectId(book_id)})
            if not book:
                return jsonify({"error": "Book not found"}), 404
            
            book_dict = dict(book)
            book_dict['_id'] = str(book_dict['_id'])
            return jsonify(book_dict), 200
        except Exception as e:
            return jsonify({"error": "Invalid book parameters"}), 500

    # 4. BORROW A BOOK (UPGRADED WITH LIVE WAITLIST QUEUE LOGIC)
   # 4. BORROW A BOOK (UPGRADED FOR INTERACTIVE LEASE SCHEDULE FORMS)
    @books_bp.route('/borrow', methods=['POST'])
    @jwt_required()
    def borrow_book():
        try:
            user_id = get_jwt_identity()
            data = request.get_json()
            book_id = data.get('bookId')
            
            # 🔥 NEW: Extract user contact details and custom calendar bounds
            start_date_str = data.get('startDate')
            due_date_str = data.get('endDate')
            phone = data.get('phone', 'Not Provided')
            notes = data.get('notes', '')
            
            books_collection = db["Book"]
            book = books_collection.find_one({"_id": ObjectId(book_id)})
            
            if not book:
                return jsonify({"error": "Book not found in database"}), 404
                
            if book.get('available', 0) <= 0:
                books_collection.update_one(
                    {"_id": ObjectId(book_id)},
                    {"$addToSet": {"queue_list": user_id}}
                )
                return jsonify({"message": "⏳ Out of stock! You have successfully joined the active waitlist queue."}), 200
            
            books_collection.update_one(
                {"_id": ObjectId(book_id)},
                {"$inc": {"available": -1}}
            )
            
            # Parse custom dates or fall back to system standard defaults
            borrowed_at = start_date_str if start_date_str else datetime.utcnow().strftime("%Y-%m-%d")
            due_date = due_date_str if due_date_str else (datetime.utcnow() + timedelta(days=14)).strftime("%Y-%m-%d")
            
            loan = {
                "user_id": user_id,
                "book_id": ObjectId(book_id),
                "book_title": book['title'],
                "borrowed_at": borrowed_at,
                "due_date": due_date,
                "status": "issued",
                # 🔥 Saved directly inside the ledger so admins can view user contact parameters
                "admin_meta": {
                    "phone": phone,
                    "additional_notes": notes,
                    "submitted_timestamp": datetime.utcnow().strftime("%Y-%m-%d %H:%M:%S")
                }
            }
            db.loans.insert_one(loan)
            return jsonify({"message": f"🎉 Lease request confirmed! Assigned return date: {due_date}."}), 200
        except Exception as e:
            return jsonify({"error": f"Failed to process loan agreement node: {str(e)}"}), 500

    # 5. GET USER LOANS
    @books_bp.route('/loans', methods=['GET'])
    @jwt_required()
    def get_user_loans():
        user_id = get_jwt_identity()
        active_loans = list(db["loans"].find({"user_id": user_id, "status": "issued"}))
        
        borrowed_list = []
        for loan in active_loans:
            borrowed_list.append({
                "loan_id": str(loan["_id"]),
                "book_id": str(loan["book_id"]),
                "title": loan.get("book_title", "Unknown Book"),
                "borrowed_at": loan["borrowed_at"].strftime("%Y-%m-%d") if isinstance(loan["borrowed_at"], datetime) else str(loan["borrowed_at"]),
                "due_date": loan["due_date"].strftime("%Y-%m-%d") if isinstance(loan["due_date"], datetime) else str(loan["due_date"]),
                "status": loan.get("status", "issued")
            })
        return jsonify(borrowed_list), 200

    # 6. CLEAR LOAN HISTORY
    @books_bp.route('/loans/clear', methods=['POST'])
    @jwt_required()
    def clear_loan_history():
        user_id = get_jwt_identity()
        db["loans"].update_many(
            {"user_id": user_id, "status": "returned"},
            {"$set": {"status": "archived"}}
        )
        return jsonify({"message": "History cleared successfully!"}), 200

    # 7. RETURN A BOOK
    @books_bp.route('/return', methods=['POST'])
    @jwt_required()
    def return_book():
        try:
            user_id = get_jwt_identity()
            data = request.get_json()
            loan_id = data.get('loanId')
            
            loan = db.loans.find_one({"_id": ObjectId(loan_id), "user_id": user_id, "status": "issued"})
            if not loan:
                return jsonify({"error": "Active loan not found"}), 404
                
            db.loans.update_one(
                {"_id": ObjectId(loan_id)}, 
                {"$set": {"status": "returned", "returned_at": datetime.utcnow()}}
            )
            
            db["Book"].update_one({"_id": loan["book_id"]}, {"$inc": {"available": 1}})
            
            return jsonify({"message": "📚 Book returned successfully! Copy added back to shelf."}), 200
        except Exception as e:
            return jsonify({"error": "Failed to process return transaction."}), 500

    # 8. DELETE A BOOK
    @books_bp.route('/book/<book_id>', methods=['DELETE'])
    @jwt_required()
    def delete_book(book_id):
        try:
            result = db["Book"].delete_one({"_id": ObjectId(book_id)})
            if result.deleted_count == 0:
                return jsonify({"error": "Book not found in database"}), 404
                
            return jsonify({"message": "🗑️ Volume permanently deleted from the hive."}), 200
        except Exception as e:
            return jsonify({"error": "Failed to delete book."}), 500

    # 9. TOGGLE WISHLIST HEART
    @books_bp.route('/wishlist/toggle', methods=['POST'])
    @jwt_required()
    def toggle_wishlist():
        try:
            user_id = get_jwt_identity()
            data = request.get_json()
            book_id = data.get('bookId')

            user = db.users.find_one({"_id": ObjectId(user_id)})
            wishlist = user.get("wishlist", [])

            if book_id in wishlist:
                db.users.update_one({"_id": ObjectId(user_id)}, {"$pull": {"wishlist": book_id}})
                return jsonify({"message": "Removed from wishlist", "isSaved": False}), 200
            else:
                db.users.update_one({"_id": ObjectId(user_id)}, {"$addToSet": {"wishlist": book_id}})
                return jsonify({"message": "Added to wishlist", "isSaved": True}), 200
        except Exception as e:
            return jsonify({"error": "Failed to update wishlist"}), 500

    # 10. GET ENTIRE WISHLIST
    @books_bp.route('/wishlist', methods=['GET'])
    @jwt_required()
    def get_wishlist():
        try:
            user_id = get_jwt_identity()
            user = db.users.find_one({"_id": ObjectId(user_id)})
            wishlist_ids = user.get("wishlist", [])

            object_ids = [ObjectId(bid) for bid in wishlist_ids if ObjectId.is_valid(bid)]
            books = list(db["Book"].find({"_id": {"$in": object_ids}}))

            sanitized = []
            for b in books:
                item = dict(b)
                item['_id'] = str(item['_id'])
                sanitized.append(item)

            return jsonify(sanitized), 200
        except Exception as e:
            return jsonify({"error": "Failed to retrieve wishlist"}), 500

    # 11. 🔥 NEW ENDPOINT: LIVE OUTRIGHT TRANSACTION PURCHASE ENGINE 🔥
    @books_bp.route('/purchase', methods=['POST'])
    @jwt_required()
    def purchase_book():
        try:
            user_id = get_jwt_identity()
            data = request.get_json()
            book_id = data.get('bookId')
            
            book = db["Book"].find_one({"_id": ObjectId(book_id)})
            user = db.users.find_one({"_id": ObjectId(user_id)})
            
            if not book or not user:
                return jsonify({"error": "Resource reference missing"}), 404
                
            if book.get('available', 0) <= 0:
                return jsonify({"error": "Volume completely depleted from stock shelves"}), 400
                
            price = float(book.get('price', 14.99))
            wallet_balance = float(user.get('balance', 0.00))
            
            if wallet_balance < price:
                return jsonify({"error": "Insufficient digital ledger account credits"}), 400
                
            # Deduct cost from wallet balance, update real user statistics metrics
            db.users.update_one(
                {"_id": ObjectId(user_id)},
                {
                    "$inc": {
                        "balance": -price,
                        "stats.total_books_read": 1,
                        "stats.books_this_month": 1,
                        "stats.yearly_goal_current": 1
                    },
                    "$addToSet": {"purchased_books": str(book_id)}
                }
            )
            
            # Lower available library shelf copy assignment count by 1 permanent item
            db["Book"].update_one({"_id": ObjectId(book_id)}, {"$inc": {"available": -1}})
            
            return jsonify({"message": "🛍️ Core asset purchased successfully! Permanent ownership approved."}), 200
        except Exception as e:
            return jsonify({"error": str(e)}), 500
        
        # 12. 🔥 NEW: FETCH REVIEWS FOR A SPECIFIC BOOK 🔥
    @books_bp.route('/book/<book_id>/reviews', methods=['GET'])
    def get_book_reviews(book_id):
        try:
            reviews_collection = db["reviews"]
            # Find all reviews matching this book_id
            reviews = list(reviews_collection.find({"book_id": str(book_id)}).sort("timestamp", -1))
            
            sanitized = []
            for r in reviews:
                item = dict(r)
                item['_id'] = str(item['_id'])
                sanitized.append(item)
                
            return jsonify(sanitized), 200
        except Exception as e:
            return jsonify({"error": str(e)}), 500

    # 13. 🔥 NEW: SUBMIT AN AUTHENTIC VERIFIED REVIEW 🔥
    @books_bp.route('/review/add', methods=['POST'])
    @jwt_required()
    def add_book_review():
        try:
            user_id = get_jwt_identity()
            data = request.get_json()
            
            book_id = data.get('bookId')
            rating = float(data.get('rating', 5.0))
            comment = data.get('comment', '')
            status = data.get('status') # Expects 'completed' or 'bored'
            source = data.get('source') # Expects 'purchase' or 'return'
            
            user = db.users.find_one({"_id": ObjectId(user_id)})
            if not user:
                return jsonify({"error": "User session not found"}), 404

            # Determine if the reviewer gets the Genuine Reader Star Badge ⭐
            has_star = False
            if source == 'purchase':
                has_star = True # Buyers always get the genuine reader star
            elif source == 'return' and status == 'completed':
                has_star = True # Borrowers only get it if they completed reading

            new_review = {
                "book_id": str(book_id),
                "user_id": str(user_id),
                "user_name": user.get('name', 'Anonymous Reader'),
                "rating": rating,
                "comment": comment,
                "status": status,
                "has_star": has_star,
                "timestamp": datetime.utcnow().strftime("%Y-%m-%d")
            }
            
            db["reviews"].insert_one(new_review)
            return jsonify({"message": "✅ Review submitted successfully to the ledger!"}), 201
        except Exception as e:
            return jsonify({"error": str(e)}), 500
        
        # 14. 🔥 NEW: GLOBAL ADMINISTRATIVE DASHBOARD COMMAND METRICS 🔥
    @books_bp.route('/admin/dashboard-matrix', methods=['GET'])
    @jwt_required()
    def get_admin_dashboard_matrix():
        try:
            user_id = get_jwt_identity()
            current_user = db.users.find_one({"_id": ObjectId(user_id)})
            
            # Strict security gate verification check
            if not current_user or current_user.get('role') != 'admin':
                return jsonify({"error": "Access Rejected: Ultimate clearance token required."}), 403

            # 1. Aggregate Global Platform Statistics
            total_books_count = db["Book"].count_documents({})
            total_registered_users = db.users.count_documents({})
            total_active_loans = db.loans.count_documents({"status": "issued"})
            
            # Calculate collective platform capital assets
            pipeline_balance = list(db.users.aggregate([{"$group": {"_id": None, "total": {"$sum": "$balance"}}}]))
            total_platform_liquidity = pipeline_balance[0]["total"] if pipeline_balance else 0.0

            # 2. Compile Live User Directory Mapping
            users_list = list(db.users.find({}, {"name": 1, "email": 1, "role": 1, "library_id": 1, "balance": 1}))
            sanitized_users = []
            for u in users_list:
                u["_id"] = str(u["_id"])
                sanitized_users.append(u)

            # 3. Pull Active Custom Leases with User Contact Details
            active_loans_list = list(db.loans.find({"status": "issued"}))
            sanitized_loans = []
            for l in active_loans_list:
                l["_id"] = str(l["_id"])
                l["book_id"] = str(l["book_id"])
                # Extract corresponding user email tracking vectors
                linked_user = db.users.find_one({"_id": ObjectId(l["user_id"])}, {"email": 1})
                l["user_email"] = linked_user.get("email", "Unknown Account") if linked_user else "Deleted User"
                sanitized_loans.append(l)

            # 4. Isolate High-Demand Backorder Waitlists
            backordered_volumes = list(db["Book"].find({"queue_list.0": {"$exists": True}}, {"title": 1, "author": 1, "queue_list": 1, "available": 1}))
            sanitized_backorders = []
            for b in backordered_volumes:
                b["_id"] = str(b["_id"])
                sanitized_backorders.append(b)

            return jsonify({
                "summary": {
                    "totalBooks": total_books_count,
                    "totalUsers": total_registered_users,
                    "activeLoans": total_active_loans,
                    "vaultCredits": round(total_platform_liquidity, 2)
                },
                "users": sanitized_users,
                "leases": sanitized_loans,
                "waitlists": sanitized_backorders
            }), 200
        except Exception as e:
            return jsonify({"error": f"Administrative data aggregation pipeline failure: {str(e)}"}), 500