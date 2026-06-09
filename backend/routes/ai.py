import os
import google.generativeai as genai
from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required

ai_bp = Blueprint('ai', __name__)

if os.getenv("GEMINI_API_KEY"):
    genai.configure(api_key=os.getenv("GEMINI_API_KEY"))
model = genai.GenerativeModel('gemini-1.5-flash')

def init_ai(db):
    
    @ai_bp.route('/chat', methods=['POST'])
    @jwt_required()
    def chat_with_gemini():
        data = request.get_json()
        user_message = data.get('message', '')
        
        if not user_message:
            return jsonify({"error": "Message is empty"}), 400
            
        try:
            books_collection = db["Book"]
            all_books = list(books_collection.find({}, {"title": 1, "author": 1, "category": 1, "available": 1}))
            
            catalog_summary = ""
            for b in all_books:
                catalog_summary += f"- '{b.get('title')}' by {b.get('author')} [{b.get('category')}] ({b.get('available', 0)} copies left)\n"

            system_prompt = f"""
            You are BookHive AI, a helpful virtual assistant for a school library software platform.
            Here is the exact real-time catalog of books physically sitting on our shelves:
            {catalog_summary}
            
            Answer the user's question politely using ONLY the catalog provided above. 
            Keep answers conversational, short (2-3 sentences max), and friendly.
            
            User's Question: {user_message}
            """
            
            response = model.generate_content(system_prompt)
            return jsonify({"reply": response.text}), 200
        except Exception as e:
            return jsonify({"reply": "Sorry, my AI core ran into a processing hiccup."}), 500