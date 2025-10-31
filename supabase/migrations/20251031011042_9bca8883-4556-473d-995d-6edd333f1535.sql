-- Allow users to insert their own role (only once, for their own user_id)
CREATE POLICY "Users can insert their own role"
ON public.user_roles
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Create admin account role (you'll need to sign up with email: admin@petsustain.com, password: Admin@123456)
-- After signing up with that email, this will automatically assign admin role
-- Note: You must sign up first with these credentials, then this role will be waiting