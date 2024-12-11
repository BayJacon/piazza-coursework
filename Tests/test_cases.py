import requests
import time
import pytest
from test_functions import (create_post, login_user, nick_post, olga_post, users, BASE_URL, tokens)

def test_case_1():
    """Olga, Nick, Mary, and Nestor register successfully."""
    for user_data in users.values():
        response = requests.post(f"{BASE_URL}/api/user/register", json=user_data)
        assert response.status_code in (200, 201), f"Failed to register user: {user_data['username']}"

def test_case_2():
    """Olga, Nick, Mary, and Nestor log in successfully and store tokens."""
    for user_data in users.values():
        login_user(user_data)
    # Assert that tokens have been stored for all users
    for username, user_data in users.items():
        assert username in tokens, f"Token for {username} not found in tokens dictionary"
        assert tokens[username], f"Token for {username} is empty or invalid"


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