import { useCallback, useEffect, useRef } from "react";
import { useAuth } from "~/contexts/AuthContext";

// ✅ Global Cache: Created once, persists across all component re-renders and unmounts.
const audioCache: Record<string, HTMLAudioElement> = {};

// Sound mapping
const SOUND_FILES = {
  click: "/sounds/click-minecraftsound.mp3",
  correct: "/sounds/duolingo-correct.mp3",
  wrong: "/sounds/duolingo-incorrect.mp3",
  complete: "/sounds/duolingo-completed-chapter.mp3",
  gameover: "/sounds/fah.mp3",
  claim: "/sounds/happy-happy-happy-cat.mp3",
  purchase: "/sounds/purchase-gold-sfx.mp3",
  tour_voice:
    "/sounds/animal-crossing-isabelle-voice-clips-no-background-music-youtubemp3free.mp3",
};

export function useGameSound() {
  const { user } = useAuth();
  const soundEnabled = user?.settings?.soundEnabled ?? true;
  const sfxVolume = user?.settings?.sfxVolume ?? 50;
  const actualVolume = soundEnabled ? sfxVolume / 100 : 0;

  useEffect(() => {
    // 1. Preload all sounds immediately when this hook is first used
    if (typeof window !== "undefined") {
      Object.entries(SOUND_FILES).forEach(([key, src]) => {
        if (!audioCache[key]) {
          const audio = new Audio(src);
          audio.preload = "auto"; // Force browser to fetch headers/data
          audio.volume = actualVolume;
          audioCache[key] = audio;
        }
      });
    }
  }, []);

  // 2. Update volume for all cached sounds when settings change
  useEffect(() => {
    Object.values(audioCache).forEach((audio) => {
      audio.volume = actualVolume;
    });
  }, [actualVolume]);

  const playSound = useCallback((type: keyof typeof SOUND_FILES) => {
    const audio = audioCache[type];
    if (audio) {
      // 2. Reset time to 0 allows "rapid fire" clicking (e.g. typing sounds)
      audio.currentTime = 0;

      // 3. Play immediately. Catch error if user hasn't interacted with page yet.
      const playPromise = audio.play();
      if (playPromise !== undefined) {
        playPromise.catch((error) => {
          console.warn("Audio playback prevented:", error);
        });
      }
    }
  }, []);

  const stopSound = useCallback((type: keyof typeof SOUND_FILES) => {
    const audio = audioCache[type];
    if (audio) {
      audio.pause();
      audio.currentTime = 0;
    }
  }, []);

  const playCustomSound = useCallback((src: string) => {
    if (!audioCache[src]) {
      const audio = new Audio(src);
      audio.preload = "auto";
      audio.volume = actualVolume;
      audioCache[src] = audio;
    }
    const audio = audioCache[src];
    if (audio) {
      audio.currentTime = 0;
      audio.volume = actualVolume;
      const playPromise = audio.play();
      if (playPromise !== undefined) {
        playPromise.catch((error) => {
          console.warn("Audio playback prevented:", error);
        });
      }
    }
  }, [actualVolume]);

  const stopCustomSound = useCallback((src: string) => {
    const audio = audioCache[src];
    if (audio) {
      audio.pause();
      audio.currentTime = 0;
    }
  }, []);

  return { playSound, stopSound, playCustomSound, stopCustomSound };
}
