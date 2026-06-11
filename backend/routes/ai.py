import os
from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from bson import ObjectId
from openai import OpenAI

ai_bp = Blueprint('ai', __name__)

def init_ai(db):
    @ai_bp.route('/chat', methods=['POST'])
    @jwt_required()
    def ai_chat():
        try:
            user_id = get_jwt_identity()
            data = request.get_json()
            user_message = data.get('message', '')

            if not user_message:
                return jsonify({"reply": "Message content cannot be empty."}), 400

            # 1. PROFILE CONTEXT: See who is talking to the AI
            user = db.users.find_one({"_id": ObjectId(user_id)})
            user_name = user.get('name', 'Valued Reader') if user else 'Valued Reader'
            user_balance = user.get('balance', 0.0) if user else 0.0

            # 2. DEEP DATABASE CATALOG READING: Fetch all 100 books from MongoDB
            books_cursor = db["Book"].find({}, {"title": 1, "author": 1, "category": 1, "description": 1, "price": 1})
            
            catalog_entries = []
            for idx, book in enumerate(books_cursor, 1):
                entry = (
                    f"Book #{idx} -> Title: {book.get('title')} | Author: {book.get('author')} | "
                    f"Genre: {book.get('category')} | Price: ${book.get('price')} | "
                    f"Summary: {book.get('description')}"
                )
                catalog_entries.append(entry)
            
            # Combine all 100 book profiles into one structured prompt string
            complete_catalog_context = "\n".join(catalog_entries)

            # 3. CONFIGURE API ACCESS CHECKS
            api_key = os.getenv("XAI_API_KEY")
            if not api_key:
                return jsonify({
                    "reply": f"Greetings {user_name}! I am ready to parse your reading interests, but your 'XAI_API_KEY' parameter token is unconfigured in the system environment matrix."
                }), 200

            # Initialize the OpenAI compatible xAI endpoint connector
            client = OpenAI(
                api_key=api_key,
                base_url="https://api.x.ai/v1"
            )

            # 4. STRICT SYSTEM INSTRUCTIONS FOR PERSONALIZED LITERARY FOCUS
            system_prompt = (
                f"You are Grok, the specialized Book Reading Assistant and Literary Concierge for BookHive.\n"
                f"You are interacting with an active reader named {user_name} who has a digital wallet balance of ${user_balance:.2f}.\n\n"
                f"STRICT BEHAVIOR RULES:\n"
                f"1. You are an expert book assistant. You talk exclusively about books, plots, literary summaries, authors, and genres.\n"
                f"2. If the user asks general-purpose, coding, or unrelated off-topic questions, politely refuse and guide them back to talking about books or your specific database catalog.\n"
                f"3. Below is the complete live collection of books currently available inside the BookHive database. You must use this list to provide precise reading recommendations, answer summary questions, and reference specific book details:\n\n"
                f"{complete_catalog_context}\n\n"
                f"Match the style of the application: hyper-intelligent, sharp, slightly witty, and deeply knowledgeable about summaries. Help the user discover their next great read!"
            )

            # 5. 🔥 FIXED: EXECUTE VIA STREAMLINED COMPATIBLE MODEL NAME 🔥
            completion = client.chat.completions.create(
                model="grok-4.3", # Swapped to the official, supported endpoint identifier
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": user_message}
                ]
            )

            # Extract the refined text reply
            ai_reply = completion.choices[0].message.content.strip()
            return jsonify({"reply": ai_reply}), 200

        except Exception as e:
            return jsonify({"reply": f"Grok Reading Assistant pipeline exception: {str(e)}"}), 500