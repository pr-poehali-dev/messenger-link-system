'''
Business: User registration and authentication for Mess_skz platform
Args: event with httpMethod, body (username, password for registration/login)
Returns: HTTP response with user data or error
'''

import json
import os
import psycopg2
from psycopg2.extras import RealDictCursor
from typing import Dict, Any
import hashlib
import secrets
from datetime import datetime, timedelta

def hash_password(password: str) -> str:
    return hashlib.sha256(password.encode()).hexdigest()

def generate_session_token() -> str:
    return secrets.token_urlsafe(32)

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    method: str = event.get('httpMethod', 'GET')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, X-Session-Token',
                'Access-Control-Max-Age': '86400'
            },
            'body': ''
        }
    
    db_url = os.environ.get('DATABASE_URL')
    if not db_url:
        return {
            'statusCode': 500,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Database not configured'})
        }
    
    conn = psycopg2.connect(db_url)
    cur = conn.cursor(cursor_factory=RealDictCursor)
    
    try:
        if method == 'POST':
            body_data = json.loads(event.get('body', '{}'))
            action = body_data.get('action', 'login')
            username = body_data.get('username', '').strip()
            password = body_data.get('password', '')
            
            if not username or not password:
                return {
                    'statusCode': 400,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'Username and password required'})
                }
            
            if action == 'register':
                cur.execute("SELECT id FROM users WHERE username = %s", (username,))
                existing_user = cur.fetchone()
                
                if existing_user:
                    return {
                        'statusCode': 409,
                        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                        'body': json.dumps({'error': 'Username already exists'})
                    }
                
                password_hash = hash_password(password)
                trial_end = datetime.now() + timedelta(days=3)
                
                cur.execute(
                    """INSERT INTO users (username, password_hash, trial_end_date) 
                       VALUES (%s, %s, %s) RETURNING id, username, is_admin, is_verified, is_pro, trial_end_date""",
                    (username, password_hash, trial_end)
                )
                user = cur.fetchone()
                conn.commit()
                
                session_token = generate_session_token()
                
                trial_days_left = max(0, (user['trial_end_date'] - datetime.now()).days)
                
                return {
                    'statusCode': 201,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({
                        'user': {
                            'id': user['id'],
                            'username': user['username'],
                            'isAdmin': user['is_admin'],
                            'isVerified': user['is_verified'],
                            'isPro': user['is_pro'],
                            'trialDaysLeft': trial_days_left,
                            'connectedPlatforms': []
                        },
                        'sessionToken': session_token
                    })
                }
            
            elif action == 'login':
                password_hash = hash_password(password)
                
                print(f"Login attempt: username={username}, password_hash={password_hash[:20]}...")
                
                cur.execute(
                    """SELECT id, username, is_admin, is_verified, is_pro, trial_end_date, password_hash 
                       FROM users WHERE username = %s""",
                    (username,)
                )
                user = cur.fetchone()
                
                if not user:
                    print(f"User not found: {username}")
                    return {
                        'statusCode': 401,
                        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                        'body': json.dumps({'error': 'Invalid username or password'})
                    }
                
                if user['password_hash'] != password_hash:
                    print(f"Password mismatch: expected={user['password_hash'][:20]}..., got={password_hash[:20]}...")
                    return {
                        'statusCode': 401,
                        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                        'body': json.dumps({'error': 'Invalid username or password'})
                    }
                
                session_token = generate_session_token()
                
                trial_days_left = 0
                if user['trial_end_date']:
                    trial_days_left = max(0, (user['trial_end_date'] - datetime.now()).days)
                
                cur.execute(
                    """SELECT platform FROM connected_platforms 
                       WHERE user_id = %s AND is_active = TRUE""",
                    (user['id'],)
                )
                platforms = [row['platform'] for row in cur.fetchall()]
                
                return {
                    'statusCode': 200,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({
                        'user': {
                            'id': user['id'],
                            'username': user['username'],
                            'isAdmin': user['is_admin'],
                            'isVerified': user['is_verified'],
                            'isPro': user['is_pro'],
                            'trialDaysLeft': trial_days_left,
                            'connectedPlatforms': platforms
                        },
                        'sessionToken': session_token
                    })
                }
        
        return {
            'statusCode': 405,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Method not allowed'})
        }
    
    finally:
        cur.close()
        conn.close()