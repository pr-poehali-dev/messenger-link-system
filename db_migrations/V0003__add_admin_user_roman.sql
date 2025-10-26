INSERT INTO users (username, password_hash, is_admin, is_verified, is_pro, trial_end_date) 
VALUES ('роман', '8d969eef6ecad3c29a3a629280e686cf0c3f5d5a86aff3ca12020c923adc6c92', TRUE, TRUE, TRUE, NULL)
ON CONFLICT (username) DO NOTHING;