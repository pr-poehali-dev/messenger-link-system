CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    is_admin BOOLEAN DEFAULT FALSE,
    is_verified BOOLEAN DEFAULT FALSE,
    is_pro BOOLEAN DEFAULT FALSE,
    trial_end_date TIMESTAMP DEFAULT (NOW() + INTERVAL '3 days'),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS connected_platforms (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id),
    platform VARCHAR(50) NOT NULL,
    platform_user_id VARCHAR(255),
    platform_username VARCHAR(255),
    access_token TEXT,
    refresh_token TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    connected_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(user_id, platform)
);

CREATE TABLE IF NOT EXISTS messages (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id),
    platform VARCHAR(50) NOT NULL,
    sender_name VARCHAR(255) NOT NULL,
    sender_id VARCHAR(255),
    message_text TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    received_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
CREATE INDEX IF NOT EXISTS idx_messages_user_id ON messages(user_id);
CREATE INDEX IF NOT EXISTS idx_messages_is_read ON messages(is_read);
CREATE INDEX IF NOT EXISTS idx_connected_platforms_user_id ON connected_platforms(user_id);

INSERT INTO users (username, password_hash, is_admin, is_verified, is_pro, trial_end_date) 
VALUES ('skzry', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', TRUE, TRUE, TRUE, NULL)
ON CONFLICT (username) DO NOTHING;