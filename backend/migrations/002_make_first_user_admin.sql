-- Make the first user an admin (only if no admins exist)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM users WHERE role = 'admin') THEN
    UPDATE users
    SET role = 'admin'
    WHERE id = (SELECT MIN(id) FROM users)
    AND EXISTS (SELECT 1 FROM users);
    
    RAISE NOTICE 'First user promoted to admin';
  ELSE
    RAISE NOTICE 'Admin users already exist, no changes made';
  END IF;
END $$;
