import Anthropic from '@anthropic-ai/sdk';
import OpenAI from 'openai';
import { createClient } from '@/lib/supabase/server';
import { getPreviewItinerary } from '@/lib/preview-auth';
import { getPreviewContext } from '@/lib/preview-auth-server';
import { PLAN_CONFIG } from '@/lib/stripe';

const DEFAULT_OPENAI_MODEL = process.env.OPENAI_ITINERARY_MODEL || 'gpt-5-mini';
const MAX_OUTPUT_TOKENS = Number(process.env.OPENAI_ITINERARY_MAX_OUTPUT_TOKENS || 900);
const ITINERARY_SCHEMA = {
  type: 'object',
  additionalProperties: false,
  required: ['destination', 'tagline', 'days', 'estimated_daily_budget', 'insider_tip'],
  properties: {
    destination: { type: 'string' },
    tagline: { type: 'string' },
    estimated_daily_budget: { type: 'string' },
    insider_tip: { type: 'string' },
    days: {
      type: 'array',
      items: {
        type: 'object',
        additionalProperties: false,
        required: ['day', 'title', 'items'],
        properties: {
          day: { type: 'number' },
          title: { type: 'string' },
          items: {
            type: 'array',
            items: {
              type: 'object',
              additionalProperties: false,
              required: ['time', 'activity', 'description', 'cost', 'type'],
              properties: {
                time: { type: 'string' },
                activity: { type: 'string' },
                description: { type: 'string' },
                cost: { type: 'string' },
                type: { type: 'string', enum: ['gem', 'food', 'culture', 'adventure', 'relax'] },
              },
            },
          },
        },
      },
    },
  },
};

function normalizeQuery(value) {
  return String(value || '').trim().replace(/\s+/g, ' ');
}

function getOpenAI() {
  if (!process.env.OPENAI_API_KEY) return null;
  return new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
}

function getAnthropic() {
  if (!process.env.ANTHROPIC_API_KEY) return null;
  return new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
}

async function generateWithOpenAI(query) {
  const openai = getOpenAI();
  if (!openai) throw new Error('OPENAI_API_KEY is required.');

  const response = await openai.responses.create({
    model: DEFAULT_OPENAI_MODEL,
    input: [
      {
        role: 'system',
        content: [{ type: 'input_text', text: 'You are TripEdge AI, a warm and knowledgeable travel planner specializing in hidden gems and local experiences. Focus on authentic local spots, not tourist traps. Keep the itinerary concise, useful, and structured for a product UI.' }],
      },
      {
        role: 'user',
        content: [{ type: 'input_text', text: `Generate a concise 3-day itinerary for: "${query}". Each day should have 3 to 4 stops max. Keep descriptions to one sentence each. Return valid JSON only.` }],
      },
    ],
    max_output_tokens: MAX_OUTPUT_TOKENS,
    text: {
      format: {
        type: 'json_schema',
        name: 'tripedge_itinerary',
        schema: ITINERARY_SCHEMA,
        strict: true,
      },
    },
  });

  return JSON.parse(response.output_text);
}

async function generateWithAnthropic(query) {
  const anthropic = getAnthropic();
  if (!anthropic) throw new Error('No itinerary AI provider configured.');

  const message = await anthropic.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 900,
    messages: [{ role: 'user', content: `You are TripEdge AI, a warm and knowledgeable travel planner that specializes in hidden gems and local experiences. Generate a concise 3-day itinerary for: "${query}". Each day should have 3 to 4 stops max. Keep descriptions to one sentence. Return ONLY valid JSON (no markdown, no backticks): {"destination":"city","tagline":"A short evocative tagline","days":[{"day":1,"title":"Day title","items":[{"time":"9:00 AM","activity":"Activity name","description":"One sentence why this is special","cost":"$XX","type":"gem|food|culture|adventure|relax"}]}],"estimated_daily_budget":"$XXX","insider_tip":"One local insider tip"}` }],
  });

  const text = message.content[0]?.text || '';
  return JSON.parse(text.replace(/```json|```/g, '').trim());
}

export async function POST(request) {
  const { query } = await request.json();
  const normalizedQuery = normalizeQuery(query);

  if (!normalizedQuery) {
    return Response.json({ error: 'Query is required' }, { status: 400 });
  }

  const preview = getPreviewContext();
  if (preview) {
    return Response.json({
      itinerary: getPreviewItinerary(normalizedQuery),
      cached: true,
      preview: true,
      tripId: `preview-trip-${Date.now()}`,
    });
  }

  const supabase = createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('tier, itineraries_used_this_month')
    .eq('id', user.id)
    .single();

  const limit = PLAN_CONFIG[profile.tier]?.itineraryLimit || 3;
  if (profile.itineraries_used_this_month >= limit) {
    return Response.json({ error: 'Monthly itinerary limit reached. Upgrade to Pro for unlimited.', limit_reached: true }, { status: 429 });
  }

  try {
    const { data: cachedItinerary } = await supabase
      .from('itineraries')
      .select('id, destination, tagline, itinerary_data, estimated_daily_budget, insider_tip')
      .eq('user_id', user.id)
      .eq('query_text', normalizedQuery)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (cachedItinerary?.itinerary_data) {
      return Response.json({ itinerary: cachedItinerary.itinerary_data, cached: true, tripId: cachedItinerary.id });
    }

    let itinerary;
    try {
      itinerary = await generateWithOpenAI(normalizedQuery);
    } catch (openaiError) {
      if (!process.env.ANTHROPIC_API_KEY) throw openaiError;
      itinerary = await generateWithAnthropic(normalizedQuery);
    }

    await supabase.from('profiles').update({ itineraries_used_this_month: profile.itineraries_used_this_month + 1 }).eq('id', user.id);

    const { data: savedTrip, error: insertError } = await supabase.from('itineraries').insert({
      user_id: user.id,
      destination: itinerary.destination,
      tagline: itinerary.tagline,
      query_text: normalizedQuery,
      itinerary_data: itinerary,
      estimated_daily_budget: itinerary.estimated_daily_budget,
      insider_tip: itinerary.insider_tip,
    }).select('id').single();

    if (insertError) {
      throw insertError;
    }

    return Response.json({ itinerary, tripId: savedTrip.id });
  } catch (err) {
    console.error('Itinerary generation error:', err);
    return Response.json({ error: 'Failed to generate itinerary' }, { status: 500 });
  }
}
