
from flask import Flask, render_template, request, redirect, session, jsonify, send_file
from flask_session import Session
from flask_cors import CORS, cross_origin
from datetime import datetime, timedelta
import pytz
import os
import base64
import json
import requests
from io import BytesIO
from PIL import Image
from dotenv import load_dotenv
import openai
from functools import wraps
from sql import *  # Used for database connection and management
from authfunctions import *  # Used for user authentication functions
from auth import auth_blueprint
import uuid

# Load environment variables
load_dotenv()
openai.api_key = os.getenv("OPENAI_API_KEY")
IMGBB_API_KEY = os.getenv("IMGBB_API_KEY")
STABILITY_API_KEY = os.getenv("STABILITY_API_KEY")

app = Flask(__name__)

# Configure CORS
CORS(app, 
     resources={"*": {"origins": ["http://localhost:3000", "http://localhost:5000"]}},
     supports_credentials=True)

# Configure upload folder
UPLOAD_FOLDER = 'uploads'
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif'}
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

# Session configuration
app.config['SECRET_KEY'] = os.getenv('SECRET_KEY', 'your-secret-key-here')
app.config['SESSION_TYPE'] = 'filesystem'
app.config['SESSION_COOKIE_HTTPONLY'] = True
app.config['SESSION_COOKIE_SECURE'] = False  # Set to True in production with HTTPS
app.config['SESSION_COOKIE_SAMESITE'] = 'Lax'
app.config['PERMANENT_SESSION_LIFETIME'] = timedelta(days=1)
app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024  # 16MB max file size

Session(app)

autoRun = True  # Change to True if you want to run the server automatically by running the app.py file
port = 5000  # Change to any port of your choice if you want to run the server automatically
authentication = True  # Change to False if you want to disable user authentication

if authentication:
    app.register_blueprint(auth_blueprint, url_prefix='/auth')

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

def upload_to_imgbb(image_path):
    with open(image_path, "rb") as f:
        encoded_image = base64.b64encode(f.read())
    url = "https://api.imgbb.com/1/upload"
    payload = {
        "key": IMGBB_API_KEY,
        "image": encoded_image
    }
    response = requests.post(url, data=payload)
    response.raise_for_status()
    return response.json()["data"]["url"]  # Public image URL

# API Routes
@app.route('/api/analyze-image', methods=['POST'])
def analyze_image():
    if 'file' not in request.files:
        return jsonify({"error": "No file part"}), 400
    
    file = request.files['file']
    if file.filename == '':
        return jsonify({"error": "No selected file"}), 400
    
    if file and allowed_file(file.filename):
        # Save the uploaded file
        filename = f"{str(uuid.uuid4())}.{file.filename.rsplit('.', 1)[1].lower()}"
        filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)
        file.save(filepath)
        
        try:
            # Upload to ImgBB
            image_url = upload_to_imgbb(filepath)
            
            # Analyze with GPT-4 Vision (or your preferred model)
            # Note: You'll need to adapt this based on your actual AI model
            response = openai.ChatCompletion.create(
                model="gpt-4-vision-preview",
                messages=[
                    {
                        "role": "user",
                        "content": [
                            {"type": "text", "text": "Describe this image in detail and suggest what dish it might be."},
                            {"type": "image_url", "image_url": image_url}
                        ]
                    }
                ],
                max_tokens=300
            )
            
            analysis = response.choices[0].message.content
            
            return jsonify({
                "success": True,
                "analysis": analysis,
                "image_url": image_url
            })
            
        except Exception as e:
            return jsonify({"error": str(e)}), 500
        finally:
            # Clean up the uploaded file
            if os.path.exists(filepath):
                os.remove(filepath)
    
    return jsonify({"error": "File type not allowed"}), 400

@app.route('/api/generate-recipe', methods=['POST'])
def generate_recipe():
    data = request.get_json()
    if not data or 'dish_name' not in data:
        return jsonify({"error": "Dish name is required"}), 400
    
    try:
        # Generate recipe using GPT
        response = openai.ChatCompletion.create(
            model="gpt-4",
            messages=[
                {"role": "system", "content": "You are a professional chef. Generate a detailed recipe including ingredients and step-by-step instructions."},
                {"role": "user", "content": f"Generate a detailed recipe for {data['dish_name']}."}
            ],
            max_tokens=1000
        )
        
        recipe = response.choices[0].message.content
        
        return jsonify({
            "success": True,
            "recipe": recipe
        })
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/generate-dish-image', methods=['POST'])
def generate_dish_image():
    data = request.get_json()
    if not data or 'dish_name' not in data:
        return jsonify({"error": "Dish name is required"}), 400
    
    try:
        # Generate image using Stability AI
        url = "https://api.stability.ai/v2beta/stable-image/generate/core"
        headers = {
            "Authorization": f"Bearer {STABILITY_API_KEY}",
            "Accept": "application/json"
        }
        
        payload = {
            "prompt": f"A professional, realistic photograph of {data['dish_name']}, plated which looks like I would make it at home, make it look realistic and less perfectionist like a human would actually make it, make it less perfect and less fancy, and make it look human like.",
            "output_format": "png",
            "aspect_ratio": "1:1"
        }
        
        response = requests.post(url, headers=headers, files={"none": ""}, data=payload)
        response.raise_for_status()
        
        data = response.json()
        
        if "image" in data:
            # Save the generated image
            image_b64 = data["image"]
            image_bytes = base64.b64decode(image_b64)
            
            # Save to a file
            filename = f"{str(uuid.uuid4())}.png"
            filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)
            
            with open(filepath, 'wb') as f:
                f.write(image_bytes)
            
            # Return the URL to access the image
            image_url = f"/api/images/{filename}"
            
            return jsonify({
                "success": True,
                "image_url": image_url
            })
        else:
            return jsonify({"error": "Failed to generate image"}), 500
            
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/images/<filename>')
def get_image(filename):
    return send_file(os.path.join(app.config['UPLOAD_FOLDER'], filename), mimetype='image/png')

def login_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if authentication and not session.get("name"):
            return jsonify({"error": "Authentication required"}), 401
        return f(*args, **kwargs)
    return decorated_function

@app.route('/api/check-auth')
@cross_origin(supports_credentials=True)
def check_auth():
    if 'name' in session:
        return jsonify({
            "authenticated": True,
            "username": session.get("name")
        })
    return jsonify({"authenticated": False})

@app.route('/')
def index():
    if authentication and not session.get("name"):
        return redirect("/auth/login")
    
    # Generate a unique ID for the session if it doesn't exist
    if 'session_id' not in session:
        session['session_id'] = str(uuid.uuid4())
        
    return render_template('index.html')

if autoRun:
    if __name__ == '__main__':
        app.run(debug=True, port=port)
