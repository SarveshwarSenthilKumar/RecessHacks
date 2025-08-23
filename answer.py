from flask import Flask, request, jsonify
from flask_cors import CORS
import openai
import os
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__)
CORS(app)

openai.api_key = os.getenv("OPENAI_API_KEY")

# Store conversation history
conversation_history = []

@app.route("/ask", methods=["POST"])
def ask():
    data = request.json
    question = data.get("question")

    # Add user message to history
    conversation_history.append({"role": "user", "content": question})

    try:
        response = openai.ChatCompletion.create(
            model="gpt-4o-mini",
            messages=conversation_history
        )

        answer = response.choices[0].message.content
        # Add AI response to history
        conversation_history.append({"role": "assistant", "content": answer})

        return jsonify({"answer": answer})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == "__main__":
    app.run(debug=True)
