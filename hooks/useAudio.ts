import { useCallback, useEffect, useRef, useState } from 'react';
import { Audio, AVPlaybackStatus, AVPlaybackStatusSuccess } from 'expo-av';

interface AudioState {
  isLoaded: boolean;
  isPlaying: boolean;
  isBuffering: boolean;
  position: number; // seconds
  duration: number; // seconds
  playbackSpeed: number;
  volume: number;
  error: string | null;
}

const DEFAULT_STATE: AudioState = {
  isLoaded: false,
  isPlaying: false,
  isBuffering: false,
  position: 0,
  duration: 0,
  playbackSpeed: 1.0,
  volume: 1.0,
  error: null,
};

export function useAudio(audioUrl?: string) {
  const soundRef = useRef<Audio.Sound | null>(null);
  const sleepTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [state, setState] = useState<AudioState>(DEFAULT_STATE);
  const [sleepTimerActive, setSleepTimerActive] = useState(false);
  const [sleepTimerMinutes, setSleepTimerMinutes] = useState<number | null>(null);

  // ─── Setup Audio Mode ───────────────────────────────────────────────────────

  useEffect(() => {
    Audio.setAudioModeAsync({
      allowsRecordingIOS: false,
      staysActiveInBackground: true,
      playsInSilentModeIOS: true,
      shouldDuckAndroid: true,
      playThroughEarpieceAndroid: false,
    });
  }, []);

  // ─── Load Audio ─────────────────────────────────────────────────────────────

  const load = useCallback(async (url: string) => {
    // Unload existing
    if (soundRef.current) {
      await soundRef.current.unloadAsync();
      soundRef.current = null;
    }

    setState({ ...DEFAULT_STATE });

    try {
      const { sound } = await Audio.Sound.createAsync(
        { uri: url },
        {
          shouldPlay: false,
          progressUpdateIntervalMillis: 500,
          rate: state.playbackSpeed,
          shouldCorrectPitch: true,
        },
        (status) => onPlaybackStatusUpdate(status)
      );
      soundRef.current = sound;
    } catch (err: unknown) {
      setState((prev) => ({
        ...prev,
        error: err instanceof Error ? err.message : 'Failed to load audio',
      }));
    }
  }, [state.playbackSpeed]);

  function onPlaybackStatusUpdate(status: AVPlaybackStatus) {
    if (!status.isLoaded) {
      if ((status as { isLoaded: false; error?: string }).error) {
        setState((prev) => ({
          ...prev,
          error: (status as { isLoaded: false; error?: string }).error ?? 'Playback error',
        }));
      }
      return;
    }

    const s = status as AVPlaybackStatusSuccess;
    setState((prev) => ({
      ...prev,
      isLoaded: true,
      isPlaying: s.isPlaying,
      isBuffering: s.isBuffering,
      position: s.positionMillis / 1000,
      duration: s.durationMillis ? s.durationMillis / 1000 : prev.duration,
      error: null,
    }));

    // Auto-completed
    if (s.didJustFinish) {
      setState((prev) => ({ ...prev, isPlaying: false, position: 0 }));
    }
  }

  // ─── Controls ───────────────────────────────────────────────────────────────

  const play = useCallback(async () => {
    if (!soundRef.current) return;
    await soundRef.current.playAsync();
  }, []);

  const pause = useCallback(async () => {
    if (!soundRef.current) return;
    await soundRef.current.pauseAsync();
  }, []);

  const togglePlayPause = useCallback(async () => {
    if (state.isPlaying) {
      await pause();
    } else {
      await play();
    }
  }, [state.isPlaying, play, pause]);

  const seekTo = useCallback(async (seconds: number) => {
    if (!soundRef.current) return;
    await soundRef.current.setPositionAsync(seconds * 1000);
  }, []);

  const skipForward = useCallback(
    async (seconds = 15) => {
      const newPos = Math.min(state.position + seconds, state.duration);
      await seekTo(newPos);
    },
    [state.position, state.duration, seekTo]
  );

  const skipBackward = useCallback(
    async (seconds = 15) => {
      const newPos = Math.max(state.position - seconds, 0);
      await seekTo(newPos);
    },
    [state.position, seekTo]
  );

  const setPlaybackSpeed = useCallback(async (speed: number) => {
    if (!soundRef.current) return;
    await soundRef.current.setRateAsync(speed, true);
    setState((prev) => ({ ...prev, playbackSpeed: speed }));
  }, []);

  const setVolume = useCallback(async (volume: number) => {
    if (!soundRef.current) return;
    await soundRef.current.setVolumeAsync(volume);
    setState((prev) => ({ ...prev, volume }));
  }, []);

  // ─── Sleep Timer ─────────────────────────────────────────────────────────────

  const startSleepTimer = useCallback(
    (minutes: number) => {
      if (sleepTimerRef.current) clearTimeout(sleepTimerRef.current);
      setSleepTimerMinutes(minutes);
      setSleepTimerActive(true);
      sleepTimerRef.current = setTimeout(async () => {
        await pause();
        setSleepTimerActive(false);
        setSleepTimerMinutes(null);
      }, minutes * 60 * 1000);
    },
    [pause]
  );

  const cancelSleepTimer = useCallback(() => {
    if (sleepTimerRef.current) clearTimeout(sleepTimerRef.current);
    setSleepTimerActive(false);
    setSleepTimerMinutes(null);
  }, []);

  // ─── Cleanup ─────────────────────────────────────────────────────────────────

  useEffect(() => {
    return () => {
      if (soundRef.current) {
        soundRef.current.unloadAsync();
      }
      if (sleepTimerRef.current) {
        clearTimeout(sleepTimerRef.current);
      }
    };
  }, []);

  // ─── Auto-load on URL change ──────────────────────────────────────────────

  useEffect(() => {
    if (audioUrl) {
      load(audioUrl);
    }
  }, [audioUrl]);

  const getProgress = useCallback(() => {
    if (!state.duration) return 0;
    return state.position / state.duration;
  }, [state.position, state.duration]);

  return {
    ...state,
    sleepTimerActive,
    sleepTimerMinutes,
    progress: getProgress(),

    // Actions
    load,
    play,
    pause,
    togglePlayPause,
    seekTo,
    skipForward,
    skipBackward,
    setPlaybackSpeed,
    setVolume,
    startSleepTimer,
    cancelSleepTimer,
  };
}
