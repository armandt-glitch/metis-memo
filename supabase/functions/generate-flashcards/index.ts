import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const THEMES = {
  'culture': 'Culture générale',
  'histoire': 'Histoire',
  'sciences': 'Sciences',
  'geographie': 'Géographie',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { theme, count: rawCount = 5 } = await req.json();
    const count = Math.min(Math.max(parseInt(rawCount) || 5, 1), 20);
    
    if (!theme || !THEMES[theme as keyof typeof THEMES]) {
      return new Response(
        JSON.stringify({ error: 'Thème invalide' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    const themeName = THEMES[theme as keyof typeof THEMES];
    console.log(`Generating ${count} flashcards for theme: ${themeName}`);

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          {
            role: 'system',
            content: `Tu es un expert en création de flashcards éducatives. Génère exactement ${count} questions-réponses sur le thème "${themeName}". 
            
Règles:
- Questions variées et intéressantes
- Réponses concises mais complètes
- Niveau de difficulté moyen
- En français

Retourne UNIQUEMENT un tableau JSON valide avec ce format:
[{"question": "...", "answer": "..."}, ...]`
          },
          {
            role: 'user',
            content: `Génère ${count} flashcards sur le thème: ${themeName}`
          }
        ],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AI API error:', response.status, errorText);
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: 'Limite de requêtes atteinte, réessayez plus tard.' }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: 'Crédits insuffisants.' }),
          { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      throw new Error(`AI API error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;
    
    console.log('AI response received:', content?.substring(0, 200));

    // Parse JSON from response
    const jsonMatch = content.match(/\[[\s\S]*\]/);
    if (!jsonMatch) {
      throw new Error('Invalid AI response format');
    }

    const flashcards = JSON.parse(jsonMatch[0]);
    console.log(`Successfully generated ${flashcards.length} flashcards`);

    return new Response(
      JSON.stringify({ flashcards, theme: themeName }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error generating flashcards:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Erreur de génération' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
