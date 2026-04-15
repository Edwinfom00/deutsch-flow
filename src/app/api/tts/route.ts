import type { NextRequest } from "next/server";

export const dynamic = "force-dynamic";

/**
 * POST /api/tts
 * Body: { text: string; voiceId?: string }
 * Returns: audio/mpeg stream from ElevenLabs (eleven_multilingual_v2)
 *
 * This route keeps the ELEVENLABS_API_KEY server-side only.
 * Speed / playback-rate is handled client-side via HTMLAudioElement.playbackRate.
 */
export async function POST(req: NextRequest) {
  const apiKey = process.env.ELEVENLABS_API_KEY;
  if (!apiKey) {
    console.error("[/api/tts] ELEVENLABS_API_KEY is not set");
    return new Response("ElevenLabs not configured", { status: 500 });
  }

  let text: string;
  let voiceId: string;

  try {
    const body = (await req.json()) as { text?: string; voiceId?: string };
    text = (body.text ?? "").trim();
    voiceId = body.voiceId ?? "pNInz6obpgDQGcFmaJgB"; // Adam — default
  } catch {
    return new Response("Invalid JSON body", { status: 400 });
  }

  if (!text) {
    return new Response("text is required", { status: 400 });
  }

  try {
    const elRes = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`,
      {
        method: "POST",
        headers: {
          "xi-api-key": apiKey,
          "Content-Type": "application/json",
          Accept: "audio/mpeg",
        },
        body: JSON.stringify({
          text,
          model_id: "eleven_multilingual_v2",
          voice_settings: {
            stability: 0.5,
            similarity_boost: 0.75,
            style: 0.0,
            use_speaker_boost: true,
          },
        }),
      }
    );

    if (!elRes.ok) {
      const errText = await elRes.text();
      console.error("[/api/tts] ElevenLabs error:", elRes.status, errText);
      return new Response("TTS generation failed", { status: elRes.status });
    }

    const audio = await elRes.arrayBuffer();
    return new Response(audio, {
      headers: {
        "Content-Type": "audio/mpeg",
        "Cache-Control": "no-store",
      },
    });
  } catch (err) {
    console.error("[/api/tts] Unexpected error:", err);
    return new Response("Internal error", { status: 500 });
  }
}
