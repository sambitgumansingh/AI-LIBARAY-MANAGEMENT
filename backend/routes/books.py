from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from bson import ObjectId
from datetime import datetime, timedelta

books_bp = Blueprint('books', __name__)

def init_books(db):
    
    # 1. GET ALL BOOKS (This is what populates your Dashboard!)
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

    # 2. ADD A NEW BOOK (From your new Admin Gateway)
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
                "image_url": data.get("image_url", "")
            }
            
            result = books_collection.insert_one(new_book)
            return jsonify({"message": "✅ Book added successfully to the hive!", "id": str(result.inserted_id)}), 201
            
        except Exception as e:
            return jsonify({"error": f"Failed to add book: {str(e)}"}), 500

    # 3. GET A SINGLE BOOK (For your Book Details page)
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

    # 4. BORROW A BOOK
    @books_bp.route('/borrow', methods=['POST'])
    @jwt_required()
    def borrow_book():
        try:
            user_id = get_jwt_identity()
            data = request.get_json()
            book_id = data.get('bookId')
            
            books_collection = db["Book"]
            book = books_collection.find_one({"_id": ObjectId(book_id)})
            
            if not book:
                return jsonify({"error": "Book not found in database"}), 404
                
            if book.get('available', 0) <= 0:
                return jsonify({"error": "No copies available to borrow"}), 400
            
            books_collection.update_one(
                {"_id": ObjectId(book_id)},
                {"$inc": {"available": -1}}
            )
            
            loan = {
                "user_id": user_id,
                "book_id": ObjectId(book_id),
                "book_title": book['title'],
                "borrowed_at": datetime.utcnow(),
                "due_date": datetime.utcnow() + timedelta(days=14),
                "status": "issued"
            }
            db.loans.insert_one(loan)
            return jsonify({"message": "🎉 Book borrowed successfully!"}), 200
        except Exception as e:
            return jsonify({"error": "Failed to process borrow transaction."}), 500

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
            
            # 1. Find the active loan
            loan = db.loans.find_one({"_id": ObjectId(loan_id), "user_id": user_id, "status": "issued"})
            if not loan:
                return jsonify({"error": "Active loan not found"}), 404
                
            # 2. Mark the loan as returned
            db.loans.update_one(
                {"_id": ObjectId(loan_id)}, 
                {"$set": {"status": "returned", "returned_at": datetime.utcnow()}}
            )
            
            # 3. Give the book copy back to the library shelf
            db["Book"].update_one({"_id": loan["book_id"]}, {"$inc": {"available": 1}})
            
            return jsonify({"message": "📚 Book returned successfully! Copy added back to shelf."}), 200
        except Exception as e:
            return jsonify({"error": "Failed to process return transaction."}), 500

    # 8. DELETE A BOOK (Admin level action)
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