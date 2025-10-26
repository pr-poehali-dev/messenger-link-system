'''
Business: Connect social media platforms to user account
Args: event with httpMethod, body (userId, platform, platformUserId)
Returns: HTTP response with success status
'''

import json
import os
import psycopg2
from psycopg2.extras import RealDictCursor
from typing import Dict, Any

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    method: str = event.get('httpMethod', 'GET')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'POST, DELETE, OPTIONS',
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
            user_id = body_data.get('userId')
            platform = body_data.get('platform', '').strip().lower()
            platform_user_id = body_data.get('platformUserId', '').strip()
            
            if not user_id or not platform:
                return {
                    'statusCode': 400,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'userId and platform required'})
                }
            
            if platform not in ['telegram', 'vk', 'max', 'whatsapp']:
                return {
                    'statusCode': 400,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'Invalid platform'})
                }
            
            cur.execute(
                """INSERT INTO connected_platforms (user_id, platform, platform_user_id, is_active)
                   VALUES (%s, %s, %s, TRUE)
                   ON CONFLICT (user_id, platform) 
                   DO UPDATE SET platform_user_id = EXCLUDED.platform_user_id, 
                                 is_active = TRUE,
                                 connected_at = CURRENT_TIMESTAMP
                   RETURNING id""",
                (user_id, platform, platform_user_id or f'{platform}_user_{user_id}')
            )
            conn.commit()
            
            cur.execute(
                """SELECT platform FROM connected_platforms 
                   WHERE user_id = %s AND is_active = TRUE""",
                (user_id,)
            )
            platforms = [row['platform'] for row in cur.fetchall()]
            
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({
                    'success': True,
                    'message': f'Platform {platform} connected',
                    'connectedPlatforms': platforms
                })
            }
        
        elif method == 'DELETE':
            body_data = json.loads(event.get('body', '{}'))
            user_id = body_data.get('userId')
            platform = body_data.get('platform', '').strip().lower()
            
            if not user_id or not platform:
                return {
                    'statusCode': 400,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'userId and platform required'})
                }
            
            cur.execute(
                """UPDATE connected_platforms 
                   SET is_active = FALSE 
                   WHERE user_id = %s AND platform = %s""",
                (user_id, platform)
            )
            conn.commit()
            
            cur.execute(
                """SELECT platform FROM connected_platforms 
                   WHERE user_id = %s AND is_active = TRUE""",
                (user_id,)
            )
            platforms = [row['platform'] for row in cur.fetchall()]
            
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({
                    'success': True,
                    'message': f'Platform {platform} disconnected',
                    'connectedPlatforms': platforms
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
