import {
  createAudioPlaylist,
  requestNotificationPermissionsAsync,
  setAudioModeAsync,
  type AudioPlaylist,
} from 'expo-audio';
import { create } from 'zustand';

import { LESSON_AUDIO, VOICE_NAMES, type VoiceId } from '@/content/lesson-audio';
import { LESSONS } from '@/content/lessons';

/** A lesson counts as listened to once this share of it has played. */
const HEARD_FRACTION = 0.9;

type PlayerState = {
  voice: VoiceId;
  /** The lesson (task statement) loaded in the player, or null when nothing is loaded. */
  currentId: string | null;
  playing: boolean;
  /** Seconds. */
  currentTime: number;
  duration: number;
  /** Height of the mini player when it floats over a screen (Android tab screens), else 0. */
  overlayHeight: number;
};

/** What the player is doing, for the UI. Playback itself lives in the native playlist. */
export const useLessonPlayer = create<PlayerState>(() => ({
  voice: 'ruth',
  currentId: null,
  playing: false,
  currentTime: 0,
  duration: 0,
  overlayHeight: 0,
}));

let playlist: AudioPlaylist | null = null;
let playlistVoice: VoiceId | null = null;
let order: string[] = [];
/**
 * Track index `playLesson` skipped to, until the native playlist reports it. Status events are
 * delivered asynchronously, so a freshly created playlist can still report track 0 (or the old
 * track) after `skipTo`; without this guard the UI showed lesson 1.1 and the lesson screen
 * followed it there.
 */
let pendingIndex: number | null = null;
let audioModeReady = false;
let onLessonHeard: (lessonId: string) => void = () => undefined;

/** Lessons that have audio for a voice, in exam order. */
export function lessonsWithAudio(voice: VoiceId): string[] {
  return LESSONS.map((lesson) => lesson.taskStatement).filter((id) => id in LESSON_AUDIO[voice]);
}

/** Called when a lesson has been listened to (nearly) to the end. */
export function setOnLessonHeard(callback: (lessonId: string) => void) {
  onLessonHeard = callback;
}

function metadata(lessonId: string, voice: VoiceId) {
  const lesson = LESSONS.find((l) => l.taskStatement === lessonId);
  return {
    title: `${lessonId} ${lesson?.title ?? ''}`.trim(),
    artist: `CloudPrep · ${VOICE_NAMES[voice]} (AI voice)`,
    albumTitle: 'AWS Cloud Practitioner lessons',
  };
}

function release() {
  playlist?.clearLockScreenControls();
  playlist?.destroy();
  playlist = null;
  playlistVoice = null;
  order = [];
  pendingIndex = null;
  useLessonPlayer.setState({ currentId: null, playing: false, currentTime: 0, duration: 0 });
}

function ensurePlaylist(voice: VoiceId): AudioPlaylist {
  if (playlist && playlistVoice === voice) return playlist;
  release();

  order = lessonsWithAudio(voice);
  const created = createAudioPlaylist({
    sources: order.map((id) => LESSON_AUDIO[voice][id]),
    loop: 'none',
    // Frequent updates keep the read-along highlight in step with the voice.
    updateInterval: 250,
  });

  // Remember how far the current lesson got, to tell "finished" from "skipped".
  let progress = { index: 0, time: 0, duration: 0 };
  const heard = (index: number) => {
    if (
      progress.index === index &&
      progress.duration > 0 &&
      progress.time >= progress.duration * HEARD_FRACTION
    ) {
      onLessonHeard(order[index]);
    }
  };

  created.addListener('playlistStatusUpdate', (status) => {
    if (pendingIndex !== null) {
      if (status.currentIndex !== pendingIndex) return;
      pendingIndex = null;
    }
    if (status.didJustFinish) heard(status.currentIndex);
    progress = { index: status.currentIndex, time: status.currentTime, duration: status.duration };
    useLessonPlayer.setState({
      currentId: order[status.currentIndex] ?? null,
      playing: status.playing,
      currentTime: status.currentTime,
      duration: status.duration,
    });
  });
  created.addListener('trackChanged', ({ previousIndex, currentIndex }) => {
    heard(previousIndex);
    progress = { index: currentIndex, time: 0, duration: 0 };
    const id = order[currentIndex];
    if (id) created.updateLockScreenMetadata(metadata(id, voice));
  });

  playlist = created;
  playlistVoice = voice;
  return created;
}

/** Starts a lesson from the beginning in the selected voice, replacing whatever was playing. */
export async function playLesson(lessonId: string): Promise<void> {
  const { voice } = useLessonPlayer.getState();
  if (!(lessonId in LESSON_AUDIO[voice])) return;

  if (!audioModeReady) {
    // Keep playing with the screen locked or the app in the background, even in silent mode.
    await setAudioModeAsync({
      playsInSilentMode: true,
      shouldPlayInBackground: true,
      interruptionMode: 'doNotMix',
    });
    // Android 13+ shows the media controls as a notification.
    void requestNotificationPermissionsAsync().catch(() => undefined);
    audioModeReady = true;
  }

  const player = ensurePlaylist(voice);
  pendingIndex = order.indexOf(lessonId);
  player.skipTo(pendingIndex);
  player.setActiveForLockScreen(true, metadata(lessonId, voice), {
    showNextTrack: true,
    showPreviousTrack: true,
  });
  player.play();
  useLessonPlayer.setState({ currentId: lessonId, playing: true, currentTime: 0 });
}

export function togglePlayback() {
  if (!playlist) return;
  if (playlist.playing) playlist.pause();
  else playlist.play();
}

/** Jumps to a position, in seconds, in the lesson that is loaded. */
export function seekTo(seconds: number) {
  if (!playlist) return;
  void playlist.seekTo(seconds);
  useLessonPlayer.setState({ currentTime: seconds });
}

export function nextLesson() {
  playlist?.next();
}

export function previousLesson() {
  playlist?.previous();
}

/** Stops playback and removes the lock-screen controls. */
export function stopPlayback() {
  release();
}

/** Changes the narrator. Playback stops, because each voice has its own audio files. */
export function setVoice(voice: VoiceId) {
  if (voice === useLessonPlayer.getState().voice) return;
  release();
  useLessonPlayer.setState({ voice });
}
