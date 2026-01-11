const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const MOTIVATIONAL_MESSAGES = [
  "Rome ne s'est pas faite en un jour, ta mémoire non plus. Viens réviser.",
  "Un petit rappel aujourd'hui, un grand souvenir demain.",
  "Deux minutes de révision valent mieux qu'un oubli total.",
  "Ta mémoire t'attend, elle n'aime pas être mise en pause.",
  "Réviser maintenant, remercier ton futur toi plus tard.",
  "Juste une carte. Promis, après tu peux retourner procrastiner.",
  "Si tu lis ça, tu peux réviser une carte.",
  "Ding ! Ce souvenir aimerait rester vivant.",
];

function getRandomMessage(): string {
  return MOTIVATIONAL_MESSAGES[Math.floor(Math.random() * MOTIVATIONAL_MESSAGES.length)];
}

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const ONESIGNAL_APP_ID = Deno.env.get('ONESIGNAL_APP_ID');
    const ONESIGNAL_API_KEY = Deno.env.get('ONESIGNAL_API_KEY');

    if (!ONESIGNAL_APP_ID || !ONESIGNAL_API_KEY) {
      console.error('Missing OneSignal configuration');
      return new Response(
        JSON.stringify({ error: 'OneSignal not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { user_ids, title, body } = await req.json();

    if (!user_ids || !Array.isArray(user_ids) || user_ids.length === 0) {
      return new Response(
        JSON.stringify({ error: 'user_ids array is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const notificationTitle = title || 'Métis Memo';
    const notificationBody = body || getRandomMessage();

    console.log(`Sending OneSignal notification to ${user_ids.length} users`);

    const response = await fetch('https://api.onesignal.com/notifications', {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${ONESIGNAL_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        app_id: ONESIGNAL_APP_ID,
        include_aliases: { 
          external_id: user_ids 
        },
        target_channel: 'push',
        headings: { 
          fr: notificationTitle, 
          en: notificationTitle 
        },
        contents: { 
          fr: notificationBody, 
          en: notificationBody 
        },
        url: '/?openReview=true',
        chrome_web_icon: '/pwa-192x192.png',
        chrome_web_badge: '/pwa-192x192.png',
        web_buttons: [
          { 
            id: 'review', 
            text: '📚 Réviser', 
            url: '/?openReview=true' 
          },
          { 
            id: 'dismiss', 
            text: 'Plus tard' 
          }
        ],
        // Notification settings
        priority: 10,
        ttl: 86400, // 24 hours
      }),
    });

    const data = await response.json();
    
    if (!response.ok) {
      console.error('OneSignal API error:', data);
      return new Response(
        JSON.stringify({ error: 'Failed to send notification', details: data }),
        { status: response.status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('OneSignal notification sent:', data);
    
    return new Response(
      JSON.stringify({ success: true, data }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in send-onesignal-notification:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
