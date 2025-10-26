-- Update admin passwords to "22"
UPDATE users 
SET password_hash = '785f3ec7eb32f30b90cd298e774f8818ab3929ff3c52357e300e5143c6878cae' 
WHERE is_admin = TRUE;