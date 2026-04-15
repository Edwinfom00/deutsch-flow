"use client";

import { useState, useRef, useCallback } from "react";

// ─── Voice IDs (ElevenLabs — eleven_multilingual_v2) ─────────────────────────
// All voices handle German naturally with the multilingual model.

export const EL_VOICES = {
  /** Default AI conversational partner — neutral male */
  ai:       "pNInz6obpgDQGcFmaJgB", // Adam
  /** AI female variant */
  ai_f:     "EXAVITQu4vr4xnSDxMaL", // Bella
  /** Hören primary — clear authoritative male for listening exercises */
  hoeren:   "VR6AewLTigWG4xSOukaG", // Arnold
  /** Hören secondary — female speaker, used in dialogues */
  hoeren_f: "MF3mGyEYCl7XYWbV9V6O", // Elli
} as const;

export type VoiceId = (typeof EL_VOICES)[keyof typeof EL_VOICES] | string;

// ─── Playback rate per CEFR level ────────────────────────────────────────────
// Applied client-side via HTMLAudioElement.playbackRate (0.5 – 4.0).
// A0/A1 → slow & clear. C1/C2 → native-speed.

export const CEFR_RATE: Record<string, number> = {
  A0: 0.70,
  A1: 0.78,
  A2: 0.88,
  B1: 0.95,
  B2: 1.00,
  C1: 1.08,
  C2: 1.15,
};

// ─── useTTS hook ─────────────────────────────────────────────────────────────

export type PlayOptions = {
  voiceId?: VoiceId;
  /** HTMLAudioElement.playbackRate. Defaults to 1.0. */
  playbackRate?: number;
};

/**
 * useTTS — shared Text-to-Speech hook backed by ElevenLabs via /api/tts.
 *
 * Falls back to browser SpeechSynthesis if the API call fails (e.g. no key).
 *
 * Usage:
 *   const { isLoading, isPlaying, play, stop } = useTTS();
 *   play("Guten Morgen!", { voiceId: EL_VOICES.ai, playbackRate: CEFR_RATE["A1"] });
 */
export function useTTS() {
  const [isLoading, setIsLoading] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);

  const audioRef   = useRef<HTMLAudioElement | null>(null);
  const blobUrlRef = useRef<string | null>(null);

  const stop = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    setIsPlaying(false);
  }, []);

  const play = useCallback(
    async (text: string, opts?: PlayOptions) => {
      stop();
      if (!text.trim()) return;
      setIsLoading(true);

      try {
        const res = await fetch("/api/tts", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            text,
            voiceId: opts?.voiceId ?? EL_VOICES.ai,
          }),
        });

        if (!res.ok) throw new Error(`HTTP ${res.status}`);

        const blob = await res.blob();

        // Clean up previous blob URL to avoid memory leaks
        if (blobUrlRef.current) URL.revokeObjectURL(blobUrlRef.current);
        blobUrlRef.current = URL.createObjectURL(blob);

        const audio = new Audio(blobUrlRef.current);
        audioRef.current     = audio;
        audio.playbackRate   = opts?.playbackRate ?? 1.0;
        audio.onplay         = () => { setIsLoading(false); setIsPlaying(true); };
        audio.onended        = () => setIsPlaying(false);
        audio.onerror        = () => { setIsLoading(false); setIsPlaying(false); };
        audio.oncanplaythrough = () => setIsLoading(false);

        await audio.play();
      } catch (err) {
        console.warn("[useTTS] ElevenLabs failed — browser TTS fallback:", err);
        setIsLoading(false);

        if (typeof window !== "undefined" && "speechSynthesis" in window) {
          window.speechSynthesis.cancel();
          const utt = new SpeechSynthesisUtterance(text);
          utt.lang  = "de-DE";
          utt.rate  = opts?.playbackRate ?? 0.9;
          utt.onstart = () => setIsPlaying(true);
          utt.onend   = () => setIsPlaying(false);
          utt.onerror = () => setIsPlaying(false);
          // Find best DE voice available
          const deVoice = window.speechSynthesis.getVoices().find((v) =>
            v.lang.startsWith("de")
          );
          if (deVoice) utt.voice = deVoice;
          window.speechSynthesis.speak(utt);
        }
      }
    },
    [stop]
  );

  return { isLoading, isPlaying, play, stop };
}
