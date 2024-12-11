import requests
import time
import pytest

BASE_URL = "http://localhost:3000"

users = {
    "Olga": {"username": "Olga", "email": "olga@example.com", "password": "password123"},
    "Nick": {"username": "Nick", "email": "nick@example.com", "password": "password123"},
    "Mary": {"username": "Mary", "email": "mary@example.com", "password": "password123"},
    "Nestor": {"username": "Nestor", "email": "nestor@example.com", "password": "password123"},
}

nick_post = {
        "title": "Coding Problems",
        "text": "JavaScript is so difficult :(",
        "topic": "Tech",
        "duration": 1,  # Expiration time in minutes
    }

olga_post = {
    "title": "Cloud Computing",
    "text": "Stelios's Cloud Computing Module is great, I really loved that coursework!",
    "topic": "Tech",
    "duration": 5,
    }  

tokens = {}
post_ids = {}

def register_user(user):
    try:
        response = requests.post(f"{BASE_URL}/api/user/register", json=user)
        response.raise_for_status()
        print(f"User {user['username']} registered successfully.")
    except requests.exceptions.HTTPError as e:
        print(f"Error registering {user['username']}:", e.response.json())

def login_user(user):
    try:
        # Only include email and password in the login request
        login_data = {"email": user["email"], "password": user["password"]}
        response = requests.post(f"{BASE_URL}/api/user/login", json=login_data)
        response.raise_for_status()
        token = response.json()["auth-token"]
        tokens[user["username"]] = token  # Use username as the key in tokens dictionary
        print(f"User {user['username']} logged in. Token: {token}")
    except requests.exceptions.HTTPError as e:
        print(f"Error logging in {user['username']}:", e.response.json())

def unauthorized_call():
    print("\nTC 3: Testing unauthorized API access...")
    try:
        response = requests.get(f"{BASE_URL}/posts")
        print("Unauthorized call response:", response.json())
    except requests.exceptions.HTTPError as e:
        print("Expected unauthorized error:", e.response.json())

def create_post(username, post_data):
    try:
        token = tokens[username]
        headers = {"auth-token": token}
        response = requests.post(f"{BASE_URL}/posts", json=post_data, headers=headers)
        response.raise_for_status()
        post = response.json()
        print(f"Post created: {post}")
        return post["_id"]
    except requests.exceptions.HTTPError as e:
        print(f"Error creating post for {username}:", e.response.json())