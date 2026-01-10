-- Create table for storing push subscriptions
CREATE TABLE public.push_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  device_id TEXT NOT NULL UNIQUE,
  endpoint TEXT NOT NULL,
  p256dh TEXT NOT NULL,
  auth TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.push_subscriptions ENABLE ROW LEVEL SECURITY;

-- Allow anyone to insert/update their subscription (identified by device_id)
CREATE POLICY "Anyone can insert push subscriptions"
ON public.push_subscriptions
FOR INSERT
WITH CHECK (true);

CREATE POLICY "Anyone can update their push subscription"
ON public.push_subscriptions
FOR UPDATE
USING (true);

CREATE POLICY "Anyone can view push subscriptions"
ON public.push_subscriptions
FOR SELECT
USING (true);

-- Create table for scheduled notifications
CREATE TABLE public.scheduled_notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  device_id TEXT NOT NULL REFERENCES public.push_subscriptions(device_id) ON DELETE CASCADE,
  scheduled_at TIMESTAMP WITH TIME ZONE NOT NULL,
  card_count INTEGER NOT NULL DEFAULT 1,
  sent BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.scheduled_notifications ENABLE ROW LEVEL SECURITY;

-- Allow anyone to manage their scheduled notifications
CREATE POLICY "Anyone can insert scheduled notifications"
ON public.scheduled_notifications
FOR INSERT
WITH CHECK (true);

CREATE POLICY "Anyone can update scheduled notifications"
ON public.scheduled_notifications
FOR UPDATE
USING (true);

CREATE POLICY "Anyone can delete scheduled notifications"
ON public.scheduled_notifications
FOR DELETE
USING (true);

CREATE POLICY "Anyone can view scheduled notifications"
ON public.scheduled_notifications
FOR SELECT
USING (true);

-- Create index for faster queries
CREATE INDEX idx_scheduled_notifications_pending 
ON public.scheduled_notifications(scheduled_at, sent) 
WHERE sent = false;

-- Trigger for updated_at on push_subscriptions
CREATE TRIGGER update_push_subscriptions_updated_at
BEFORE UPDATE ON public.push_subscriptions
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();