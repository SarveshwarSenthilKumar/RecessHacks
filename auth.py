from flask import Flask, render_template, request, redirect, session, jsonify, Blueprint
from flask_session import Session
from flask_cors import cross_origin
from datetime import datetime
import pytz
from sql import * #Used for database connection and management
from authfunctions import * #Used for user authentication functions

auth_blueprint = Blueprint('auth', __name__)

@auth_blueprint.route("/login", methods=["POST"])
@cross_origin(supports_credentials=True)
def login():
    if session.get("name"):
        return jsonify({"success": True, "username": session["name"]})
        
    data = request.get_json()
    if not data or 'username' not in data or 'password' not in data:
        return jsonify({"success": False, "error": "Username and password are required"}), 400
    
    username = data['username'].strip().lower()
    password = data['password'].strip()
    
    try:
        hashed_password = hash(password)
        db = SQL("sqlite:///users.db")
        users = db.execute("SELECT * FROM users WHERE username = :username", username=username)

        if len(users) == 0:
            return jsonify({"success": False, "error": "Invalid username or password"}), 401
            
        user = users[0]
        if user["password"] == hashed_password:
            session["name"] = username
            session.permanent = True
            return jsonify({
                "success": True, 
                "username": username,
                "message": "Login successful"
            })
            
        return jsonify({"success": False, "error": "Invalid username or password"}), 401
        
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500
    
@auth_blueprint.route("/signup", methods=["POST"])
@cross_origin(supports_credentials=True)
def signup():
    if session.get("name"):
        return jsonify({"success": True, "username": session["name"]})
        
    data = request.get_json()
    if not data:
        return jsonify({"success": False, "error": "Invalid request data"}), 400
        
    email = data.get('email', '').strip().lower()
    fullName = data.get('name', '').strip()
    username = data.get('username', '').strip().lower()
    password = data.get('password', '').strip()
    
    # Validate username
    validUsername = verifyUsername(username)
    if not validUsername[0]:
        return jsonify({"success": False, "error": validUsername[1]}), 400
    username = validUsername[1]

    # Validate email
    validEmail = verifyEmail(email)
    if not validEmail[0]:
        return jsonify({"success": False, "error": validEmail[1]}), 400
    email = validEmail[1]

    # Validate password
    validPassword = verifyPassword(password)
    if not validPassword[0]:
        return jsonify({"success": False, "error": validPassword[1]}), 400
    password = validPassword[1]

    try:
        db = SQL("sqlite:///users.db")
        
        # Check if username exists
        users = db.execute("SELECT * FROM users WHERE username = :username", username=username)
        if len(users) > 0:
            return jsonify({"success": False, "error": "Username already taken"}), 409
        
        # Check if email exists
        users = db.execute("SELECT * FROM users WHERE email = :email", email=email)
        if len(users) > 0:
            return jsonify({"success": False, "error": "Email already registered"}), 409

        # Create new user
        hashed_password = hash(password)
        db.execute(
            """
            INSERT INTO users (email, username, password, name) 
            VALUES (:email, :username, :password, :name)
            """, 
            email=email, 
            username=username, 
            password=hashed_password, 
            name=fullName
        )
        
        # Set session
        session["name"] = username
        session.permanent = True
        
        return jsonify({
            "success": True, 
            "username": username,
            "message": "Registration successful"
        })
        
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500
    
@auth_blueprint.route("/logout", methods=["POST"])
@cross_origin(supports_credentials=True)
def logout():
    session.clear()
    return jsonify({"success": True, "message": "Logged out successfully"})
