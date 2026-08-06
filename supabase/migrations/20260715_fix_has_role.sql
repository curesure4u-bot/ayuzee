-- 🔧 Create the has_role function (CRITICAL - app depends on this!)
-- This function is called by the frontend to check user permissions

CREATE OR REPLACE FUNCTION has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_id = _user_id AND role = _role
  );
$$;

-- Grant execute permission to authenticated and anon users
GRANT EXECUTE ON FUNCTION has_role(UUID, app_role) TO authenticated;
GRANT EXECUTE ON FUNCTION has_role(UUID, app_role) TO anon;

-- Also verify the roles are there
SELECT u.email, ur.role 
FROM user_roles ur 
JOIN auth.users u ON u.id = ur.user_id 
WHERE u.email = 'curesure4u@gmail.com'
ORDER BY ur.role;
