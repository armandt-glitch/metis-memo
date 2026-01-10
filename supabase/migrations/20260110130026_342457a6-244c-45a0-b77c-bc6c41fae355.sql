-- Drop existing policies on push_subscriptions
DROP POLICY IF EXISTS "Anyone can insert push subscriptions" ON push_subscriptions;
DROP POLICY IF EXISTS "Anyone can update their push subscription" ON push_subscriptions;
DROP POLICY IF EXISTS "Anyone can view push subscriptions" ON push_subscriptions;

-- Drop existing policies on scheduled_notifications
DROP POLICY IF EXISTS "Anyone can insert scheduled notifications" ON scheduled_notifications;
DROP POLICY IF EXISTS "Anyone can update scheduled notifications" ON scheduled_notifications;
DROP POLICY IF EXISTS "Anyone can delete scheduled notifications" ON scheduled_notifications;
DROP POLICY IF EXISTS "Anyone can view scheduled notifications" ON scheduled_notifications;

-- Drop the foreign key constraint first
ALTER TABLE scheduled_notifications DROP CONSTRAINT IF EXISTS scheduled_notifications_device_id_fkey;

-- Remove device_id and add user_id to push_subscriptions
ALTER TABLE push_subscriptions DROP CONSTRAINT IF EXISTS push_subscriptions_device_id_key;
ALTER TABLE push_subscriptions DROP COLUMN IF EXISTS device_id;
ALTER TABLE push_subscriptions ADD COLUMN user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE push_subscriptions ADD CONSTRAINT push_subscriptions_user_unique UNIQUE (user_id);

-- Remove device_id and add user_id to scheduled_notifications
ALTER TABLE scheduled_notifications DROP COLUMN IF EXISTS device_id;
ALTER TABLE scheduled_notifications ADD COLUMN user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE;

-- Create new RLS policies for push_subscriptions
CREATE POLICY "Users can insert their own subscription"
ON push_subscriptions FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own subscription"
ON push_subscriptions FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can view their own subscription"
ON push_subscriptions FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own subscription"
ON push_subscriptions FOR DELETE
USING (auth.uid() = user_id);

-- Create new RLS policies for scheduled_notifications
CREATE POLICY "Users can insert their own notifications"
ON scheduled_notifications FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own notifications"
ON scheduled_notifications FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own notifications"
ON scheduled_notifications FOR DELETE
USING (auth.uid() = user_id);

CREATE POLICY "Users can view their own notifications"
ON scheduled_notifications FOR SELECT
USING (auth.uid() = user_id);

-- Create index for faster queries on user_id
CREATE INDEX IF NOT EXISTS idx_scheduled_notifications_user 
ON scheduled_notifications(user_id, scheduled_at) 
WHERE sent = false;