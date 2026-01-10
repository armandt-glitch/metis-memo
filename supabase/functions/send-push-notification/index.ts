import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const MOTIVATIONAL_MESSAGES = [
  "Rome ne s'est pas faite en un jour, ta mémoire non plus. Viens réviser.",
  "Un petit rappel aujourd'hui, un grand souvenir demain.",
  "Deux minutes de révision valent mieux qu'un oubli total.",
  "Ta mémoire t'attend, elle n'aime pas être mise en pause.",
  "Réviser maintenant, remercier ton futur toi plus tard.",
  "Juste une carte. Promis, après tu peux retourner procrastiner.",
  "Si tu lis ça, tu peux réviser une carte.",
  "Ding ! Ce souvenir aimerait rester vivant.",
]

function getRandomMessage(): string {
  return MOTIVATIONAL_MESSAGES[Math.floor(Math.random() * MOTIVATIONAL_MESSAGES.length)]
}

async function sendWebPush(
  subscription: { endpoint: string; p256dh: string; auth: string },
  payload: { title: string; body: string; url?: string }
): Promise<boolean> {
  const vapidPublicKey = Deno.env.get('VAPID_PUBLIC_KEY')
  const vapidPrivateKey = Deno.env.get('VAPID_PRIVATE_KEY')

  if (!vapidPublicKey || !vapidPrivateKey) {
    console.error('VAPID keys not configured')
    return false
  }

  try {
    // For now, we'll use a simple fetch to the push endpoint
    // In production, you'd use the web-push library with proper encryption
    // This is a simplified version that logs the attempt
    console.log('Would send push to:', subscription.endpoint)
    console.log('Payload:', payload)
    
    // Note: Proper web push requires complex encryption
    // For a full implementation, consider using a Deno-compatible web-push library
    // or a push notification service like OneSignal, Firebase, etc.
    
    return true
  } catch (error) {
    console.error('Error sending push:', error)
    return false
  }
}

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    // Use service role for cron job access
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    )

    const now = new Date().toISOString()

    // Get all due notifications that haven't been sent
    const { data: notifications, error: fetchError } = await supabase
      .from('scheduled_notifications')
      .select('id, user_id, card_count')
      .lte('scheduled_at', now)
      .eq('sent', false)
      .limit(100)

    if (fetchError) {
      console.error('Error fetching notifications:', fetchError)
      return new Response(
        JSON.stringify({ error: 'Failed to fetch notifications' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    if (!notifications || notifications.length === 0) {
      return new Response(
        JSON.stringify({ message: 'No notifications to send' }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    console.log(`Processing ${notifications.length} notifications`)

    // Group by user to avoid sending multiple notifications
    const userNotifications = new Map<string, { ids: string[]; totalCards: number }>()
    
    for (const notif of notifications) {
      const existing = userNotifications.get(notif.user_id)
      if (existing) {
        existing.ids.push(notif.id)
        existing.totalCards += notif.card_count
      } else {
        userNotifications.set(notif.user_id, {
          ids: [notif.id],
          totalCards: notif.card_count,
        })
      }
    }

    let sentCount = 0
    const notificationIds: string[] = []

    for (const [userId, data] of userNotifications) {
      // Get user's push subscription
      const { data: subscription, error: subError } = await supabase
        .from('push_subscriptions')
        .select('endpoint, p256dh, auth')
        .eq('user_id', userId)
        .single()

      if (subError || !subscription) {
        console.log(`No subscription found for user ${userId}`)
        // Still mark as sent to avoid retrying
        notificationIds.push(...data.ids)
        continue
      }

      // Send push notification
      const success = await sendWebPush(subscription, {
        title: 'Métis Memo',
        body: getRandomMessage(),
        url: '/?openReview=true',
      })

      if (success) {
        sentCount++
      }
      
      notificationIds.push(...data.ids)
    }

    // Mark all processed notifications as sent
    if (notificationIds.length > 0) {
      const { error: updateError } = await supabase
        .from('scheduled_notifications')
        .update({ sent: true })
        .in('id', notificationIds)

      if (updateError) {
        console.error('Error marking notifications as sent:', updateError)
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        processed: notifications.length,
        sent: sentCount 
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Error in send-push-notification:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
