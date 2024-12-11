import requests
import time
import pytest
from test_functions import (create_post, login_user, nick_post, olga_post, users, BASE_URL, tokens)

def test_case_1():
    """Olga, Nick, Mary, and Nestor register successfully"""
    for user in users:
        response = requests.post(f"{BASE_URL}/api/user/register", json=user)
        assert response.status_code in (200, 201)

def test_case_2():
    """Olga, Nick, Mary, and Nestor log in successfully and store tokens."""
    for user in users:
        login_user(user)
    # Assert that tokens have been stored for all users
    for user in users:
        assert user["username"] in tokens, f"Token for {user['username']} not found in tokens dictionary"
        assert tokens[user["username"]], f"Token for {user['username']} is empty or invalid"


def test_case_3():
    """Olga makes an API call without using her token. This should be unsuccessful."""
    response = requests.get(f"{BASE_URL}/posts")  # No token included
    assert response.status_code == 401, "Unauthorized access should return status code 401"
    assert response.status_code != 200, 201

def test_case_4():
    """Olga posts a message in the Tech topic with expiration time using her token."""
    login_user(users["Olga"])
    # Ensure Olga is logged in and her token is stored
    assert "Olga" in tokens, "Olga's token is missing. Ensure she is logged in."
    # Create the post
    post_id = create_post("Olga", olga_post)
    # Assert the post was successfully created and has a valid ID
    assert post_id, "Post creation failed for Olga. No post ID returned."

def test_case_post_to_user_posts():
    """Test Nick posts a message to /api/user/posts and gets the correct response code."""
    login_user(users["Nick"])
    token = tokens.get("Nick")  # Retrieve the user's token

    # Send the POST request
    headers = {"auth-token": token}
    response = requests.post(f"{BASE_URL}/api/user/posts", json=nick_post, headers=headers)

    # Assert the response code is 201 (Created)
    assert response.status_code == 201

